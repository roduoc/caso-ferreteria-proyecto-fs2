import pagosMock from '../mocks/pagos.json';
import clientesMock from '../mocks/clientes.json';
import { crearPagoDTO } from '../models/Pago';
import { leer, guardar, esperar, siguienteId } from './storage';

const CLAVE = 'pagos';
const CLAVE_CLIENTES = 'clientes';

//devuelve todos los pagos
export async function listarPagos() {
  await esperar();
  const pagos = leer(CLAVE, pagosMock);
  return pagos.map(crearPagoDTO);
}

export async function listarPagosCliente(clienteId) {
  await esperar();
  const pagos = leer(CLAVE, pagosMock);
  return pagos
    .filter((p) => p.clienteId === clienteId)
    .map(crearPagoDTO);
}

//el cliente paga su deuda, puede ser pago parcial
//guarda el pago y descuenta el monto del saldo adeudado
export async function registrarPago(clienteId, monto) {
  await esperar();

  if (!Number.isInteger(monto) || monto <= 0) {
    throw new Error('El monto debe ser un número entero mayor a 0');
  }

  //carga los clientes de localstorage
  const clientes = leer(CLAVE_CLIENTES, clientesMock);
  //encuentra su indice
  const indice = clientes.findIndex((c) => c.id === clienteId);
  if (indice === -1) throw new Error('Cliente no encontrado');

  if (!clientes[indice].cuentaCorrienteHabilitada) {
    throw new Error('El cliente no tiene cuenta corriente habilitada');
  }
  if (monto > clientes[indice].saldoAdeudado) {
    throw new Error('El monto no puede ser mayor a la deuda');
  }

  const pagos = leer(CLAVE, pagosMock);
  const nuevo = {
    id: siguienteId('ultimoIdPago', pagos),
    clienteId,
    //toisostring slice(0, 10) deja solo 2026-09-28
    fecha: new Date().toISOString().slice(0, 10),
    monto,
  };
  pagos.push(nuevo);
  guardar(CLAVE, pagos);

  //descuenta el pago de la deuda
  clientes[indice] = {
    ...clientes[indice],
    saldoAdeudado: clientes[indice].saldoAdeudado - monto,
  };
  guardar(CLAVE_CLIENTES, clientes);

  return crearPagoDTO(nuevo);
}
