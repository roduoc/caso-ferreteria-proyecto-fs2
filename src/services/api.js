import { obtenerToken, cerrarSesion } from './sesion';

const URL_BACKEND = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export async function llamarApi(ruta, { metodo = 'GET', datos, sinToken = false } = {}) {
  const headers = {};
  const token = sinToken ? null : obtenerToken();
  //si hay sesion, se manda el token para los endpoints protegidos
  if (token) headers.Authorization = `Bearer ${token}`;
  if (datos !== undefined) headers['Content-Type'] = 'application/json';

  let respuesta;
  try {
    respuesta = await fetch(`${URL_BACKEND}${ruta}`, {
      method: metodo,
      headers,
      body: datos !== undefined ? JSON.stringify(datos) : undefined,
    });
  } catch {
    //fetch solo falla asi cuando no llega al servidor (apagado, sin internet o bloqueado por CORS)
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }

  //204 No Content (por ejemplo al eliminar): no hay JSON que leer
  if (respuesta.status === 204) return null;

  //algunos errores pueden venir sin body, por eso no se asume que siempre hay JSON
  let cuerpo;
  try {
    cuerpo = await respuesta.json();
  } catch {
    cuerpo = null;
  }

  if (!respuesta.ok) {
    //401 con token: el token vencio o no es valido, se cierra la sesion
    if (respuesta.status === 401 && token) {
      cerrarSesion();
      throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
    }
    throw new Error(cuerpo?.mensaje ?? `Error del servidor (${respuesta.status})`);
  }

  return cuerpo;
}
