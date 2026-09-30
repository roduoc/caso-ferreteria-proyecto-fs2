import { useEffect, useState } from 'react';
//usesearchparams lee lo que va despues del ? en la url, por ejemplo ?buscar=cemento
import { Link, useSearchParams } from 'react-router-dom';
import sinImagen from '../assets/sin-imagen.svg';
import { listarProductos } from '../services/productoService';
import { agregarAlCarrito } from '../services/carritoService';

function formatoPrecio(precio) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(precio);
}

export default function Productos() {
    const [parametros] = useSearchParams();

    const [productos, setProductos] = useState([]);
    //si se llega con ?buscar= desde el buscador del navbar, el input parte con ese texto
    const [busqueda, setBusqueda] = useState(parametros.get('buscar') || '');
    //por default se muestran todas las categoriasa
    const [categoria, setCategoria] = useState('Todas');
    const [orden, setOrden] = useState('original');
    const [notificacion, setNotificacion] = useState(null);

    //pide los productos al cargar la pagina por primera vez
    useEffect(() => {
        listarProductos().then(setProductos);
    }, []);

    useEffect(() => {
        if (!notificacion) return;
        const temporizador = setTimeout(() => setNotificacion(null), 1800);
        //si llega otra notificacion antes, se cancela el temporizador anterior
        return () => clearTimeout(temporizador);
    }, [notificacion]);

    //new Set deja cada categoria una sola vez
    //y los ... la convierten de nuevo en arreglo para poder usar map
    const categorias = [...new Set(productos.map((producto) => producto.categoria))];

    function obtenerProductosFiltrados() {
        const texto = busqueda.trim().toLowerCase();

        //en cada vuelta del filter se evalua si el producto cumple con las condiciones
        //coicide busqueda y coincide categoria, eso retorna true o false
        const resultados = productos.filter((producto) => {
            const coincideBusqueda = producto.nombre.toLowerCase().includes(texto)
                || producto.codigo.toLowerCase().includes(texto)
                || producto.marca.toLowerCase().includes(texto);
            const coincideCategoria = categoria === 'Todas' || producto.categoria === categoria;
            return coincideBusqueda && coincideCategoria;
        });

        if (orden === 'precio-menor') resultados.sort((a, b) => a.precio - b.precio);
        if (orden === 'precio-mayor') resultados.sort((a, b) => b.precio - a.precio);
        if (orden === 'nombre') resultados.sort((a, b) => a.nombre.localeCompare(b.nombre));

        return resultados;
    }

    function mostrarMensaje(mensaje, tipo) {
        setNotificacion({ texto: mensaje, tipo });
    }

    async function anadir(codigo) {
        try {
            await agregarAlCarrito(codigo);
            mostrarMensaje('Producto añadido al carrito.', 'ok');
        } catch (e) {
            mostrarMensaje(e.message, 'error');
        }
    }
    
    const productosFiltrados = obtenerProductosFiltrados();
    const textoProducto = productosFiltrados.length === 1 ? 'producto encontrado' : 'productos encontrados';

    return (
        <>
            <main className="flex-1">
                <section className="border-b border-amber-200 bg-amber-50">
                    <div className="page-shell py-9 sm:py-12">
                        <p className="text-sm font-bold uppercase tracking-wider text-amber-700">Catálogo</p>
                        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Productos disponibles</h1>
                        <p className="mt-3 max-w-2xl leading-7 text-stone-600">Busca materiales y herramientas, revisa su stock y agrega lo que necesites al carrito.</p>
                    </div>
                </section>

                <section className="page-shell py-8 sm:py-10" aria-label="Filtros del catálogo">
                    <div className="grid gap-4 rounded-xl border border-stone-200 bg-white p-5 md:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold" htmlFor="search-input">Buscar producto</label>
                            <input id="search-input" className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" type="search" placeholder="Nombre, código o marca"
                                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold" htmlFor="category-select">Categoría</label>
                            <select id="category-select" className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
                                value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                                <option value="Todas">Todas las categorías</option>
                                {categorias.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold" htmlFor="order-select">Ordenar por</label>
                            <select id="order-select" className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
                                value={orden} onChange={(e) => setOrden(e.target.value)}>
                                <option value="original">Orden del catálogo</option>
                                <option value="nombre">Nombre</option>
                                <option value="precio-menor">Menor precio</option>
                                <option value="precio-mayor">Mayor precio</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="page-shell pb-14" aria-labelledby="products-title">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <h2 id="products-title" className="text-2xl font-bold">Todos los productos</h2>
                        {productos.length > 0 && (
                            <p className="text-sm text-stone-500">{productosFiltrados.length} {textoProducto}</p>
                        )}
                    </div>

                    {productos.length > 0 && productosFiltrados.length === 0 && (
                        <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">No encontramos productos con esos filtros.</p>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {productosFiltrados.map((producto) => (
                            <article key={producto.codigo} className="product-card flex flex-col">
                                <div className="relative bg-stone-100">
                                    <Link to={`/producto/${producto.codigo}`} aria-label={`Ver detalle de ${producto.nombre}`}>
                                        <img className="h-48 w-full object-contain p-7" src={sinImagen} alt={`${producto.nombre} sin imagen disponible`} />
                                    </Link>
                                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600">{producto.codigo}</span>
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">{producto.categoria} · {producto.subcategoria}</p>
                                    <h2 className="mt-2 text-lg font-bold leading-snug"><Link className="hover:text-amber-700" to={`/producto/${producto.codigo}`}>{producto.nombre}</Link></h2>
                                    <p className="mt-2 text-sm text-stone-500">Marca {producto.marca} · {producto.unidad}</p>
                                    <p className="mt-3 text-sm font-semibold text-green-700">Stock disponible: {producto.stock}</p>
                                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                                        <strong className="text-xl">{formatoPrecio(producto.precio)}</strong>
                                        <button className="add-button" type="button" onClick={() => anadir(producto.codigo)}>Añadir</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            {notificacion && (
                <p role="status" aria-live="polite"
                    className={notificacion.tipo === 'error'
                        ? 'fixed bottom-5 right-5 rounded-lg bg-red-700 px-5 py-3 text-sm font-semibold text-white'
                        : 'fixed bottom-5 right-5 rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white'}>
                    {notificacion.texto}
                </p>
            )}
        </>
    );
}
