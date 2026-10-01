import { useEffect, useState } from 'react';
//useparams lee las partes de la ruta que empiezan con :, aqui el :codigo de /producto/:codigo
import { Link, useParams } from 'react-router-dom';
import sinImagen from '../assets/sin-imagen.svg';
import { obtenerProducto } from '../services/productoService';

function formatoPrecio(precio) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(precio);
}

export default function DetalleProducto() {
    const { codigo } = useParams();

    const [producto, setProducto] = useState(null);
    const [noEncontrado, setNoEncontrado] = useState(false);
    const [cantidad, setCantidad] = useState(1);

    useEffect(() => {
        obtenerProducto(codigo)
            .then((productoEncontrado) => {
                setProducto(productoEncontrado);
                setNoEncontrado(false);
                setCantidad(1);
            })
            .catch(() => setNoEncontrado(true));
    }, [codigo]);

    if (noEncontrado) {
        return (
            <main className="flex-1">
                <section className="page-shell py-16 text-center">
                    <h1 className="text-3xl font-bold">Producto no encontrado</h1>
                    <p className="mt-3 text-stone-600">El producto solicitado no existe en el catálogo.</p>
                    <Link className="add-button mt-6 inline-block" to="/productos">Volver al catálogo</Link>
                </section>
            </main>
        );
    }

    //mientras el service responde todavia no hay producto, no se jmuestra nada
    if (!producto) {
        return <main className="flex-1"></main>;
    }

    function disminuirCantidad() {
        if (Number(cantidad) > 1) setCantidad(Number(cantidad) - 1);
    }

    function aumentarCantidad() {
        if (Number(cantidad) < producto.stock) setCantidad(Number(cantidad) + 1);
    }

    function corregirCantidad() {
        if (Number(cantidad) < 1) setCantidad(1);
        if (Number(cantidad) > producto.stock) setCantidad(producto.stock);
    }

    return (
        <main className="flex-1">
            <title>{`${producto.nombre} | Ferretería Los Maestros`}</title>

            <section className="page-shell py-8 sm:py-10">
                <nav className="mb-6 text-sm text-stone-500" aria-label="Migas de pan">
                    <Link className="hover:text-amber-700" to="/">Inicio</Link>
                    <span aria-hidden="true"> / </span>
                    <Link className="hover:text-amber-700" to="/productos">Productos</Link>
                    <span aria-hidden="true"> / </span>
                    <span className="font-semibold text-stone-700">{producto.codigo}</span>
                </nav>

                <div className="grid gap-8 rounded-xl border border-stone-200 bg-white p-5 sm:p-8 lg:grid-cols-2 lg:gap-12">
                    <div className="flex min-h-80 items-center justify-center rounded-xl bg-stone-100 p-8 sm:min-h-112">
                        <img className="max-h-80 w-full object-contain" src={sinImagen} alt={`${producto.nombre} sin imagen disponible`} />
                    </div>

                    <div className="flex flex-col justify-center">
                        <p className="text-sm font-bold uppercase tracking-wider text-amber-700">{producto.categoria} · {producto.subcategoria}</p>
                        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{producto.nombre}</h1>
                        <p className="mt-4 leading-7 text-stone-600">Producto disponible en Ferretería Los Maestros. Consulta su información y selecciona la cantidad que necesitas.</p>

                        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm">
                            <div><dt className="text-stone-500">Marca</dt><dd className="mt-1 font-semibold">{producto.marca}</dd></div>
                            <div><dt className="text-stone-500">Unidad de venta</dt><dd className="mt-1 font-semibold">{producto.unidad}</dd></div>
                            <div><dt className="text-stone-500">Disponibilidad</dt><dd className="mt-1 font-semibold text-green-700">En stock</dd></div>
                            <div><dt className="text-stone-500">Stock disponible</dt><dd className="mt-1 font-semibold">{producto.stock} {producto.stock === 1 ? 'unidad' : 'unidades'}</dd></div>
                        </dl>

                        <strong className="mt-7 text-3xl">{formatoPrecio(producto.precio)}</strong>

                        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold" htmlFor="quantity-input">Cantidad</label>
                                <div className="flex items-center gap-2">
                                    <button className="quantity-button" type="button" aria-label="Disminuir cantidad" onClick={disminuirCantidad}>−</button>
                                    <input id="quantity-input" className="h-10 w-16 rounded-lg border border-stone-300 bg-white text-center font-semibold outline-none focus:border-amber-500" type="number" min="1" max={producto.stock}
                                        value={cantidad} onChange={(e) => setCantidad(e.target.value)} onBlur={corregirCantidad} />
                                    <button className="quantity-button" type="button" aria-label="Aumentar cantidad" onClick={aumentarCantidad}>+</button>
                                </div>
                            </div>
                            <button className="add-button min-h-10 flex-1" type="button">Añadir al carrito</button>
                        </div>
                        <p className="mt-4 text-xs leading-5 text-stone-500">El producto se reserva solamente después de confirmar el pedido.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
