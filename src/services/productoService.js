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
export async function actualizarProducto(codigo, cambios) {
  await esperar();
  const nuevosDatos = {};

  if (cambios.precio !== undefined) {
    if (cambios.precio === '') throw new Error('Ingresa un precio');
    const precio = Number(cambios.precio);
    if (!Number.isInteger(precio) || precio <= 0) {
      throw new Error('El precio debe ser un número entero mayor a 0');
    }
    nuevosDatos.precio = precio;
  }

  if (cambios.stock !== undefined) {
    if (cambios.stock === '') throw new Error('Ingresa una cantidad');
    const stock = Number(cambios.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error('La cantidad debe ser un número entero de 0 o más');
    }
    nuevosDatos.stock = stock;
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

//crea un producto nuevo, solo lo usa el admin
export async function crearProducto(datos) {
  await esperar();

  //los datos llegan tal como estan en el formulario, todos como texto
  //primero se revisa que ningun campo este vacio
  if (!datos.codigo.trim() || !datos.nombre.trim() || !datos.categoria.trim() ||
      !datos.subcategoria.trim() || !datos.marca.trim() || !datos.unidad.trim() ||
      datos.precio === '' || datos.stock === '' || datos.stockMinimo === '') {
    throw new Error('Todos los campos son obligatorios');
  }

  //recien despues de revisar que no esten vacios se convierten a numero
  //si se convirtieran antes, Number('') daria 0 y no se sabria si estaba vacio
  const precio = Number(datos.precio);
  const stock = Number(datos.stock);
  const stockMinimo = Number(datos.stockMinimo);

  if (!Number.isInteger(precio) || precio <= 0) {
    throw new Error('El precio debe ser un número entero mayor a 0');
  }
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error('La cantidad debe ser un número entero de 0 o más');
  }
  if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
    throw new Error('El stock mínimo debe ser un número entero de 0 o más');
  }

  //carga los productos
  const productos = leer(CLAVE, productosMock);
  const codigo = datos.codigo.trim().toUpperCase();

  //some pregunta si al menos uno de los elementos cumple la condicion
  if (productos.some((p) => p.codigo === codigo)) {
    throw new Error('Ya existe un producto con ese código');
  }

  const nuevo = {
    codigo,
    nombre: datos.nombre.trim(),
    categoria: datos.categoria.trim(),
    subcategoria: datos.subcategoria.trim(),
    marca: datos.marca.trim(),
    unidad: datos.unidad.trim(),
    precio,
    stock,
    stockMinimo,
  };

  //push lo agrega a la lista de productos
  productos.push(nuevo);
  //guarda la lista de productos con el producto nuevo
  guardar(CLAVE, productos);
  return crearProductoDTO(nuevo);
}

//elimina un producto segun su codigo, solo lo usa el admin
export async function eliminarProducto(codigo) {
  await esperar();
  //carga los productos
  const productos = leer(CLAVE, productosMock);

  if (!productos.some((p) => p.codigo === codigo)) {
    throw new Error('Producto no encontrado');
  }

  //filter deja todos los productos menos el que se elimina
  guardar(CLAVE, productos.filter((p) => p.codigo !== codigo));
}

