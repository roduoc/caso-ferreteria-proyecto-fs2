import { describe, expect, it } from 'vitest';
import { obtenerReporteVentas } from './reporteService';
import { pedidos, sesionDePrueba, simularApi, usuariosDePrueba } from '../test/apiSimulada';

describe('HU 13: reportes de ventas', () => {
  it('UT-24: rechaza la consulta sin permisos de administrador', async () => {
    await expect(obtenerReporteVentas()).rejects.toThrow(/permiso|administrador/i);
    sesionDePrueba(3);
    await expect(obtenerReporteVentas()).rejects.toThrow(/permiso|administrador/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('UT-24: ordena ventas históricas y clientes por frecuencia, incluso si falta el usuario', async () => {
    sesionDePrueba(1);
    const fetch = simularApi({
      'GET /api/pedidos': { cuerpo: [...pedidos, { clienteId: 99, items: [pedidos[0].items[1]] }] },
      'GET /api/usuarios': { cuerpo: usuariosDePrueba },
    });
    const reporte = await obtenerReporteVentas();
    expect(reporte.productos[0]).toMatchObject({ codigo: 'MC007', cantidad: 200 });
    expect(reporte.productos.find(({ codigo }) => codigo === 'MC005')).toMatchObject({ cantidad: 12 });
    expect(reporte.clientes[0]).toMatchObject({ id: 3, nombre: 'Juan Pérez Díaz', cantidad: 2 });
    expect(reporte.clientes.at(-1)).toMatchObject({ nombre: 'Cliente #99', cantidad: 1 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
