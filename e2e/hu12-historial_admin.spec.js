import { test, expect } from '@playwright/test'
import { CORREOS, ingresar, pedidosDeCliente } from './apoyo'

async function verHistorialCliente(page, id) {
  await page.getByPlaceholder('Buscar por id (ej: 3)').fill(String(id))
  await page.getByRole('link', { name: 'Ver historial de compras' }).click()
  await expect(page).toHaveURL(new RegExp(`#/admin/historial/${id}$`))
}

test.describe('Consultar historial de compras por cliente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, CORREOS.carla)
    await expect(page).toHaveURL(/#\/admin\/usuarios/)
    await page.goto('/#/admin/historial')
  })

  //en la base de datos real Juan y Ana van teniendo mas pedidos,
  //por eso se le pregunta al backend cuales son y se revisa que aparezcan esos
  test('CP-41: Carla ve el historial completo de Juan', async ({ page }) => {
    const pedidosJuan = await pedidosDeCliente(3)
    const pedidosAna = await pedidosDeCliente(4)

    await verHistorialCliente(page, 3)

    await expect(page.getByText('Historial de pedidos de Juan Pérez Díaz')).toBeVisible()
    //exact true para que '#1' no encuentre tambien '#12'
    for (const pedido of pedidosJuan) {
      await expect(page.getByText(`#${pedido.id}`, { exact: true })).toBeVisible()
    }
    //los pedidos de ana no aparecen en el historial de juan
    for (const pedido of pedidosAna) {
      await expect(page.getByText(`#${pedido.id}`, { exact: true })).toHaveCount(0)
    }
  })

  test('CP-42: si Luis no tiene pedidos, se muestra un mensaje', async ({ page }) => {
    const pedidosLuis = await pedidosDeCliente(5)
    test.skip(pedidosLuis.length > 0, 'Luis ya tiene pedidos en esta base de datos, no se puede probar')

    await verHistorialCliente(page, 5)
    await expect(page.getByText('Este cliente todavía no tiene pedidos.')).toBeVisible()
  })
})
