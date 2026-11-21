import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const currentPageSource = readFileSync(
	resolve(process.cwd(), 'src/lib/typescript/pages/currentPage.ts'),
	'utf8'
);
const dataTypeSource = readFileSync(
	resolve(process.cwd(), 'src/lib/typescript/data/functions/Types/Data.ts'),
	'utf8'
);

describe('shared client bundle boundaries', () => {
	it('does not import the full spell registry from currentPage', () => {
		expect(currentPageSource).not.toContain('data/internals/rules/spellcasting/spells/spell-data');
	});

	it('resolves spell breadcrumbs through runtime metadata', () => {
		expect(currentPageSource).toContain('getRuntimeSpellBreadcrumbMetadata');
	});

	it('keeps the canonical data type dependency type-only', () => {
		expect(dataTypeSource).toContain('import type { data }');
		expect(dataTypeSource).not.toMatch(/import \{\s*data\s*\}/);
	});
});
