import pedidosMock from '../mocks/pedidos.json';
import { crearPedidoDTO, ESTADOS_PEDIDO } from '../models/Pedido';
import { leer, guardar, esperar } from './storage';

const CLAVE = 'pedidos';

//devuelve todos los pedidos, los mas nuevos primero
//lo usan el vendedor y el admin
export async function listarPedidos() {
  await esperar();
  const pedidos = leer(CLAVE, pedidosMock);

  return [...pedidos]
    .sort((a, b) => b.id - a.id)
    .map(crearPedidoDTO);
}

//cambia el estado de un pedido
export async function cambiarEstado(id, nuevoEstado) {
  await esperar();

  if (!ESTADOS_PEDIDO.includes(nuevoEstado)) {
    throw new Error('Estado no válido');
  }

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
