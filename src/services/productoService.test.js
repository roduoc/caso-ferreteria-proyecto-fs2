import { describe, expect, it } from 'vitest';
import { actualizarProducto, actualizarStock, crearProducto, eliminarProducto, listarProductos, obtenerProducto } from './productoService';
import { rutasCatalogo, sesionDePrueba, simularApi } from '../test/apiSimulada';

const productoNuevo = {
  codigo: 'TS001', nombre: 'Producto de prueba', categoria: 'Herramientas', subcategoria: 'Pruebas',
  marca: 'Test', unidad: 'Unidad', precio: '2500', stock: '10', stockMinimo: '2',
};

describe('productoService', () => {
  it('UT-06 / UT-10: muestra el stock y la alerta que envía el catálogo público', async () => {
    simularApi(rutasCatalogo({
      MC001: { stock: 19, stockBajo: true },
      MC002: { stock: 10, stockBajo: false },
    }));
    const productos = await listarProductos();
    expect(productos.find(({ codigo }) => codigo === 'MC001')).toMatchObject({ stockMinimo: 20, stockBajo: true });
    await expect(obtenerProducto('MC002')).resolves.toMatchObject({ stock: 10, stockBajo: false });
  });

  it('UT-08: permite editar el stock y muestra la baja en el catálogo', async () => {
    sesionDePrueba(1);
    const fetch = simularApi({
      ...rutasCatalogo({ MC001: { activo: false } }),
      'PATCH /api/productos/MC001': { cuerpo: { codigo: 'MC001', stock: 6 } },
      'DELETE /api/productos/MC001': { estado: 204 },
    });
    await expect(actualizarProducto('MC001', { stock: '6' })).resolves.toMatchObject({ stock: 6 });
    expect(JSON.parse(fetch.mock.lastCall[1].body)).toEqual({ stock: 6 });
    await eliminarProducto('MC001');
    await expect(obtenerProducto('MC001')).rejects.toThrow('Producto no encontrado');
    expect((await listarProductos()).some(({ codigo }) => codigo === 'MC001')).toBe(false);
  });

  it('UT-09: rechaza cambios sin el rol correspondiente', async () => {
    await expect(crearProducto(productoNuevo)).rejects.toThrow(/administrador/i);
    await expect(eliminarProducto('MC001')).rejects.toThrow(/administrador/i);
    await expect(actualizarProducto('MC001', { precio: 10 })).rejects.toThrow(/administrador/i);
    await expect(actualizarStock('MC001', 10)).rejects.toThrow(/permiso/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('UT-09: valida los campos obligatorios y los valores numéricos', async () => {
    sesionDePrueba(1);
    for (const [datos, mensaje] of [
      [{ ...productoNuevo, nombre: '' }, /obligatorios/i],
      [{ ...productoNuevo, precio: '0' }, /precio/i],
      [{ ...productoNuevo, stock: '-1' }, /cantidad/i],
      [{ ...productoNuevo, stockMinimo: '-1' }, /stock mínimo/i],
    ]) {
      await expect(crearProducto(datos)).rejects.toThrow(mensaje);
    }
    await expect(actualizarProducto('MC001', {})).rejects.toThrow(/precio o una cantidad/i);
    await expect(actualizarStock('MC001', '')).rejects.toThrow(/cantidad/i);
    expect(fetch).not.toHaveBeenCalled();
  });
});
