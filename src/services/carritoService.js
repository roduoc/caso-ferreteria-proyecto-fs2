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

//si quien llama no pasa una cantidad, por defecto es 1
export async function agregarAlCarrito(codigo, cantidad = 1) {
  await esperar();

  const productos = leer(CLAVE_PRODUCTOS, productosMock);
  const producto = productos.find((p) => p.codigo === codigo);
  if (!producto) throw new Error('Producto no encontrado.');

  const cantidadAgregar = Number(cantidad);
  if (!Number.isInteger(cantidadAgregar) || cantidadAgregar < 1) {
    throw new Error('La cantidad debe ser un número entero mayor a 0.');
  }

  const carrito = leer(CLAVE, []);
  const itemExistente = carrito.find((item) => item.codigo === codigo);

  //lo que ya estaba en el carrito mas lo que se quiere agregar no puede superar el stock
  const cantidadEnCarrito = itemExistente ? itemExistente.cantidad : 0;
  if (cantidadEnCarrito + cantidadAgregar > producto.stock) {
    throw new Error('No hay más stock disponible.');
  }

  //si el elemento ya estaba en el carrito le suma la cantidad
  //si no, guarda el codigo y la cantidad
  if (itemExistente) {
    itemExistente.cantidad += cantidadAgregar;
  } else {
    carrito.push({ codigo, cantidad: cantidadAgregar });
  }

  guardar(CLAVE, carrito);
  return carrito;
}
