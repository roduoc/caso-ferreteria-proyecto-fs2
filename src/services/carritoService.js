import { leer, guardar} from './storage';
import { listarProductos, obtenerProducto } from './productoService';

const CLAVE = 'carrito';

export async function obtenerCarrito() {
  return leer(CLAVE, []);
}

//devuelve los productos del carrito con sus datos y subtotal
export async function obtenerDetalleCarrito() {
  const carrito = leer(CLAVE, []);
  if (carrito.length === 0) return [];

  const productos = await listarProductos();

  return carrito.flatMap((item) => {
    const producto = productos.find((p) => p.codigo === item.codigo);
    if (!producto || producto.activo === false) return [];

    return [{
      ...producto,
      cantidad: item.cantidad,
      subtotal: producto.precio * item.cantidad,
    }];
  });
}

function avisarCambio() {
  window.dispatchEvent(new Event('carritoActualizado'));
}

//si quien llama no pasa una cantidad, por defecto es 1
export async function agregarAlCarrito(codigo, cantidad = 1) {
  const producto = await obtenerProducto(codigo);

  const cantidadAgregar = Number(cantidad);
  if (!Number.isInteger(cantidadAgregar) || cantidadAgregar < 1) {
    throw new Error('La cantidad debe ser un número entero mayor a 0.');
  }

  const carrito = leer(CLAVE, []);
  const itemExistente = carrito.find((item) => item.codigo === codigo);

  const cantidadEnCarrito = itemExistente ? itemExistente.cantidad : 0;
  if (producto.stock === 0) {
    throw new Error('Este producto no tiene stock disponible.');
  }
  if (cantidadEnCarrito + cantidadAgregar > producto.stock) {
    throw new Error(`Solo hay ${producto.stock} disponibles y ya tienes ${cantidadEnCarrito} en tu carrito.`);
  }

  if (itemExistente) {
    itemExistente.cantidad += cantidadAgregar;
  } else {
    carrito.push({ codigo, cantidad: cantidadAgregar });
  }

  guardar(CLAVE, carrito);
  avisarCambio();
  return carrito;
}

export async function actualizarCantidad(codigo, cantidad) {
  const nuevaCantidad = Number(cantidad);
  const producto = await obtenerProducto(codigo);

  if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1) {
    throw new Error('La cantidad debe ser mayor a 0.');
  }
  if (nuevaCantidad > producto.stock) {
    throw new Error('No hay más stock disponible.');
  }

  const carrito = leer(CLAVE, []);
  const item = carrito.find((elemento) => elemento.codigo === codigo);
  if (!item) throw new Error('El producto no está en el carrito.');

  item.cantidad = nuevaCantidad;
  guardar(CLAVE, carrito);
  avisarCambio();
  return carrito;
}

export async function eliminarDelCarrito(codigo) {
  const carrito = leer(CLAVE, []);
  const nuevoCarrito = carrito.filter((item) => item.codigo !== codigo);
  guardar(CLAVE, nuevoCarrito);
  avisarCambio();
  return nuevoCarrito;
}

export async function vaciarCarrito() {
  guardar(CLAVE, []);
  avisarCambio();
  return [];
}
