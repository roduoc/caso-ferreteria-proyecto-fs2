import pedidosMock from '../mocks/pedidos.json';
import productosMock from '../mocks/productos.json';
import clientesMock from '../mocks/clientes.json';
import { crearPedidoDTO, ESTADOS_PEDIDO } from '../models/Pedido';
import { leer, guardar, esperar, siguienteId } from './storage';
import { obtenerSesion } from './usuarioService';

const CLAVE = 'pedidos';
const CLAVE_PRODUCTOS = 'productos';
const CLAVE_CLIENTES = 'clientes';
const CLAVE_CARRITO = 'carrito';
const CLAVE_ULTIMO_ID = 'ultimoIdPedido';

//devuelve todos los pedidos
//lo usan el vendedor y el admin
export async function listarPedidos() {
  await esperar();
  if (!['admin', 'vendedor'].includes(obtenerSesion()?.rol)) {
    throw new Error('No tienes permiso para gestionar pedidos');
  }
  const pedidos = leer(CLAVE, pedidosMock);
  return pedidos.map(crearPedidoDTO);
}

//cambia el estado de un pedido
export async function cambiarEstado(id, nuevoEstado) {
  await esperar();

  if (!['admin', 'vendedor'].includes(obtenerSesion()?.rol)) {
    throw new Error('No tienes permiso para gestionar pedidos');
  }

  if (!ESTADOS_PEDIDO.includes(nuevoEstado)) throw new Error('Estado de pedido no válido');

  const pedidos = leer(CLAVE, pedidosMock);
  const indice = pedidos.findIndex((p) => p.id === id);
  if (indice === -1) throw new Error('Pedido no encontrado');

  if (pedidos[indice].estado === 'Entregado') {
    throw new Error('Un pedido entregado ya no se puede cambiar');
  }

  pedidos[indice] = { ...pedidos[indice], estado: nuevoEstado };
  guardar(CLAVE, pedidos);

  return crearPedidoDTO(pedidos[indice]);
}

//devuelve solo los pedidos de un cliente, para el historial de compras
export async function listarPedidosCliente(clienteId) {
  await esperar();
  const sesion = obtenerSesion();
  if (!sesion || (sesion.rol !== 'admin' && (sesion.rol !== 'cliente' || sesion.id !== clienteId))) {
    throw new Error('No tienes permiso para consultar estos pedidos');
  }
  const pedidos = leer(CLAVE, pedidosMock);
  return pedidos
    .filter((p) => p.clienteId === clienteId)
    .map(crearPedidoDTO);
}

//crea el pedido usando el carrito actual y descuenta el stock
export async function crearPedido(clienteId, datosEntrega, medioPago) {
  await esperar();

  const sesion = obtenerSesion();
  if (!sesion || sesion.rol !== 'cliente' || sesion.id !== clienteId) {
    throw new Error('Inicia sesión como cliente para comprar.');
  }
  if (!['contado', 'cuenta_corriente'].includes(medioPago)) {
    throw new Error('Selecciona un medio de pago válido.');
  }

  const carrito = leer(CLAVE_CARRITO, []);
  if (carrito.length === 0) throw new Error('El carrito está vacío.');

  const productos = leer(CLAVE_PRODUCTOS, productosMock);
  const clientes = leer(CLAVE_CLIENTES, clientesMock);
  const cliente = clientes.find((c) => c.id === clienteId);
  if (!cliente) throw new Error('Cliente no encontrado.');

  if (medioPago === 'cuenta_corriente' && !cliente.cuentaCorrienteHabilitada) {
    throw new Error('La cuenta corriente no está habilitada.');
  }

  const items = carrito.map((itemCarrito) => {
    const producto = productos.find((p) => p.codigo === itemCarrito.codigo);
    if (!producto || producto.activo === false) throw new Error('Uno de los productos ya no existe.');
    if (itemCarrito.cantidad > producto.stock) {
      throw new Error(`No hay stock suficiente de ${producto.nombre}.`);
    }

    return {
      codigo: producto.codigo,
      nombre: producto.nombre,
      cantidad: itemCarrito.cantidad,
      precioUnitario: producto.precio,
    };
  });

  const subtotal = items.reduce((total, item) => total + item.precioUnitario * item.cantidad, 0);
  const costoEnvio = datosEntrega.modalidad === 'despacho' ? 3990 : 0;
  const total = subtotal + costoEnvio;
  const pedidos = leer(CLAVE, pedidosMock);

  const nuevoPedido = {
    id: siguienteId(CLAVE_ULTIMO_ID, [...pedidosMock, ...pedidos]),
    clienteId,
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'Pendiente',
    medioPago,
    entrega: datosEntrega,
    costoEnvio,
    items,
    total,
  };

  //las validaciones se hacen antes de guardar para evitar cambios incompletos
  items.forEach((item) => {
    const producto = productos.find((p) => p.codigo === item.codigo);
    producto.stock -= item.cantidad;
  });

  if (medioPago === 'cuenta_corriente') cliente.saldoAdeudado += total;

  pedidos.push(nuevoPedido);
  guardar(CLAVE_PRODUCTOS, productos);
  guardar(CLAVE_CLIENTES, clientes);
  guardar(CLAVE, pedidos);
  guardar(CLAVE_CARRITO, []);
  window.dispatchEvent(new Event('carritoActualizado'));

  return crearPedidoDTO(nuevoPedido);
}
