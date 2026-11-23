import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const buildRoot = path.resolve('build');
const clientRoot = path.resolve('build/_app/immutable');
const initialSharedBudget = 1_000_000;
const routeChunkBudget = 1_500_000;
const htmlPageBudget = 500_000;
const homepageInitialJavaScriptBudget = 1_000_000;

if (!fs.existsSync(buildRoot)) {
    throw new Error('Missing build/. Run pnpm build first.');
}

const htmlFiles = [];
const jsFiles = [];

function collect(directory, callback) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const filePath = path.join(directory, entry.name);
        if (entry.isDirectory()) collect(filePath, callback);
        else callback(filePath);
    }
}

collect(buildRoot, (filePath) => {
    const bytes = fs.statSync(filePath).size;
    if (filePath.endsWith('.html')) htmlFiles.push({ filePath, bytes });
    if (
        filePath.endsWith('.js') &&
        filePath.includes(`${path.sep}_app${path.sep}immutable${path.sep}`)
    ) {
        const source = fs.readFileSync(filePath);
        jsFiles.push({
            filePath,
            bytes,
            gzipBytes: zlib.gzipSync(source).length,
        });
    }
});

htmlFiles.sort((a, b) => b.bytes - a.bytes);
jsFiles.sort((a, b) => b.bytes - a.bytes);

const manifestPath = path.resolve('.svelte-kit/output/client/.vite/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const aliases = new Map();
for (const [key, value] of Object.entries(manifest)) {
    if (value.file) aliases.set(`_${path.basename(value.file)}`, value);
}

function closure(value, seen = new Set()) {
    if (!value || seen.has(value.file)) return seen;
    seen.add(value.file);
    for (const imported of value.imports ?? []) closure(aliases.get(imported), seen);
    return seen;
}

const rootNode = manifest['.svelte-kit/generated/build/client-optimized/nodes/0.js'];
const rootClosure = [...closure(rootNode)];
const rootBytes = rootClosure.reduce((sum, file) => {
    const buildPath = path.resolve('build', file);
    return sum + (fs.existsSync(buildPath) ? fs.statSync(buildPath).size : 0);
}, 0);
const routeNodes = Object.entries(manifest).filter(([key]) =>
    key.includes('/client-optimized/nodes/'),
);
const canonicalFiles = new Set(
    Object.values(manifest)
        .filter((value) => ['_index_', 'spell-data', 'faq'].includes(value.name))
        .map((value) => value.file),
);
const canonicalNodes = routeNodes.filter(([, value]) =>
    [...closure(value)].some((file) => canonicalFiles.has(file)),
).length;
const rootCanonicalFiles = rootClosure.filter((file) => canonicalFiles.has(file));

function getHtmlAssetPaths(html, attribute) {
    return [...html.matchAll(new RegExp(`${attribute}=["']([^"']+)["']`, 'gi'))]
        .map((match) => match[1])
        .filter((href) => href.startsWith('./_app/immutable/') && href.endsWith('.js'))
        .map((href) => path.resolve(buildRoot, href.slice(2)));
}

const homepagePath = path.join(buildRoot, 'index.html');
const homepageHtml = fs.readFileSync(homepagePath, 'utf8');
const homepageJavaScriptFiles = [
    ...new Set([
        ...getHtmlAssetPaths(homepageHtml, 'href'),
        ...getHtmlAssetPaths(homepageHtml, 'src'),
    ]),
];
const homepageJavaScriptBytes = homepageJavaScriptFiles.reduce(
    (sum, filePath) => sum + fs.statSync(filePath).size,
    0,
);

function inspectHtml(filePath) {
    const html = fs.readFileSync(filePath, 'utf8');
    const relative = path.relative(buildRoot, filePath).replaceAll('\\', '/');
    const missingImageAlt = [];
    const unnamedControls = [];
    const invalidJsonLd = [];
    const jsonLdTypes = new Set();

    for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
        if (!/\balt\s*=/.test(match[0])) missingImageAlt.push(match[0]);
    }

    for (const match of html.matchAll(/<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
        const attributes = match[2];
        const content = match[3];
        const text = content
            .replace(/<[^>]+>/g, ' ')
            .replace(/&(?:nbsp|#160);/gi, ' ')
            .trim();
        const hasImageName = /<img\b[^>]*\balt\s*=\s*["'][^"']+/.test(content);
        const hasExplicitName = /\baria-label(?:ledby)?\s*=/.test(attributes);
        if (!text && !hasImageName && !hasExplicitName) unnamedControls.push(match[0]);
    }

    for (const match of html.matchAll(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    )) {
        try {
            const value = JSON.parse(match[1].trim());
            if (value?.['@context'] !== 'https://schema.org' || !Array.isArray(value?.['@graph'])) {
                invalidJsonLd.push(
                    'JSON-LD must contain the schema.org context and an @graph array',
                );
                continue;
            }
            for (const item of value['@graph']) {
                if (typeof item?.['@type'] === 'string') jsonLdTypes.add(item['@type']);
                for (const key of ['@id', 'url']) {
                    if (item?.[key] != null && !/^https:\/\//.test(item[key])) {
                        invalidJsonLd.push(`${key} is not an absolute HTTPS URL`);
                    }
                }
            }
        } catch (error) {
            invalidJsonLd.push(error.message);
        }
    }

    return {
        relative,
        missingImageAlt,
        unnamedControls,
        invalidJsonLd,
        jsonLdTypes: [...jsonLdTypes],
    };
}

const htmlInspection = htmlFiles.map(({ filePath }) => inspectHtml(filePath));
const missingImageAlt = htmlInspection.flatMap((item) =>
    item.missingImageAlt.length
        ? [{ file: item.relative, count: item.missingImageAlt.length }]
        : [],
);
const unnamedControls = htmlInspection.flatMap((item) =>
    item.unnamedControls.length
        ? [{ file: item.relative, count: item.unnamedControls.length }]
        : [],
);
const invalidJsonLd = htmlInspection.flatMap((item) =>
    item.invalidJsonLd.map((message) => ({ file: item.relative, message })),
);
const structuredDataTypes = [...new Set(htmlInspection.flatMap((item) => item.jsonLdTypes))];

const report = {
    routes: htmlFiles.length,
    totalHtmlBytes: htmlFiles.reduce((sum, item) => sum + item.bytes, 0),
    topHtml: htmlFiles.slice(0, 20).map(({ filePath, bytes }) => ({
        file: path.relative(buildRoot, filePath).replaceAll('\\', '/'),
        bytes,
    })),
    totalClientJavaScriptBytes: jsFiles.reduce((sum, item) => sum + item.bytes, 0),
    totalClientJavaScriptGzipBytes: jsFiles.reduce((sum, item) => sum + item.gzipBytes, 0),
    largestChunks: jsFiles.slice(0, 20).map(({ filePath, bytes, gzipBytes }) => ({
        file: path.relative(buildRoot, filePath).replaceAll('\\', '/'),
        bytes,
        gzipBytes,
    })),
    rootLayoutDependencyBytes: rootBytes,
    rootLayoutDependencyFiles: rootClosure,
    clientNodes: routeNodes.length,
    clientNodesWithCanonicalData: canonicalNodes,
    rootCanonicalFiles,
    homepage: {
        initialJavaScriptFiles: homepageJavaScriptFiles.map((filePath) => ({
            file: path.relative(buildRoot, filePath).replaceAll('\\', '/'),
            bytes: fs.statSync(filePath).size,
        })),
        initialJavaScriptRequestCount: homepageJavaScriptFiles.length,
        initialJavaScriptBytes: homepageJavaScriptBytes,
        initialHtmlDeclaredRequestCount: (homepageHtml.match(/<(?:script|link|img)\b/gi) ?? [])
            .length,
    },
    accessibility: {
        htmlFiles: htmlFiles.length,
        imagesMissingAlt: missingImageAlt,
        unnamedControls,
    },
    structuredData: { types: structuredDataTypes, invalid: invalidJsonLd },
    budgets: {
        initialSharedBytes: initialSharedBudget,
        routeChunkBytes: routeChunkBudget,
        htmlPageBytes: htmlPageBudget,
        homepageInitialJavaScriptBytes: homepageInitialJavaScriptBudget,
    },
};

console.log(JSON.stringify(report, null, 2));

if (rootBytes > initialSharedBudget) {
    throw new Error(`Root-layout dependency closure exceeds ${initialSharedBudget} bytes.`);
}
if (rootCanonicalFiles.length > 0) {
    throw new Error(
        `Canonical data entered the root-layout closure: ${rootCanonicalFiles.join(', ')}`,
    );
}
if (htmlFiles.some(({ bytes }) => bytes > htmlPageBudget)) {
    throw new Error(`At least one prerendered HTML page exceeds ${htmlPageBudget} bytes.`);
}
if (jsFiles.some(({ bytes }) => bytes > routeChunkBudget)) {
    throw new Error(`A client chunk exceeds the route-chunk budget of ${routeChunkBudget} bytes.`);
}
if (homepageJavaScriptBytes > homepageInitialJavaScriptBudget) {
    throw new Error(
        `Homepage initial JavaScript exceeds ${homepageInitialJavaScriptBudget} bytes.`,
    );
}
if (missingImageAlt.length > 0) {
    throw new Error(
        `Generated HTML contains images without alt text: ${missingImageAlt.map((item) => `${item.file} (${item.count})`).join(', ')}`,
    );
}
if (unnamedControls.length > 0) {
    throw new Error(
        `Generated HTML contains unnamed interactive controls: ${unnamedControls.map((item) => `${item.file} (${item.count})`).join(', ')}`,
    );
}
if (invalidJsonLd.length > 0) {
    throw new Error(
        `Generated HTML contains invalid structured data: ${invalidJsonLd.map((item) => `${item.file}: ${item.message}`).join('; ')}`,
    );
}

for (const { filePath } of htmlFiles) {
    const html = fs.readFileSync(filePath, 'utf8');
    const sharedPopupIds = (html.match(/id=["']wiki-shared-popup["']/g) ?? []).length;
    const hasSharedLayout = html.includes('class="layout"') || html.includes("class='layout'");
    const relativeHtmlPath = path.relative(buildRoot, filePath).replaceAll('\\', '/');
    const intentionallyPopupless =
        relativeHtmlPath === '404.html' || relativeHtmlPath.includes('acid-splash');
    if (hasSharedLayout && !intentionallyPopupless && sharedPopupIds !== 1) {
        throw new Error(
            `${path.relative(buildRoot, filePath)} contains ${sharedPopupIds} shared popup hosts; expected exactly one.`,
        );
    }
    if (html.includes('popup--full') || html.includes('popup--description')) {
        throw new Error(
            `${path.relative(buildRoot, filePath)} contains prerendered popup content.`,
        );
    }
}
