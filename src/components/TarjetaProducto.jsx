import { Link } from 'react-router-dom';
import sinImagen from '../assets/sin-imagen.svg';

function formatoPrecio(precio) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(precio);
}

export default function TarjetaProducto({ producto }) {
  return (
    <article className="product-card flex h-full flex-col">
      <div className="relative border-b border-stone-200 bg-stone-50">
        <img
          className="h-44 w-full object-contain p-5"
          src={sinImagen}
          alt={`Sin imagen disponible para ${producto.nombre}`}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white px-2 py-1 text-xs font-bold text-stone-600 shadow-sm">
          {producto.codigo}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">{producto.categoria}</p>
        <h3 className="mt-2 font-bold leading-5">{producto.nombre}</h3>
        <p className="mt-2 text-sm text-stone-500">{producto.marca} · {producto.unidad}</p>
        <p className={`mt-2 text-xs font-semibold ${producto.stock > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          {producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Sin stock'}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <strong className="text-lg">{formatoPrecio(producto.precio)}</strong>
          <Link className="add-button" to={`/producto/${producto.codigo}`}>Ver producto</Link>
        </div>
      </div>
    </article>
  );
}
