import { describe, expect, it } from 'vitest';
import { obtenerReporteVentas } from './reporteService';
import { eliminarProducto } from './productoService';
import { iniciarSesion } from './usuarioService';

describe('HU 13: reportes de ventas', () => {
  it('UT-24: solo permite consultar reportes al administrador', async () => {
    await expect(obtenerReporteVentas()).rejects.toThrow(/permiso|administrador/i);
    await iniciarSesion('juan.perez@gmail.com', '1234');
    await expect(obtenerReporteVentas()).rejects.toThrow(/permiso|administrador/i);
  });

  it('UT-24: ordena productos por unidades vendidas y clientes por frecuencia de compra', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    const reporte = await obtenerReporteVentas();
    expect(reporte.productos[0]).toMatchObject({ codigo: 'MC007', cantidad: 200 });
    expect(reporte.clientes[0]).toMatchObject({ id: 3, cantidad: 2 });
    expect(reporte.productos.every((p, i, lista) => i === 0 || lista[i - 1].cantidad >= p.cantidad)).toBe(true);
  });

  it('UT-24: conserva ventas históricas de productos dados de baja', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    await eliminarProducto('MC007');
    const reporte = await obtenerReporteVentas();
    expect(reporte.productos[0].codigo).toBe('MC007');
  });

});
