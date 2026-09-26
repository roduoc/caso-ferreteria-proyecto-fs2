import pedidosMock from '../mocks/pedidos.json';
import { crearPedidoDTO } from '../models/Pedido';
import { leer, guardar, esperar } from './storage';

const CLAVE = 'pedidos';

//devuelve todos los pedidos
//lo usan el vendedor y el admin
export async function listarPedidos() {
  await esperar();
  const pedidos = leer(CLAVE, pedidosMock);
  return pedidos.map(crearPedidoDTO);
}

//cambia el estado de un pedido
export async function cambiarEstado(id, nuevoEstado) {
  await esperar();

  const pedidos = leer(CLAVE, pedidosMock);
  const indice = pedidos.findIndex((p) => p.id === id);
  if (indice === -1) throw new Error('Pedido no encontrado');

  if (pedidos[indice].estado === 'Entregado' || pedidos[indice].estado === 'Cancelado') {
    throw new Error('Un pedido entregado o cancelado ya no se puede cambiar');
  }

  pedidos[indice] = { ...pedidos[indice], estado: nuevoEstado };
  guardar(CLAVE, pedidos);

  return crearPedidoDTO(pedidos[indice]);
}

//devuelve solo los pedidos de un cliente, para el historial de compras
export async function listarPedidosCliente(clienteId) {
  await esperar();
  const pedidos = leer(CLAVE, pedidosMock);
  return pedidos
    .filter((p) => p.clienteId === clienteId)
    .map(crearPedidoDTO);
}
