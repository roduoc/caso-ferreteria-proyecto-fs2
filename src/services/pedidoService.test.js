import { describe, expect, it } from 'vitest';
import { obtenerCarrito } from './carritoService';
import { cambiarEstado, crearPedido, listarPedidos, listarPedidosCliente } from './pedidoService';
import { cerrarSesion } from './usuarioService';
import { ESTADOS_PEDIDO } from '../models/Pedido';
import { pedidos, sesionDePrueba, simularApi } from '../test/apiSimulada';

const despacho = { modalidad: 'despacho', direccion: 'Av. Test 1', comuna: 'La Serena' };
const retiro = { modalidad: 'retiro' };

function prepararCarrito() {
  localStorage.setItem('carrito', JSON.stringify([
    { codigo: 'MC001', cantidad: 2, precio: 1, nombre: 'Ignorar' },
  ]));
}

describe('creación de pedidos', () => {
  it.each([
    ['UT-18', 'cuenta_corriente', despacho, 3990],
    ['UT-20', 'contado', retiro, 0],
  ])('%s envía la compra con medio %s y vacía el carrito al confirmarse', async (_id, medioPago, entrega, costoEnvio) => {
    sesionDePrueba(4);
    prepararCarrito();
    const total = 11980 + costoEnvio;
    const fetch = simularApi({
      'POST /api/pedidos': {
        estado: 201,
        cuerpo: { id: 4, clienteId: 4, medioPago, total, costoEnvio, estado: 'Pendiente' },
      },
    });

    const pedido = await crearPedido(4, entrega, medioPago);

    expect(pedido).toMatchObject({ id: 4, medioPago, total, costoEnvio });
    expect(JSON.parse(fetch.mock.lastCall[1].body)).toEqual({
      clienteId: 4, entrega, medioPago, items: [{ codigo: 'MC001', cantidad: 2 }],
    });
    expect(await obtenerCarrito()).toEqual([]);
  });

  it('UT-19: muestra el rechazo de crédito del servidor y conserva el carrito', async () => {
    sesionDePrueba(3);
    prepararCarrito();
    simularApi({
      'POST /api/pedidos': { estado: 409, cuerpo: { mensaje: 'Cuenta corriente no habilitada' } },
    });
    await expect(crearPedido(3, despacho, 'cuenta_corriente')).rejects.toThrow(/no habilitada/i);
    expect(await obtenerCarrito()).toHaveLength(1);
  });

  it('UT-19: rechaza pedidos sin sesión, con carrito vacío o medio inválido', async () => {
    await expect(crearPedido(4, despacho, 'contado')).rejects.toThrow(/sesión/i);
    sesionDePrueba(4);
    await expect(crearPedido(4, despacho, 'otro')).rejects.toThrow(/medio de pago/i);
    await expect(crearPedido(4, despacho, 'contado')).rejects.toThrow(/vacío/i);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('HU 10 y HU 12: estados, propiedad e historial', () => {
  it('UT-16: solicita solo los pedidos del cliente autenticado', async () => {
    sesionDePrueba(3);
    simularApi({ 'GET /api/pedidos/cliente/3': { cuerpo: [pedidos[0], pedidos[2]] } });
    await expect(listarPedidosCliente(3)).resolves.toMatchObject([
      { clienteId: 3, estado: 'Pendiente' },
      { clienteId: 3, estado: 'Entregado' },
    ]);
    await expect(listarPedidosCliente(4)).rejects.toThrow(/permiso/i);
    cerrarSesion();
    await expect(listarPedidosCliente(3)).rejects.toThrow(/permiso/i);
  });

  it('UT-23: permite al administrador consultar fecha y monto de las compras', async () => {
    sesionDePrueba(1);
    simularApi({
      'GET /api/pedidos/cliente/3': { cuerpo: [pedidos[0]] },
      'GET /api/pedidos': { cuerpo: pedidos },
    });
    await expect(listarPedidosCliente(3)).resolves.toMatchObject([{ fecha: '2026-09-15', total: 34760 }]);
    await expect(listarPedidos()).resolves.toHaveLength(3);
  });

  it('UT-17: valida los estados y envía el nuevo estado al servidor', async () => {
    sesionDePrueba(2);
    const fetch = simularApi({
      'PATCH /api/pedidos/1/estado': { cuerpo: { ...pedidos[0], estado: 'Despachado' } },
      'PATCH /api/pedidos/3/estado': { estado: 409, cuerpo: { mensaje: 'El pedido ya fue entregado' } },
    });
    expect(ESTADOS_PEDIDO).toEqual(['Pendiente', 'En preparación', 'Despachado', 'Entregado']);
    await expect(cambiarEstado(1, 'Cancelado')).rejects.toThrow(/no válido/i);
    await expect(cambiarEstado(1, 'Despachado')).resolves.toMatchObject({ estado: 'Despachado' });
    expect(JSON.parse(fetch.mock.lastCall[1].body)).toEqual({ estado: 'Despachado' });
    await expect(cambiarEstado(3, 'Pendiente')).rejects.toThrow(/entregado/i);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('UT-16: impide al cliente gestionar pedidos', async () => {
    sesionDePrueba(3);
    await expect(listarPedidos()).rejects.toThrow(/permiso/i);
    await expect(cambiarEstado(1, 'Despachado')).rejects.toThrow(/permiso/i);
    expect(fetch).not.toHaveBeenCalled();
  });
});
