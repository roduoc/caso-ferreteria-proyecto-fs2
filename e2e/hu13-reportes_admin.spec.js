import { test, expect } from '@playwright/test'
import { ingresar } from './apoyo'

//este test solo lee: el reporte se calcula con los pedidos reales que manda el backend

test.describe('HU-13 Reporte de productos y clientes más frecuentes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'admin@duoc.cl', '1234')
    await expect(page).toHaveURL(/#\/admin\/usuarios/)
    await page.goto('/#/admin/reportes')
  })

  test('CP-43: Carla ve el reporte de productos más vendidos', async ({ page }) => {
    //heading busca los h1, h2, h3 etc
    await expect(page.getByRole('heading', { name: '10 productos más vendidos' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Gráfico de 10 productos más vendidos' })).toBeVisible()
  })

  test('CP-44: Carla ve el reporte de clientes más frecuentes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '10 clientes más frecuentes' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Gráfico de 10 clientes más frecuentes' })).toBeVisible()
  })
})
