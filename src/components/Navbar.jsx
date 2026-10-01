//use state le da memoria a la pagina
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logo-los-maestros.svg';
import { obtenerSesion, cerrarSesion } from '../services/usuarioService';
import { obtenerCarrito } from '../services/carritoService';

//los escribimos aca para recorrerlos mas tarde y no escribirlos dos veces

const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/productos', label: 'Productos' },
    { href: '/sobre-nosotros', label: 'Nosotros' },
    { href: '/vista-blog', label: 'Blog' },
    { href: '/sobre-nosotros', label: 'Contacto' },
];

function Navbar() {

    //use no memo excluye a este componente de la memorizacion automatica
    //en cada render se evaluan de nuevo todas las expresiones
    //se usa porque obtener sesion no recibe props ni estados, y eso significa
    //que nunca cambia para el compiler, entonces la ejecuta una sola vez y luego la lee desde ahí

    //obtener sesion lee localstorage, y localstorage esta fuera de react
    //cuando se inicia sesion localstorage cambia pero el compiler no se entera
    //y sigue leyendo el primer obtener sesion

    //la sesion ya se habia actualizado al iniciar sesion
    //pero al re renderizar con use no memo se vuelve a leer obtener session

    //al cambiar de pagina se re renderiza layout y sus hijos
    //que es el outlet, o sea, la pagina actual se re renderiza tambien

    //cuando se cambia de outlet cambia el tipo de componente y se redibuja
    //pero el navbar no cambia entre vistas privadas y publicas de clientes
    'use no memo';

    //variable menu abierto, empieza en false
    //funcion setmenuabierto para cambiarla
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [cantidadCarrito, setCantidadCarrito] = useState(0);

    const sesion = obtenerSesion();

    useEffect(() => {
        async function actualizarContador() {
            const carrito = await obtenerCarrito();
            setCantidadCarrito(carrito.reduce((total, item) => total + item.cantidad, 0));
        }

        actualizarContador();
        window.addEventListener('carritoActualizado', actualizarContador);
        window.addEventListener('storage', actualizarContador);

        return () => {
            window.removeEventListener('carritoActualizado', actualizarContador);
            window.removeEventListener('storage', actualizarContador);
        };
    }, []);

    //togglemenu invierte el valor actual, si estaba en true pasa a false y al reves
    //
    function toggleMenu() {
        setMenuAbierto((abierto) => !abierto);
    }

    //esta fuerza el menu a cerrarse no importa el estado actual
    //sirve para cuando tocas un link dentro del menu movil, para que no quede abierto
    function cerrarMenu() {
        setMenuAbierto(false);
    }

    return (
        <header className="border-b border-stone-300 bg-white">
            <div className="page-shell flex h-20 items-center gap-4">
                {/* Boton hamburguesa*/}
                <button
                    id="menu-button"
                    className="simple-icon-button lg:hidden"
                    type="button"
                    onClick={toggleMenu}>

                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo mas nombre*/}
                <Link to="/" className="flex items-center gap-3" aria-label="Ir al inicio">
                    <img className="size-12" src={logo} alt="" />
                    <span>
                        <strong className="block text-xl leading-tight tracking-tight">Los Maestros</strong>
                        <span className="hidden text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-700 sm:block">
                            Ferretería
                        </span>
                    </span>
                </Link>

                {/* Inicio, productos, nosotros, blog, contacto*/}
                <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold lg:flex" aria-label="Navegación principal">
                    {/*cada href lleva al link.href y su texto es el link.label*/}
                    {navLinks.map((link) => (
                        <NavLink key={link.label} className="nav-link" to={link.href}>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Barra de busqueda*/}
                {/* */}
                <form className="relative hidden xl:block" action="./productos.html" method="get">
                    <span className="sr-only">Buscar productos</span>
                    <input
                        name="buscar"
                        className="w-52 rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 pr-10 text-sm outline-none focus:border-amber-500"
                        type="search"
                        placeholder="Buscar productos..."
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-700" type="submit" aria-label="Buscar">
                        ⌕
                    </button>
                </form>

                {!sesion ? (
                    <>
                        {/*Ingresar*/}
                        <Link
                            id="cuenta"
                            className="ml-auto hidden rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold sm:block lg:ml-0"
                            to="/login">
                            Ingresar
                        </Link>
                        {/*Crear cuenta*/}
                        <Link
                            className="hidden rounded-lg bg-amber-400 px-6 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-500 md:block whitespace-nowrap"
                            to="/registro">
                            Crear cuenta
                        </Link>
                    </>
                ) : (
                    <>
                        {sesion.rol === 'cliente' && (
                            <Link
                                className="ml-auto hidden rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold sm:block lg:ml-0 whitespace-nowrap"
                                to="/mis-pedidos">
                                Mis pedidos
                            </Link>
                        )}
                        {/*borra la sesion y vuelve al inicio*/}
                        <Link
                            className="ml-auto hidden rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold sm:block lg:ml-0 whitespace-nowrap"
                            to="/"
                            onClick={cerrarSesion}>
                            Cerrar sesión
                        </Link>
                    </>
                )}

                {/*Carrito*/}
                <NavLink
                    id="cart-button"
                    className="relative flex items-center gap-2 rounded-lg border border-stone-300 p-2.5 text-sm font-semibold"
                    to="/carrito"
                    aria-label={`Carrito con ${cantidadCarrito} productos`}>

                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />
                        <circle cx="10" cy="20" r="1" />
                        <circle cx="18" cy="20" r="1" />
                    </svg>
                    <span className="hidden sm:inline">Carrito</span>
                    <span
                        id="cart-count"
                        className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-white bg-amber-400 text-xs font-bold text-stone-900">
                        {cantidadCarrito}
                    </span>
                </NavLink>
            </div>

            {/*El onclick funciona tocando cualquier elemento del nav*/}
            {/*hidden si el menu esta cerrado
            cuando el boton hamburguesa hace toggle el valor de menuabierto cambia
            de false a true, entonces hidden cambia a false y el menu pasa a mostrarse*/}
            <nav
                id="mobile-menu"
                className="page-shell border-t border-stone-200 py-3 lg:hidden"
                hidden={!menuAbierto}
                onClick={cerrarMenu}>

                {navLinks.map((link) => (
                    <NavLink key={link.label} className="mobile-link" to={link.href}>
                        {link.label}
                    </NavLink>
                ))}


                {!sesion ? (
                    <>
                        <Link className="mobile-link" to="/login">Ingresar</Link>
                        <Link className="mobile-link" to="/registro">Crear cuenta</Link>
                    </>
                ) : (
                    <>
                        {sesion.rol === 'cliente' && (
                            <Link className="mobile-link" to="/mis-pedidos">Mis pedidos</Link>
                        )}
                        <Link className="mobile-link" to="/" onClick={cerrarSesion}>Cerrar sesión</Link>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Navbar;
