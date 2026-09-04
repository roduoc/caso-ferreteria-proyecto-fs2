////////menu movil
//
const menuButton = document.querySelector("#menu-button");
const mobileMenu = document.querySelector("#mobile-menu");

menuButton.addEventListener("click", () => {
  const menuAbierto = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!menuAbierto));
  menuButton.setAttribute("aria-label", menuAbierto ? "Abrir menú" : "Cerrar menú");
  mobileMenu.hidden = menuAbierto;
});


mobileMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
  }
});

////////////////mapa
const mapaEnvio = L.map('mapa-envio').setView([-29.9027, -71.2519], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapaEnvio);
L.marker([-29.9027, -71.2519]).addTo(mapaEnvio)
  .bindPopup('Ferretería Los Maestros')
  .openPopup();

/////////////////validar campos y redireccionar
////////validación y redirección al pagar
const botonPagar = document.querySelector("#boton-pagar");
const despachoError = document.querySelector("#despacho-error");
const retiroTienda = document.querySelector("#retiro-tienda");
const comuna = document.querySelector("#comuna");
const direccion = document.querySelector("#direccion");

botonPagar.addEventListener("click", () => {
  const esRetiro = retiroTienda.checked;

  //si es retiro en tienda directamente lo pasa a index
  if (esRetiro) {
    window.location.href = "index.html";
    return;
  }

  //le quita los espacios atras y adelante y los compara con un string vacio
  const comunaVacia = comuna.value.trim() === "";
  const direccionVacia = direccion.value.trim() === "";

  if (comunaVacia || direccionVacia) {
    despachoError.textContent = "Debes completar comuna y dirección para el despacho.";
    despachoError.classList.remove("hidden");
    return;
  }

  despachoError.classList.add("hidden");
  window.location.href = "index.html";
});