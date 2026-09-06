// Productos de prueba del carrito.
// No se guardan en el navegador: al recargar vuelven a estas cantidades.
let carrito = [
  { codigo: "HM001", cantidad: 1 },
  { codigo: "PT007", cantidad: 2 },
];

window.obtenerCarrito = function () {
  return carrito;
};

window.guardarCarrito = function (nuevoCarrito) {
  carrito = nuevoCarrito;
  window.actualizarContadorCarrito();
};

window.cantidadCarrito = function () {
  return carrito.reduce((total, item) => total + item.cantidad, 0);
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

  const itemExistente = carrito.find((item) => item.codigo === codigoProducto);

  if (itemExistente) {
    if (itemExistente.cantidad + cantidadAgregar > producto.stock) return false;
    itemExistente.cantidad += cantidadAgregar;
  } else {
    if (cantidadAgregar > producto.stock) return false;
    carrito.push({ codigo: codigoProducto, cantidad: cantidadAgregar });
  }

  window.actualizarContadorCarrito();
  return true;
};

window.actualizarContadorCarrito();
