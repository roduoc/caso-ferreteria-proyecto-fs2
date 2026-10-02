import { Link, useSearchParams } from 'react-router-dom';

export default function CompraExitosa() {
  const [parametros] = useSearchParams();
  const pedido = parametros.get('pedido');

  return (
    <main className="page-shell flex flex-1 items-center justify-center py-14">
      <section className="w-full max-w-xl rounded-xl border border-emerald-200 bg-white p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700" aria-hidden="true">✓</div>
        <h1 className="mt-5 text-3xl font-bold">Compra realizada</h1>
        <p className="mt-3 text-stone-600">Tu pedido #{pedido} fue registrado correctamente.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="add-button" to="/mis-pedidos">Ver mis pedidos</Link>
          <Link className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-bold" to="/productos">Seguir comprando</Link>
        </div>
      </section>
    </main>
  );
}
