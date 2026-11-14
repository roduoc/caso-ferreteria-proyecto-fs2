import { crearPagoDTO } from '../models/Pago';
import { llamarApi } from './api';

//devuelve todos los pagos (solo el admin, en AdminCredito)
export async function listarPagos() {
  const pagos = await llamarApi('/api/pagos');
  return pagos.map(crearPagoDTO);
}

//devuelve los pagos de un cliente (el admin, o el mismo cliente)
export async function listarPagosCliente(clienteId) {
  const pagos = await llamarApi(`/api/pagos/cliente/${clienteId}`);
  return pagos.map(crearPagoDTO);
}

export async function registrarPago(clienteId, monto) {
  if (!Number.isInteger(monto) || monto <= 0) {
    throw new Error('El monto debe ser un número entero mayor a 0');
  }

  //el backend revisa que tenga cuenta corriente y que no pague mas de lo que debe
  const pago = await llamarApi('/api/pagos', {
    metodo: 'POST',
    datos: { clienteId, monto },
  });
  return crearPagoDTO(pago);
}
