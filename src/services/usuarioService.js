import regionesComunas from '../mocks/regionesComunas.json';
import { TIPOS_CLIENTE } from './clienteService';
import { obtenerSesion, cerrarSesion, guardarSesion } from './sesion';
import { llamarApi } from './api';

export const rutasPorRol = {
  admin: '/admin/usuarios',
  vendedor: '/vendedor/inventario',
  cliente: '/mis-pedidos',
};

export const ROLES = ['admin', 'vendedor', 'cliente'];

function exigirAdministrador() {
  if (obtenerSesion()?.rol !== 'admin') throw new Error('Solo el administrador puede gestionar usuarios');
}

//dominios de correo permitidos
const DOMINIOS_PERMITIDOS = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];

export async function listarUsuarios() {
  exigirAdministrador();
  return llamarApi('/api/usuarios');
}

export async function obtenerUsuario(id) {
  exigirAdministrador();
  return llamarApi(`/api/usuarios/${encodeURIComponent(id)}`);
}

//revisa los datos del formulario de editar, lanza un error con el primer problema que encuentre
function validarDatos(datos) {
  if (!/^[0-9]{6,8}[0-9kK]$/.test(datos.rut.trim())) {
    throw new Error('El RUT debe tener entre 7 y 9 caracteres, sin puntos ni guion');
  }
  if (!datos.nombre.trim()) throw new Error('El nombre es obligatorio');
  if (datos.nombre.trim().length > 50) throw new Error('El nombre no puede superar los 50 caracteres');
  if (!datos.apellidos.trim()) throw new Error('Los apellidos son obligatorios');
  if (datos.apellidos.trim().length > 100) throw new Error('Los apellidos no pueden superar los 100 caracteres');

  const partesCorreo = datos.correo.trim().split('@');
  if (partesCorreo.length !== 2 || !/^[^\s@]+$/.test(partesCorreo[0]) || !DOMINIOS_PERMITIDOS.includes(partesCorreo[1].toLowerCase())) {
    throw new Error('El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com');
  }
  if (datos.correo.trim().length > 100) throw new Error('El correo no puede superar los 100 caracteres');

  if (!datos.region) throw new Error('Selecciona una región');
  if (!datos.comuna) throw new Error('Selecciona una comuna');

  //si la region existe y si la comuna pertenece a la region
  if (!regionesComunas[datos.region] || !regionesComunas[datos.region].includes(datos.comuna)) {
    throw new Error('La comuna no pertenece a la región elegida');
  }

  if (!datos.direccion.trim()) throw new Error('La dirección es obligatoria');
  if (datos.direccion.trim().length > 300) throw new Error('La dirección no puede superar los 300 caracteres');

  if (datos.rol === 'cliente' && !TIPOS_CLIENTE.includes(datos.tipoCliente)) {
    throw new Error('Selecciona si el cliente es particular o contratista');
  }
}

//solo se envian los campos de UsuarioRequest, sin id, token ni nombreCompleto
function datosUsuario(datos) {
  validarDatos(datos);
  if (!ROLES.includes(datos.rol)) throw new Error('Selecciona un rol válido');
  return {
    rut: datos.rut.trim().toUpperCase(),
    nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(),
    correo: datos.correo.trim().toLowerCase(),
    rol: datos.rol,
    region: datos.region,
    comuna: datos.comuna,
    direccion: datos.direccion.trim(),
    tipoCliente: datos.rol === 'cliente' ? datos.tipoCliente : null,
    cuentaCorrienteHabilitada: datos.rol === 'cliente' && datos.tipoCliente === 'contratista'
      && datos.cuentaCorrienteHabilitada === true,
  };
}

export async function crearUsuario(datos) {
  exigirAdministrador();
  const usuario = datosUsuario(datos);
  if (!datos.clave || datos.clave.length < 4 || datos.clave.length > 10) {
    throw new Error('La contraseña debe tener entre 4 y 10 caracteres');
  }
  //el backend crea tambien al cliente en la misma transaccion
  return llamarApi('/api/usuarios', {
    metodo: 'POST',
    datos: { ...usuario, clave: datos.clave },
  });
}

export async function actualizarUsuario(id, datos) {
  exigirAdministrador();
  const usuario = await llamarApi(`/api/usuarios/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    datos: datosUsuario(datos),
  });
  const sesion = obtenerSesion();
  if (sesion?.id === usuario.id) guardarSesion(usuario, sesion.token);
  return usuario;
}

export async function eliminarUsuario(id) {
  exigirAdministrador();
  await llamarApi(`/api/usuarios/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
  if (obtenerSesion()?.id === Number(id)) cerrarSesion();
}

//se vuelven a exportar porque estan en sesion y necesitamos exportarlas desde aqui
export { obtenerSesion, cerrarSesion };

function validarLogin(correo, clave) {
  if (!correo.trim()) throw new Error('No puede haber campos en blanco.');
  if (correo.trim().length > 100) throw new Error('El correo no puede superar los 100 caracteres.');

  const partes = correo.trim().split('@');
  if (partes.length !== 2 || !DOMINIOS_PERMITIDOS.includes(partes[1].toLowerCase())) {
    throw new Error('Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.');
  }

  if (!clave) throw new Error('No puede haber campos en blanco.');
  if (clave.length < 4 || clave.length > 10) {
    throw new Error('La contraseña debe tener entre 4 y 10 caracteres.');
  }
}

export async function iniciarSesion(correo, clave) {
  validarLogin(correo, clave);

  const respuesta = await llamarApi('/api/auth/login', {
    metodo: 'POST',
    sinToken: true,
    datos: { correo: correo.trim().toLowerCase(), clave },
  });

  return guardarSesion(respuesta.usuario, respuesta.token);
}

export async function registrarCliente(datos) {
  validarDatos({ ...datos, rol: 'cliente' });
  if (datos.clave.length < 4 || datos.clave.length > 10) {
    throw new Error('La contraseña debe tener entre 4 y 10 caracteres');
  }

  //solo se mandan los campos que espera el backend (RegistroRequest)
  //si se manda un campo de mas, el backend responde 400
  const respuesta = await llamarApi('/api/auth/registro', {
    metodo: 'POST',
    sinToken: true,
    datos: {
      rut: datos.rut.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
      clave: datos.clave,
      region: datos.region,
      comuna: datos.comuna,
      direccion: datos.direccion.trim(),
      tipoCliente: datos.tipoCliente,
    },
  });

  return guardarSesion(respuesta.usuario, respuesta.token);
}
