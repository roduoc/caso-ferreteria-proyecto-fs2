import { describe, expect, it } from 'vitest';
import { obtenerReporteVentas } from './reporteService';
import { eliminarProducto } from './productoService';
import { iniciarSesion } from './usuarioService';

describe('HU 13: reportes de ventas', () => {
  it('solo permite consultar reportes al administrador', async () => {
    await expect(obtenerReporteVentas()).rejects.toThrow(/permiso|administrador/i);
    await iniciarSesion('juan.perez@gmail.com', '1234');
    await expect(obtenerReporteVentas()).rejects.toThrow(/permiso|administrador/i);
  });

  it('ordena productos por unidades vendidas y clientes por frecuencia de compra', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    const reporte = await obtenerReporteVentas();
    expect(reporte.productos[0]).toMatchObject({ codigo: 'MC007', cantidad: 200 });
    expect(reporte.clientes[0]).toMatchObject({ id: 3, cantidad: 2 });
    expect(reporte.productos.every((p, i, lista) => i === 0 || lista[i - 1].cantidad >= p.cantidad)).toBe(true);
  });

  it('conserva ventas históricas de productos dados de baja', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    await eliminarProducto('MC007');
    const reporte = await obtenerReporteVentas();
    expect(reporte.productos[0].codigo).toBe('MC007');
  });

  it('informa reportes vacíos cuando todavía no hay pedidos', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    localStorage.setItem('pedidos', '[]');
    expect(await obtenerReporteVentas()).toEqual({ productos: [], clientes: [] });
  });

  it('agrupa un producto repetido y conserva la frecuencia de un cliente eliminado', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    localStorage.setItem('pedidos', JSON.stringify([
      { id: 1, clienteId: 999, items: [{ codigo: 'A', nombre: 'Producto A', cantidad: 2 }] },
      { id: 2, clienteId: 999, items: [{ codigo: 'A', nombre: 'Producto A', cantidad: 3 }] },
    ]));
    const reporte = await obtenerReporteVentas();
    expect(reporte.productos).toEqual([{ codigo: 'A', nombre: 'Producto A', cantidad: 5 }]);
    expect(reporte.clientes).toEqual([{ id: 999, nombre: 'Cliente #999', cantidad: 2 }]);
  });
});
