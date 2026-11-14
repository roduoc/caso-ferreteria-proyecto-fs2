import { test, expect } from '@playwright/test'
import { CORREOS, ingresar, leerProducto, cambiarProducto } from './apoyo'

//datos del Cemento Polpaico antes de cada test, para dejar su stock igual al final
let cemento

test.describe('HU-07 Alerta de bajo stock', () => {
  test.beforeEach(async ({ page }) => {
    cemento = await leerProducto('MC001')
    await page.goto('/#/login')
    await ingresar(page, CORREOS.carla)
    await expect(page).toHaveURL(/#\/admin\/usuarios/)
    await page.goto('/#/admin/inventario')
  })

  test.afterEach(async () => {
    await cambiarProducto('MC001', { stock: cemento.stock })
  })

  test('CP-31: si el stock del Cemento Polpaico baja de su mínimo, aparece la alerta', async ({ page }) => {
    await page.getByPlaceholder('Buscar por código (ej: MC001)').fill('MC001')

    //el minimo se lee del backend (en los datos iniciales es 20), la alerta aparece solo por debajo
    await page.getByPlaceholder('Nueva cantidad').fill(String(cemento.stockMinimo - 1))
    await page.getByRole('button', { name: 'Editar cantidad' }).click()
    await expect(page.getByRole('alert')).toHaveText('Cantidad actualizada correctamente')
    await expect(page.getByText(`Stock bajo: el mínimo es ${cemento.stockMinimo}`)).toBeVisible()
  })

  test('CP-32: si el stock del Cemento Polpaico sube sobre su mínimo, la alerta desaparece', async ({ page }) => {
    await page.getByPlaceholder('Buscar por código (ej: MC001)').fill('MC001')

    //primero se deja bajo el minimo
    await page.getByPlaceholder('Nueva cantidad').fill(String(cemento.stockMinimo - 1))
    await page.getByRole('button', { name: 'Editar cantidad' }).click()
    await expect(page.getByText(`Stock bajo: el mínimo es ${cemento.stockMinimo}`)).toBeVisible()

    //despue se sube sobre el minimo, para que desaparezca la alerta
    const sobreElMinimo = cemento.stockMinimo + 1
    await page.getByPlaceholder('Nueva cantidad').fill(String(sobreElMinimo))
    await page.getByRole('button', { name: 'Editar cantidad' }).click()

    //la alerta desaparece
    await expect(page.getByText(/Stock bajo/)).toHaveCount(0)

    //despues de recargar sigue sin alerta: el stock nuevo quedo guardado en MySQL
    await page.reload()
    await page.getByPlaceholder('Buscar por código (ej: MC001)').fill('MC001')
    await expect(page.getByText(`Cantidad: ${sobreElMinimo}`)).toBeVisible()
    await expect(page.getByText(/Stock bajo/)).toHaveCount(0)
  })
})
