import { test, expect } from '@playwright/test'

async function agregarDesdeDetalle(page, codigo, cantidad) {
  await page.goto(`/#/producto/${codigo}`)
  //exact true porque los botones + y - tienen aria-label aumentar cantidad y disminuir cantidad
  //se puede confundir

  //getbylabel tambien mira los aria label
  //en este caso, tenemos el label quantity input que se conecta con su respectivo input
  await page.getByLabel('Cantidad', { exact: true }).fill(String(cantidad))
  await page.getByRole('button', { name: 'Añadir al carrito' }).click()
}

test.describe('HU-08 Agregar productos al carrito', () => {

  test('CP-33: se agregan 3 sacos de Cemento Polpaico al carrito', async ({ page }) => {
    await agregarDesdeDetalle(page, 'MC001', 3)
    await expect(page.getByRole('status')).toHaveText('Producto añadido al carrito.')
    await expect(page.getByRole('link', { name: 'Carrito con 3 productos' })).toBeVisible()
    await page.goto('/#/carrito')
    await expect(page.getByText('Cemento Polpaico gris 25 kg')).toBeVisible()
    await expect(page.getByText('3 productos en el carrito')).toBeVisible()
  })

  test('CP-34: no se puede agregar más Caladoras que su stock, 4', async ({ page }) => {
    await agregarDesdeDetalle(page, 'HE006', 4)
    await expect(page.getByRole('status')).toHaveText('Producto añadido al carrito.')
    //se intenta agregar 1 mas
    await page.getByLabel('Cantidad', { exact: true }).fill('1')
    await page.getByRole('button', { name: 'Añadir al carrito' }).click()
    await expect(page.getByRole('status')).toHaveText('Solo hay 4 disponibles y ya tienes 4 en tu carrito.')
    //el carrito se queda en 4
    await expect(page.getByRole('link', { name: 'Carrito con 4 productos' })).toBeVisible()
  })

  test('CP-35: el subtotal del carrito cambia al agregar, modificar y eliminar', async ({ page }) => {
    //la fila subtotal
    const subtotal = page.locator('aside div').filter({ hasText: 'Subtotal' })

    //agregar 2 sacos = 11980
    await agregarDesdeDetalle(page, 'MC001', 2)
    await expect(page.getByRole('status')).toHaveText('Producto añadido al carrito.')
    await page.goto('/#/carrito')
    await expect(subtotal).toContainText('$11.980')

    //con + quedan 3 sacos 17970
    await page.getByRole('button', { name: 'Aumentar cantidad' }).click()
    await expect(subtotal).toContainText('$17.970')

    //con - vuelven a ser 2 sacos 11980
    await page.getByRole('button', { name: 'Disminuir cantidad' }).click()
    await expect(subtotal).toContainText('$11.980')

    //al eliminar el carrito queda vacio
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByText('Tu carrito está vacío')).toBeVisible()
  })
})