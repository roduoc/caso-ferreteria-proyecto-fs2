import { test, expect } from '@playwright/test'
import {
  CORREOS, ingresar, datosUnicos, buscarIdPorCorreo, eliminarUsuarioSiExiste,
  crearClienteDePrueba, leerCliente, restaurarCliente,
} from './apoyo'

//getbyplaceholder busca un input con el placeholder 'buscar por nombre'
//una vez que lo identifica fill escribe dentro del campo
async function buscarUsuarioPorId(page, id) {
  await page.getByPlaceholder('Buscar por id (ej: 3)').fill(String(id))
}

//usuarios que creo el test, para eliminarlos al final y no dejar basura en MySQL
let creados = []

test.describe('HU-03 Gestión de usuarios y roles', () => {
  //antes de cada test, Carla, la admin, inicia sesión y llega a geestion de ususarios
  test.beforeEach(async ({ page }) => {
    creados = []
    await page.goto('/#/login')
    await ingresar(page, CORREOS.carla)
    await expect(page).toHaveURL(/#\/admin\/usuarios/)
  })

  test.afterEach(async () => {
    for (const id of creados) await eliminarUsuarioSiExiste(id)
  })

  //en este caso el texto que identifica cada campo esta dentro del campo, por eso
  //usamos getbyplaceholder, no getbylabel que es cuando el texto esta fuera del campo
  test('CP 14 Carla crea a Sofía como cliente y aparece en la lista', async ({ page }) => {
    //el backend no deja repetir correo ni RUT, por eso Sofia tiene datos nuevos en cada ejecucion
    const { rut, correo } = datosUnicos()
    await page.getByPlaceholder('RUT (sin puntos ni guion)').fill(rut)

    //es necesario el exact true porque si no encontraria tambien el placeholder de
    //'buscar por nombre' y se confundiria
    await page.getByPlaceholder('Nombre', { exact: true }).fill('Sofía')
    await page.getByPlaceholder('Apellidos').fill('Rojas Pérez')
    await page.getByPlaceholder('Correo electrónico').fill(correo)
    await page.getByPlaceholder('Contraseña (4 a 10 caracteres)').fill('1234')

    //select por el dropdown
    await page.locator('select[name="rol"]').selectOption({ label: 'Cliente' })
    await page.locator('select[name="region"]').selectOption({ label: 'Coquimbo' })
    await page.locator('select[name="comuna"]').selectOption({ label: 'La Serena' })
    await page.getByPlaceholder('Dirección').fill('Av. del Mar 100')
    await page.getByRole('button', { name: 'Agregar usuario' }).click()

    await expect(page.getByRole('alert')).toHaveText('Usuario Sofía Rojas Pérez creado correctamente')
    creados.push(await buscarIdPorCorreo(correo))

    //comprobamos que sofia esta con su correo, porque debe ser unico
    //sin recargar esperamos que sofia aparezca como estado de react
    await expect(page.getByText(correo)).toBeVisible()

    //recargamos para comprobar que sigue ahi: la lista se vuelve a pedir al backend,
    //asi que si aparece es porque quedo guardada en MySQL
    await page.reload()
    await expect(page.getByText(correo)).toBeVisible()
  })

  test('CP 15 no deja crear un usuario con el correo de Ana', async ({ page }) => {
    await page.getByPlaceholder('RUT (sin puntos ni guion)').fill(datosUnicos().rut)
    await page.getByPlaceholder('Nombre', { exact: true }).fill('Sofía')
    await page.getByPlaceholder('Apellidos').fill('Rojas Pérez')
    await page.getByPlaceholder('Correo electrónico').fill(CORREOS.ana)
    await page.getByPlaceholder('Contraseña (4 a 10 caracteres)').fill('1234')
    await page.locator('select[name="region"]').selectOption({ label: 'Coquimbo' })
    await page.locator('select[name="comuna"]').selectOption({ label: 'La Serena' })
    await page.getByPlaceholder('Dirección').fill('Av. del Mar 100')
    await page.getByRole('button', { name: 'Agregar usuario' }).click()

    await expect(page.getByRole('alert')).toHaveText('Ya existe un usuario con ese correo')
  })

  test('CP 16 Carla edita la dirección de Juan y el cambio queda guardado', async ({ page }) => {
    //se guardan los datos de Juan para dejarlos como estaban al terminar
    const juanOriginal = await leerCliente(3)
    try {
      await buscarUsuarioPorId(page, 3)

      //usamos el get by role link con el boton editar a pesar de que hay muchos botones
      //porque usamos el buscador para filtrar al usuario
      await page.getByRole('link', { name: 'Editar' }).click()
      await expect(page).toHaveURL(/#\/admin\/usuarios\/3/)

      await page.getByLabel('Dirección').fill('Calle Nueva 123')
      await page.getByRole('button', { name: 'Guardar cambios' }).click()
      await expect(page.getByRole('alert')).toHaveText('Cambios guardados correctamente')

      //si comprobamos que le cambio sigue ahi despues de recargar es porque de verdad se guardo
      //ya que al recargar se borra el componente y se vuelven a pedir los datos al backend
      await page.reload()
      await expect(page.getByLabel('Dirección')).toHaveValue('Calle Nueva 123')
    } finally {
      await restaurarCliente(juanOriginal)
    }
  })

  //no se usa a Juan: cambiarle el rol borraria su cuenta de cliente
  //se usa un cliente creado solo para esta prueba
  test('CP 17 Carla cambia el rol de un cliente a vendedor', async ({ page }) => {
    const cliente = await crearClienteDePrueba()
    creados.push(cliente.id)
    await page.reload()

    await buscarUsuarioPorId(page, cliente.id)
    await page.getByRole('link', { name: 'Editar' }).click()

    //getbylabel porque este dropdown tiene htmlfor y id
    await page.getByLabel('Rol').selectOption({ label: 'Vendedor' })
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(page.getByRole('alert')).toHaveText('Cambios guardados correctamente')
    await page.getByRole('link', { name: 'Volver a la lista de usuarios' }).click()
    await buscarUsuarioPorId(page, cliente.id)

    //locator 'p' busca los elementos <p> de la pagina
    //lo usamos porque se confunde con el vendedor del formulario de crear
    //y nosotros queremos saber el rol del usuario, es para descartar
    await expect(page.locator('p').getByText('Vendedor', { exact: true })).toBeVisible()
  })

  //en el backend eliminar es una baja logica que no se puede deshacer:
  //si se eliminara a Luis, los demas tests ya no lo tendrian. Se elimina un cliente de prueba
  test('CP 18 Carla elimina un cliente y desaparece de la lista', async ({ page }) => {
    const cliente = await crearClienteDePrueba()
    creados.push(cliente.id)
    await page.reload()

    await buscarUsuarioPorId(page, cliente.id)
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByRole('alert')).toHaveText(`Usuario ${cliente.nombreCompleto} eliminado correctamente`)

    //tohavecount es para contar las ocurrencias, esperamos que haya 0 porque
    //el cliente ya no esta, verificamos que desaparecio de la pantalla
    await expect(page.getByText(cliente.correo)).toHaveCount(0)

    await page.reload()
    await buscarUsuarioPorId(page, cliente.id)

    //si sigue sin aparecer depues de recargar es porque de verdad se elimino en el backend
    await expect(page.getByText(cliente.correo)).toHaveCount(0)
  })

  test('CP 19 no deja eliminar a Ana porque tiene deuda', async ({ page }) => {
    //en la base de datos real la deuda de Ana cambia con sus pagos
    const ana = await leerCliente(4)
    test.skip(ana.saldoAdeudado === 0, 'Ana no tiene deuda en este momento, no se puede probar')

    await buscarUsuarioPorId(page, 4)
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByRole('alert')).toHaveText('El cliente tiene deuda pendiente en su cuenta corriente')

    //que ana aparezca todavia en la pagina demuestra que no fue eliminada
    await expect(page.getByText(CORREOS.ana)).toBeVisible()

    //reload por si las dudas de que no se vaya a eliminar
    await page.reload()
    await buscarUsuarioPorId(page, 4)
    await expect(page.getByText(CORREOS.ana)).toBeVisible()
  })

  test('CP 20 Carla no puede eliminarse porque es la única admin', async ({ page }) => {
    await buscarUsuarioPorId(page, 1)
    await page.getByRole('button', { name: 'Eliminar' }).click()

    //este mensaje ahora lo manda el backend
    await expect(page.getByRole('alert')).toHaveText('Debe quedar al menos un administrador')

    await expect(page.getByText(CORREOS.carla)).toBeVisible()

    //despues de recargar carla sigue en la lista que manda el backend
    await page.reload()
    await buscarUsuarioPorId(page, 1)
    await expect(page.getByText(CORREOS.carla)).toBeVisible()
  })
})
