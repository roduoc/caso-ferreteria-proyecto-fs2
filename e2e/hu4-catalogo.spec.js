import { test, expect } from '@playwright/test'

async function ingresar(page, correo, clave) {
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña').fill(clave)
  await page.getByRole('button', { name: 'Acceder' }).click()
}

//pedro, vendedor, inicia sesion y cambia el stock de un producto
async function cambiarStock(page, codigo, cantidad) {
  await page.goto('/#/login')
  await ingresar(page, 'vendedor@duoc.cl', '1234')

  await page.getByPlaceholder('Buscar por código (ej: MC001)').fill(codigo)
  //fill escribe texto, por eso debemos convertir lo que escribimos a string
  await page.getByPlaceholder('Nueva cantidad').fill(String(cantidad))
  await page.getByRole('button', { name: 'Editar cantidad' }).click()
  await expect(page.getByRole('alert')).toHaveText('Cantidad actualizada correctamente')
}

async function buscarEnCatalogo(page, codigo) {
  await page.goto('/#/productos')
  await page.getByLabel('Buscar producto').fill(codigo)
}

test.describe('HU-04 Consultar catálogo con stock', () => {

  test('CP 21 el catálogo muestra el stock del Cemento Polpaico', async ({ page }) => {
    await buscarEnCatalogo(page, 'MC001')
    await expect(page.getByText('Stock disponible: 80')).toBeVisible()
  })

  test('CP 22 Pedro cambia el stock y el catálogo muestra el stock nuevo', async ({ page }) => {
    await cambiarStock(page, 'MC001', 75)
    await buscarEnCatalogo(page, 'MC001')
    await expect(page.getByText('Stock disponible: 75')).toBeVisible()
  })

  test('CP 23 un producto sin stock se indica claramente en el catálogo', async ({ page }) => {
    await cambiarStock(page, 'MC001', 0)
    await buscarEnCatalogo(page, 'MC001')
    await expect(page.getByText('Sin stock')).toBeVisible()
  })

  test('CP 24 un producto sin stock no se puede agregar al carrito', async ({ page }) => {
    await cambiarStock(page, 'MC001', 0)
    await buscarEnCatalogo(page, 'MC001')
    await page.getByRole('button', { name: 'Añadir' }).click()

    //en productos nuestro aviso de producto sin stock es con status
    await expect(page.getByRole('status')).toHaveText('Este producto no tiene stock disponible.')

    //usamos el nombre del aria label para ese link
    await expect(page.getByRole('link', { name: 'Carrito con 0 productos' })).toBeVisible()
  })
})
