import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import heroFerreteria from '../assets/hero-ferreteria.svg';
import sinImagen from '../assets/sin-imagen.svg';
import TarjetaProducto from '../components/TarjetaProducto';
import { listarProductos } from '../services/productoService';

const categorias = [
  { nombre: 'Herramientas', icono: '🔨' },
  { nombre: 'Mat. Construcción', texto: 'Construcción', icono: '🧱' },
  { nombre: 'Electricidad', icono: '💡' },
  { nombre: 'Pinturas', icono: '🖌️' },
];

const publicaciones = [
  {
    id: 'herramientas',
    etiqueta: 'Consejos',
    titulo: 'Cómo elegir una herramienta para el hogar',
    resumen: 'Revisa algunos aspectos básicos antes de comprar tu primera herramienta.',
  },
  {
    id: 'reparacion',
    etiqueta: 'Construcción',
    titulo: 'Materiales básicos para una reparación',
    resumen: 'Una lista breve para preparar arreglos pequeños sin comprar de más.',
  },
];

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vistaActiva = true;
    document.title = 'Ferretería Los Maestros';

    async function cargarProductos() {
      try {
        const respuesta = await listarProductos();
        if (vistaActiva) setProductos(respuesta.slice(0, 4));
      } catch {
        if (vistaActiva) setError('No se pudieron cargar los productos destacados.');
      } finally {
        if (vistaActiva) setCargando(false);
      }
    }

    cargarProductos();
    return () => {
      vistaActiva = false;
    };
  }, []);

  return (
    <main>
      <section id="nosotros" className="page-shell py-8 sm:py-12" aria-labelledby="hero-title">
        <div className="grid overflow-hidden rounded-xl border border-amber-200 bg-amber-50 lg:grid-cols-2">
          <div className="flex flex-col items-start justify-center p-7 sm:p-10">
            <p className="text-sm font-bold uppercase tracking-wider text-amber-700">Ferretería en La Serena</p>
            <h1 id="hero-title" className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              Todo para tu próximo proyecto
            </h1>
            <p className="mt-5 max-w-xl leading-7 text-stone-600">
              Encuentra materiales de construcción, herramientas y artículos de ferretería. Puedes revisar nuestros productos sin iniciar sesión.
            </p>
            <Link className="mt-7 rounded-lg bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-amber-700" to="/productos">
              Ver productos
            </Link>
          </div>
          <img
            className="h-72 w-full object-cover lg:h-full"
            src={heroFerreteria}
            alt="Estanterías con herramientas y materiales de ferretería"
          />
        </div>
      </section>

      <section className="page-shell pb-10" aria-label="Beneficios de la ferretería">
        <div className="trust-strip">
          <div className="trust-item">
            <span className="trust-icon" aria-hidden="true">✓</span>
            <div><strong>Stock disponible</strong><p>Consulta antes de comprar</p></div>
          </div>
          <div className="trust-item">
            <span className="trust-icon" aria-hidden="true">⌂</span>
            <div><strong>Retiro en tienda</strong><p>En nuestra sucursal de La Serena</p></div>
          </div>
          <div className="trust-item">
            <span className="trust-icon" aria-hidden="true">?</span>
            <div><strong>Atención cercana</strong><p>Te ayudamos con tus materiales</p></div>
          </div>
        </div>
      </section>

      <section className="page-shell pb-12" aria-labelledby="categories-title">
        <h2 id="categories-title" className="section-title">Categorías</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categorias.map((categoria) => (
            <Link
              key={categoria.nombre}
              className="category-box"
              to={`/productos?categoria=${encodeURIComponent(categoria.nombre)}`}
            >
              <span aria-hidden="true">{categoria.icono}</span>
              {categoria.texto || categoria.nombre}
            </Link>
          ))}
        </div>
      </section>

      <section id="productos" className="border-y border-stone-300 bg-white py-12" aria-labelledby="products-title">
        <div className="page-shell">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="products-title" className="section-title">Productos destacados</h2>
              <p className="mt-2 text-stone-600">Algunos productos disponibles en nuestra tienda.</p>
            </div>
            <Link className="hidden text-sm font-semibold text-amber-700 sm:block" to="/productos">Ver todos</Link>
          </div>

          {cargando && <p className="mt-7 text-stone-600">Cargando productos...</p>}
          {error && <p className="mt-7 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
          {!cargando && !error && (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {productos.map((producto) => (
                <TarjetaProducto key={producto.codigo} producto={producto} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="blog" className="page-shell py-12" aria-labelledby="blog-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="blog-title" className="section-title">Blog</h2>
            <p className="mt-2 text-stone-600">Consejos sencillos para tus proyectos.</p>
          </div>
          <Link className="hidden text-sm font-semibold text-amber-700 sm:block" to="/vista-blog">Ver más</Link>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {publicaciones.map((publicacion) => (
            <article key={publicacion.id} className="blog-card">
              <img className="h-48 w-full object-contain p-6 sm:w-56" src={sinImagen} alt="Publicación sin imagen disponible" />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">{publicacion.etiqueta}</p>
                <h3 className="mt-2 text-xl font-bold">{publicacion.titulo}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{publicacion.resumen}</p>
                <Link className="mt-4 inline-block text-sm font-semibold text-amber-700" to={`/vista-blog?articulo=${publicacion.id}`}>
                  Leer publicación
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
