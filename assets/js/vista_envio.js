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
if (window.L) {
  const mapaEnvio = L.map("mapa-envio").setView([-29.9027, -71.2519], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapaEnvio);
  L.marker([-29.9027, -71.2519]).addTo(mapaEnvio)
    .bindPopup("Ferretería Los Maestros")
    .openPopup();
}

/////////////////validar campos y redireccionar
////////validación y redirección al pagar
const botonPagar = document.querySelector("#boton-pagar");
const despachoError = document.querySelector("#despacho-error");
const retiroTienda = document.querySelector("#retiro-tienda");
const comuna = document.querySelector("#comuna");
const direccion = document.querySelector("#direccion");
const despachoDomicilio = document.querySelector("#despacho-domicilio");
const costoDespacho = document.querySelector("#costo-despacho");
const totalCompra = document.querySelector("#total-compra");

function formatoPrecio(precio) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(precio);
}

function actualizarEntrega() {
  const esDespacho = despachoDomicilio.checked;
  const costo = esDespacho ? 3990 : 0;
  const subtotal = window.obtenerCarrito().reduce((suma, item) => {
    const producto = window.productos.find((actual) => actual.codigo === item.codigo);
    return suma + (producto ? producto.precio * item.cantidad : 0);
  }, 0);

  comuna.disabled = !esDespacho;
  direccion.disabled = !esDespacho;
  costoDespacho.textContent = costo === 0 ? "Gratis" : formatoPrecio(costo);
  totalCompra.textContent = formatoPrecio(subtotal + costo);
  despachoError.classList.add("hidden");
}

document.querySelectorAll('input[name="modalidad"]').forEach((opcion) => {
  opcion.addEventListener("change", actualizarEntrega);
});

botonPagar.addEventListener("click", () => {
  const esRetiro = retiroTienda.checked;

  //si es retiro en tienda termina el flujo y muestra los pedidos
  if (esRetiro) {
    window.location.href = "vista_mis_pedidos.html";
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
  window.location.href = "vista_mis_pedidos.html";
});

actualizarEntrega();
