import productosMock from '../mocks/productos.json';
import { leer, guardar, esperar } from './storage';

const CLAVE = 'carrito';
const CLAVE_PRODUCTOS = 'productos';

//el carrito es una lista de codigo, cantidad
//parte vacio, por eso el valor inicial es una lista vacia y no un json de mocks

export async function obtenerCarrito() {
  await esperar();
  return leer(CLAVE, []);
}

//devuelve los productos del carrito con sus datos y subtotal
export async function obtenerDetalleCarrito() {
  await esperar();
  const carrito = leer(CLAVE, []);
  const productos = leer(CLAVE_PRODUCTOS, productosMock);

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
  await esperar();

  const productos = leer(CLAVE_PRODUCTOS, productosMock);
  const producto = productos.find((p) => p.codigo === codigo);
  if (!producto || producto.activo === false) throw new Error('Producto no encontrado.');

  const cantidadAgregar = Number(cantidad);
  if (!Number.isInteger(cantidadAgregar) || cantidadAgregar < 1) {
    throw new Error('La cantidad debe ser un número entero mayor a 0.');
  }

  const carrito = leer(CLAVE, []);
  const itemExistente = carrito.find((item) => item.codigo === codigo);

  //lo que ya estaba en el carrito mas lo que se quiere agregar no puede superar el stock
  const cantidadEnCarrito = itemExistente ? itemExistente.cantidad : 0;
  if (producto.stock === 0) {
    throw new Error('Este producto no tiene stock disponible.');
  }
  if (cantidadEnCarrito + cantidadAgregar > producto.stock) {
    throw new Error(`Solo hay ${producto.stock} disponibles y ya tienes ${cantidadEnCarrito} en tu carrito.`);
  }

  //si el elemento ya estaba en el carrito le suma la cantidad
  //si no, guarda el codigo y la cantidad
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
  await esperar();
  const nuevaCantidad = Number(cantidad);
  const productos = leer(CLAVE_PRODUCTOS, productosMock);
  const producto = productos.find((p) => p.codigo === codigo);
  if (!producto || producto.activo === false) throw new Error('Producto no encontrado.');

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
  await esperar();
  const carrito = leer(CLAVE, []);
  const nuevoCarrito = carrito.filter((item) => item.codigo !== codigo);
  guardar(CLAVE, nuevoCarrito);
  avisarCambio();
  return nuevoCarrito;
}

export async function vaciarCarrito() {
  await esperar();
  guardar(CLAVE, []);
  avisarCambio();
  return [];
}
