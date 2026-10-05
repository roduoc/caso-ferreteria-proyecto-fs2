import { test, expect } from '@playwright/test'

async function ingresar(page, correo, clave) {
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña').fill(clave)
  await page.getByRole('button', { name: 'Acceder' }).click()
}

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
    await expect(page.getByRole('img', { name: 'Gráfico de los 10 productos más vendidos' })).toBeVisible()
  })

  test('CP-44: Carla ve el reporte de clientes más frecuentes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '10 clientes más frecuentes' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Gráfico de los 10 clientes más frecuentes' })).toBeVisible()
  })
})