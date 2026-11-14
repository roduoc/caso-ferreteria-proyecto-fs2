import { test, expect } from '@playwright/test'
import { ingresar, leerProducto, cambiarProducto } from './apoyo'

//stock del Cemento Polpaico antes del test (aqui no se compra, solo se elige la entrega)
let stockOriginal

test.describe('HU-09 Elegir modalidad de entrega', () => {
  //antes del test agregamoso un cemento polpaico al carrito
  test.beforeEach(async ({ page }) => {
    //para agregarlo al carrito necesita stock: si en la base real se acabo, se repone para el test
    stockOriginal = (await leerProducto('MC001')).stock
    if (stockOriginal < 1) await cambiarProducto('MC001', { stock: 10 })

    await page.goto('/#/login')
    await ingresar(page, 'ana.torres@gmail.com', '1234')
    await expect(page).toHaveURL(/#\/mis-pedidos/)
    await page.goto('/#/producto/MC001')
    await page.getByRole('button', { name: 'Añadir al carrito' }).click()
    await expect(page.getByRole('status')).toHaveText('Producto añadido al carrito.')
    //luego pasamos a envios
    await page.goto('/#/envios')
    await expect(page.getByText('Modalidad de entrega')).toBeVisible()
  })

  test.afterEach(async () => {
    await cambiarProducto('MC001', { stock: stockOriginal })
  })

  test('CP-36: Ana elige retiro en tienda y el pago muestra esa modalidad', async ({ page }) => {
    await page.getByLabel('Retiro en tienda').check()
    await page.getByRole('button', { name: 'Continuar al pago' }).click()
    await expect(page).toHaveURL(/#\/pago/)
    await expect(page.getByText('Retiro en tienda Los Maestros')).toBeVisible()
  })

  test('CP-37: Ana elige despacho a domicilio y el pago muestra su dirección', async ({ page }) => {
    await page.getByLabel('Despacho a domicilio').check()
    await page.getByLabel('Comuna').fill('Coquimbo')
    await page.getByLabel('Dirección').fill('Calle Nueva 123')
    await page.getByRole('button', { name: 'Continuar al pago' }).click()
    await expect(page).toHaveURL(/#\/pago/)
    await expect(page.getByText('Despacho a Calle Nueva 123, Coquimbo')).toBeVisible()
  })

  test('CP-38: si Ana elige despacho, se pide la dirección y no se puede seguir sin ella', async ({ page }) => {
    //con retiro no se pide direccion
    await expect(page.getByLabel('Dirección')).toHaveCount(0)

    //con despacho aparece el campo de direccion
    await page.getByLabel('Despacho a domicilio').check()
    await expect(page.getByLabel('Dirección')).toBeVisible()

    //si se deja vaci no deja continuar
    await page.getByLabel('Dirección').fill('')
    await page.getByRole('button', { name: 'Continuar al pago' }).click()
    await expect(page.getByText('Ingresa la comuna y la dirección de despacho.')).toBeVisible()
    await expect(page).toHaveURL(/#\/envios/)
  })
})