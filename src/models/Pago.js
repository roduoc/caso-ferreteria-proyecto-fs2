//dto de pago
//un pago es lo que un cliente abona a la deuda de su cuenta corriente
export function crearPagoDTO(p) {
  return {
    id: p.id,
    clienteId: p.clienteId,
    fecha: p.fecha,
    monto: p.monto,
  };
}
