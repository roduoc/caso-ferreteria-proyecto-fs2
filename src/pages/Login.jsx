import { useState, useEffect } from 'react';
//usenavigate sirve para cambiar de pagina desde el codigo, reemplaza a window.location.href
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo-los-maestros.svg';
import { iniciarSesion, obtenerSesion, rutasPorRol } from '../services/usuarioService';

export default function Login() {
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    //reemplaza a mostrarError y ocultarError: si error tiene texto se muestra, si esta vacio se oculta
    const [error, setError] = useState('');

    //navigate permite cambiar de ruta
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!error) return;
        const temporizador = setTimeout(() => setError(null), 3000);
        //si llega otro mensaje antes de los 3 segundos, se cancela el temporizador anterior
        return () => clearTimeout(temporizador);
    }, [error]);

    const sesion = obtenerSesion();
    if (sesion) {
        return <Navigate to={rutasPorRol[sesion.rol]} replace />;
    }


    //prevent default cancela que se recargue la pagina al hacer submit para manejarlo nosotros
    async function manejarSubmit(event) {
        event.preventDefault();

        try {
            //el service valida los campos y revisa si el correo y la clave coinciden con algun usuario
            //si algo falla lanza un error, y el catch muestra su mensaje
            const usuario = await iniciarSesion(correo, clave);
            setError('');

            //si un cliente venia de una pagina protegida vuelve ahi
            const desde = location.state?.desde;
            if (usuario.rol === 'cliente' && desde) {
                navigate(desde);
            } else {
                navigate(rutasPorRol[usuario.rol]);
            }
        } catch (e) {
            setError(e.message);
        }
    }

    return (
        <main>
            <div className="page-shell relative py-8">
                {/*left 0 top 8 son las coordenadas*/}
                <Link to="/" className="absolute left-0 top-8 text-sm font-semibold text-stone-500 hover:text-amber-700">
                    ← Volver al inicio
                </Link>

                {/*mi cuenta y logo de la tienda*/}
                <div className="flex flex-col items-center pt-18">
                    <h1 className="section-title text-center">Mi Cuenta</h1>
                    <img className="mt-3 size-16" src={logo} alt="Logo Ferretería Los Maestros" />
                </div>

                {/*mx auto centra el elemento horizontalmente
                margin top separa el recuadro de lo que esta arriba
                en pantallas grandes el padding es de 8, aumenta*/}
                <div className="mx-auto mt-8 w-full max-w-md rounded-xl border border-stone-300 bg-white p-6 sm:p-8">

                    {/*ACCEDER
                    h full le indica que ocupe el 100 de altura disponible*/}
                    <div className="flex h-full flex-col rounded-lg border border-stone-200 p-5 sm:p-6">
                        <h2 className="text-lg font-bold">Acceder</h2>

                        {/*space y 4 agrega espacio vertical entre los elementos hijos
                        noValidate es para desactivar la validacion automatica de los campos para poder hacerla nosotros mismos
                        flex 1 hace que el form crezca y ocupe todo el espacio vertical disponible*/}
                        <form onSubmit={manejarSubmit} className="mt-4 flex flex-1 flex-col space-y-4" noValidate>

                            {/*el error solo se dibuja si tiene texto*/}
                            {error && (
                                <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                                    role="alert">{error}</p>
                            )}

                            <div>
                                {/*margin bottom es un pequeño espacio debajo del label, separandolo del input que viene despues*/}
                                <label className="mb-1 block text-sm font-semibold">Correo electrónico</label>
                                <input name="correo" type="email" maxLength="100" required
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold">Contraseña</label>
                                <input name="clave" type="password" maxLength="10" required
                                    value={clave}
                                    onChange={(e) => setClave(e.target.value)}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                            </div>

                            {/*mt auto empuja el elemento especifico hasta el final del espacio disponible*/}
                            <button className="add-button w-full mt-auto" type="submit">Acceder</button>
                        </form>
                    </div>

                </div>
            </div>
        </main>
    );
}
