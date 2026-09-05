// El carrito dura solamente mientras la pestaña del navegador está abierta.
// No se usa almacenamiento permanente.
const CLAVE_CARRITO = "carritoLosMaestros";

window.obtenerCarrito = function () {
  const carritoGuardado = sessionStorage.getItem(CLAVE_CARRITO);
  return carritoGuardado ? JSON.parse(carritoGuardado) : [];
};

window.guardarCarrito = function (carrito) {
  sessionStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  window.actualizarContadorCarrito();
};

window.cantidadCarrito = function () {
  return window.obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
};

window.actualizarContadorCarrito = function () {
  const contador = document.querySelector("#cart-count");
  const enlace = document.querySelector("#cart-button");
  const cantidad = window.cantidadCarrito();
  const textoProducto = cantidad === 1 ? "producto" : "productos";

  if (contador) contador.textContent = cantidad;
  if (enlace) enlace.setAttribute("aria-label", `Carrito con ${cantidad} ${textoProducto}`);
};

window.agregarAlCarrito = function (codigoProducto, cantidad = 1) {
  const producto = window.productos.find((item) => item.codigo === codigoProducto);
  const cantidadAgregar = Number(cantidad);
  if (!producto || producto.stock === 0 || cantidadAgregar < 1) return false;

  const carrito = window.obtenerCarrito();
  const itemExistente = carrito.find((item) => item.codigo === codigoProducto);

  if (itemExistente) {
    if (itemExistente.cantidad + cantidadAgregar > producto.stock) return false;
    itemExistente.cantidad += cantidadAgregar;
  } else {
    if (cantidadAgregar > producto.stock) return false;
    carrito.push({ codigo: codigoProducto, cantidad: cantidadAgregar });
  }

  window.guardarCarrito(carrito);
  return true;
};

window.actualizarContadorCarrito();
