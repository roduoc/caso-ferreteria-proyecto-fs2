//funciones compartidas por todos los services para usar localStorage

//lee una coleccion desde localStorage
//si todavia no existe, la crea copiando los datos iniciales del json de mocks

//la clave es como la etiqueta de un cajon, le dice donde buscar a localstorage
export function leer(clave, datosIniciales) {
  //busca en localstorage lo guardado con esa llave
  const guardado = localStorage.getItem(clave);

  //si ya habia datos, devolverlos
  if (guardado) {
    return JSON.parse(guardado);
  }

  //si no habia nada, copia los datos del json
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
