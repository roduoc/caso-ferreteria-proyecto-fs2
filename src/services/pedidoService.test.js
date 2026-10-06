import { describe, expect, it } from 'vitest';
import { agregarAlCarrito, obtenerCarrito } from './carritoService';
import { obtenerCliente } from './clienteService';
import { cambiarEstado, crearPedido, listarPedidos, listarPedidosCliente } from './pedidoService';
import { obtenerProducto } from './productoService';
import { cerrarSesion, iniciarSesion } from './usuarioService';
import { ESTADOS_PEDIDO } from '../models/Pedido';

const entrega = { modalidad: 'despacho', direccion: 'Av. Test 1', comuna: 'La Serena' };
const loginCliente = () => iniciarSesion('ana.torres@gmail.com', '1234');

describe('compra a crédito', () => {
  it('suma productos y despacho al monto adeudado y descuenta stock una sola vez', async () => {
    const sesion = await loginCliente();
    const productoAntes = await obtenerProducto('MC001');
    const saldoAntes = (await obtenerCliente(sesion.id)).saldoAdeudado;
    await agregarAlCarrito('MC001', 2);

    const pedido = await crearPedido(sesion.id, entrega, 'cuenta_corriente');

    expect(pedido.total).toBe(productoAntes.precio * 2 + 3990);
    expect(pedido.medioPago).toBe('cuenta_corriente');
    expect((await obtenerCliente(sesion.id)).saldoAdeudado).toBe(saldoAntes + pedido.total);
    expect((await obtenerProducto('MC001')).stock).toBe(productoAntes.stock - 2);
    expect(await obtenerCarrito()).toEqual([]);
    expect((await listarPedidosCliente(sesion.id)).some((p) => p.id === pedido.id)).toBe(true);
  });

  it('no aumenta la deuda al pagar al contado', async () => {
    const sesion = await loginCliente();
    const saldoAntes = (await obtenerCliente(sesion.id)).saldoAdeudado;
    await agregarAlCarrito('MC001');
    const pedido = await crearPedido(sesion.id, { modalidad: 'retiro' }, 'contado');
    expect(pedido.costoEnvio).toBe(0);
    expect((await obtenerCliente(sesion.id)).saldoAdeudado).toBe(saldoAntes);
  });

  it('rechaza crédito no habilitado y conserva carrito, stock y deuda', async () => {
    const sesion = await iniciarSesion('juan.perez@gmail.com', '1234');
    await agregarAlCarrito('MC001');
    const productoAntes = await obtenerProducto('MC001');
    await expect(crearPedido(sesion.id, entrega, 'cuenta_corriente')).rejects.toThrow(/habilitada/i);
    expect((await obtenerProducto('MC001')).stock).toBe(productoAntes.stock);
    expect((await obtenerCliente(sesion.id)).saldoAdeudado).toBe(0);
    expect(await obtenerCarrito()).toHaveLength(1);
  });

  it('rechaza pedidos sin sesión, con carrito vacío o medio inválido', async () => {
    await expect(crearPedido(4, entrega, 'contado')).rejects.toThrow(/sesión/i);
    const sesion = await loginCliente();
    await expect(crearPedido(sesion.id, entrega, 'otro')).rejects.toThrow(/medio de pago/i);
    await expect(crearPedido(sesion.id, entrega, 'contado')).rejects.toThrow(/vacío/i);
  });
});

describe('HU 10 y HU 12: estados, propiedad e historial', () => {
  it('solo entrega pedidos del cliente autenticado y sus estados actuales', async () => {
    await iniciarSesion('juan.perez@gmail.com', '1234');
    const propios = await listarPedidosCliente(3);
    expect(propios.length).toBeGreaterThan(0);
    expect(propios.every((p) => p.clienteId === 3 && ESTADOS_PEDIDO.includes(p.estado))).toBe(true);
    await expect(listarPedidosCliente(4)).rejects.toThrow(/permiso/i);
    cerrarSesion();
    await expect(listarPedidosCliente(3)).rejects.toThrow(/permiso/i);
  });

  it('permite al administrador consultar compras de un cliente con fecha y monto', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    const historial = await listarPedidosCliente(3);
    expect(historial.length).toBeGreaterThan(0);
    expect(historial.every((p) => p.clienteId === 3 && /^\d{4}-\d{2}-\d{2}$/.test(p.fecha) && p.total > 0)).toBe(true);
    expect(await listarPedidos()).toHaveLength(3);
  });

  it('acepta exactamente cuatro estados y muestra la actualización al consultar', async () => {
    expect(ESTADOS_PEDIDO).toEqual(['Pendiente', 'En preparación', 'Despachado', 'Entregado']);
    await iniciarSesion('vendedor@duoc.cl', '1234');
    await expect(cambiarEstado(1, 'Cancelado')).rejects.toThrow(/no válido/i);
    await cambiarEstado(1, 'Despachado');
    await iniciarSesion('juan.perez@gmail.com', '1234');
    expect((await listarPedidosCliente(3)).find((p) => p.id === 1).estado).toBe('Despachado');
    await iniciarSesion('vendedor@duoc.cl', '1234');
    await expect(cambiarEstado(3, 'Pendiente')).rejects.toThrow(/entregado/i);
  });

  it('impide al cliente gestionar todos los pedidos', async () => {
    await iniciarSesion('juan.perez@gmail.com', '1234');
    await expect(listarPedidos()).rejects.toThrow(/permiso/i);
    await expect(cambiarEstado(1, 'Despachado')).rejects.toThrow(/permiso/i);
  });
});
