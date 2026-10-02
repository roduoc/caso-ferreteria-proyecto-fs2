import { Link, useLocation } from 'react-router-dom';

export default function CompraFallida() {
  const location = useLocation();

  return (
    <main className="page-shell flex flex-1 items-center justify-center py-14">
      <section className="w-full max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-100 text-3xl text-red-700" aria-hidden="true">!</div>
        <h1 className="mt-5 text-3xl font-bold">No pudimos completar la compra</h1>
        <p className="mt-3 text-stone-600">{location.state?.mensaje || 'Ocurrió un problema al procesar el pedido.'}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="add-button" to="/envios">Intentar nuevamente</Link>
          <Link className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-bold" to="/carrito">Volver al carrito</Link>
        </div>
      </section>
    </main>
  );
}
