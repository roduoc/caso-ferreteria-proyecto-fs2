import { useEffect, useState } from 'react';
//sirve para leer datos que vienen en la url, en este caso
//el :id
import { useParams } from 'react-router-dom';
import { obtenerCliente } from '../../services/clienteService';
import { listarPedidosCliente } from '../../services/pedidoService';

//convierte una fecha 2026-09-15 al formato 15/09/2026
function formatearFecha(fecha) {
    return fecha.split('-').reverse().join('/');
}

//agrega el signo $ y el punto de miles
function formatearPrecio(valor) {
    return `$${valor.toLocaleString('es-CL')}`;
}

export default function AdminHistorialVer() {
    const { id } = useParams();
    const clienteId = Number(id);

    const [cliente, setCliente] = useState(null);
    const [pedidos, setPedidos] = useState([]);
    const [error, setError] = useState(null);

    //pide el cliente y sus pedidos cuando la pagina aparece
    //se vuelve a ejecutar si cambia el id de la url
    useEffect(() => {
        obtenerCliente(clienteId)
            .then((clienteEncontrado) => {
                setCliente(clienteEncontrado);
                //borra un error anterior, por si antes se entro a un id que no existia
                setError(null);
            })
            .catch((e) => setError(e.message));
        listarPedidosCliente(clienteId).then(setPedidos);
    }, [clienteId]);

    if (error) {
        return (
            <div className="flex-1 px-8 py-10">
                <p className="text-center text-red-600 font-semibold">{error}</p>
            </div>
        );
    }

    return (
        //en el caso de flex row crece y ocupa todo el espacio disponible horizontal
        <div className="flex-1 px-8 py-10">

            {/*mientras carga el cliente todavia no hay nombre, por eso el ?*/}
            <h1 className="text-3xl font-semibold text-stone-900 text-center mb-10 mt-4">
                Historial de pedidos de {cliente?.nombreCompleto}
            </h1>

            {/*mx auto centra horizontalmente un elemento*/}
            <div className="max-w-5xl mx-auto space-y-4">

                {cliente && pedidos.length === 0 && (
                    <p className="text-center text-stone-500">Este cliente todavía no tiene pedidos.</p>
                )}

                {/*una tarjeta por cada pedido del cliente*/}
                {pedidos.map((pedido) => (
                    <div key={pedido.id} className="rounded-lg border border-stone-200 bg-white p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <div>
                                <span className="text-xs text-stone-400 block">N° de pedido</span>
                                <span className="font-semibold text-stone-800">#{String(pedido.id)}</span>
                            </div>
                            <div>
                                <span className="text-xs text-stone-400 block">Fecha</span>
                                <span className="font-semibold text-stone-800">{formatearFecha(pedido.fecha)}</span>
                            </div>
                            <div>
                                <span className="text-xs text-stone-400 block">Estado</span>
                                <span className="font-semibold text-stone-800">{pedido.estado}</span>
                            </div>
                            <div>
                                <span className="text-xs text-stone-400 block">Total</span>
                                <span className="font-semibold text-stone-800">{formatearPrecio(pedido.total)}</span>
                            </div>
                        </div>

                        {/*se dibuja automaticamente un triangulito*/}
                        <details className="mt-4 border-t border-stone-200 pt-4">
                            <summary className="cursor-pointer text-sm font-semibold text-amber-700">
                                Ver detalle del pedido
                            </summary>
                            <table className="mt-3 w-full text-sm table-fixed">
                                {/*thead son los nombres de las columnas*/}
                                <thead>
                                    {/*tr define una fila*/}
                                    <tr className="text-left text-stone-500">
                                        <th className="pb-2 px-2 font-medium">Producto</th>
                                        <th className="pb-2 px-2 font-medium">Cantidad</th>
                                        <th className="pb-2 px-2 font-medium">Precio unitario</th>
                                        <th className="pb-2 px-2 font-medium">Subtotal</th>
                                    </tr>
                                </thead>
                                {/*el cuerpo con los datos reales, cada tr es una fila
                                divide y le dibuja una linea horizontal entre cada hijo*/}
                                <tbody className="divide-y divide-stone-100">
                                    {/*una fila por cada producto del pedido
                                    el subtotal se calcula multiplicando cantidad por precio unitario*/}
                                    {pedido.items.map((item) => (
                                        <tr key={item.codigo}>
                                            <td className="py-2 px-2">{item.nombre}</td>
                                            <td className="py-2 px-2">{item.cantidad}</td>
                                            <td className="py-2 px-2">{formatearPrecio(item.precioUnitario)}</td>
                                            <td className="py-2 px-2">{formatearPrecio(item.cantidad * item.precioUnitario)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </details>
                    </div>
                ))}

            </div>
        </div>
    );
}
