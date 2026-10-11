import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { obtenerDetalleCarrito } from '../services/carritoService';
import { obtenerCliente } from '../services/clienteService';
import { crearPedido } from '../services/pedidoService';
import { obtenerSesion } from '../services/usuarioService';

function formatoPrecio(precio) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(precio);
}

export default function Pago() {
  const location = useLocation();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const entrega = location.state;
  const [items, setItems] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [medioPago, setMedioPago] = useState('contado');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    Promise.all([obtenerDetalleCarrito(), obtenerCliente(sesion.id)]).then(([detalle, datosCliente]) => {
      setItems(detalle);
      setCliente(datosCliente);
    });
  }, [sesion.id]);

  if (!entrega?.modalidad) return <Navigate to="/envios" replace />;

  const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
  const costoEnvio = entrega.modalidad === 'despacho' ? 3990 : 0;

  async function pagar() {
    try {
      setProcesando(true);
      const pedido = await crearPedido(sesion.id, entrega, medioPago);
      navigate(`/compra-exitosa?pedido=${pedido.id}`, { replace: true });
    } catch (error) {
      navigate('/compra-fallida', { replace: true, state: { mensaje: error.message } });
    }
  }

  if (items.length === 0 && cliente) return <Navigate to="/carrito" replace />;

  return (
    <main className="flex-1">
      <section className="border-b border-amber-200 bg-amber-50">
        <div className="page-shell py-9 sm:py-12">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-700">Paso 2 de 2</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Pago</h1>
          <p className="mt-3 text-stone-600">Selecciona cómo pagarás el pedido.</p>
        </div>
      </section>

      <section className="page-shell grid gap-7 py-10 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-bold">Medio de pago</h2>
          <div className="mt-5 space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 p-4 has-[:checked]:border-amber-600 has-[:checked]:bg-amber-50">
              <input className="size-4 accent-amber-600" type="radio" name="pago" value="contado" checked={medioPago === 'contado'} onChange={(e) => setMedioPago(e.target.value)} />
              <span><strong className="block">Pago al contado</strong><small className="text-stone-500">Tarjeta de débito, crédito o transferencia</small></span>
            </label>

            {cliente?.cuentaCorrienteHabilitada && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 p-4 has-[:checked]:border-amber-600 has-[:checked]:bg-amber-50">
                <input className="size-4 accent-amber-600" type="radio" name="pago" value="cuenta_corriente" checked={medioPago === 'cuenta_corriente'} onChange={(e) => setMedioPago(e.target.value)} />
                <span><strong className="block">Pagar con crédito de la ferretería</strong><small className="text-stone-500">El total del pedido, incluido el despacho, se sumará a tu monto adeudado.</small></span>
              </label>
            )}
          </div>

          <div className="mt-7 rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
            <strong className="block text-stone-900">Entrega seleccionada</strong>
            {entrega.modalidad === 'retiro'
              ? 'Retiro en tienda Los Maestros'
              : `Despacho a ${entrega.direccion}, ${entrega.comuna}`}
          </div>
        </div>

        <aside className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-bold">Total del pedido</h2>
          <div className="mt-5 space-y-3 border-b border-stone-200 pb-4 text-sm">
            <p className="flex justify-between"><span>Productos</span><strong>{formatoPrecio(subtotal)}</strong></p>
            <p className="flex justify-between"><span>Entrega</span><strong>{formatoPrecio(costoEnvio)}</strong></p>
          </div>
          <p className="flex justify-between pt-4 text-lg"><strong>Total</strong><strong>{formatoPrecio(subtotal + costoEnvio)}</strong></p>
          <button className="mt-6 w-full rounded-lg bg-amber-500 px-5 py-3 font-bold hover:bg-amber-600 disabled:cursor-wait disabled:opacity-60" type="button" disabled={procesando || items.length === 0} onClick={pagar}>
            {procesando ? 'Procesando...' : medioPago === 'cuenta_corriente' ? 'Confirmar compra a crédito' : 'Confirmar pago'}
          </button>
          <Link className="mt-3 block text-center text-sm font-semibold text-amber-700" to="/envios">Volver a entrega</Link>
        </aside>
      </section>
    </main>
  );
}