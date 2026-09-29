//dto de usuario: la forma que tienen los usuarios que reciben los componentes
//no incluye la clave, asi la contrasena nunca llega a las pantallas
export function crearUsuarioDTO(u) {
  return {
    id: u.id,
    rut: u.rut,
    nombre: u.nombre,
    apellidos: u.apellidos,
    //nombre y apellidos juntos, para no armarlo en cada pantalla
    nombreCompleto: `${u.nombre} ${u.apellidos}`,
    correo: u.correo,
    rol: u.rol,
    region: u.region,
    comuna: u.comuna,
    direccion: u.direccion
  };
}
