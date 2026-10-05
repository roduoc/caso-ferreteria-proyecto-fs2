import { test, expect } from '@playwright/test'

async function ingresar(page, correo, clave) {
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña').fill(clave)
  await page.getByRole('button', { name: 'Acceder' }).click()
}

//getbyplaceholder busca un input con el placeholder 'buscar por nombre'
//una vez que lo identifica fill escribe dentro del campo
async function buscarUsuarioPorId(page, id) {
  await page.getByPlaceholder('Buscar por id (ej: 3)').fill(String(id))
}

test.describe('HU-03 Gestión de usuarios y roles', () => {
  //antes de cada test, Carla, la admin, inicia sesión y llega a geestion de ususarios
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
    await ingresar(page, 'admin@duoc.cl', '1234')
    await expect(page).toHaveURL(/#\/admin\/usuarios/)
  })

  //en este caso el texto que identifica cada campo esta dentro del campo, por eso
  //usamos getbyplaceholder, no getbylabel que es cuando el texto esta fuera del campo
  test('CP 14 Carla crea a Sofía como cliente y aparece en la lista', async ({ page }) => {
    await page.getByPlaceholder('RUT (sin puntos ni guion)').fill('123456789')

    //es necesario el exact true porque si no encontraria tambien el placeholder de 
    //'buscar por nombre' y se confundiria
    await page.getByPlaceholder('Nombre', { exact: true }).fill('Sofía')
    await page.getByPlaceholder('Apellidos').fill('Rojas Pérez')
    await page.getByPlaceholder('Correo electrónico').fill('sofia@gmail.com')
    await page.getByPlaceholder('Contraseña (4 a 10 caracteres)').fill('1234')

    //select por el dropdown
    await page.locator('select[name="rol"]').selectOption({ label: 'Cliente' })
    await page.locator('select[name="region"]').selectOption({ label: 'Coquimbo' })
    await page.locator('select[name="comuna"]').selectOption({ label: 'La Serena' })
    await page.getByPlaceholder('Dirección').fill('Av. del Mar 100')
    await page.getByRole('button', { name: 'Agregar usuario' }).click()

    await expect(page.getByRole('alert')).toHaveText('Usuario Sofía Rojas Pérez creado correctamente')

    //comprobamos que sofia esta con su correo, porque debe ser unico
    //sin recargar esperamos que sofia aparezca como estado de react
    await expect(page.getByText('sofia@gmail.com')).toBeVisible()

    //recargamos para comprobar que sigue ahi y fue
    //guardada en localstorage
    await page.reload()
    await expect(page.getByText('sofia@gmail.com')).toBeVisible()
  })

  test('CP 15 no deja crear un usuario con el correo de Ana', async ({ page }) => {
    await page.getByPlaceholder('RUT (sin puntos ni guion)').fill('123456789')
    await page.getByPlaceholder('Nombre', { exact: true }).fill('Sofía')
    await page.getByPlaceholder('Apellidos').fill('Rojas Pérez')
    await page.getByPlaceholder('Correo electrónico').fill('ana.torres@gmail.com')
    await page.getByPlaceholder('Contraseña (4 a 10 caracteres)').fill('1234')
    await page.locator('select[name="region"]').selectOption({ label: 'Coquimbo' })
    await page.locator('select[name="comuna"]').selectOption({ label: 'La Serena' })
    await page.getByPlaceholder('Dirección').fill('Av. del Mar 100')
    await page.getByRole('button', { name: 'Agregar usuario' }).click()

    await expect(page.getByRole('alert')).toHaveText('Ya existe un usuario con ese correo')
  })

  test('CP 16 Carla edita la dirección de Juan y el cambio queda guardado', async ({ page }) => {
    await buscarUsuarioPorId(page, 3)

    //usamos el get by role link con el boton editar a pesar de que hay muchos botones
    //porque usamos el buscador para filtrar al usuario
    await page.getByRole('link', { name: 'Editar' }).click()
    await expect(page).toHaveURL(/#\/admin\/usuarios\/3/)

    await page.getByLabel('Dirección').fill('Calle Nueva 123')
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(page.getByRole('alert')).toHaveText('Cambios guardados correctamente')

    //al recargar, la direccion nueva sigue ahi porque se guardo en localStorage
    //si comprobamos que le cambio sigue ahi despues de recargar es porque de verdad se guardo
    //ya que al recargar se borra el componente y se vuelve a escribir
    //entonces se trae de nuevo los datos del usuario
    await page.reload()
    await expect(page.getByLabel('Dirección')).toHaveValue('Calle Nueva 123')
  })

  test('CP 17 Carla cambia el rol de Juan a vendedor', async ({ page }) => {
    await buscarUsuarioPorId(page, 3)
    await page.getByRole('link', { name: 'Editar' }).click()

    //getbylabel porque este dropdown tiene htmlfor y id
    await page.getByLabel('Rol').selectOption({ label: 'Vendedor' })
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(page.getByRole('alert')).toHaveText('Cambios guardados correctamente')
    await page.getByRole('link', { name: 'Volver a la lista de usuarios' }).click()
    await buscarUsuarioPorId(page, 3)

    //locator 'p' busca los elementos <p> de la pagina
    //lo usamos porque se confunde con el vendedor del formulario de crear
    //y nosotros queremos saber el rol de juan, es para descartar
    await expect(page.locator('p').getByText('Vendedor', { exact: true })).toBeVisible()
  })

  test('CP 18 Carla elimina a Luis y desaparece de la lista', async ({ page }) => {
    await buscarUsuarioPorId(page, 5)
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByRole('alert')).toHaveText('Usuario Luis Fuentes Araya eliminado correctamente')
    
    //tohavecount es para contar las ocurrencias, esperamos que haya 0 porque
    //luis ya no esta, verificamos que desaparecio de la pantalla
    await expect(page.getByText('luis.fuentes@duoc.cl')).toHaveCount(0)

    await page.reload()
    await buscarUsuarioPorId(page, 5)

    //si luis sigue sin aparecer depues de recargar es porque de verdad se elimino
    await expect(page.getByText('luis.fuentes@duoc.cl')).toHaveCount(0)
  })

  test('CP 19 no deja eliminar a Ana porque tiene deuda', async ({ page }) => {
    await buscarUsuarioPorId(page, 4)
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByRole('alert')).toHaveText('El cliente tiene deuda pendiente en su cuenta corriente')
    
    //que ana aparezca todavia en la pagina demuestra que no fue eliminada
    await expect(page.getByText('ana.torres@gmail.com')).toBeVisible()

    //reload por si las dudas de que no se vaya a eliminar
    await page.reload()
    await buscarUsuarioPorId(page, 4)
    await expect(page.getByText('ana.torres@gmail.com')).toBeVisible()
  })

  test('CP 20 Carla no puede eliminarse porque es la única admin', async ({ page }) => {
    await buscarUsuarioPorId(page, 1)
    await page.getByRole('button', { name: 'Eliminar' }).click()

    await expect(page.getByRole('alert')).toHaveText('No se puede eliminar al único administrador')

    await expect(page.getByText('admin@duoc.cl')).toBeVisible()

    //despues de recargar carla sigue guardada en localstorage
    await page.reload()
    await buscarUsuarioPorId(page, 1)
    await expect(page.getByText('admin@duoc.cl')).toBeVisible()
  })
})