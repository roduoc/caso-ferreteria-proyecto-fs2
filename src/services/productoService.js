import { llamarApi } from './api';
import { obtenerSesion } from './sesion';

//el catalogo es publico, aunque haya una sesion guardada
export async function listarProductos() {
  return llamarApi('/api/productos', { sinToken: true });
}

export async function obtenerProducto(codigo) {
  return llamarApi(`/api/productos/${encodeURIComponent(codigo)}`, { sinToken: true });
}

function exigirAdministrador() {
  if (obtenerSesion()?.rol !== 'admin') throw new Error('Solo el administrador puede gestionar productos');
}

function numeroEntero(valor, nombre, minimo) {
  if (valor === '' || valor === null || valor === undefined || String(valor).trim() === '') {
    throw new Error(`Ingresa ${nombre}`);
  }
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < minimo) {
    if (nombre === 'un precio') throw new Error('El precio debe ser un número entero mayor a 0');
    if (nombre === 'el stock mínimo') throw new Error('El stock mínimo debe ser un número entero de 0 o más');
    throw new Error('La cantidad debe ser un número entero de 0 o más');
  }
  return numero;
}

export async function actualizarProducto(codigo, cambios) {
  exigirAdministrador();
  const datos = {};
  if (cambios.precio !== undefined) datos.precio = numeroEntero(cambios.precio, 'un precio', 1);
  if (cambios.stock !== undefined) datos.stock = numeroEntero(cambios.stock, 'una cantidad', 0);
  if (Object.keys(datos).length === 0) throw new Error('Ingresa un precio o una cantidad');
  return llamarApi(`/api/productos/${encodeURIComponent(codigo)}`, {
    metodo: 'PATCH',
    datos,
  });
}

//el vendedor usa una ruta aparte que solo acepta stock
export async function actualizarStock(codigo, stock) {
  if (!['admin', 'vendedor'].includes(obtenerSesion()?.rol)) {
    throw new Error('No tienes permiso para actualizar el stock');
  }
  return llamarApi(`/api/productos/${encodeURIComponent(codigo)}/stock`, {
    metodo: 'PATCH',
    datos: { stock: numeroEntero(stock, 'una cantidad', 0) },
  });
}

export async function crearProducto(datos) {
  exigirAdministrador();
  const campos = ['codigo', 'nombre', 'categoria', 'subcategoria', 'marca', 'unidad'];
  if (campos.some((campo) => !datos[campo]?.trim())
      || [datos.precio, datos.stock, datos.stockMinimo].some((valor) => valor === '' || valor == null)) {
    throw new Error('Todos los campos son obligatorios');
  }
  const nuevo = {
    codigo: datos.codigo.trim().toUpperCase(),
    nombre: datos.nombre.trim(),
    categoria: datos.categoria.trim(),
    subcategoria: datos.subcategoria.trim(),
    marca: datos.marca.trim(),
    unidad: datos.unidad.trim(),
    precio: numeroEntero(datos.precio, 'un precio', 1),
    stock: numeroEntero(datos.stock, 'una cantidad', 0),
    stockMinimo: numeroEntero(datos.stockMinimo, 'el stock mínimo', 0),
  };
  return llamarApi('/api/productos', {
    metodo: 'POST',
    datos: nuevo,
  });
}

export async function eliminarProducto(codigo) {
  exigirAdministrador();
  await llamarApi(`/api/productos/${encodeURIComponent(codigo)}`, { metodo: 'DELETE' });
}
