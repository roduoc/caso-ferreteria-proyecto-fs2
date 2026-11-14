import { test, expect } from '@playwright/test'
import { CORREOS, ingresar, leerProducto, cambiarProducto, crearPedidoDePrueba } from './apoyo'

//en la base de datos real los pedidos de Ana y sus estados cambian con el uso,
//por eso cada test le crea un pedido nuevo a Ana (al contado, sin deuda) y revisa ese
let pedido
let stockOriginal

test.describe('HU-10 Consultar estado del pedido', () => {
    test.beforeEach(async () => {
        stockOriginal = (await leerProducto('MC001')).stock
        if (stockOriginal < 1) await cambiarProducto('MC001', { stock: 10 })
        pedido = await crearPedidoDePrueba(CORREOS.ana, 4, 'MC001')
    })

    //el pedido queda en el historial de Ana (los pedidos no se eliminan),
    //pero el stock que descontó se deja como estaba
    test.afterEach(async () => {
        await cambiarProducto('MC001', { stock: stockOriginal })
    })

    test('CP-39: Ana ve el estado de su pedido en Mis pedidos', async ({ page }) => {
        await page.goto('/#/login')
        await ingresar(page, CORREOS.ana)
        await expect(page).toHaveURL(/#\/mis-pedidos/)

        await page.getByPlaceholder('Buscar por número de pedido').fill(String(pedido.id))
        await expect(page.getByText(`Pedido #${pedido.id}`)).toBeVisible()
        //un pedido nuevo parte en estado pendiente
        await expect(page.getByText('Pendiente', { exact: true })).toBeVisible()
    })

    test('CP-40: Pedro despacha el pedido de Ana y ella ve el estado nuevo', async ({ page }) => {
        //el vendedor pedro cambia el pedido nuevo de ana a despachado
        await page.goto('/#/login')
        await ingresar(page, CORREOS.pedro)
        await expect(page).toHaveURL(/#\/vendedor\/inventario/)
        await page.goto('/#/vendedor/pedidos')
        await page.getByPlaceholder('Buscar por número de pedido').fill(String(pedido.id))

        //al buscar el pedido queda una sola tarjeta, asi que hay un solo label estado del dropdown
        //no se confunde con el estado del centro porque lo del centro es un span
        //lo del dropdown es un label
        await page.getByLabel('Estado', { exact: true }).selectOption({ label: 'Despachado' })
        await page.getByRole('button', { name: 'Editar estado' }).click()
        await expect(page.getByRole('alert')).toHaveText('Estado actualizado correctamente')

        //el vendedor cierra sesion y entra un cliente
        await page.getByRole('link', { name: 'Cerrar sesión' }).click()
        await expect(page).toHaveURL(/#\/login/)
        await ingresar(page, CORREOS.ana)
        await expect(page).toHaveURL(/#\/mis-pedidos/)

        //ana busca su pedido, el mismo que cambio el vendedor
        await page.getByPlaceholder('Buscar por número de pedido').fill(String(pedido.id))
        await expect(page.getByText(`Pedido #${pedido.id}`)).toBeVisible()
        await expect(page.getByText('Despachado', { exact: true })).toBeVisible()
    })
})
