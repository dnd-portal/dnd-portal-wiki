import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const buildDir = join(root, 'build');
const clientDir = join(root, '.svelte-kit/output/client');
const output = join(root, 'reports/performance/runtime-metadata-baseline.json');
const routes = {
    homepage: '/',
    classes: '/classes/',
    subclass: '/classes/wizard/abjuration/',
    human: '/species/human/5-5e/',
    elf: '/species/elf/5e/',
    spells: '/spells/',
    fireball: '/spells/fireball/',
    rules: '/rules/combat/',
    faq: '/faq/acid-splash-5e/',
    equipment: '/equipment/armor/leather/',
    homebrew: '/homebrew/eldor/magic-items/mimic-stick/',
};

function allFiles(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const file = join(dir, entry.name);
        return entry.isDirectory() ? allFiles(file) : [file];
    });
}

function outputPath(route) {
    return join(buildDir, route === '/' ? 'index.html' : `${route.slice(1)}index.html`);
}

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

function inspectRoute(route) {
    const file = outputPath(route);
    if (!existsSync(file)) return { route, available: false };
    const html = readFileSync(file);
    const text = html.toString('utf8');
    const jsonLd = [
        ...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
    ].map((match) => JSON.parse(match[1]));
    return {
        route,
        available: true,
        bytes: html.length,
        articleHash: sha256(text.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? ''),
        title: text.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? null,
        description: text.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? null,
        canonical: text.match(/<link rel="canonical" href="([^"]*)"/i)?.[1] ?? null,
        openGraph: [...text.matchAll(/<meta property="(og:[^"]+)" content="([^"]*)"/gi)].map(
            (m) => [m[1], m[2]],
        ),
        jsonLd,
        jsonLdHash: sha256(JSON.stringify(jsonLd)),
        breadcrumbs: jsonLd.flatMap((graph) =>
            (graph['@graph'] ?? []).filter((entity) => entity['@type'] === 'BreadcrumbList'),
        ),
        images: [...text.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*\balt="([^"]*)"/gi)].map((m) => ({
            href: m[1],
            alt: m[2],
        })),
        sourceAttribution: /SRD|Source|Attribution|License/i.test(text),
    };
}

const clientJs = allFiles(join(clientDir, '_app/immutable')).filter((file) => file.endsWith('.js'));
const js = clientJs.map((file) => {
    const bytes = readFileSync(file);
    return {
        file: relative(clientDir, file).replaceAll('\\', '/'),
        bytes: bytes.length,
        gzipBytes: gzipSync(bytes).length,
    };
});
const homepageHtml = readFileSync(outputPath('/'), 'utf8');
const homepageJs = [...homepageHtml.matchAll(/(?:src|href)="([^"]+\.js)"/g)]
    .map((match) => match[1].replace(/^\//, ''))
    .filter((file, index, all) => file.includes('_app/immutable/') && all.indexOf(file) === index);
const normalizedHomepageJs = homepageJs.map((file) => file.replace(/^\.\//, ''));
const baseline = {
    note: 'Phase A baseline. Run after a clean pnpm build; hashes and byte values are deterministic for the same toolchain and source revision.',
    commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    routeCount: allFiles(buildDir).filter((file) => file.endsWith('.html')).length,
    totalHtmlBytes: allFiles(buildDir)
        .filter((file) => file.endsWith('.html'))
        .reduce((sum, file) => sum + statSync(file).size, 0),
    clientJavaScript: {
        files: js.length,
        rawBytes: js.reduce((sum, item) => sum + item.bytes, 0),
        gzipBytes: js.reduce((sum, item) => sum + item.gzipBytes, 0),
        largest: [...js].sort((a, b) => b.bytes - a.bytes).slice(0, 20),
    },
    homepage: {
        requestCount: homepageJs.length,
        files: homepageJs,
        rawBytes: normalizedHomepageJs.reduce(
            (sum, file) =>
                sum + (js.find((item) => `_app/immutable/${item.file}` === file)?.bytes ?? 0),
            0,
        ),
    },
    representatives: Object.fromEntries(
        Object.entries(routes).map(([name, route]) => [name, inspectRoute(route)]),
    ),
};
writeFileSync(output, `${JSON.stringify(baseline, null, 2)}\n`);
console.log(`Wrote ${output}`);
