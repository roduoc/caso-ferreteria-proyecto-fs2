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
    items: p.items,
    total: p.total,
  };
}
