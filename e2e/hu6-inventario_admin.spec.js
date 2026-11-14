import { test, expect } from '@playwright/test'
import {
  CORREOS, ingresar, datosUnicos, formatoPrecio, leerProducto, cambiarProducto,
  crearProductoDePrueba, eliminarProductoSiExiste,
} from './apoyo'

async function buscarEnCatalogo(page, codigo) {
  await page.goto('/#/productos')
  await page.getByLabel('Buscar producto').fill(codigo)
}

//productos que creo el test, para eliminarlos al final
let creados = []

test.describe('HU-06 Mantener productos del catálogo', () => {
  test.beforeEach(async ({ page }) => {
    creados = []
    await page.goto('/#/login')
    await ingresar(page, CORREOS.carla)
    await expect(page).toHaveURL(/#\/admin\/usuarios/)
    await page.goto('/#/admin/inventario')
  })

  test.afterEach(async () => {
    for (const codigo of creados) await eliminarProductoSiExiste(codigo)
  })

  test('CP-28: Carla crea un producto y aparece en el catálogo', async ({ page }) => {
    //el backend no deja repetir codigos (ni de productos eliminados),
    //por eso el alicate tiene un codigo nuevo en cada ejecucion
    const { codigo } = datosUnicos()
    creados.push(codigo)

    //exact true porque varios placeholders se parecen
    //codigo y buscar por codigo
    //categoria y subcategiria
    //precio y nuevo precio
    await page.getByPlaceholder('Código', { exact: true }).fill(codigo)
    await page.getByPlaceholder('Nombre', { exact: true }).fill('Alicate universal 8 pulgadas')
    await page.getByPlaceholder('Marca').fill('Stanley')
    await page.getByPlaceholder('Categoría', { exact: true }).fill('Herramientas')
    await page.getByPlaceholder('Subcategoría').fill('Alicates')
    await page.getByPlaceholder('Unidad (ej: Saco, Unidad)').fill('Unidad')
    await page.getByPlaceholder('Precio', { exact: true }).fill('8990')
    await page.getByPlaceholder('Cantidad', { exact: true }).fill('15')
    await page.getByPlaceholder('Stock mínimo').fill('5')
    await page.getByRole('button', { name: 'Agregar producto' }).click()

    await expect(page.getByRole('alert')).toHaveText(`Producto ${codigo} creado correctamente`)

    //luego vamos a buscar lo que creamos al ctalogo
    await buscarEnCatalogo(page, codigo)
    await expect(page.getByText('Alicate universal 8 pulgadas')).toBeVisible()
  })

  test('CP-29: Carla edita el precio del Cemento Polpaico y el catálogo muestra el precio nuevo', async ({ page }) => {
    //se guarda el precio actual para dejarlo igual al terminar
    const precioOriginal = (await leerProducto('MC001')).precio
    //un precio distinto al actual, para que de verdad se note el cambio
    const precioNuevo = precioOriginal + 500
    try {
      await page.getByPlaceholder('Buscar por código (ej: MC001)').fill('MC001')
      await page.getByPlaceholder('Nuevo precio').fill(String(precioNuevo))
      await page.getByRole('button', { name: 'Editar precio' }).click()
      await expect(page.getByRole('alert')).toHaveText('Precio actualizado correctamente')

      await buscarEnCatalogo(page, 'MC001')
      await expect(page.getByText(formatoPrecio(precioNuevo))).toBeVisible()
    } finally {
      await cambiarProducto('MC001', { precio: precioOriginal })
    }
  })

  //eliminar es una baja logica que no se puede deshacer: si se eliminara el Cemento Polpaico,
  //los demas tests ya no lo tendrian. Se elimina un producto creado solo para esta prueba
  test('CP-30: Carla elimina un producto y ya no aparece en el catálogo', async ({ page }) => {
    const producto = await crearProductoDePrueba()
    creados.push(producto.codigo)
    await page.reload()

    await page.getByPlaceholder('Buscar por código (ej: MC001)').fill(producto.codigo)
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByRole('alert')).toHaveText(`Producto ${producto.codigo} eliminado correctamente`)

    await buscarEnCatalogo(page, producto.codigo)
    await expect(page.getByText('No encontramos productos con esos filtros.')).toBeVisible()
  })
})
