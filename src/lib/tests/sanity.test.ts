import { describe, expect, it } from 'vitest';
import { getDynamicSpellBreadcrumbItems } from '#lib/typescript/pages/currentPage.js';
import { getData } from '#lib/typescript/data/_index_.js';
import { createSeoMetadata } from '#lib/typescript/pages/seo.js';

describe('D&D Portal test environment', () => {
    it('runs unit tests successfully', () => {
        expect(true).toBe(true);
    });

	it.each([
		['blade-ward', ['Spells', 'Cantrips', 'Blade Ward']],
		['magic-missile', ['Spells', '1st Level', 'Magic Missile']]
	])('keeps dynamic spell breadcrumb keys unique for %s', (slug, labels) => {
		const items = getDynamicSpellBreadcrumbItems(slug);
		const keys = items.map((item) => item.key);
		expect(new Set(keys).size).toBe(keys.length);
		expect(items.map((item) => item.label)).toEqual(labels);
	});

	it('keeps central utility links slash-normalized', () => {
		expect(getData('internals.utility.myCharacter').href).toBe('/my-character/');
		expect(getData('internals.utility.diceRoller').href).toBe('/dice-roller/');
		expect(getData('internals.utility.currencyConverter').href).toBe('/currency-converter/');
	});

	it('distinguishes Homebrew SEO titles while keeping route canonicals', () => {
		const pageData = getData('internals.magicItems.mimicStick');
		const wiki = createSeoMetadata({ path: 'internals.magicItems.mimicStick', pageData, pathname: '/magic-items/the-mimic-stick/' });
		const homebrew = createSeoMetadata({ path: 'internals.magicItems.mimicStick', pageData, pathname: '/homebrew/eldor/magic-items/mimic-stick/' });

		expect(homebrew.title).not.toBe(wiki.title);
		expect(homebrew.title).toContain('Homebrew');
		expect(homebrew.canonicalUrl).toContain('/homebrew/eldor/magic-items/mimic-stick/');
	});
});
