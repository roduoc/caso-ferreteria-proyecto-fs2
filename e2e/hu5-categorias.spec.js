import { test, expect } from '@playwright/test'

test.describe('HU-05 Buscar productos por categoría', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/productos')
  })

  //el sistema permite filtrar el catalogo de productos por categoria
  test('CP 25 al elegir pinturas solo se muestran los 9 productos de esa categoría', async ({ page }) => {
    await page.getByLabel('Categoría').selectOption({ label: 'Pinturas' })
    await expect(page.getByText('9 productos encontrados')).toBeVisible()
    //cada tarjeta es un <article>, y todas deben decir pinturas en su categoria
    await expect(page.locator('article')).toHaveCount(9)
    await expect(page.locator('article').filter({ hasText: 'Pinturas ·' })).toHaveCount(9)
  })

  test('CP 26 al volver a todas las categorías se muestran los 85 productos', async ({ page }) => {
    await page.getByLabel('Categoría').selectOption({ label: 'Pinturas' })
    await expect(page.getByText('9 productos encontrados')).toBeVisible()
    await page.getByLabel('Categoría').selectOption({ label: 'Todas las categorías' })
    await expect(page.getByText('85 productos encontrados')).toBeVisible()
  })

  test('CP 27 si el filtro no encuentra productos, muestra un mensaje', async ({ page }) => {
    await page.getByLabel('Buscar producto').fill('xyz')
    await expect(page.getByText('No encontramos productos con esos filtros.')).toBeVisible()
})

})