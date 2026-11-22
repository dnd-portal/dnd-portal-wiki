import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer } from 'vite';

const root = process.cwd();
const outputPath = resolve(root, 'static/_data/navbar-search.json');
const server = await createServer({
	root,
	server: { middlewareMode: true },
	appType: 'custom',
	logLevel: 'error'
});

try {
	const module = await server.ssrLoadModule('/src/lib/typescript/pages/search.ts');
	const entries = module.searchIndex.map((entry) => ({
		id: entry.id,
		href: entry.href,
		title: entry.title,
		subtitle: entry.subtitle,
		category: entry.category,
		// Navbar suggestions need names and destinations, not full page prose.
		searchText: `${entry.title} ${entry.subtitle} ${entry.href} ${entry.category}`
	}));

	mkdirSync(resolve(root, 'static/_data'), { recursive: true });
	writeFileSync(outputPath, `${JSON.stringify(entries)}\n`);
} finally {
	await server.close();
}
