import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerSesion } from '../services/usuarioService';
import { listarPedidosCliente } from '../services/pedidoService';
import { obtenerCliente } from '../services/clienteService';
import sinImagen from '../assets/sin-imagen.svg';

function formatearFecha(fecha) {
    return fecha.split('-').reverse().join('/');
}

function formatoPrecio(precio) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(precio);
}

const COLORES_ESTADO = {
    'Pendiente': 'bg-red-100 text-red-800',
    'En preparación': 'bg-amber-100 text-amber-800',
    'Despachado': 'bg-blue-100 text-blue-800',
    'Entregado': 'bg-green-100 text-green-800',
};

export default function MisPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [cliente, setCliente] = useState(null);

    useEffect(() => {
        const sesion = obtenerSesion();
        listarPedidosCliente(sesion.id).then((pedidosCliente) => {
            obtenerCliente(sesion.id).then(setCliente);
            setPedidos(pedidosCliente);
            setCargando(false);
        });
    }, []);

    return (
        //flex 1 para que ocupe todo el espacio vertical disponibl y el footer se quede abajo
        <main className="flex-1">
            <title>Mis pedidos | Ferretería Los Maestros</title>
            {/*page shell limita el ancho del contenido a un determinado ancho que debe ser el mas pequeño
            entre dos medidas de pantalla. */}
            <section className="page-shell py-10">
                <h1 className="text-2xl font-bold text-stone-800 text-center mb-8">Mis Pedidos</h1>

                <div className="flex flex-col gap-6">

                    {/*botón mi credito
                    justify end empuja el elemento hacia la derecha, va en el padre
                    transition colors le agrega una animación al pasar por encima, hover, cambio de color*/}
                    {cliente && cliente.cuentaCorrienteHabilitada && (
                        <div className="flex justify-end mt-8">
                            <Link to="/mi-credito"
                                className=" items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
                                Ver mi crédito
                            </Link>
                        </div>
                    )}

                    {/*si el cliente todavia no ha comprado nada*/}
                    {!cargando && pedidos.length === 0 && (
                        <p className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-600">Todavía no tienes pedidos.</p>
                    )}

                    {pedidos.map((pedido) => (
                        <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
                            {/*fecha y estado
                            el justify between hace que el primer elemento se pegue a la izquierda y el segundo a la derecha*/}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-stone-500 text-sm">{formatearFecha(pedido.fecha)}</span>
                                {/*rounded full redondea las esquinas del elemento lo maximo posible*/}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${COLORES_ESTADO[pedido.estado]}`}>
                                    {pedido.estado}
                                </span>
                            </div>

                            {/*productos
                            details esconde su contenido y summary es lo que siempre se ve
                            al hacer click en summary se abre, y al hacer click de nuevo se cierra
                            group permite que la flechita sepa si details esta abierto*/}
                            <details className="group">
                                {/*list none le quita el triangulo que el navegador pone por defecto*/}
                                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-amber-700">
                                    Ver productos ({pedido.items.length})
                                    {/*group open rotate 180 da vuelta la flechita cuando details esta abierto*/}
                                    <svg viewBox="0 0 24 24" className="size-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </summary>

                                <div className="mt-4 grid grid-cols-1 gap-4">

                                    {/*items center alinea verticalmente los elementos, para que esten a la misma altura
                                gap 3 genera un espacio horizontal entre la imagen y el texto de nombre producto cantidad y precio*/}
                                    {pedido.items.map((item) => (
                                        <div key={item.codigo} className="flex items-center gap-3 border border-stone-100 rounded-lg p-3">
                                            <img src={sinImagen} alt={item.nombre}
                                                className="w-16 h-16 object-cover rounded-lg border border-stone-100" />
                                            <div className="flex flex-col">
                                                <p className="font-semibold text-stone-800 text-sm">{item.nombre}</p>
                                                <p className="text-stone-500 text-xs">Cantidad: {item.cantidad}</p>
                                                <p className="text-amber-700 font-bold text-sm mt-1">{formatoPrecio(item.precioUnitario)}</p>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </details>

                            {/*total de la compra
                            border t es borde superior, separa el total de los productos
                            justify between deja "Total" a la izquierda y el monto a la derecha*/}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
                                <span className="text-sm font-semibold text-stone-600">Total</span>
                                <span className="text-lg font-bold text-stone-800">{formatoPrecio(pedido.total)}</span>
                            </div>
                        </div>
                    ))}

                </div>
            </section>
        </main>
    );
}
