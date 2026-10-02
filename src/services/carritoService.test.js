import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  actualizarCantidad,
  agregarAlCarrito,
  eliminarDelCarrito,
  obtenerCarrito,
  obtenerDetalleCarrito,
  vaciarCarrito,
} from './carritoService';

describe('carritoService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('agrega un producto nuevo al carrito', async () => {
    await agregarAlCarrito('MC001', 2);

    await expect(obtenerCarrito()).resolves.toEqual([
      { codigo: 'MC001', cantidad: 2 },
    ]);
  });

  it('suma la cantidad cuando el producto ya existe', async () => {
    await agregarAlCarrito('MC001', 1);
    await agregarAlCarrito('MC001', 2);

    const carrito = await obtenerCarrito();
    expect(carrito[0].cantidad).toBe(3);
  });

  it('impide superar el stock disponible', async () => {
    await expect(agregarAlCarrito('MC001', 81)).rejects.toThrow('No hay más stock disponible.');
  });

  it('devuelve el detalle y subtotal de cada producto', async () => {
    await agregarAlCarrito('MC001', 2);

    const [item] = await obtenerDetalleCarrito();
    expect(item.nombre).toBe('Cemento Polpaico gris 25 kg');
    expect(item.subtotal).toBe(item.precio * 2);
  });

  it('actualiza, elimina y vacía productos', async () => {
    await agregarAlCarrito('MC001', 1);
    await agregarAlCarrito('MC002', 1);
    await actualizarCantidad('MC001', 3);
    await eliminarDelCarrito('MC002');

    expect(await obtenerCarrito()).toEqual([{ codigo: 'MC001', cantidad: 3 }]);

    await vaciarCarrito();
    expect(await obtenerCarrito()).toEqual([]);
  });
});
