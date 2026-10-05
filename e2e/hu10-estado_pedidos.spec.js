import { test, expect } from '@playwright/test'

async function ingresar(page, correo, clave) {
    await page.getByLabel('Correo').fill(correo)
    await page.getByLabel('Contraseña').fill(clave)
    await page.getByRole('button', { name: 'Acceder' }).click()
}

test.describe('HU-10 Consultar estado del pedido', () => {

    test('CP-39: Ana ve el estado de su pedido en Mis pedidos', async ({ page }) => {
        await page.goto('/#/login')
        await ingresar(page, 'ana.torres@gmail.com', '1234')
        await expect(page).toHaveURL(/#\/mis-pedidos/)
        await expect(page.getByText('En preparación')).toBeVisible()
    })

    test('CP-40: Pedro despacha el pedido de Ana y ella ve el estado nuevo', async ({ page }) => {
        //el vendedor pedro cambia el pedido 2 a despachado
        await page.goto('/#/login')
        await ingresar(page, 'vendedor@duoc.cl', '1234')
        await expect(page).toHaveURL(/#\/vendedor\/inventario/)
        await page.goto('/#/vendedor/pedidos')
        await page.getByPlaceholder('Buscar por número de pedido').fill('2')

        //al buscar el pedido 2 queda una sola tarjeta, asi que hay un solo label estado del dropdown
        //no se confunde con el estado del centro porque lo del centro es un span
        //lo del dropdown es un label
        await page.getByLabel('Estado', { exact: true }).selectOption({ label: 'Despachado' })
        await page.getByRole('button', { name: 'Editar estado' }).click()
        await expect(page.getByRole('alert')).toHaveText('Estado actualizado correctamente')

        //el vendedor cierra sesion y entra un cliente
        await page.getByRole('link', { name: 'Cerrar sesión' }).click()
        await expect(page).toHaveURL(/#\/login/)
        await ingresar(page, 'ana.torres@gmail.com', '1234')
        await expect(page).toHaveURL(/#\/mis-pedidos/)

        //ana busca el pedido 2, el mismo que cambio el vendedor
        await page.getByPlaceholder('Buscar por número de pedido').fill('2')
        await expect(page.getByText('Pedido #2')).toBeVisible()
        await expect(page.getByText('Despachado')).toBeVisible()
    })
})