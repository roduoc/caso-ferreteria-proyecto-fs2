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

//////// carrito de compras
const cartList = document.querySelector("#cart-list");
const emptyCart = document.querySelector("#empty-cart");
const cartContent = document.querySelector("#cart-content");
const cartSubtotal = document.querySelector("#cart-subtotal");
const cartTotal = document.querySelector("#cart-total");
const clearCartButton = document.querySelector("#clear-cart");
const continueButton = document.querySelector("#continue-button");

function formatoPrecio(precio) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(precio);
}

function mostrarCarrito() {
  const carrito = window.obtenerCarrito();
  const estaVacio = carrito.length === 0;

  emptyCart.classList.toggle("hidden", !estaVacio);
  cartContent.classList.toggle("hidden", estaVacio);
  if (estaVacio) return;

  cartList.innerHTML = carrito.map((item) => {
    const producto = window.productos.find((productoActual) => productoActual.codigo === item.codigo);
    return `
      <article class="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
        <img class="size-24 rounded-lg border border-stone-200 bg-stone-100 object-contain p-3" src="./assets/images/sin-imagen.svg" alt="${producto.nombre} sin imagen disponible" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold uppercase tracking-wide text-amber-700">${producto.codigo} · ${producto.categoria}</p>
          <h2 class="mt-1 font-bold">${producto.nombre}</h2>
          <p class="mt-1 text-sm text-stone-500">${formatoPrecio(producto.precio)} por ${producto.unidad.toLowerCase()}</p>
          <p class="mt-1 text-xs text-stone-500">Stock disponible: ${producto.stock}</p>
        </div>
        <div class="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <strong>${formatoPrecio(producto.precio * item.cantidad)}</strong>
          <div class="flex items-center gap-2">
            <button class="quantity-button" type="button" data-action="decrease" data-code="${producto.codigo}" aria-label="Disminuir cantidad">−</button>
            <span class="w-8 text-center font-semibold">${item.cantidad}</span>
            <button class="quantity-button" type="button" data-action="increase" data-code="${producto.codigo}" aria-label="Aumentar cantidad">+</button>
          </div>
          <button class="text-sm font-semibold text-red-700 hover:underline" type="button" data-action="remove" data-code="${producto.codigo}">Eliminar</button>
        </div>
      </article>
    `;
  }).join("");

  const total = carrito.reduce((suma, item) => {
    const producto = window.productos.find((productoActual) => productoActual.codigo === item.codigo);
    return suma + producto.precio * item.cantidad;
  }, 0);

  cartSubtotal.textContent = formatoPrecio(total);
  cartTotal.textContent = formatoPrecio(total);
}

function cambiarCantidad(codigoProducto, cambio) {
  const carrito = window.obtenerCarrito();
  const item = carrito.find((producto) => producto.codigo === codigoProducto);
  const producto = window.productos.find((productoActual) => productoActual.codigo === codigoProducto);
  if (!item || !producto) return;

  const nuevaCantidad = item.cantidad + cambio;
  if (nuevaCantidad < 1) return;
  if (nuevaCantidad > producto.stock) {
    alert("No puedes agregar más unidades que el stock disponible.");
    return;
  }

  item.cantidad = nuevaCantidad;
  window.guardarCarrito(carrito);
  mostrarCarrito();
}

cartList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  if (button.dataset.action === "increase") cambiarCantidad(button.dataset.code, 1);
  if (button.dataset.action === "decrease") cambiarCantidad(button.dataset.code, -1);

  if (button.dataset.action === "remove") {
    const carritoActualizado = window.obtenerCarrito().filter((item) => item.codigo !== button.dataset.code);
    window.guardarCarrito(carritoActualizado);
    mostrarCarrito();
  }
});

clearCartButton.addEventListener("click", () => {
  window.guardarCarrito([]);
  mostrarCarrito();
});

continueButton.addEventListener("click", () => {
  window.location.href = "vista_login.html";
});

mostrarCarrito();
