import { beforeEach, describe, expect, it } from 'vitest';
import { cerrarSesion, iniciarSesion } from './usuarioService';
import {
  actualizarProducto,
  actualizarStock,
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
  beforeEach(async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
  });
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
    expect(JSON.parse(localStorage.getItem('productos')).find((p) => p.codigo === 'TS001')).toMatchObject({ activo: false });
    expect((await listarProductos()).some((p) => p.codigo === 'TS001')).toBe(false);
  });

  it('activa la alerta solo al quedar bajo el stock mínimo', async () => {
    const alLimite = await actualizarProducto('MC001', { stock: 20 });
    expect(alLimite.stockMinimo).toBe(20);
    expect(alLimite.stockBajo).toBe(false);
    const bajoMinimo = await actualizarProducto('MC001', { stock: 19 });
    expect(bajoMinimo.stockBajo).toBe(true);
  });

  it('rechaza crear o dar de baja productos sin rol administrador', async () => {
    cerrarSesion();
    await expect(crearProducto(productoNuevo)).rejects.toThrow(/administrador/i);
    await expect(eliminarProducto('MC001')).rejects.toThrow(/administrador/i);
    await expect(actualizarProducto('MC001', { precio: 10 })).rejects.toThrow(/administrador/i);
  });

  it('permite al vendedor reponer stock, pero no cambiar el precio', async () => {
    cerrarSesion();
    await iniciarSesion('vendedor@duoc.cl', '1234');
    await expect(actualizarProducto('MC001', { precio: 1000 })).rejects.toThrow(/administrador/i);
    await expect(crearProducto(productoNuevo)).rejects.toThrow(/administrador/i);
    await expect(eliminarProducto('MC001')).rejects.toThrow(/administrador/i);
    expect((await actualizarStock('MC001', 25)).stock).toBe(25);
    await expect(actualizarStock('MC001', -1)).rejects.toThrow(/cantidad/i);
  });

  it.each([
    [{ ...productoNuevo, nombre: '' }, /obligatorios/i],
    [{ ...productoNuevo, precio: '0' }, /precio/i],
    [{ ...productoNuevo, stock: '-1' }, /cantidad/i],
    [{ ...productoNuevo, stockMinimo: '-1' }, /stock mínimo/i],
  ])('rechaza datos de producto inválidos', async (datos, mensaje) => {
    await expect(crearProducto(datos)).rejects.toThrow(mensaje);
  });

  it('valida la actualización y eliminación de productos inexistentes', async () => {
    await expect(actualizarProducto('MC001', { precio: '' })).rejects.toThrow(/ingresa un precio/i);
    await expect(actualizarProducto('MC001', { precio: '-2' })).rejects.toThrow(/precio/i);
    await expect(actualizarProducto('MC001', { stock: '' })).rejects.toThrow(/ingresa una cantidad/i);
    await expect(actualizarProducto('MC001', { stock: '-1' })).rejects.toThrow(/cantidad/i);
    await expect(actualizarProducto('NOEXISTE', { stock: 1 })).rejects.toThrow(/no encontrado/i);
    await expect(eliminarProducto('NOEXISTE')).rejects.toThrow(/no encontrado/i);
  });
});
