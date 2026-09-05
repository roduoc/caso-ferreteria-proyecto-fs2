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
// --- Mapa ---
// Mismas coordenadas y estilo que en vista_envios
const mapaNosotros = L.map('mapa-nosotros').setView([-29.9027, -71.2519], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapaNosotros);
L.marker([-29.9027, -71.2519]).addTo(mapaNosotros)
  .bindPopup('Ferretería Los Maestros')
  .openPopup();