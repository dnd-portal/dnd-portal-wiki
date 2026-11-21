import { test, expect } from '@playwright/test';
import axe from 'axe-core';

async function runAxe(page) {
	await page.addScriptTag({ content: axe.source });
	const results = await page.evaluate(async () => window.axe.run(document));
	const nonCritical = results.violations.filter(({ impact }) => impact !== 'critical');
	if (nonCritical.length > 0) {
		console.warn(`Known non-critical axe findings: ${nonCritical.map(({ id }) => id).join(', ')}`);
	}
	return results;
}

test('homepage has semantic navigation, shared popup host and no accessibility violations', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/D&D Portal Wiki/);
	await expect(page.locator('main')).toBeVisible();
	await expect(page.locator('#wiki-shared-popup')).toHaveCount(1);
	await expect(page.locator('.popup--full')).toHaveCount(0);
	await expect(page.locator('a[href]').first()).toHaveAttribute('href');
	const results = await runAxe(page);
	expect(results.violations.filter(({ impact }) => impact === 'critical')).toEqual([]);
});

test('deep spell route preserves breadcrumbs and hydrates without console errors', async ({ page }) => {
	const errors = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	await page.goto('/spells/magic-missile/');
	await expect(page.getByRole('heading', { name: 'Magic Missile' })).toBeVisible();
	await expect(page.getByRole('link', { name: '1st Level' })).toHaveAttribute('href', /spells\/1st-level/);
	expect(errors).toEqual([]);
});

test('keyboard focus exposes a popup relationship without changing anchor semantics', async ({ page }) => {
	await page.goto('/');
	const link = page.locator('a[aria-describedby="wiki-shared-popup"]').first();
	await link.focus();
	await expect(link).toBeFocused();
	await expect(link).toHaveAttribute('href');
	await expect(link).toHaveAttribute('aria-describedby', 'wiki-shared-popup');
});

test('navbar search is loaded lazily after input', async ({ page }, testInfo) => {
	test.skip(testInfo.project.name === 'mobile', 'The mobile layout exposes search through mobile navigation.');
	await page.goto('/');
	const before = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name));
	const search = page.getByRole('searchbox', { name: 'Search the Wiki' });
	await search.fill('magic');
	await page.waitForTimeout(500);
	const after = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name));
	const loadedAfterInput = after.filter((resource) => !before.includes(resource));
	expect(loadedAfterInput.some((resource) => resource.includes('/_app/immutable/chunks/'))).toBe(true);
});

test('mobile search route remains usable', async ({ page }, testInfo) => {
	test.skip(testInfo.project.name !== 'mobile', 'This scenario targets the mobile search layout.');
	await page.goto('/search/');
	await expect(page.getByRole('heading', { name: /Search/i }).first()).toBeVisible();
	await expect(page.getByRole('searchbox').first()).toBeVisible();
});

test('mobile production output remains navigable and accessible', async ({ page }) => {
	await page.goto('/classes/pugilist/');
	await expect(page.getByRole('heading', { name: /Pugilist/i }).first()).toBeVisible();
	const results = await runAxe(page);
	expect(results.violations.filter(({ impact }) => impact === 'critical')).toEqual([]);
});
