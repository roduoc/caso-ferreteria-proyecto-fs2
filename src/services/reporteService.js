import { listarPedidos } from './pedidoService';
import { listarUsuarios } from './usuarioService';

//Los gráficos se calculan desde los pedidos guardados, incluidos los productos dados de baja.
export async function obtenerReporteVentas() {
  const [pedidos, usuarios] = await Promise.all([listarPedidos(), listarUsuarios()]);
  const ventasPorProducto = new Map();
  const comprasPorCliente = new Map();

  for (const pedido of pedidos) {
    comprasPorCliente.set(pedido.clienteId, (comprasPorCliente.get(pedido.clienteId) || 0) + 1);

    for (const item of pedido.items) {
      const anterior = ventasPorProducto.get(item.codigo);
      ventasPorProducto.set(item.codigo, {
        codigo: item.codigo,
        nombre: item.nombre,
        cantidad: (anterior?.cantidad || 0) + item.cantidad,
      });
    }
  }

  const productos = [...ventasPorProducto.values()]
    .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre))
    .slice(0, 10);
  const clientes = [...comprasPorCliente.entries()]
    .map(([id, cantidad]) => ({
      id,
      nombre: usuarios.find((usuario) => usuario.id === id)?.nombreCompleto || `Cliente #${id}`,
      cantidad,
    }))
    .sort((a, b) => b.cantidad - a.cantidad || a.id - b.id)
    .slice(0, 10);

  return { productos, clientes };
}
