import { test, expect } from '@playwright/test'
import { conectarBackend } from './apoyo'

//en la base de datos real se pueden agregar o eliminar productos,
//por eso la cantidad esperada se calcula con lo que responde el backend
let total
let pinturas

test.describe('HU-05 Buscar productos por categoría', () => {
  test.beforeEach(async ({ page }) => {
    const carla = await conectarBackend()
    const productos = await carla.get('/api/productos')
    await carla.cerrar()
    total = productos.length
    pinturas = productos.filter((p) => p.categoria === 'Pinturas').length

    await page.goto('/#/productos')
  })

  //el texto cambia si hay uno solo: '1 producto encontrado'
  const encontrados = (cantidad) => `${cantidad} ${cantidad === 1 ? 'producto encontrado' : 'productos encontrados'}`

  //el sistema permite filtrar el catalogo de productos por categoria
  test('CP 25 al elegir pinturas solo se muestran los productos de esa categoría', async ({ page }) => {
    await page.getByLabel('Categoría').selectOption({ label: 'Pinturas' })
    await expect(page.getByText(encontrados(pinturas))).toBeVisible()
    //cada tarjeta es un <article>, y todas deben decir pinturas en su categoria
    await expect(page.locator('article')).toHaveCount(pinturas)
    await expect(page.locator('article').filter({ hasText: 'Pinturas ·' })).toHaveCount(pinturas)
  })

  test('CP 26 al volver a todas las categorías se muestran todos los productos', async ({ page }) => {
    await page.getByLabel('Categoría').selectOption({ label: 'Pinturas' })
    await expect(page.getByText(encontrados(pinturas))).toBeVisible()
    await page.getByLabel('Categoría').selectOption({ label: 'Todas las categorías' })
    await expect(page.getByText(encontrados(total))).toBeVisible()
  })

  test('CP 27 si el filtro no encuentra productos, muestra un mensaje', async ({ page }) => {
    await page.getByLabel('Buscar producto').fill('xyz')
    await expect(page.getByText('No encontramos productos con esos filtros.')).toBeVisible()
  })
})
