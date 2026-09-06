////////menu movil
const menuButton = document.querySelector("#menu-button");
const mobileMenu = document.querySelector("#mobile-menu");

menuButton.addEventListener("click", () => {
  const menuAbierto = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!menuAbierto));
  mobileMenu.hidden = menuAbierto;
});


mobileMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
  }
});

//////////////////////mapa
if (window.L) {
  const mapaNosotros = L.map("mapa-nosotros").setView([-29.9027, -71.2519], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapaNosotros);
  L.marker([-29.9027, -71.2519]).addTo(mapaNosotros)
    .bindPopup("Ferretería Los Maestros")
    .openPopup();
}

////////////////////validar form
const formContacto = document.querySelector("#form-contacto");
formContacto.addEventListener("submit", (event) => {
    //por defecto, al hacer submit recarga la pagina, pero no queremos eso esta vez
  event.preventDefault();

  const correo = document.querySelector("#contacto-correo").value.trim();
  const mensaje = document.querySelector("#contacto-mensaje").value.trim();
  const errorEl = document.querySelector("#contacto-error");
  const exitoEl = document.querySelector("#contacto-exito");

  if (!correo || !mensaje || !formContacto.checkValidity()) {
    errorEl.textContent = "Debes ingresar un correo válido y escribir un mensaje.";
    errorEl.classList.remove("hidden");
    exitoEl.classList.add("hidden");
    return;
  }

  errorEl.classList.add("hidden");
  formContacto.reset();
  exitoEl.classList.remove("hidden");
});
