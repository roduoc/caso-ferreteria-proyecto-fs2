import { describe, expect, it } from 'vitest';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
  obtenerProducto,
} from './productoService';

const productoNuevo = {
  codigo: 'TS001',
  nombre: 'Producto de prueba',
  categoria: 'Herramientas',
  subcategoria: 'Pruebas',
  marca: 'Test',
  unidad: 'Unidad',
  precio: '2500',
  stock: '10',
  stockMinimo: '2',
};

describe('productoService', () => {
  it('lista los productos simulados como DTO', async () => {
    const productos = await listarProductos();

    expect(productos.length).toBeGreaterThan(0);
    expect(productos[0]).toEqual(expect.objectContaining({
      codigo: expect.any(String),
      stockBajo: expect.any(Boolean),
    }));
  });

  it('crea y obtiene un producto', async () => {
    const creado = await crearProducto(productoNuevo);
    const encontrado = await obtenerProducto(creado.codigo);

    expect(encontrado.nombre).toBe('Producto de prueba');
    expect(encontrado.precio).toBe(2500);
  });

  it('rechaza códigos duplicados', async () => {
    await crearProducto(productoNuevo);

    await expect(crearProducto(productoNuevo)).rejects.toThrow('Ya existe un producto con ese código');
  });

  it('actualiza precio y stock guardándolos como números', async () => {
    await crearProducto(productoNuevo);
    const actualizado = await actualizarProducto('TS001', { precio: '3000', stock: '6' });

    expect(actualizado.precio).toBe(3000);
    expect(actualizado.stock).toBe(6);
  });

  it('elimina un producto', async () => {
    await crearProducto(productoNuevo);
    await eliminarProducto('TS001');

    await expect(obtenerProducto('TS001')).rejects.toThrow('Producto no encontrado');
  });
});
