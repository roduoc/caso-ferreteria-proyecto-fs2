import { expect, test } from '@playwright/test';

test('la portada y el catálogo público cargan desde el sitio', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('link', { name: 'Ver productos', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Ver productos', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Productos disponibles' })).toBeVisible();
  await expect(page.getByRole('article').first()).toBeVisible();
});
