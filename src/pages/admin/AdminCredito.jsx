import { useEffect, useState } from 'react';
import { listarClientes } from '../../services/clienteService';
import { listarPagos } from '../../services/pagoService';

function formatearFecha(fecha) {
    return fecha.split('-').reverse().join('/');
}

function formatearPrecio(valor) {
    return `$${valor.toLocaleString('es-CL')}`;
}

export default function AdminCredito() {
    const [clientes, setClientes] = useState([]);
    const [pagos, setPagos] = useState([]);

    //pide los clientes y pagos
    useEffect(() => {
        listarClientes().then(setClientes);
        listarPagos().then(setPagos);
    }, []);

    //solo se muestran los clientes que tienen cuenta corriente
    //o que tuvieron una y todavia tienen pagos guardados
    const clientesCredito = clientes.filter((c) =>
        //pagos.some pregunta si hay al menos un pago de ese cliente
        //recorre la lista de pagos y devuelve true cuando encuentra uno con el mismo id
        c.cuentaCorrienteHabilitada || pagos.some((p) => p.clienteId === c.id)
    );

    return (
        //en el caso de flex row crece y ocupa todo el espacio disponible horizontal
        <div className="flex-1 px-8 py-10">
            <h1 className="text-3xl font-semibold text-stone-900 text-center mb-10">Cuentas corrientes - Vista Administrador</h1>

            {/*space y 4 agrega espacio vertical entre cada tarjeta*/}
            <div className="max-w-5xl mx-auto space-y-4">

                {clientes.length > 0 && clientesCredito.length === 0 && (
                    <p className="text-center text-stone-500">No hay clientes con cuenta corriente.</p>
                )}

                {/*una tarjeta por cada cliente con credito*/}
                {clientesCredito.map((cliente) => {
                    //los pagos que son de este cliente
                    const pagosCliente = pagos.filter((p) => p.clienteId === cliente.id);
                    //reduce suma todos los montos, parte desde 0
                    const totalPagado = pagosCliente.reduce((suma, p) => suma + p.monto, 0);

                    return (
                        <div key={cliente.id} className="rounded-lg border border-stone-200 bg-white p-6">

                            {/*nombre a la izquierda, saldo al centro, total pagado a la derecha*/}
                            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="block text-lg leading-7 text-stone-900">#{cliente.id}</span>
                                    <div>
                                        <p className="font-medium text-lg text-stone-800">{cliente.nombreCompleto}</p>
                                        <p className="text-sm text-stone-500">{cliente.correo}</p>
                                    </div>
                                </div>
                                <p className="text-stone-600 text-left sm:text-center">
                                    <span className="text-xs text-stone-400 block">Saldo adeudado</span>
                                    <span className="font-semibold text-lg">{formatearPrecio(cliente.saldoAdeudado)}</span>
                                </p>
                                <p className="text-stone-600 text-left sm:text-right">
                                    <span className="text-xs text-stone-400 block">Total pagado</span>
                                    <span className="font-semibold text-lg">{formatearPrecio(totalPagado)}</span>
                                </p>
                            </div>

                            {/*se dibuja automaticamente un triangulito*/}
                            <details className="mt-4 border-t border-stone-200 pt-4">
                                <summary className="cursor-pointer text-sm font-semibold text-amber-700">
                                    Ver historial de pagos
                                </summary>

                                {pagosCliente.length === 0 ? (
                                    <p className="mt-3 text-sm text-stone-500">Este cliente todavía no ha hecho pagos.</p>
                                ) : (
                                    <table className="mt-3 w-full text-sm table-fixed">
                                        <thead>
                                            <tr className="text-left text-stone-500">
                                                <th className="pb-2 px-2 font-medium">N° de pago</th>
                                                <th className="pb-2 px-2 font-medium">Fecha</th>
                                                <th className="pb-2 px-2 font-medium">Monto</th>
                                            </tr>
                                        </thead>
                                        {/*divide le dibuja una linea horizontal entre cada fila*/}
                                        <tbody className="divide-y divide-stone-100">
                                            {pagosCliente.map((pago) => (
                                                <tr key={pago.id}>
                                                    <td className="py-2 px-2">#{String(pago.id).padStart(4, '0')}</td>
                                                    <td className="py-2 px-2">{formatearFecha(pago.fecha)}</td>
                                                    <td className="py-2 px-2">{formatearPrecio(pago.monto)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </details>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}
