import { useEffect, useState } from 'react';
import { listarPedidos, cambiarEstado } from '../../services/pedidoService';
import TarjetaPedidoVendedor from '../../components/TarjetaPedido';

export default function VendedorGestionPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [buscarId, setBuscarId] = useState('');

  //useEffect con [] se ejecuta una sola vez, cuando la pagina aparece
  //aqui se piden los pedidos al service
  useEffect(() => {
    listarPedidos().then(setPedidos);
  }, []);

  //la pagina le entrega esta funcion a cada tarjeta
  //guarda el estado nuevo con el service y reemplaza ese pedido en la lista
  async function guardarEstado(id, nuevoEstado) {
    const actualizado = await cambiarEstado(id, nuevoEstado);
    setPedidos((lista) => lista.map((p) => (p.id === id ? actualizado : p)));
  }

  const textoBuscado = buscarId.trim();
  const pedidosFiltrados = textoBuscado === ''
    ? pedidos
    : pedidos.filter((p) => String(p.id) === textoBuscado);

  return (
    //en el caso de flex row crece y ocupa todo el espacio disponible horizontal
    <div className="flex-1 px-8 py-10">
      <h1 className="text-3xl font-semibold text-stone-900 text-center mb-10">Gestión de pedidos - Vista Vendedor</h1>

      {/*space y 4 agrega espacio vertical entre cada tarjeta de pedido
            max w 5xl para que las tarjetas ocupen mas ancho*/}
      <div className="max-w-5xl mx-auto space-y-4">

        <input type="search" placeholder="Buscar por número de pedido"
        value={buscarId}
        onChange={(e) => setBuscarId(e.target.value)}
        className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-amber-500" 
        />


        {pedidos.length > 0 && pedidosFiltrados.length === 0 && (
          <p className="text-center text-stone-500">No se encontraron pedidos.</p>
        )}

        {/*se crea una tarjeta por cada pedido
        la pagina le pasa el pedido a mostrar*/}
        {pedidosFiltrados.map((pedido) => (
          <TarjetaPedidoVendedor key={pedido.id} pedido={pedido} onCambiarEstado={guardarEstado} />
        ))}

      </div>
    </div>
  );
}