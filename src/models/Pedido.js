//estados posibles de un pedido, se usan para armar el select
export const ESTADOS_PEDIDO = ['Pendiente', 'En preparación', 'Despachado', 'Entregado'];

//dto de pedido
export function crearPedidoDTO(p) {
  return {
    id: p.id,
    clienteId: p.clienteId,
    fecha: p.fecha,
    estado: p.estado,
    medioPago: p.medioPago,
    entrega: p.entrega,
    costoEnvio: p.costoEnvio || 0,
    items: p.items,
    total: p.total,
  };
}
