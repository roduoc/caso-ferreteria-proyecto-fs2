import { useState } from 'react';
//navlink sabe si su ruta es la pagina en la que estas
//sirve para saber si un link esta activo con isActive
//para darle un estilo distinto a ese link
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import NavbarAdmin from '../components/NavbarAdmin';
import FooterAdmin from '../components/FooterAdmin';
import { obtenerSesion } from '../services/usuarioService';

export default function LayoutPanel({ links, subtitulo, rol }) {
    const [panelAbierto, setPanelAbierto] = useState(false);

    const sesion = obtenerSesion();
    if (!sesion || sesion.rol !== rol) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
        <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900">
            <NavbarAdmin />

            <main>
                {/*flex-col modo columna en celulares, filas en pantallas grandes */}
                <div className="flex flex-col lg:flex-row min-h-screen">

                    {/*m 3 margin 3 espacio en los 4 lados arriba abajo derecha izquierda */}
                    <button
                        type="button"
                        className="simple-icon-button m-3 lg:hidden"
                        onClick={() => setPanelAbierto(!panelAbierto)}
                    >
                        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/*en celulares ocupa todo el ancho de la pantalla con w full
                    en pantallas grandes ocupa solo 2 64 */}
                    <aside
                        id="panel-lateral"
                        className={`${panelAbierto ? 'flex' : 'hidden'} w-full flex-col bg-stone-900 lg:flex lg:w-64`}
                    >
                        <div className="px-5 py-6 border-b border-stone-800">
                            <p className="text-stone-50 font-semibold text-lg leading-tight">Ferretería<br />Los Maestros</p>
                            <p className="text-stone-500 text-xs mt-1">{subtitulo}</p>
                        </div>

                        {/* space y 1 agrega espacio vertical entre elementos hijos */}
                        <nav className="px-3 py-4 space-y-1">
                            {links.map((link) => (
                                <NavLink
                                    key={link.ruta}
                                    to={link.ruta}
                                    onClick={() => setPanelAbierto(false)}
                                    // link activo: solo cambia el color del texto
                                    className={({ isActive }) =>
                                        isActive
                                            ? 'flex rounded-lg px-4 py-[0.65rem] text-sm font-semibold text-amber-400'
                                            : 'flex rounded-lg px-4 py-[0.65rem] text-sm text-stone-300 transition-colors hover:bg-stone-800 hover:text-stone-50'
                                    }
                                >
                                    {link.texto}
                                </NavLink>
                            ))}
                        </nav>
                    </aside>

                    <Outlet />

                </div>
            </main>

            <FooterAdmin />

        </div>
            
        </>
    );
}