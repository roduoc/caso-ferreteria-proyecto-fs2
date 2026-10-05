import { test, expect } from '@playwright/test'

async function ingresar(page, correo, clave) {
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña').fill(clave)
  await page.getByRole('button', { name: 'Acceder' }).click()
}

async function buscarEnCatalogo(page, codigo) {
  await page.goto('/#/productos')
  await page.getByLabel('Buscar producto').fill(codigo)
}

test.describe('HU-06 Mantener productos del catálogo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'admin@duoc.cl', '1234')
    await expect(page).toHaveURL(/#\/admin\/usuarios/)
    await page.goto('/#/admin/inventario')
  })

  test('CP-28: Carla crea un producto y aparece en el catálogo', async ({ page }) => {
    //exact true porque varios placeholders se parecen
    //codigo y buscar por codigo
    //categoria y subcategiria
    //precio y nuevo precio
    await page.getByPlaceholder('Código', { exact: true }).fill('HE999')
    await page.getByPlaceholder('Nombre', { exact: true }).fill('Alicate universal 8 pulgadas')
    await page.getByPlaceholder('Marca').fill('Stanley')
    await page.getByPlaceholder('Categoría', { exact: true }).fill('Herramientas')
    await page.getByPlaceholder('Subcategoría').fill('Alicates')
    await page.getByPlaceholder('Unidad (ej: Saco, Unidad)').fill('Unidad')
    await page.getByPlaceholder('Precio', { exact: true }).fill('8990')
    await page.getByPlaceholder('Cantidad', { exact: true }).fill('15')
    await page.getByPlaceholder('Stock mínimo').fill('5')
    await page.getByRole('button', { name: 'Agregar producto' }).click()

    await expect(page.getByRole('alert')).toHaveText('Producto HE999 creado correctamente')

    //luego vamos a buscar lo que creamos al ctalogo
    await buscarEnCatalogo(page, 'HE999')
    await expect(page.getByText('Alicate universal 8 pulgadas')).toBeVisible()
  })

  test('CP-29: Carla edita el precio del Cemento Polpaico y el catálogo muestra el precio nuevo', async ({ page }) => {
    await page.getByPlaceholder('Buscar por código (ej: MC001)').fill('MC001')
    await page.getByPlaceholder('Nuevo precio').fill('6500')
    await page.getByRole('button', { name: 'Editar precio' }).click()
    await expect(page.getByRole('alert')).toHaveText('Precio actualizado correctamente')

    await buscarEnCatalogo(page, 'MC001')
    await expect(page.getByText('$6.500')).toBeVisible()
  })

  test('CP-30: Carla elimina el Cemento Polpaico y ya no aparece en el catálogo', async ({ page }) => {
    await page.getByPlaceholder('Buscar por código (ej: MC001)').fill('MC001')
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByRole('alert')).toHaveText('Producto MC001 eliminado correctamente')

    await buscarEnCatalogo(page, 'MC001')
    await expect(page.getByText('No encontramos productos con esos filtros.')).toBeVisible()
  })
})