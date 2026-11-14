import { test, expect } from '@playwright/test'
import { CORREOS, ingresar, leerProducto, cambiarProducto } from './apoyo'

//pedro, vendedor, inicia sesion y cambia el stock de un producto
async function cambiarStock(page, codigo, cantidad) {
  await page.goto('/#/login')
  await ingresar(page, CORREOS.pedro)

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

//stock que tenia el Cemento Polpaico antes de cada test, para dejarlo igual al final
let stockOriginal

test.describe('HU-04 Consultar catálogo con stock', () => {
  test.beforeEach(async () => {
    stockOriginal = (await leerProducto('MC001')).stock
  })

  test.afterEach(async () => {
    await cambiarProducto('MC001', { stock: stockOriginal })
  })

  //en la base de datos real el stock cambia con las compras,
  //por eso se compara con lo que dice el backend y no con un numero fijo
  test('CP 21 el catálogo muestra el stock del Cemento Polpaico', async ({ page }) => {
    await buscarEnCatalogo(page, 'MC001')
    const texto = stockOriginal > 0 ? `Stock disponible: ${stockOriginal}` : 'Sin stock'
    await expect(page.getByText(texto)).toBeVisible()
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
