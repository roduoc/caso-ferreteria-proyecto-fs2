//use state le da memoria a la pagina
import { useState } from 'react';

//los escribimos aca para recorrerlos mas tarde y no escribirlos dos veces
const navLinks = [
    { href: './index.html', label: 'Inicio' },
    { href: './productos.html', label: 'Productos' },
    { href: '#nosotros', label: 'Nosotros' },
    { href: './vista_blog.html', label: 'Blog' },
    { href: './vista_contacto.html', label: 'Contacto' },
];

function Header() {
    //variable menu abierto, empieza en false
    //funcion setmenuabierto para cambiarla
    const [menuAbierto, setMenuAbierto] = useState(false);

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
                <a href="./index.html" className="flex items-center gap-3" aria-label="Ir al inicio">
                    <img className="size-12" src="./assets/images/logo-los-maestros.svg" alt="" />
                    <span>
                        <strong className="block text-xl leading-tight tracking-tight">Los Maestros</strong>
                        <span className="hidden text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-700 sm:block">
                            Ferretería
                        </span>
                    </span>
                </a>

                {/* Inicio, productos, nosotros, blog, contacto*/}
                <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold lg:flex" aria-label="Navegación principal">
                    {/*cada href lleva al link.href y su texto es el link.label*/}
                    {navLinks.map((link) => (
                        <a key={link.href} className="nav-link" href={link.href}>
                            {link.label}
                        </a>
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

                {/*Ingresar*/}
                <a
                    id="cuenta"
                    className="ml-auto hidden rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold sm:block lg:ml-0"
                    href="./vista_login.html">
                    Ingresar
                </a>
                {/*Crear cuenta*/}
                <a
                    className="hidden rounded-lg bg-amber-400 px-6 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-500 md:block whitespace-nowrap"
                    href="./vista_registrarse.html" >
                    Crear cuenta
                </a>

                {/*Carrito*/}
                <a
                    id="cart-button"
                    className="relative flex items-center gap-2 rounded-lg border border-stone-300 p-2.5 text-sm font-semibold"
                    href="./carrito.html"
                    aria-label="Carrito con 0 productos">

                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />
                        <circle cx="10" cy="20" r="1" />
                        <circle cx="18" cy="20" r="1" />
                    </svg>
                    <span className="hidden sm:inline">Carrito</span>
                    <span
                        id="cart-count"
                        className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-white bg-amber-400 text-xs font-bold text-stone-900">
                        0
                    </span>
                </a>
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
                    <a key={link.href} className="mobile-link" href={link.href}>
                        {link.label}
                    </a>
                ))}
                <a className="mobile-link" href="./vista_login.html">Ingresar</a>
                <a className="mobile-link" href="./vista_registrarse.html">Crear cuenta</a>
            </nav>
        </header>
    );
}

export default Header;
