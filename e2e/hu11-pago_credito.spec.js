import { test, expect } from '@playwright/test'

async function ingresar(page, correo, clave) {
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña').fill(clave)
  await page.getByRole('button', { name: 'Acceder' }).click()
}

//inicia sesion como cliente, agrega un item y llega a la pagina de pago
async function llegarAlPago(page, correo) {
  await page.goto('/#/login')
  await ingresar(page, correo, '1234')
  await expect(page).toHaveURL(/#\/mis-pedidos/)
  await page.goto('/#/producto/MC001')
  await page.getByRole('button', { name: 'Añadir al carrito' }).click()
  await expect(page.getByRole('status')).toHaveText('Producto añadido al carrito.')
  await page.goto('/#/envios')
  await page.getByLabel('Retiro en tienda').check()
  await page.getByRole('button', { name: 'Continuar al pago' }).click()
  await expect(page).toHaveURL(/#\/pago/)
  await expect(page.getByText('Medio de pago')).toBeVisible()
}

test.describe('HU-11 Registrar venta a cuenta corriente', () => {

  test('CP-45: Ana tiene cuenta corriente y ve la opción de pagar con ella', async ({ page }) => {
    await llegarAlPago(page, 'ana.torres@gmail.com')

    //encuentra el boton de radio de cuenta corriente, getBylabel acepta parte del texto
    await page.getByLabel('Pagar con crédito de la ferretería')
  })

  test('CP-46: Ana compra con cuenta corriente y el total se suma a su deuda', async ({ page }) => {
    await llegarAlPago(page, 'ana.torres@gmail.com')

    //encuentra el radio con el texto
    await page.getByLabel('Pagar con crédito de la ferretería').check()
    await page.getByRole('button', { name: /Confirmar/ }).click()

    //la compra queda registrada de inmediato
    await expect(page.getByRole('heading', { name: 'Compra realizada' })).toBeVisible()
    await page.goto('/#/mi-credito')

    //vemos el saldo de deuda aumentado
    await expect(page.locator('#saldo-actual')).toHaveText('$37.990')
  })

  test('CP-47: Luis no tiene cuenta corriente y no puede pagar con ella', async ({ page }) => {
    await llegarAlPago(page, 'luis.fuentes@duoc.cl')
    await expect(page.getByText('Pago al contado')).toBeVisible()

    //solo aparece pago al contado
    await expect(page.getByLabel('Pagar con crédito de la ferretería')).toHaveCount(0)
  })
})