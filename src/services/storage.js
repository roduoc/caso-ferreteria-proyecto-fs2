//funciones compartidas por todos los services para usar localStorage

//lee una coleccion desde localStorage
//si todavia no existe, la crea copiando los datos iniciales del json de mocks
export function leer(clave, datosIniciales) {
  const guardado = localStorage.getItem(clave);

  if (guardado) {
    return JSON.parse(guardado);
  }

  localStorage.setItem(clave, JSON.stringify(datosIniciales));
  return datosIniciales;
}

//guarda la coleccion completa en localStorage
//localStorage solo guarda texto, por eso se convierte con JSON.stringify
export function guardar(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

//simula el tiempo que tardaria un servidor real en responder
export function esperar(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
