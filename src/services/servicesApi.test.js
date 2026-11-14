import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { guardarSesion, obtenerSesion } from './sesion';
import { crearUsuario, actualizarUsuario, eliminarUsuario, iniciarSesion, registrarCliente } from './usuarioService';
import { listarProductos, crearProducto, actualizarStock, actualizarProducto, eliminarProducto } from './productoService';
import { obtenerCliente, actualizarCliente } from './clienteService';

const usuario = { id: 1, rol: 'admin', nombre: 'Carla', correo: 'admin@duoc.cl' };
const datosUsuario = {
  rut: '176543219', nombre: 'Prueba', apellidos: 'API', correo: 'PRUEBA@gmail.com', clave: '1234',
  rol: 'cliente', region: 'Coquimbo', comuna: 'La Serena', direccion: 'Calle 1',
  tipoCliente: 'particular', cuentaCorrienteHabilitada: false,
};
const token = () => `cabecera.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`;

function responder(cuerpo, status = 200) {
  fetch.mockResolvedValueOnce({ status, ok: status < 400, json: async () => cuerpo });
}

function peticion() {
  const [url, opciones] = fetch.mock.lastCall;
  return { url, ...opciones, datos: opciones.body ? JSON.parse(opciones.body) : undefined };
}

describe('servicios conectados a la API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    guardarSesion(usuario, token());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('consulta el catalogo sin token y devuelve el stock del backend', async () => {
    const productos = [{ codigo: 'MC001', stock: 7, stockBajo: false }];
    responder(productos);
    expect(await listarProductos()).toEqual(productos);
    expect(peticion()).toMatchObject({ url: expect.stringContaining('/api/productos'), method: 'GET', headers: {} });
    expect(localStorage.getItem('productos')).toBeNull();
  });

  it('crea productos con numeros y solo con los campos del request', async () => {
    responder({ codigo: 'TEST1', precio: 1000 });
    await crearProducto({ codigo: ' test1 ', nombre: 'Prueba', categoria: 'Pruebas', subcategoria: 'Test',
      marca: 'Test', unidad: 'Unidad', precio: '1000', stock: '5', stockMinimo: '2', activo: true });
    expect(peticion()).toMatchObject({ method: 'POST', datos: { codigo: 'TEST1', precio: 1000, stock: 5, stockMinimo: 2 } });
    expect(peticion().datos).not.toHaveProperty('activo');
    expect(peticion().headers.Authorization).toMatch(/^Bearer /);
  });

  it('vendedor usa el endpoint de stock y no puede editar precios', async () => {
    guardarSesion({ ...usuario, rol: 'vendedor' }, token());
    responder({ codigo: 'MC001', stock: 8 });
    expect((await actualizarStock('MC001', '8')).stock).toBe(8);
    expect(peticion()).toMatchObject({ url: expect.stringContaining('/api/productos/MC001/stock'), method: 'PATCH', datos: { stock: 8 } });
    await expect(actualizarProducto('MC001', { precio: 1 })).rejects.toThrow(/administrador/);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('crear y editar usuarios no envia campos de la vista ni crea clientes por separado', async () => {
    responder({ id: 6, rol: 'cliente' });
    await crearUsuario({ ...datosUsuario, id: 999, nombreCompleto: 'No enviar', token: 'No enviar' });
    expect(peticion()).toMatchObject({ method: 'POST', datos: { correo: 'prueba@gmail.com', clave: '1234', rol: 'cliente' } });
    expect(peticion().datos).not.toHaveProperty('id');
    expect(fetch).toHaveBeenCalledTimes(1);
    responder({ id: 6, rol: 'cliente' });
    await actualizarUsuario(6, { ...datosUsuario, id: 6 });
    expect(peticion()).toMatchObject({ url: expect.stringContaining('/api/usuarios/6'), method: 'PUT' });
    expect(peticion().datos).not.toHaveProperty('clave');
    expect(peticion().datos).not.toHaveProperty('id');
  });

  it('login y registro usan la respuesta JWT sin enviar la sesion anterior', async () => {
    const jwt = token();
    responder({ usuario, token: jwt });
    await iniciarSesion('ADMIN@DUOC.CL', '1234');
    expect(peticion()).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json' }, datos: { correo: 'admin@duoc.cl', clave: '1234' } });
    expect(obtenerSesion().token).toBe(jwt);
    responder({ usuario: { ...usuario, id: 6, rol: 'cliente' }, token: jwt });
    await registrarCliente(datosUsuario);
    expect(peticion().datos).not.toHaveProperty('rol');
    expect(peticion().datos).not.toHaveProperty('cuentaCorrienteHabilitada');
    expect(obtenerSesion().rol).toBe('cliente');
  });

  it('consulta y actualiza los clientes del backend sin usar mocks locales', async () => {
    responder({ id: 6, tipoCliente: 'contratista' });
    expect((await obtenerCliente(6)).id).toBe(6);
    expect(peticion().url).toContain('/api/clientes/6');
    responder({ id: 6, tipoCliente: 'particular', cuentaCorrienteHabilitada: false });
    await actualizarCliente(6, { tipoCliente: 'particular', cuentaCorrienteHabilitada: true, saldoAdeudado: 0 });
    expect(peticion()).toMatchObject({ method: 'PUT', datos: { tipoCliente: 'particular', cuentaCorrienteHabilitada: false } });
    expect(peticion().datos).not.toHaveProperty('saldoAdeudado');
    expect(localStorage.getItem('clientes')).toBeNull();
  });

  it('maneja DELETE 204, mensajes 409 y cierra la sesion ante un 401', async () => {
    responder(null, 204);
    await eliminarProducto('TEST1');
    expect(peticion().method).toBe('DELETE');
    responder({ mensaje: 'Debe quedar al menos un administrador' }, 409);
    await expect(eliminarUsuario(1)).rejects.toThrow('Debe quedar al menos un administrador');
    expect(obtenerSesion()).not.toBeNull();
    responder({ mensaje: 'Token vencido' }, 401);
    await expect(eliminarUsuario(1)).rejects.toThrow(/sesión expiró/);
    expect(obtenerSesion()).toBeNull();
  });
});
