import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import sinImagen from '../assets/sin-imagen.svg';
import {
  actualizarCantidad,
  eliminarDelCarrito,
  obtenerDetalleCarrito,
  vaciarCarrito,
} from '../services/carritoService';

function formatoPrecio(precio) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(precio);
}

export default function Carrito() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  async function cargarCarrito() {
    const detalle = await obtenerDetalleCarrito();
    setItems(detalle);
    setCargando(false);
  }

  useEffect(() => {
    obtenerDetalleCarrito().then((detalle) => {
      setItems(detalle);
      setCargando(false);
    });
  }, []);

  async function cambiarCantidad(item, cambio) {
    try {
      setMensaje('');
      await actualizarCantidad(item.codigo, item.cantidad + cambio);
      await cargarCarrito();
    } catch (error) {
      setMensaje(error.message);
    }
  }

  async function eliminar(codigo) {
    await eliminarDelCarrito(codigo);
    await cargarCarrito();
  }

  async function vaciar() {
    await vaciarCarrito();
    await cargarCarrito();
  }

  const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
  const cantidadProductos = items.reduce((total, item) => total + item.cantidad, 0);

  return (
    <main className="flex-1">
      <section className="border-b border-amber-200 bg-amber-50">
        <div className="page-shell py-9 sm:py-12">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-700">Tu compra</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Carrito de compras</h1>
          <p className="mt-3 text-stone-600">Revisa los productos y cantidades antes de continuar.</p>
        </div>
      </section>

      <section className="page-shell py-10">
        {cargando && <p className="text-stone-600">Cargando carrito...</p>}

        {!cargando && items.length === 0 && (
          <div className="rounded-xl border border-stone-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-amber-100 text-2xl" aria-hidden="true">🛒</div>
            <h2 className="mt-5 text-xl font-bold">Tu carrito está vacío</h2>
            <p className="mt-2 text-stone-600">Agrega productos del catálogo para comenzar tu compra.</p>
            <Link className="add-button mt-6 inline-block" to="/productos">Ver productos</Link>
          </div>
        )}

        {!cargando && items.length > 0 && (
          <div className="grid items-start gap-7 lg:grid-cols-[1fr_22rem]">
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-sm text-stone-600">{cantidadProductos} productos en el carrito</p>
                <button className="text-sm font-semibold text-red-700 hover:underline" type="button" onClick={vaciar}>
                  Vaciar carrito
                </button>
              </div>

              {mensaje && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{mensaje}</p>}

              <div className="space-y-4">
                {items.map((item) => (
                  <article key={item.codigo} className="grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
                    <img className="h-28 w-full rounded-lg bg-stone-50 object-contain p-3" src={sinImagen} alt={`${item.nombre} sin imagen disponible`} />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">{item.codigo}</p>
                      <h2 className="mt-1 font-bold">{item.nombre}</h2>
                      <p className="mt-1 text-sm text-stone-500">{item.marca} · {item.unidad}</p>
                      <button className="mt-3 text-sm font-semibold text-red-700 hover:underline" type="button" onClick={() => eliminar(item.codigo)}>
                        Eliminar
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:block sm:text-right">
                      <div className="flex items-center gap-2" aria-label={`Cantidad de ${item.nombre}`}>
                        <button className="quantity-button" type="button" disabled={item.cantidad === 1} onClick={() => cambiarCantidad(item, -1)} aria-label="Disminuir cantidad">−</button>
                        <span className="min-w-8 text-center font-bold">{item.cantidad}</span>
                        <button className="quantity-button" type="button" disabled={item.cantidad >= item.stock} onClick={() => cambiarCantidad(item, 1)} aria-label="Aumentar cantidad">+</button>
                      </div>
                      <strong className="sm:mt-4 sm:block">{formatoPrecio(item.subtotal)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-xl border border-stone-200 bg-white p-6 lg:sticky lg:top-5">
              <h2 className="text-xl font-bold">Resumen</h2>
              <div className="mt-5 flex justify-between border-b border-stone-200 pb-4 text-sm">
                <span>Subtotal</span>
                <strong>{formatoPrecio(subtotal)}</strong>
              </div>
              <div className="flex justify-between py-4 text-sm text-stone-600">
                <span>Envío</span>
                <span>Se calcula después</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-4 text-lg">
                <strong>Total</strong>
                <strong>{formatoPrecio(subtotal)}</strong>
              </div>
              <Link className="mt-6 block rounded-lg bg-amber-500 px-5 py-3 text-center font-bold text-stone-900 hover:bg-amber-600" to="/envios">
                Continuar compra
              </Link>
              <Link className="mt-3 block text-center text-sm font-semibold text-amber-700" to="/productos">
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
