import { useState } from 'react';
//link es el reemplazo de la etiqueta de html <a> para los links
import { Link } from 'react-router-dom';
import logo from '../assets/logo-los-maestros.svg';
import { cerrarSesion } from '../services/usuarioService';

export default function HeaderPanel() {
    const [menuAbierto, setMenuAbierto] = useState(false);

    // le agrega un borde inferior color stone y un fondo blanco al nav
    return (
        <header className="border-b border-stone-300 bg-white">
            {/* page shell limita el ancho del contenido a un determinado ancho que debe ser el mas pequeño
          entre dos medidas de pantalla.
          flex convierte los elementos hijos en flexbox, que los ordena como una fila horizontal
          h-20 le da una altura fija al header
          items center centra verticalmente los elementos */}
            <div className="page-shell flex h-20 items-center gap-4">

                {/* aria controls nos dice que mobile menu esta siendo controlado por menu button. */}
                <button
                    className="simple-icon-button lg:hidden"
                    type="button"
                    onClick={() => setMenuAbierto(!menuAbierto)}
                >
                    {/* boton hamburguesa dibujado */}
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* indica que es un link toda esta seccion */}
                <Link to="/" className="flex items-center gap-3" aria-label="Ir al inicio">
                    <img className="size-12" src={logo} alt="" />
                    <span>
                        {/* block ocupa toda la linea disponible y empuja lo que viene despues a la linea siguiente
                leading tight controla el espacio vertical entre las lineas de texto
                tracking tight controla el espacio entre letras de la misma palabra, con tight quedan un poquito mas juntas */}
                        <strong className="block text-xl leading-tight tracking-tight">Los Maestros</strong>
                        {/* hidden no se muestra en pantallas pequeñas
                text y su tamaño
                fuente negrita
                uppercase mayusculas
                tracking y su tamaño especifica el espacio entre letras de la misma palabra
                sm block que se muestra en pantallas mas grandes que no sean celulares */}
                        <span className="hidden text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-700 sm:block">
                            Ferretería
                        </span>
                    </span>
                </Link>

                {/* boton de ingresar a la cuenta
            sm block que se muestre solo en pantallas grandes */}
                <Link
                    to="/login"
                    onClick={cerrarSesion}
                    className="hidden ml-auto rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold sm:block"
                >
                    Cerrar sesión
                </Link>
            </div>

            {/* border t es borde superior
          no ocupa todo el ancho de pantalla por el page shell 
          el && significa if, si menuabierto es verdadero se muestra lo de la derecha*/}
            {menuAbierto && (
                <nav id="mobile-menu" className="page-shell border-t border-stone-200 py-3 lg:hidden">
                    <Link className="mobile-link" to="/" onClick={() => setMenuAbierto(false)}>Inicio</Link>
                    <Link className="mobile-link" to="/login" onClick={cerrarSesion}>Cerrar sesión</Link>
                </nav>
            )}
        </header>
    );
}