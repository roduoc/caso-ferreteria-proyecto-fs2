import productosMock from '../mocks/productos.json';
import { crearProductoDTO } from '../models/Producto';
import { leer, guardar, esperar } from './storage';

const CLAVE = 'productos';

//devuelve todos los productos
export async function listarProductos() {
  await esperar();
  const productos = leer(CLAVE, productosMock);
  return productos.map(crearProductoDTO);
}

//devuelve un producto segun su codigo
export async function obtenerProducto(codigo) {
  await esperar();
  const productos = leer(CLAVE, productosMock);
  const producto = productos.find((p) => p.codigo === codigo);

  if (!producto) throw new Error('Producto no encontrado');
  return crearProductoDTO(producto);
}

//cambia el precio y/o el stock de un producto
//cambios es un objeto, por ejemplo { precio: 5990 } o { stock: 20 }
export async function actualizarProducto(codigo, cambios) {
  await esperar();

  if (cambios.precio !== undefined && (!Number.isInteger(cambios.precio) || cambios.precio <= 0)) {
    throw new Error('El precio debe ser un número entero mayor a 0');
  }
  if (cambios.stock !== undefined && (!Number.isInteger(cambios.stock) || cambios.stock < 0)) {
    throw new Error('La cantidad debe ser un número entero de 0 o más');
  }

  //carga los productos
  const productos = leer(CLAVE, productosMock);
  //busca el producto por codigo
  const indice = productos.findIndex((p) => p.codigo === codigo);
  if (indice === -1) throw new Error('Producto no encontrado');

  //se copia el producto con los cambios encima
  productos[indice] = { ...productos[indice], ...cambios };
  guardar(CLAVE, productos);

  return crearProductoDTO(productos[indice]);
}
