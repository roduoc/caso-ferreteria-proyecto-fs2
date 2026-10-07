import { describe, expect, it } from 'vitest';
import {
  actualizarUsuario, cerrarSesion, crearUsuario, eliminarUsuario, iniciarSesion,
  listarUsuarios, obtenerSesion, obtenerUsuario, registrarCliente,
} from './usuarioService';

const datos = {
  rut: '176543218', nombre: 'María', apellidos: 'López', correo: 'maria@gmail.com',
  clave: 'abcd', rol: 'cliente', region: 'Coquimbo', comuna: 'La Serena',
  direccion: 'Calle Uno 123', tipoCliente: 'particular',
};

const comoAdmin = () => iniciarSesion('admin@duoc.cl', '1234');

describe('HU 1: registro de clientes', () => {
  it('registra e inicia sesión inmediatamente con un token simulado', async () => {
    const sesion = await registrarCliente(datos);
    expect(sesion).toMatchObject({ correo: datos.correo, rol: 'cliente' });
    expect(sesion.token).toEqual(expect.any(String));
    expect(obtenerSesion()?.id).toBe(sesion.id);
  });

  it('rechaza correos fuera de los dominios permitidos o mal formados', async () => {
    for (const correo of ['maria@otro.com', '@gmail.com', 'correo-sin-arroba']) {
      await expect(registrarCliente({ ...datos, correo })).rejects.toThrow(/correo/i);
    }
  });

  it('rechaza contraseña inválida y correo duplicado', async () => {
    await expect(registrarCliente({ ...datos, clave: '' })).rejects.toThrow(/contraseña/i);
    await registrarCliente(datos);
    await expect(registrarCliente({ ...datos, rut: '176543229', correo: 'MARIA@GMAIL.COM' })).rejects.toThrow(/correo/i);
  });

});

describe('HU 2: sesión', () => {
  it('acepta credenciales correctas y cierra sesión invalidando el token', async () => {
    const sesion = await iniciarSesion('ADMIN@DUOC.CL', '1234');
    expect(sesion.token).toEqual(expect.any(String));
    cerrarSesion();
    expect(obtenerSesion()).toBeNull();
    localStorage.setItem('sesion', JSON.stringify(sesion));
    expect(obtenerSesion()).toBeNull();
    await expect(listarUsuarios()).rejects.toThrow(/administrador/i);
  });

  it('rechaza credenciales incorrectas y campos inválidos', async () => {
    await expect(iniciarSesion('admin@duoc.cl', 'error')).rejects.toThrow(/incorrectos/i);
    await expect(iniciarSesion('', '1234')).rejects.toThrow(/blanco/i);
    await expect(iniciarSesion('admin@otro.com', '1234')).rejects.toThrow(/correos/i);
    await expect(iniciarSesion('admin@duoc.cl', '12')).rejects.toThrow(/contraseña/i);
    expect(obtenerSesion()).toBeNull();
  });

  it('ignora sesiones manipuladas o de usuarios eliminados', async () => {
    localStorage.setItem('sesion', '{mal json');
    expect(obtenerSesion()).toBeNull();
    localStorage.setItem('sesion', JSON.stringify({ id: 3, rol: 'cliente' }));
    expect(obtenerSesion()).toBeNull();
    await comoAdmin();
    const usuario = await crearUsuario({ ...datos, rol: 'vendedor' });
    cerrarSesion();
    await iniciarSesion(datos.correo, datos.clave);
    const sesionEliminada = localStorage.getItem('sesion');
    await comoAdmin();
    await eliminarUsuario(usuario.id);
    localStorage.setItem('sesion', sesionEliminada);
    localStorage.setItem('tokenActivo', JSON.parse(sesionEliminada).token);
    expect(obtenerSesion()).toBeNull();
  });
});

describe('HU 3: gestión de usuarios por administrador', () => {
  it('impide listar, consultar, crear, editar o eliminar sin administrador', async () => {
    await expect(listarUsuarios()).rejects.toThrow(/administrador/i);
    await expect(obtenerUsuario(3)).rejects.toThrow(/administrador/i);
    await expect(crearUsuario(datos)).rejects.toThrow(/administrador/i);
    await expect(actualizarUsuario(3, datos)).rejects.toThrow(/administrador/i);
    await expect(eliminarUsuario(3)).rejects.toThrow(/administrador/i);
  });

  it('crea, cambia el rol y elimina un usuario; ya no puede iniciar sesión', async () => {
    await comoAdmin();
    const creado = await crearUsuario({ ...datos, rol: 'vendedor' });
    expect((await listarUsuarios()).some((u) => u.id === creado.id)).toBe(true);
    expect((await obtenerUsuario(creado.id)).rol).toBe('vendedor');
    const editado = await actualizarUsuario(creado.id, { ...datos, rol: 'cliente' });
    expect(editado.rol).toBe('cliente');
    await eliminarUsuario(creado.id);
    await expect(iniciarSesion(datos.correo, datos.clave)).rejects.toThrow(/incorrectos/i);
  });

  it('rechaza rol inválido, duplicados y eliminación del único administrador', async () => {
    await comoAdmin();
    await expect(crearUsuario({ ...datos, rol: 'otro' })).rejects.toThrow(/rol/i);
    await expect(crearUsuario({ ...datos, correo: 'admin@duoc.cl' })).rejects.toThrow(/correo/i);
    await expect(actualizarUsuario(3, { ...datos, rol: 'otro' })).rejects.toThrow(/rol/i);
    await expect(eliminarUsuario(1)).rejects.toThrow(/único administrador/i);
  });
});
