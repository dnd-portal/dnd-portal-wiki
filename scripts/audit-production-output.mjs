import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const buildRoot = path.resolve('build');
const clientRoot = path.resolve('build/_app/immutable');
const initialSharedBudget = 1_000_000;
const routeChunkBudget = 1_500_000;
const htmlPageBudget = 500_000;

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
	if (filePath.endsWith('.js') && filePath.includes(`${path.sep}_app${path.sep}immutable${path.sep}`)) {
		const source = fs.readFileSync(filePath);
		jsFiles.push({
			filePath,
			bytes,
			gzipBytes: zlib.gzipSync(source).length
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
const routeNodes = Object.entries(manifest).filter(([key]) => key.includes('/client-optimized/nodes/'));
const canonicalFiles = new Set(
	Object.values(manifest)
		.filter((value) => ['_index_', 'spell-data', 'faq'].includes(value.name))
		.map((value) => value.file)
);
const canonicalNodes = routeNodes.filter(([, value]) =>
	[...closure(value)].some((file) => canonicalFiles.has(file))
).length;
const rootCanonicalFiles = rootClosure.filter((file) => canonicalFiles.has(file));

const report = {
	routes: htmlFiles.length,
	totalHtmlBytes: htmlFiles.reduce((sum, item) => sum + item.bytes, 0),
	topHtml: htmlFiles.slice(0, 20).map(({ filePath, bytes }) => ({
		file: path.relative(buildRoot, filePath).replaceAll('\\', '/'),
		bytes
	})),
	totalClientJavaScriptBytes: jsFiles.reduce((sum, item) => sum + item.bytes, 0),
	totalClientJavaScriptGzipBytes: jsFiles.reduce((sum, item) => sum + item.gzipBytes, 0),
	largestChunks: jsFiles.slice(0, 20).map(({ filePath, bytes, gzipBytes }) => ({
		file: path.relative(buildRoot, filePath).replaceAll('\\', '/'),
		bytes,
		gzipBytes
	})),
	rootLayoutDependencyBytes: rootBytes,
	rootLayoutDependencyFiles: rootClosure,
	clientNodes: routeNodes.length,
	clientNodesWithCanonicalData: canonicalNodes,
	rootCanonicalFiles,
	budgets: {
		initialSharedBytes: initialSharedBudget,
		routeChunkBytes: routeChunkBudget,
		htmlPageBytes: htmlPageBudget
	}
};

console.log(JSON.stringify(report, null, 2));

if (rootBytes > initialSharedBudget) {
	throw new Error(`Root-layout dependency closure exceeds ${initialSharedBudget} bytes.`);
}
if (rootCanonicalFiles.length > 0) {
	throw new Error(`Canonical data entered the root-layout closure: ${rootCanonicalFiles.join(', ')}`);
}
if (htmlFiles.some(({ bytes }) => bytes > htmlPageBudget)) {
	throw new Error(`At least one prerendered HTML page exceeds ${htmlPageBudget} bytes.`);
}
if (jsFiles.some(({ bytes }) => bytes > routeChunkBudget)) {
	throw new Error(`A client chunk exceeds the route-chunk budget of ${routeChunkBudget} bytes.`);
}

for (const { filePath } of htmlFiles) {
	const html = fs.readFileSync(filePath, 'utf8');
	const sharedPopupIds = (html.match(/id=["']wiki-shared-popup["']/g) ?? []).length;
	const hasSharedLayout = html.includes('class="layout"') || html.includes("class='layout'");
	const relativeHtmlPath = path.relative(buildRoot, filePath).replaceAll('\\', '/');
	const intentionallyPopupless = relativeHtmlPath === '404.html' || relativeHtmlPath.includes('acid-splash');
	if (hasSharedLayout && !intentionallyPopupless && sharedPopupIds !== 1) {
		throw new Error(`${path.relative(buildRoot, filePath)} contains ${sharedPopupIds} shared popup hosts; expected exactly one.`);
	}
	if (html.includes('popup--full') || html.includes('popup--description')) {
		throw new Error(`${path.relative(buildRoot, filePath)} contains prerendered popup content.`);
	}
}
