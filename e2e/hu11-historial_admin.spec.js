import { test, expect } from '@playwright/test'

async function ingresar(page, correo, clave) {
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña').fill(clave)
  await page.getByRole('button', { name: 'Acceder' }).click()
}

async function verHistorialCliente(page, id) {
  await page.getByPlaceholder('Buscar por id (ej: 3)').fill(String(id))
  await page.getByRole('link', { name: 'Ver historial de compras' }).click()
  await expect(page).toHaveURL(new RegExp(`#/admin/historial/${id}$`))
}

test.describe('HU-12 Consultar historial de compras por cliente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'admin@duoc.cl', '1234')
    await expect(page).toHaveURL(/#\/admin\/usuarios/)
    await page.goto('/#/admin/historial')
  })

  //Juan (id 3) tiene los pedidos 1 y 3, el pedido 2 es de Ana
  test('CP-41: Carla ve el historial completo de Juan', async ({ page }) => {
    await verHistorialCliente(page, 3)

    await expect(page.getByText('Historial de pedidos de Juan Pérez Díaz')).toBeVisible()
    await expect(page.getByText('#1')).toBeVisible()
    await expect(page.getByText('#3')).toBeVisible()
    //el pedido de ana no aparece en el historial de juan
    await expect(page.getByText('#2')).toHaveCount(0)
  })

  test('CP-42: si Luis no tiene pedidos, se muestra un mensaje', async ({ page }) => {
    await verHistorialCliente(page, 5)
    await expect(page.getByText('Este cliente todavía no tiene pedidos.')).toBeVisible()
  })
})