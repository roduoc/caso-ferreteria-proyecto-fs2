import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerDetalleCarrito } from '../services/carritoService';
import { obtenerCliente } from '../services/clienteService';
import { obtenerSesion } from '../services/usuarioService';

function formatoPrecio(precio) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(precio);
}

export default function Envios() {
  const sesion = obtenerSesion();
  const navigate = useNavigate();
  const [modalidad, setModalidad] = useState('retiro');
  const [comuna, setComuna] = useState('');
  const [direccion, setDireccion] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [carritoVacio, setCarritoVacio] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([obtenerCliente(sesion.id), obtenerDetalleCarrito()]).then(([cliente, items]) => {
      setComuna(cliente.comuna);
      setDireccion(cliente.direccion);
      setSubtotal(items.reduce((total, item) => total + item.subtotal, 0));
      setCarritoVacio(items.length === 0);
      setCargando(false);
    });
  }, [sesion.id]);

  function continuar(evento) {
    evento.preventDefault();
    setError('');

    if (modalidad === 'despacho' && (!comuna.trim() || !direccion.trim())) {
      setError('Ingresa la comuna y la dirección de despacho.');
      return;
    }

    navigate('/pago', {
      state: {
        modalidad,
        comuna: modalidad === 'despacho' ? comuna.trim() : '',
        direccion: modalidad === 'despacho' ? direccion.trim() : '',
      },
    });
  }

  const costoEnvio = modalidad === 'despacho' ? 3990 : 0;

  if (cargando) return <main className="page-shell flex-1 py-12"><p>Cargando datos de entrega...</p></main>;

  if (carritoVacio) {
    return (
      <main className="page-shell flex-1 py-12 text-center">
        <h1 className="text-2xl font-bold">No hay productos para enviar</h1>
        <p className="mt-2 text-stone-600">Primero debes agregar productos al carrito.</p>
        <Link className="add-button mt-6 inline-block" to="/productos">Ver productos</Link>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="border-b border-amber-200 bg-amber-50">
        <div className="page-shell py-9 sm:py-12">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-700">Paso 1 de 2</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Modalidad de entrega</h1>
          <p className="mt-3 text-stone-600">Elige cómo quieres recibir tu compra.</p>
        </div>
      </section>

      <form className="page-shell py-10" onSubmit={continuar} noValidate>
        <div className="grid gap-7 lg:grid-cols-[1fr_22rem]">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white p-5 has-[:checked]:border-amber-600 has-[:checked]:bg-amber-50">
                <input className="size-4 accent-amber-600" type="radio" name="modalidad" value="retiro" checked={modalidad === 'retiro'} onChange={(e) => setModalidad(e.target.value)} />
                <span><strong className="block">Retiro en tienda</strong><small className="text-stone-500">Sin costo adicional</small></span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white p-5 has-[:checked]:border-amber-600 has-[:checked]:bg-amber-50">
                <input className="size-4 accent-amber-600" type="radio" name="modalidad" value="despacho" checked={modalidad === 'despacho'} onChange={(e) => setModalidad(e.target.value)} />
                <span><strong className="block">Despacho a domicilio</strong><small className="text-stone-500">Costo fijo de $3.990</small></span>
              </label>
            </div>

            {modalidad === 'retiro' ? (
              <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="text-lg font-bold">Sucursal Los Maestros</h2>
                <p className="mt-2 text-stone-600">Av. Francisco de Aguirre 100, La Serena.</p>
                <p className="mt-1 text-sm text-stone-500">Lunes a sábado, de 09:00 a 18:00.</p>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
                <h2 className="text-lg font-bold">Dirección de despacho</h2>
                {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold" htmlFor="comuna">Comuna</label>
                    <input id="comuna" className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 outline-none focus:border-amber-500" value={comuna} maxLength="100" onChange={(e) => setComuna(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold" htmlFor="direccion">Dirección</label>
                    <input id="direccion" className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 outline-none focus:border-amber-500" value={direccion} maxLength="150" onChange={(e) => setDireccion(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="text-xl font-bold">Resumen</h2>
            <div className="mt-5 space-y-3 border-b border-stone-200 pb-4 text-sm">
              <p className="flex justify-between"><span>Productos</span><strong>{formatoPrecio(subtotal)}</strong></p>
              <p className="flex justify-between"><span>Entrega</span><strong>{formatoPrecio(costoEnvio)}</strong></p>
            </div>
            <p className="flex justify-between pt-4 text-lg"><strong>Total</strong><strong>{formatoPrecio(subtotal + costoEnvio)}</strong></p>
            <button className="mt-6 w-full rounded-lg bg-amber-500 px-5 py-3 font-bold hover:bg-amber-600" type="submit">Continuar al pago</button>
            <Link className="mt-3 block text-center text-sm font-semibold text-amber-700" to="/carrito">Volver al carrito</Link>
          </aside>
        </div>
      </form>
    </main>
  );
}
