import { test, expect } from '@playwright/test'

// Datos válidos de una clienta nueva (no existe en usuarios.json)
const datosValidos = {
  nombre: 'Sofía',
  apellidos: 'Rojas Pérez',
  rut: '123456789',
  correo: 'sofia@gmail.com',
  clave: '1234',
  region: 'Coquimbo',
  comuna: 'La Serena',
  direccion: 'Av. del Mar 100',
}

//page es una pestaña abierta del navegador que abre playwright
async function llenarFormulario(page, cambios = {}) {
    //datos se recalcula cada vez que se llama a llenarformulario, para actualizarlo
  const datos = { ...datosValidos, ...cambios }
  //getbylabel busca un label con ese texto
  //una vez que lo encuentra, lee el htmlfor, luego busca el id y encuentra el campo a llenar
  //fill llena ese campo

  //usamos getbylabel porque lo que ve el usuario es el campo con un label encima
  //a diferencia del getbyplaceholder que tiene el texto dentro del campo
  await page.getByLabel('Nombre').fill(datos.nombre)
  await page.getByLabel('Apellidos').fill(datos.apellidos)
  await page.getByLabel('RUT').fill(datos.rut)
  await page.getByLabel('Correo').fill(datos.correo)
  await page.getByLabel('Contraseña').fill(datos.clave)
  await page.getByLabel('Región').selectOption({ label: datos.region })
  await page.getByLabel('Comuna').selectOption({ label: datos.comuna })
  await page.getByLabel('Dirección').fill(datos.direccion)
  await page.getByRole('button', { name: 'Registrarse' }).click()
}

test.describe('HU-01 Registro de clientes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/registro')
  })

  test('CP-1 Sofía se registra y llega a mis pedidos', async ({ page }) => {
    await llenarFormulario(page)
    await expect(page).toHaveURL(/#\/mis-pedidos/)
  })

  test('CP-2 rechaza correo con dominio no permitido', async ({ page }) => {
    await llenarFormulario(page, { correo: 'sofia@hotmail.com' })
    await expect(page.getByRole('alert')).toHaveText('El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com')
    //comprobamos que luego del error nos mantenemos en registro
    await expect(page).toHaveURL(/#\/registro/)
  })

  test('CP-3 rechaza contraseña de menos de 4 caracteres', async ({ page }) => {
    await llenarFormulario(page, { clave: '12' })
    await expect(page.getByRole('alert')).toHaveText('La contraseña debe tener entre 4 y 10 caracteres')
    await expect(page).toHaveURL(/#\/registro/)
  })

  test('CP-4 rechaza RUT con puntos y guion', async ({ page }) => {
    await llenarFormulario(page, { rut: '12.345.678-9' })
    await expect(page.getByRole('alert')).toHaveText('El RUT debe tener entre 7 y 9 caracteres, sin puntos ni guion')
    await expect(page).toHaveURL(/#\/registro/)
  })

  test('CP-5 rechaza el correo de Ana porque ya existe', async ({ page }) => {
    await llenarFormulario(page, { correo: 'ana.torres@gmail.com' })
    await expect(page.getByRole('alert')).toHaveText('Ya existe un usuario con ese correo')
    await expect(page).toHaveURL(/#\/registro/)
  })

  test('CP-6 con sesión iniciada, registro redirige a mis pedidos', async ({ page }) => {
    await llenarFormulario(page)
    await page.goto('/#/registro')
    await expect(page).toHaveURL(/#\/mis-pedidos/)
  })
})