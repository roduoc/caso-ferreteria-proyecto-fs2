import { describe, expect, it } from 'vitest';
import {
  actualizarUsuario, cerrarSesion, crearUsuario, eliminarUsuario, iniciarSesion,
  listarUsuarios, obtenerSesion, obtenerUsuario, registrarCliente,
} from './usuarioService';
import { crearToken, sesionDePrueba, simularApi, usuariosDePrueba } from '../test/apiSimulada';
import { guardarSesion, obtenerToken } from './sesion';

const datos = {
  rut: '176543218', nombre: 'María', apellidos: 'López', correo: 'maria@gmail.com',
  clave: 'abcd', rol: 'cliente', region: 'Coquimbo', comuna: 'La Serena',
  direccion: 'Calle Uno 123', tipoCliente: 'particular',
};

describe('HU 1: registro de clientes', () => {
  it('UT-01: guarda la sesión con el token devuelto al registrarse', async () => {
    const token = crearToken();
    const usuario = { id: 6, correo: datos.correo, rol: 'cliente' };
    simularApi({ 'POST /api/auth/registro': { estado: 201, cuerpo: { usuario, token } } });
    await expect(registrarCliente(datos)).resolves.toEqual({ ...usuario, token });
    expect(obtenerToken()).toBe(token);
  });

  it('UT-02: valida correo y contraseña y muestra el conflicto por correo duplicado', async () => {
    for (const correo of ['maria@otro.com', '@gmail.com', 'correo-sin-arroba']) {
      await expect(registrarCliente({ ...datos, correo })).rejects.toThrow(/correo/i);
    }
    await expect(registrarCliente({ ...datos, clave: '' })).rejects.toThrow(/contraseña/i);
    expect(fetch).not.toHaveBeenCalled();
    simularApi({
      'POST /api/auth/registro': { estado: 409, cuerpo: { mensaje: 'El correo ya está registrado' } },
    });
    await expect(registrarCliente(datos)).rejects.toThrow(/correo/i);
    expect(obtenerSesion()).toBeNull();
  });
});

describe('HU 2: sesión', () => {
  it('UT-03: guarda el token recibido y elimina la sesión local al salir', async () => {
    const token = crearToken();
    simularApi({ 'POST /api/auth/login': { cuerpo: { usuario: usuariosDePrueba[0], token } } });
    await expect(iniciarSesion('ADMIN@DUOC.CL', '1234')).resolves.toMatchObject({ rol: 'admin', token });
    expect(obtenerToken()).toBe(token);
    cerrarSesion();
    expect(obtenerToken()).toBeNull();
    await expect(listarUsuarios()).rejects.toThrow(/administrador/i);
  });

  it('UT-04: rechaza credenciales incorrectas y campos inválidos', async () => {
    const fetch = simularApi({
      'POST /api/auth/login': { estado: 401, cuerpo: { mensaje: 'Correo o contraseña incorrectos' } },
    });
    await expect(iniciarSesion('admin@duoc.cl', 'error')).rejects.toThrow(/incorrectos/i);
    await expect(iniciarSesion('', '1234')).rejects.toThrow(/blanco/i);
    await expect(iniciarSesion('admin@otro.com', '1234')).rejects.toThrow(/correos/i);
    await expect(iniciarSesion('admin@duoc.cl', '12')).rejects.toThrow(/contraseña/i);
    await expect(iniciarSesion('admin@duoc.cl', '')).rejects.toThrow(/blanco/i);
    expect(obtenerSesion()).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('UT-04: ignora sesiones incompletas y elimina un token vencido', () => {
    localStorage.setItem('sesion', '{mal json');
    expect(obtenerSesion()).toBeNull();
    localStorage.setItem('sesion', JSON.stringify({ id: 3, rol: 'cliente' }));
    expect(obtenerSesion()).toBeNull();
    guardarSesion(usuariosDePrueba[0], 'invalido');
    expect(obtenerSesion()).toBeNull();
    guardarSesion(usuariosDePrueba[0], crearToken(1));
    expect(obtenerSesion()).toBeNull();
    expect(localStorage.getItem('sesion')).toBeNull();
  });
});

describe('HU 3: gestión de usuarios por administrador', () => {
  it('UT-05: impide gestionar usuarios sin ser administrador', async () => {
    await expect(listarUsuarios()).rejects.toThrow(/administrador/i);
    await expect(obtenerUsuario(3)).rejects.toThrow(/administrador/i);
    await expect(crearUsuario(datos)).rejects.toThrow(/administrador/i);
    await expect(actualizarUsuario(3, datos)).rejects.toThrow(/administrador/i);
    await expect(eliminarUsuario(3)).rejects.toThrow(/administrador/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('UT-05: consulta y edita un usuario y muestra el rechazo al ingresar tras la baja', async () => {
    sesionDePrueba(1);
    const usuario = { id: 6, correo: datos.correo, rol: 'vendedor' };
    simularApi({
      'GET /api/usuarios': { cuerpo: [usuario] },
      'GET /api/usuarios/6': { cuerpo: usuario },
      'PUT /api/usuarios/6': { cuerpo: { ...usuario, rol: 'cliente' } },
      'DELETE /api/usuarios/6': { estado: 204 },
      'POST /api/auth/login': { estado: 401, cuerpo: { mensaje: 'Correo o contraseña incorrectos' } },
    });
    await expect(listarUsuarios()).resolves.toEqual([usuario]);
    await expect(obtenerUsuario(6)).resolves.toEqual(usuario);
    await expect(actualizarUsuario(6, datos)).resolves.toMatchObject({ rol: 'cliente' });
    await eliminarUsuario(6);
    cerrarSesion();
    await expect(iniciarSesion(datos.correo, datos.clave)).rejects.toThrow(/incorrectos/i);
  });

  it('UT-05: valida rol y contraseña y muestra el conflicto al borrar el único administrador', async () => {
    sesionDePrueba(1);
    const fetch = simularApi({
      'DELETE /api/usuarios/1': { estado: 409, cuerpo: { mensaje: 'Es el único administrador' } },
    });
    await expect(crearUsuario({ ...datos, rol: 'otro' })).rejects.toThrow(/rol/i);
    await expect(crearUsuario({ ...datos, clave: '12' })).rejects.toThrow(/contraseña/i);
    await expect(eliminarUsuario(1)).rejects.toThrow(/único administrador/i);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
