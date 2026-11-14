import { request, expect } from '@playwright/test'

//la misma direccion que usa el frontend (la lee playwright.config.js desde el .env)
export const BACKEND_URL = process.env.VITE_API_URL ?? 'http://localhost:8080'

export const CORREOS = {
  carla: 'admin@duoc.cl',
  pedro: 'vendedor@duoc.cl',
  juan: 'juan.perez@gmail.com',
  ana: 'ana.torres@gmail.com',
  luis: 'luis.fuentes@duoc.cl',
}

export async function ingresar(page, correo, clave = '1234') {
  await page.getByLabel('Correo').fill(correo)
  await page.getByLabel('Contraseña').fill(clave)
  await page.getByRole('button', { name: 'Acceder' }).click()
}

export function formatoPrecio(precio) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(precio)
}

let contador = 0
export function datosUnicos() {
  contador += 1
  const numero = `${Date.now()}`.slice(-7) + (contador % 10)
  return {
    rut: `${numero}${contador % 10}`,
    correo: `pw${numero}@gmail.com`,
    codigo: `PW${numero}`,
  }
}

export async function conectarBackend(correo = CORREOS.carla) {
  const contexto = await request.newContext({ baseURL: BACKEND_URL })
  const login = await contexto.post('/api/auth/login', { data: { correo, clave: '1234' } })
  expect(login.ok(), `No se pudo iniciar sesion con ${correo} en ${BACKEND_URL}. ¿Esta encendido el backend?`).toBeTruthy()
  const { token } = await login.json()

  async function llamar(metodo, ruta, datos) {
    const respuesta = await contexto.fetch(ruta, {
      method: metodo,
      headers: { Authorization: `Bearer ${token}` },
      data: datos,
    })
    if (!respuesta.ok()) {
      throw new Error(`${metodo} ${ruta} respondio ${respuesta.status()}: ${await respuesta.text()}`)
    }
    return respuesta.status() === 204 ? null : respuesta.json()
  }

  return {
    get: (ruta) => llamar('GET', ruta),
    post: (ruta, datos) => llamar('POST', ruta, datos),
    put: (ruta, datos) => llamar('PUT', ruta, datos),
    patch: (ruta, datos) => llamar('PATCH', ruta, datos),
    eliminar: (ruta) => llamar('DELETE', ruta),
    cerrar: () => contexto.dispose(),
  }
}

// ---------- productos ----------

export async function leerProducto(codigo) {
  const carla = await conectarBackend()
  const producto = await carla.get(`/api/productos/${codigo}`)
  await carla.cerrar()
  return producto
}

//Carla cambia el precio o el stock de un producto (por ejemplo para restaurarlo)
export async function cambiarProducto(codigo, cambios) {
  const carla = await conectarBackend()
  await carla.patch(`/api/productos/${codigo}`, cambios)
  await carla.cerrar()
}

//crea un producto solo para el test, con un codigo que no existe
export async function crearProductoDePrueba(cambios = {}) {
  const { codigo } = datosUnicos()
  const producto = {
    codigo,
    nombre: `Producto de prueba ${codigo}`,
    categoria: 'Herramientas',
    subcategoria: 'Pruebas',
    marca: 'Playwright',
    unidad: 'Unidad',
    precio: 1000,
    stock: 10,
    stockMinimo: 2,
    ...cambios,
  }
  const carla = await conectarBackend()
  await carla.post('/api/productos', producto)
  await carla.cerrar()
  return producto
}

//elimina un producto si todavia existe (si el test ya lo elimino, no hace nada)
export async function eliminarProductoSiExiste(codigo) {
  const carla = await conectarBackend()
  try {
    await carla.eliminar(`/api/productos/${codigo}`)
  } catch {
    //ya estaba eliminado
  }
  await carla.cerrar()
}

// ---------- usuarios ----------

//crea un cliente solo para el test, con correo y RUT que no existen
export async function crearClienteDePrueba(cambios = {}) {
  const { rut, correo } = datosUnicos()
  const datos = {
    rut,
    nombre: 'Prueba',
    apellidos: 'Playwright',
    correo,
    clave: '1234',
    rol: 'cliente',
    region: 'Coquimbo',
    comuna: 'La Serena',
    direccion: 'Calle de Prueba 1',
    tipoCliente: 'particular',
    cuentaCorrienteHabilitada: false,
    ...cambios,
  }
  const carla = await conectarBackend()
  const usuario = await carla.post('/api/usuarios', datos)
  await carla.cerrar()
  return usuario
}

//busca el id de un usuario por su correo (por ejemplo, el que se registro en el test)
export async function buscarIdPorCorreo(correo) {
  const carla = await conectarBackend()
  const usuarios = await carla.get('/api/usuarios')
  await carla.cerrar()
  return usuarios.find((u) => u.correo === correo.toLowerCase())?.id
}

//elimina un usuario creado por el test, si todavia existe
export async function eliminarUsuarioSiExiste(id) {
  if (!id) return
  const carla = await conectarBackend()
  try {
    await carla.eliminar(`/api/usuarios/${id}`)
  } catch {
    //ya estaba eliminado
  }
  await carla.cerrar()
}

//lee un cliente con sus datos de usuario y de cuenta corriente
export async function leerCliente(id) {
  const carla = await conectarBackend()
  const cliente = await carla.get(`/api/clientes/${id}`)
  await carla.cerrar()
  return cliente
}

//deja a un cliente con los datos que tenia antes del test
export async function restaurarCliente(cliente) {
  const carla = await conectarBackend()
  await carla.put(`/api/usuarios/${cliente.id}`, {
    rut: cliente.rut,
    nombre: cliente.nombre,
    apellidos: cliente.apellidos,
    correo: cliente.correo,
    rol: 'cliente',
    region: cliente.region,
    comuna: cliente.comuna,
    direccion: cliente.direccion,
    tipoCliente: cliente.tipoCliente,
    cuentaCorrienteHabilitada: cliente.cuentaCorrienteHabilitada,
  })
  await carla.cerrar()
}

// ---------- pedidos ----------

//un cliente compra un producto al contado con retiro en tienda, sin pasar por la pantalla
export async function crearPedidoDePrueba(correo, clienteId, codigo) {
  const cliente = await conectarBackend(correo)
  const pedido = await cliente.post('/api/pedidos', {
    clienteId,
    medioPago: 'contado',
    entrega: { modalidad: 'retiro', comuna: '', direccion: '' },
    items: [{ codigo, cantidad: 1 }],
  })
  await cliente.cerrar()
  return pedido
}

export async function pedidosDeCliente(id) {
  const carla = await conectarBackend()
  const pedidos = await carla.get(`/api/pedidos/cliente/${id}`)
  await carla.cerrar()
  return pedidos
}
