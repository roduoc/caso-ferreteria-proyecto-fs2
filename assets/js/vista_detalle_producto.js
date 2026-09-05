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

//////// detalle del producto
const parametros = new URLSearchParams(window.location.search);
const codigoProducto = parametros.get("codigo");
const producto = window.productos.find((item) => item.codigo === codigoProducto);
const detailContent = document.querySelector("#detail-content");
const productNotFound = document.querySelector("#product-not-found");
const relatedGrid = document.querySelector("#related-grid");

function formatoPrecio(precio) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(precio);
}

function mostrarMensaje(mensaje, tipo) {
  const notification = document.querySelector("#notification");
  notification.textContent = mensaje;
  notification.className = tipo === "error"
    ? "fixed bottom-5 right-5 rounded-lg bg-red-700 px-5 py-3 text-sm font-semibold text-white"
    : "fixed bottom-5 right-5 rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white";
  setTimeout(() => notification.classList.add("hidden"), 1800);
}

function mostrarProductosRelacionados() {
  const relacionados = window.productos.filter((item) => {
    return item.categoria === producto.categoria && item.codigo !== producto.codigo;
  }).slice(0, 3);

  relatedGrid.innerHTML = relacionados.map((item) => `
    <article class="product-card">
      <a href="./detalle_producto.html?codigo=${item.codigo}">
        <img class="h-36 w-full bg-stone-100 object-contain p-5" src="./assets/images/sin-imagen.svg" alt="${item.nombre} sin imagen disponible" />
      </a>
      <div class="p-4">
        <p class="text-xs font-bold uppercase tracking-wide text-amber-700">${item.subcategoria}</p>
        <h3 class="mt-1 font-bold leading-snug"><a class="hover:text-amber-700" href="./detalle_producto.html?codigo=${item.codigo}">${item.nombre}</a></h3>
        <strong class="mt-3 block">${formatoPrecio(item.precio)}</strong>
      </div>
    </article>
  `).join("");
}

function mostrarDetalle() {
  if (!producto) {
    detailContent.classList.add("hidden");
    productNotFound.classList.remove("hidden");
    return;
  }

  document.title = `${producto.nombre} | Ferretería Los Maestros`;
  document.querySelector("#product-category").textContent = `${producto.categoria} · ${producto.subcategoria}`;
  document.querySelector("#product-name").textContent = producto.nombre;
  document.querySelector("#product-code").textContent = producto.codigo;
  document.querySelector("#product-brand").textContent = producto.marca;
  document.querySelector("#product-unit").textContent = producto.unidad;
  document.querySelector("#product-price").textContent = formatoPrecio(producto.precio);
  document.querySelector("#product-stock").textContent = `${producto.stock} ${producto.stock === 1 ? "unidad" : "unidades"}`;
  document.querySelector("#product-image").alt = `${producto.nombre} sin imagen disponible`;
  document.querySelector("#quantity-input").max = producto.stock;
  mostrarProductosRelacionados();
}

const quantityInput = document.querySelector("#quantity-input");

document.querySelector("#decrease-quantity").addEventListener("click", () => {
  const cantidad = Number(quantityInput.value);
  if (cantidad > 1) quantityInput.value = cantidad - 1;
});

document.querySelector("#increase-quantity").addEventListener("click", () => {
  const cantidad = Number(quantityInput.value);
  if (producto && cantidad < producto.stock) quantityInput.value = cantidad + 1;
});

document.querySelector("#add-detail-product").addEventListener("click", () => {
  if (!producto) return;
  const cantidad = Number(quantityInput.value);

  if (cantidad < 1 || cantidad > producto.stock) {
    mostrarMensaje("Selecciona una cantidad válida.", "error");
    return;
  }

  const agregado = window.agregarAlCarrito(producto.codigo, cantidad);
  mostrarMensaje(agregado ? "Producto añadido al carrito." : "La cantidad supera el stock disponible.", agregado ? "ok" : "error");
});

quantityInput.addEventListener("change", () => {
  if (!producto) return;
  const cantidad = Number(quantityInput.value);
  if (cantidad < 1) quantityInput.value = 1;
  if (cantidad > producto.stock) quantityInput.value = producto.stock;
});

mostrarDetalle();
