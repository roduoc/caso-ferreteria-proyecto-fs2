import usuariosMock from '../mocks/usuarios.json';
import clientesMock from '../mocks/clientes.json';
import regionesComunas from '../mocks/regionesComunas.json';
import { crearUsuarioDTO } from '../models/Usuario';
import { leer, guardar, esperar, siguienteId } from './storage';
import { crearCliente, actualizarCliente, eliminarCliente, TIPOS_CLIENTE } from './clienteService';

//se retorna un dto en leer, actualizar y crear para
//actualizar la pantalla luego de la accion, y porque 
//el nuevo elemento tiene que tener la misma forma
//que el resto de la lista. 

const CLAVE = 'usuarios';
const CLAVE_CLIENTES = 'clientes';
const CLAVE_ULTIMO_ID = 'ultimoIdUsuario';

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

//devuelve todos los usuarios
export async function listarUsuarios() {
  await esperar();
  exigirAdministrador();
  const usuarios = leer(CLAVE, usuariosMock);
  return usuarios.map(crearUsuarioDTO);
}

//devuelve un usuario segun su id
export async function obtenerUsuario(id) {
  await esperar();
  exigirAdministrador();
  const usuarios = leer(CLAVE, usuariosMock);
  const usuario = usuarios.find((u) => u.id === id);

  if (!usuario) throw new Error('Usuario no encontrado');
  return crearUsuarioDTO(usuario);
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

//crea un usuario nuevo
export async function crearUsuario(datos) {
  exigirAdministrador();
  return crearUsuarioInterno(datos);
}

async function crearUsuarioInterno(datos) {
  await esperar();
  validarDatos(datos);

  if (!ROLES.includes(datos.rol)) throw new Error('Selecciona un rol válido');

  //la clave solo se pide al crear, tiene las mismas reglas del registro
  if (datos.clave.length < 4 || datos.clave.length > 10) {
    throw new Error('La contraseña debe tener entre 4 y 10 caracteres');
  }

  const usuarios = leer(CLAVE, usuariosMock);
  const correo = datos.correo.trim().toLowerCase();
  const rut = datos.rut.trim().toUpperCase();

  //el correo y el rut no se pueden repetir
  if (usuarios.some((u) => u.correo.toLowerCase() === correo)) {
    throw new Error('Ya existe un usuario con ese correo');
  }
  if (usuarios.some((u) => u.rut.toUpperCase() === rut)) {
    throw new Error('Ya existe un usuario con ese RUT');
  }

  //el id nuevo sale del contador, asi no se repite el id de un usuario eliminado

  //se le pasan dos listas, que se juntan y se comparan con el numero mas grande que tengan ambas
  const nuevoId = siguienteId(CLAVE_ULTIMO_ID, [...usuariosMock, ...usuarios]);

  const nuevo = {
    id: nuevoId,
    rut,
    nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(),
    correo,
    clave: datos.clave,
    rol: datos.rol,
    region: datos.region,
    comuna: datos.comuna,
    direccion: datos.direccion.trim()
  };

  usuarios.push(nuevo);
  guardar(CLAVE, usuarios);

  //si es cliente, se le pide al clienteService que cree el registro
  //primero se guarda el usuario porque el cliente necesita que su usuario exista
  if (nuevo.rol === 'cliente') {
    await crearCliente(nuevoId, datos);
  }

  return crearUsuarioDTO(nuevo);
}

//cambia los datos de un usuario
//si es cliente, tambien actualiza, crea o elimina su registro de cliente segun el rol
export async function actualizarUsuario(id, datos) {
  await esperar();
  exigirAdministrador();
  validarDatos(datos);
  if (!ROLES.includes(datos.rol)) throw new Error('Selecciona un rol válido');

  const usuarios = leer(CLAVE, usuariosMock);
  const clientes = leer(CLAVE_CLIENTES, clientesMock);

  const indice = usuarios.findIndex((u) => u.id === id);
  if (indice === -1) throw new Error('Usuario no encontrado');

  const correo = datos.correo.trim().toLowerCase();
  //el correo no se puede repetir con el de otro usuario
  if (usuarios.some((u) => u.id !== id && u.correo.toLowerCase() === correo)) {
    throw new Error('Ya existe otro usuario con ese correo');
  }
  const rut = datos.rut.trim().toUpperCase();
  //el rut tampoco se puede repetir con el de otro usuario
  if (usuarios.some((u) => u.id !== id && u.rut.toUpperCase() === rut)) {
    throw new Error('Ya existe otro usuario con ese RUT');
  }

  const rolAnterior = usuarios[indice].rol;

  //no se puede dejar el sistema sin ningun admin
  const cantidadAdmins = usuarios.filter((u) => u.rol === 'admin').length;
  if (rolAnterior === 'admin' && datos.rol !== 'admin' && cantidadAdmins === 1) {
    throw new Error('Debe quedar al menos un administrador');
  }

  //primero se hacen los cambios en clientes, porque son los que pueden fallar por deuda
  //si fallan, el usuario no se alcanza a guardar
  //retorna true o false
  const eraCliente = clientes.some((c) => c.id === id);

  if (datos.rol === 'cliente' && eraCliente) {
    //sigue siendo cliente: se actualiza su tipo y cuenta corriente
    await actualizarCliente(id, datos);
  } else if (datos.rol === 'cliente' && !eraCliente) {
    //pasa a ser cliente: se le crea su registro
    await crearCliente(id, datos);
  } else if (datos.rol !== 'cliente' && eraCliente) {
    //deja de ser cliente: se borra su registro
    await eliminarCliente(id);
  }

  //se copia el usuario con los datos nuevos encima, la clave se mantiene
  usuarios[indice] = {
    ...usuarios[indice],
    rut,
    rol: datos.rol,
    nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(),
    correo,
    region: datos.region,
    comuna: datos.comuna,
    direccion: datos.direccion.trim(),
  };

  guardar(CLAVE, usuarios);
  return crearUsuarioDTO(usuarios[indice]);
}

//elimina un usuario, y si era cliente tambien su registro en clientes
export async function eliminarUsuario(id) {
  await esperar();
  exigirAdministrador();
  const usuarios = leer(CLAVE, usuariosMock);
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) throw new Error('Usuario no encontrado');

  //no se puede eliminar al unico administrador
  if (usuario.rol === 'admin' && usuarios.filter((u) => u.rol === 'admin').length === 1) {
    throw new Error('No se puede eliminar al único administrador');
  }

  //si es cliente, primero se elimina su registro de cliente
  //si tiene deuda, eliminarCliente lanza un error y el usuario no se elimina
  const clientes = leer(CLAVE_CLIENTES, clientesMock);
  if (clientes.some((c) => c.id === id)) {
    await eliminarCliente(id);
  }

  //filter deja a todos menos al usuario eliminado
  guardar(CLAVE, usuarios.filter((u) => u.id !== id));
}

//login
const CLAVE_SESION = 'sesion';
const CLAVE_TOKEN_ACTIVO = 'tokenActivo';

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

//busca un usuario con ese correo y clave
//si lo encuentra, guarda su dto en localStorage como el usuario con la sesion iniciada
export async function iniciarSesion(correo, clave) {
  await esperar();
  validarLogin(correo, clave);
  const usuarios = leer(CLAVE, usuariosMock);

  //revisa usuario por usuario y compara el correo y la clave
  const usuario = usuarios.find(
    (u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.clave === clave
  );

  if (!usuario) throw new Error('Correo o contraseña incorrectos.');

  //clave sesion aqui es sesion, se guarda el dto del usuario en sesion
  const usuarioDTO = crearUsuarioDTO(usuario);
  const sesion = { ...usuarioDTO, token: crypto.randomUUID() };
  guardar(CLAVE_SESION, sesion);
  guardar(CLAVE_TOKEN_ACTIVO, sesion.token);
  return sesion;
}

//devuelve el usuario con la sesion iniciada, o null
//no es async porque los layouts la necesitan antes de dibujar la pagina
export function obtenerSesion() {
  const guardado = localStorage.getItem(CLAVE_SESION);
  if (!guardado) return null;
  try {
    const sesion = JSON.parse(guardado);
    if (!sesion.token || sesion.token !== JSON.parse(localStorage.getItem(CLAVE_TOKEN_ACTIVO))) return null;
    const usuarios = leer(CLAVE, usuariosMock);
    const usuario = usuarios.find((u) => u.id === sesion.id && u.rol === sesion.rol);
    return usuario ? sesion : null;
  } catch {
    return null;
  }
}

//borra la sesion de localStorage
export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
  localStorage.removeItem(CLAVE_TOKEN_ACTIVO);
}

export async function registrarCliente(datos) {
  await crearUsuarioInterno({ ...datos, rol: 'cliente', cuentaCorrienteHabilitada: false });

  return iniciarSesion(datos.correo, datos.clave);
}
