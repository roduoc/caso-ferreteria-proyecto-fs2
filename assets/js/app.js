const productGrid = document.querySelector("#product-grid");
const menuButton = document.querySelector("#menu-button");
const mobileMenu = document.querySelector("#mobile-menu");

function formatoPrecio(precio) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(precio);
}

function mostrarProductos() {
  const productosDestacados = window.productos.slice(0, 4);
  productGrid.innerHTML = productosDestacados.map((producto) => `
    <article class="product-card">
      <img class="h-52 w-full bg-stone-100 object-contain p-8" src="./assets/images/sin-imagen.svg" alt="Producto sin imagen disponible" />
      <div class="p-5">
        <p class="text-xs font-bold uppercase tracking-wider text-stone-500">${producto.categoria}</p>
        <h3 class="mt-2 text-lg font-bold">${producto.nombre}</h3>
        <div class="mt-5 flex items-center justify-between gap-3">
          <strong class="text-xl">${formatoPrecio(producto.precio)}</strong>
          <button class="add-button" type="button" data-product-code="${producto.codigo}" aria-label="Añadir ${producto.nombre} al carrito">Añadir</button>
        </div>
      </div>
    </article>
  `).join("");
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-product-code]");
  if (!addButton) return;
  window.agregarAlCarrito(addButton.dataset.productCode);
});

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

mostrarProductos();
