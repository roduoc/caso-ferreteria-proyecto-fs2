import { describe, expect, it } from 'vitest';
import { listarPagos, listarPagosCliente, registrarPago } from './pagoService';
import { sesionDePrueba, simularApi } from '../test/apiSimulada';

describe('pagoService: abonos de deuda', () => {
  it('UT-21: envía el abono al backend y muestra los pagos registrados', async () => {
    sesionDePrueba(4);
    const pago = { id: 3, clienteId: 4, monto: 1000, fecha: '2026-11-14' };
    const fetch = simularApi({
      'POST /api/pagos': { estado: 201, cuerpo: pago },
      'GET /api/pagos/cliente/4': { cuerpo: [pago] },
      'GET /api/pagos': { cuerpo: [pago] },
    });
    await expect(registrarPago(4, 1000)).resolves.toEqual(pago);
    expect(JSON.parse(fetch.mock.lastCall[1].body)).toEqual({ clienteId: 4, monto: 1000 });
    await expect(listarPagosCliente(4)).resolves.toEqual([pago]);
    sesionDePrueba(1);
    await expect(listarPagos()).resolves.toEqual([pago]);
  });

  it('UT-21: rechaza abonos que no sean enteros positivos', async () => {
    for (const monto of [0, -1, 1.5]) {
      await expect(registrarPago(4, monto)).rejects.toThrow(/entero mayor a 0/i);
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it('UT-21: muestra el rechazo del backend cuando el abono supera la deuda', async () => {
    sesionDePrueba(4);
    simularApi({
      'POST /api/pagos': { estado: 409, cuerpo: { mensaje: 'El abono es mayor a la deuda' } },
    });
    await expect(registrarPago(4, 9999999)).rejects.toThrow(/mayor a la deuda/i);
  });
});
