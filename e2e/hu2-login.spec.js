import { test, expect } from '@playwright/test'

async function ingresar(page, correo, clave) {
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña').fill(clave)
  await page.getByRole('button', { name: 'Acceder' }).click()
}

test.describe('HU-02 Iniciar y cerrar sesión', () => {

  test('CP-7 Ana (cliente) inicia sesión y llega a Mis pedidos', async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'ana.torres@gmail.com', '1234')
    await expect(page).toHaveURL(/#\/mis-pedidos/)
  })

  test('CP-8 Pedro (vendedor) inicia sesión y llega a su inventario', async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'vendedor@duoc.cl', '1234')
    await expect(page).toHaveURL(/#\/vendedor\/inventario/)
  })

  test('CP-9 Carla (admin) inicia sesión y llega a Gestión de usuarios', async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'admin@duoc.cl', '1234')
    await expect(page).toHaveURL(/#\/admin\/usuarios/)
  })

  test('CP-10 con clave incorrecta muestra error y no inicia sesión', async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'ana.torres@gmail.com', '9999')
    await expect(page.getByRole('alert')).toHaveText('Correo o contraseña incorrectos.')
    await expect(page).toHaveURL(/#\/login/)
  })

  test('CP-11 Ana entra a Mi crédito sin sesión y vuelve ahí después del login', async ({ page }) => {
    await page.goto('/#/mi-credito')
    await expect(page).toHaveURL(/#\/login/)
    await ingresar(page, 'ana.torres@gmail.com', '1234')
    await expect(page).toHaveURL(/#\/mi-credito/)
  })

  test('CP-12 Juan (cliente) no puede entrar al panel de admin', async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'juan.perez@gmail.com', '1234')
    await expect(page).toHaveURL(/#\/mis-pedidos/)
    await page.goto('/#/admin/usuarios')
    await expect(page).toHaveURL(/#\/mis-pedidos/)
  })

  test('CP-13 Ana cierra sesión y ya no puede entrar a Mis pedidos', async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'ana.torres@gmail.com', '1234')
    await expect(page).toHaveURL(/#\/mis-pedidos/)
    await page.getByRole('link', { name: 'Cerrar sesión' }).click()
    await page.goto('/#/mis-pedidos')
    await expect(page).toHaveURL(/#\/login/)
  })
})