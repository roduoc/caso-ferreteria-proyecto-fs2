import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo-los-maestros.svg';
import { obtenerSesion } from '../services/usuarioService';
import { obtenerCliente } from '../services/clienteService';
import { registrarPago } from '../services/pagoService';

function formatoPrecio(precio) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(precio);
}

export default function MiCredito() {
    const [cliente, setCliente] = useState(null);
    const [monto, setMonto] = useState('');
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    //el layout ya reviso que hay sesion de cliente, por eso aqui sesion no es null
    useEffect(() => {
        const sesion = obtenerSesion();
        obtenerCliente(sesion.id)
            .then(setCliente)
            .catch((e) => setError(e.message));
    }, []);

    useEffect(() => {
        if (!error && !exito) return;
        const temporizador = setTimeout(() => {
            setError('');
            setExito('');
        }, 3000);
        return () => clearTimeout(temporizador);
    }, [error, exito]);

    async function pagar(event) {
        event.preventDefault();
        try {
            await registrarPago(cliente.id, Number(monto));
            //se vuelve a pedir el cliente para mostrar el saldo ya descontado
            const clienteActualizado = await obtenerCliente(cliente.id);
            setCliente(clienteActualizado);
            setExito(`Pago de ${formatoPrecio(Number(monto))} registrado correctamente.`);
            setError('');
            setMonto('');
        } catch (e) {
            setError(e.message);
            setExito('');
        }
    }

    return (
        <main className="flex-1">
            <title>Mi crédito | Ferretería Los Maestros</title>
            <div className="page-shell relative py-8">
                <Link to="/mis-pedidos"
                    className="absolute left-0 top-8 text-sm font-semibold text-stone-500 hover:text-amber-700">←
                    Volver a mis pedidos</Link>

                <div className="flex flex-col items-center pt-18">
                    <h1 className="section-title text-center">Mi Crédito</h1>
                    <img className="mt-3 size-16" src={logo}
                        alt="Logo Ferretería Los Maestros" />
                </div>

                {/*recuadro blanco grande*/}
                <div className="mx-auto mt-6 md:mt-16 w-full max-w-md rounded-xl border border-stone-300 bg-white p-6 sm:p-8 ">
                    {/*segundo recuadro blanco grande con contenido*/}
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-stone-200 p-5 sm:p-6">
                        {/*tracking wide controla el espacio entre letras de la misma palabra, con tight quedan un poquito mas juntas*/}
                        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Saldo actual</p>
                        {/*mientras el service responde se muestra $0, igual que en el html*/}
                        <p id="saldo-actual" className="text-4xl font-bold text-amber-700">{formatoPrecio(cliente ? cliente.saldoAdeudado : 0)}</p>
                        <p className="mt-1 text-xs text-stone-500">Crédito acumulado este mes en tu cuenta corriente</p>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                            role="alert">{error}</p>
                    )}
                    {exito && (
                        <p className="mt-4 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"
                            role="status">{exito}</p>
                    )}

                    {cliente && cliente.cuentaCorrienteHabilitada && (
                        <form onSubmit={pagar} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold" htmlFor="monto-pago">Monto a pagar</label>
                                <input id="monto-pago" type="number" min="1" placeholder="Ej: 10000"
                                    value={monto} onChange={(e) => setMonto(e.target.value)}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                            </div>
                            <button className="add-button w-full" type="submit">Pagar</button>
                        </form>
                    )}

                    {cliente && !cliente.cuentaCorrienteHabilitada && (
                        <p className="mt-6 text-center text-sm text-stone-500">No tienes cuenta corriente habilitada.</p>
                    )}
                </div>
            </div>
        </main>
    );
}
