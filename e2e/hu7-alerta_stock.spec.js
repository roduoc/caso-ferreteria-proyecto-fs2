import { test, expect } from '@playwright/test'

async function ingresar(page, correo, clave) {
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña').fill(clave)
  await page.getByRole('button', { name: 'Acceder' }).click()
}

test.describe('HU-07 Alerta de bajo stock', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'admin@duoc.cl', '1234')
    await expect(page).toHaveURL(/#\/admin\/usuarios/)
    await page.goto('/#/admin/inventario')
  })

  test('CP-31: si el stock del Cemento Polpaico llega a su mínimo, aparece la alerta', async ({ page }) => {
    await page.getByPlaceholder('Buscar por código (ej: MC001)').fill('MC001')

    //el minimo del MC001 es 20, se deja justo en 20 para probar el igual
    await page.getByPlaceholder('Nueva cantidad').fill('20')
    await page.getByRole('button', { name: 'Editar cantidad' }).click()
    await expect(page.getByRole('alert')).toHaveText('Cantidad actualizada correctamente')
    await expect(page.getByText('Stock bajo: el mínimo es 20')).toBeVisible()
  })

  test('CP-32: si el stock del Cemento Polpaico sube sobre su mínimo, la alerta desaparece', async ({ page }) => {
    await page.getByPlaceholder('Buscar por código (ej: MC001)').fill('MC001')

    //primero se deja en el minimo
    await page.getByPlaceholder('Nueva cantidad').fill('20')
    await page.getByRole('button', { name: 'Editar cantidad' }).click()
    await expect(page.getByText('Stock bajo: el mínimo es 20')).toBeVisible()

    //despue se sube sobre el minimo, para que desaparezca la alerta
    await page.getByPlaceholder('Nueva cantidad').fill('21')
    await page.getByRole('button', { name: 'Editar cantidad' }).click()

    //la alerta desaparece
    await expect(page.getByText(/Stock bajo/)).toHaveCount(0)

    //despues de recargar sigue sin alerta con el stock guardado en localStorage
    await page.reload()
    await page.getByPlaceholder('Buscar por código (ej: MC001)').fill('MC001')
    await expect(page.getByText('Cantidad: 21')).toBeVisible()
    await expect(page.getByText(/Stock bajo/)).toHaveCount(0)
  })
})