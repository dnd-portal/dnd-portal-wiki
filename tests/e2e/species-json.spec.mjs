import { test, expect } from '@playwright/test';

test('JSON-backed species catalog links to published Human and Elf articles', async ({ page }) => {
  await page.goto('/species/');
  await expect(page.getByRole('heading', { name: 'Playable species' }).first()).toBeVisible();
  await expect(page.locator('a[href="/species/human/"]')).toBeVisible();
  await expect(page.locator('a[href="/species/elf/"]')).toBeVisible();
});

test('Human 5.5e renders full JSON article, FAQs and visible SRD attribution', async ({ page }) => {
  await page.goto('/species/human/');
  await expect(page.getByRole('heading', { name: 'Human', exact: true }).first()).toBeVisible();
  await expect(page.locator('#overview')).toBeVisible();
  await expect(page.locator('#faq details')).toHaveCount(5);
  await page.locator('#faq details').first().locator('summary').click();
  await expect(page.locator('#faq details').first().locator('.faq__answer')).toBeVisible();
  await expect(page.locator('#species-json-licenses')).toContainText('System Reference Document 5.2.1');
});

test('Elf 5e uses its own edition and FAQ content', async ({ page }) => {
  await page.goto('/species/elf/5e/');
  await expect(page.getByRole('heading', { name: 'Elf', exact: true }).first()).toBeVisible();
  await expect(page.locator('#faq details')).toHaveCount(5);
  await expect(page.locator('#species-json-licenses')).toContainText('System Reference Document 5.1');
});
