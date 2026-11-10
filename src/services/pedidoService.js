import { crearPedidoDTO, ESTADOS_PEDIDO } from '../models/Pedido';
import { leer, guardar } from './storage';
import { obtenerSesion } from './usuarioService';
import { llamarApi } from './api';

//el carrito sigue en localStorage, por eso se siguen usando leer y guardar solo para el carrito
const CLAVE_CARRITO = 'carrito';

//lo usan el vendedor y el admin
export async function listarPedidos() {
  if (!['admin', 'vendedor'].includes(obtenerSesion()?.rol)) {
    throw new Error('No tienes permiso para gestionar pedidos');
  }
  const pedidos = await llamarApi('/api/pedidos');
  return pedidos.map(crearPedidoDTO);
}

export async function cambiarEstado(id, nuevoEstado) {
  if (!['admin', 'vendedor'].includes(obtenerSesion()?.rol)) {
    throw new Error('No tienes permiso para gestionar pedidos');
  }

  if (!ESTADOS_PEDIDO.includes(nuevoEstado)) throw new Error('Estado de pedido no válido');

  //el backend revisa que el pedido exista y que no este entregado
  const pedido = await llamarApi(`/api/pedidos/${id}/estado`, {
    metodo: 'PATCH',
    datos: { estado: nuevoEstado },
  });
  return crearPedidoDTO(pedido);
}

//devuelve solo los pedidos de un cliente, para el historial de compras
export async function listarPedidosCliente(clienteId) {
  const sesion = obtenerSesion();
  if (!sesion || (sesion.rol !== 'admin' && (sesion.rol !== 'cliente' || sesion.id !== clienteId))) {
    throw new Error('No tienes permiso para consultar estos pedidos');
  }
  const pedidos = await llamarApi(`/api/pedidos/cliente/${clienteId}`);
  return pedidos.map(crearPedidoDTO);
}

//crea el pedido usando el carrito actual
export async function crearPedido(clienteId, datosEntrega, medioPago) {
  const sesion = obtenerSesion();
  if (!sesion || sesion.rol !== 'cliente' || sesion.id !== clienteId) {
    throw new Error('Inicia sesión como cliente para comprar.');
  }
  if (!['contado', 'cuenta_corriente'].includes(medioPago)) {
    throw new Error('Selecciona un medio de pago válido.');
  }

  const carrito = leer(CLAVE_CARRITO, []);
  if (carrito.length === 0) throw new Error('El carrito está vacío.');

  //solo se mandan los campos que espera el backend (CrearPedidoRequest)
  //el precio y el nombre no se mandan: los pone ms-productos, asi nadie puede cambiar el precio
  const pedido = await llamarApi('/api/pedidos', {
    metodo: 'POST',
    datos: {
      clienteId,
      medioPago,
      entrega: {
        modalidad: datosEntrega.modalidad,
        comuna: datosEntrega.comuna,
        direccion: datosEntrega.direccion,
      },
      items: carrito.map((item) => ({ codigo: item.codigo, cantidad: item.cantidad })),
    },
  });

  //si el backend rechazo el pedido, llamarApi ya lanzo el error y el carrito no se vacia
  guardar(CLAVE_CARRITO, []);
  window.dispatchEvent(new Event('carritoActualizado'));

  return crearPedidoDTO(pedido);
}
