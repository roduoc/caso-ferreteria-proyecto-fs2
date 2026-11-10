//guarda y lee la sesion del usuario en localStorage
//la sesion tiene los datos del usuario (el dto que manda el backend) y el token JWT

const CLAVE_SESION = 'sesion';
const CLAVE_TOKEN_ACTIVO = 'tokenActivo';

function leerDatosToken(token) {
  try {
    const parte = token.split('.')[1];
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function tokenVencido(token) {
  const datos = leerDatosToken(token);
  if (!datos?.exp) return true;
  return datos.exp * 1000 <= Date.now();
}

//se llama despues del login o del registro, con lo que respondio el backend
export function guardarSesion(usuario, token) {
  const sesion = { ...usuario, token };
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  return sesion;
}

//devuelve el usuario con la sesion iniciada, o null
//no es async porque los layouts la necesitan antes de dibujar la pagina
export function obtenerSesion() {
  const guardado = localStorage.getItem(CLAVE_SESION);
  if (!guardado) return null;
  try {
    const sesion = JSON.parse(guardado);
    if (!sesion.id || !sesion.rol || !sesion.token) return null;
    if (tokenVencido(sesion.token)) {
      cerrarSesion();
      return null;
    }
    return sesion;
  } catch {
    return null;
  }
}

export function obtenerToken() {
  return obtenerSesion()?.token ?? null;
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
  localStorage.removeItem(CLAVE_TOKEN_ACTIVO);
}
