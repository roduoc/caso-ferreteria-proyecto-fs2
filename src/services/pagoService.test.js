import { describe, expect, it } from 'vitest';
import { obtenerCliente } from './clienteService';
import { listarPagos, listarPagosCliente, registrarPago } from './pagoService';

describe('pagoService: abonos de deuda', () => {
  it('muestra los pagos del cliente y descuenta un abono parcial', async () => {
    const saldoAnterior = (await obtenerCliente(4)).saldoAdeudado;
    const cantidadAnterior = (await listarPagosCliente(4)).length;
    const pago = await registrarPago(4, 1000);
    expect(pago).toMatchObject({ clienteId: 4, monto: 1000, fecha: expect.any(String) });
    expect((await obtenerCliente(4)).saldoAdeudado).toBe(saldoAnterior - 1000);
    expect(await listarPagosCliente(4)).toHaveLength(cantidadAnterior + 1);
    expect((await listarPagos()).some((p) => p.id === pago.id)).toBe(true);
  });

  it.each([0, -1, 1.5])('rechaza un abono inválido de %s', async (monto) => {
    await expect(registrarPago(4, monto)).rejects.toThrow(/entero mayor a 0/i);
  });

  it('rechaza cliente inexistente, crédito no habilitado y abono mayor a la deuda', async () => {
    await expect(registrarPago(999, 100)).rejects.toThrow(/no encontrado/i);
    await expect(registrarPago(3, 100)).rejects.toThrow(/no tiene cuenta/i);
    await expect(registrarPago(4, 9999999)).rejects.toThrow(/mayor a la deuda/i);
  });
});
