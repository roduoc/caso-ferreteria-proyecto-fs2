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


//////////////////menu lateral admin
const botonPanel = document.querySelector("#boton-panel");
const panelLateral = document.querySelector("#panel-lateral");

botonPanel.addEventListener("click", () => {
  const abierto = botonPanel.getAttribute("aria-expanded") === "true";
  botonPanel.setAttribute("aria-expanded", String(!abierto));
  panelLateral.classList.toggle("hidden");
  });

//////////////////dropdown
const estadosPedido = ["Pendiente", "En preparación", "Entregado", "Cancelado"];
const seleccionar = document.querySelectorAll(".seleccionar-estado");

seleccionar.forEach((seleccionar) => {
  estadosPedido.forEach((estado) => {
    const option = document.createElement("option");
    option.value = estado;
    option.textContent = estado;
    seleccionar.appendChild(option);
  });
});