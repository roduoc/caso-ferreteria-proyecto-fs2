import { vi } from 'vitest';
import productos from '../mocks/productos.json';
import usuarios from '../mocks/usuarios.json';
import clientes from '../mocks/clientes.json';
import pedidos from '../mocks/pedidos.json';
import { crearUsuarioDTO } from '../models/Usuario';
import { guardarSesion } from '../services/sesion';

export const usuariosDePrueba = usuarios.map(crearUsuarioDTO);

export const clientesDePrueba = clientes.map((cliente) => ({
  ...usuariosDePrueba.find(({ id }) => id === cliente.id),
  ...cliente,
}));

export { pedidos };

export function crearToken(exp = Math.floor(Date.now() / 1000) + 3600) {
  return `prueba.${btoa(JSON.stringify({ exp }))}.firma`;
}

export function sesionDePrueba(id) {
  return guardarSesion(usuariosDePrueba.find((usuario) => usuario.id === id), crearToken());
}

export function simularApi(rutas = {}) {
  const solicitudes = vi.fn(async (url, opciones) => {
    const ruta = `${opciones.method} ${new URL(url).pathname}`;
    if (!Object.hasOwn(rutas, ruta)) {
      throw new Error(`Petición sin respuesta simulada: ${ruta}`);
    }
    const { estado = 200, cuerpo } = rutas[ruta];
    return { status: estado, ok: estado < 400, json: async () => structuredClone(cuerpo) };
  });
  vi.stubGlobal('fetch', solicitudes);
  return solicitudes;
}

export function rutasCatalogo(cambios = {}) {
  const catalogo = productos.map((producto) => ({ ...producto, ...cambios[producto.codigo] }));
  const rutas = { 'GET /api/productos': { cuerpo: catalogo.filter(({ activo }) => activo !== false) } };
  for (const producto of catalogo) {
    rutas[`GET /api/productos/${producto.codigo}`] = producto.activo === false
      ? { estado: 404, cuerpo: { mensaje: 'Producto no encontrado' } }
      : { cuerpo: producto };
  }
  return rutas;
}
