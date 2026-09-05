//////// menú móvil
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

//////// catálogo de productos
const productGrid = document.querySelector("#product-grid");
const productsCount = document.querySelector("#products-count");
const searchInput = document.querySelector("#search-input");
const categorySelect = document.querySelector("#category-select");
const orderSelect = document.querySelector("#order-select");
const catalogMessage = document.querySelector("#catalog-message");

function formatoPrecio(precio) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(precio);
}

function cargarCategorias() {
  const categorias = [...new Set(window.productos.map((producto) => producto.categoria))];
  categorias.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    categorySelect.appendChild(option);
  });
}

function obtenerProductosFiltrados() {
  const busqueda = searchInput.value.trim().toLowerCase();
  const categoria = categorySelect.value;

  const resultados = window.productos.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda)
      || producto.codigo.toLowerCase().includes(busqueda)
      || producto.marca.toLowerCase().includes(busqueda);
    const coincideCategoria = categoria === "Todas" || producto.categoria === categoria;
    return coincideBusqueda && coincideCategoria;
  });

  if (orderSelect.value === "precio-menor") resultados.sort((a, b) => a.precio - b.precio);
  if (orderSelect.value === "precio-mayor") resultados.sort((a, b) => b.precio - a.precio);
  if (orderSelect.value === "nombre") resultados.sort((a, b) => a.nombre.localeCompare(b.nombre));

  return resultados;
}

function mostrarProductos() {
  const productosFiltrados = obtenerProductosFiltrados();
  const textoProducto = productosFiltrados.length === 1 ? "producto encontrado" : "productos encontrados";
  productsCount.textContent = `${productosFiltrados.length} ${textoProducto}`;

  if (productosFiltrados.length === 0) {
    productGrid.innerHTML = "";
    catalogMessage.classList.remove("hidden");
    return;
  }

  catalogMessage.classList.add("hidden");
  productGrid.innerHTML = productosFiltrados.map((producto) => `
    <article class="product-card flex flex-col">
      <div class="relative bg-stone-100">
        <img class="h-48 w-full object-contain p-7" src="./assets/images/sin-imagen.svg" alt="${producto.nombre} sin imagen disponible" />
        <span class="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600">${producto.codigo}</span>
      </div>
      <div class="flex flex-1 flex-col p-5">
        <p class="text-xs font-bold uppercase tracking-wider text-amber-700">${producto.categoria} · ${producto.subcategoria}</p>
        <h2 class="mt-2 text-lg font-bold leading-snug">${producto.nombre}</h2>
        <p class="mt-2 text-sm text-stone-500">Marca ${producto.marca} · ${producto.unidad}</p>
        <p class="mt-3 text-sm font-semibold text-green-700">Stock disponible: ${producto.stock}</p>
        <div class="mt-auto flex items-center justify-between gap-3 pt-5">
          <strong class="text-xl">${formatoPrecio(producto.precio)}</strong>
          <button class="add-button" type="button" data-product-code="${producto.codigo}">Añadir</button>
        </div>
      </div>
    </article>
  `).join("");
}

function mostrarMensaje(mensaje, tipo) {
  const notification = document.querySelector("#notification");
  notification.textContent = mensaje;
  notification.className = tipo === "error"
    ? "fixed bottom-5 right-5 rounded-lg bg-red-700 px-5 py-3 text-sm font-semibold text-white"
    : "fixed bottom-5 right-5 rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white";
  setTimeout(() => notification.classList.add("hidden"), 1800);
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-product-code]");
  if (!addButton) return;

  const agregado = window.agregarAlCarrito(addButton.dataset.productCode);
  mostrarMensaje(agregado ? "Producto añadido al carrito." : "No hay más stock disponible.", agregado ? "ok" : "error");
});

searchInput.addEventListener("input", mostrarProductos);
categorySelect.addEventListener("change", mostrarProductos);
orderSelect.addEventListener("change", mostrarProductos);

cargarCategorias();
mostrarProductos();
