import { test, expect } from '@playwright/test'
import { CORREOS, ingresar, formatoPrecio, leerProducto, cambiarProducto, leerCliente, conectarBackend } from './apoyo'

//inicia sesion como cliente, agrega un item y llega a la pagina de pago
async function llegarAlPago(page, correo) {
  await page.goto('/#/login')
  await ingresar(page, correo)
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

//datos antes de cada test, para dejarlos igual al final
let cemento
//lo que el test le cargo a la deuda de Ana (0 si no compro)
let cargoDeAna

test.describe('HU-11 Registrar venta a cuenta corriente', () => {
  test.beforeEach(async () => {
    cargoDeAna = 0
    cemento = await leerProducto('MC001')
    if (cemento.stock < 1) await cambiarProducto('MC001', { stock: 10 })
  })

  test.afterEach(async () => {
    await cambiarProducto('MC001', { stock: cemento.stock })
    //si Ana compro a credito, paga ese mismo monto para que su deuda quede como estaba
    if (cargoDeAna > 0) {
      const ana = await conectarBackend(CORREOS.ana)
      await ana.post('/api/pagos', { clienteId: 4, monto: cargoDeAna })
      await ana.cerrar()
    }
  })

  test('CP-45: Ana tiene cuenta corriente y ve la opción de pagar con ella', async ({ page }) => {
    await llegarAlPago(page, CORREOS.ana)

    //encuentra el boton de radio de cuenta corriente, getBylabel acepta parte del texto
    await expect(page.getByLabel('Pagar con crédito de la ferretería')).toBeVisible()
  })

  test('CP-46: Ana compra con cuenta corriente y el total se suma a su deuda', async ({ page }) => {
    //en la base de datos real la deuda de Ana cambia, por eso se lee antes de comprar
    const deudaAntes = (await leerCliente(4)).saldoAdeudado
    //un saco con retiro en tienda: el total es solo el precio, sin envio
    const total = cemento.precio

    await llegarAlPago(page, CORREOS.ana)

    //encuentra el radio con el texto
    await page.getByLabel('Pagar con crédito de la ferretería').check()
    await page.getByRole('button', { name: /Confirmar/ }).click()

    //la compra queda registrada de inmediato
    await expect(page.getByRole('heading', { name: 'Compra realizada' })).toBeVisible()
    cargoDeAna = total
    await page.goto('/#/mi-credito')

    //vemos el saldo de deuda aumentado en el total de la compra
    await expect(page.locator('#saldo-actual')).toHaveText(formatoPrecio(deudaAntes + total))
  })

  test('CP-47: Luis no tiene cuenta corriente y no puede pagar con ella', async ({ page }) => {
    await llegarAlPago(page, CORREOS.luis)
    await expect(page.getByText('Pago al contado')).toBeVisible()

    //solo aparece pago al contado
    await expect(page.getByLabel('Pagar con crédito de la ferretería')).toHaveCount(0)
  })
})
