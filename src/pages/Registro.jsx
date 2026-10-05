import { useState, useEffect } from 'react';
//usenavigate sirve para cambiar de pagina desde el codigo, reemplaza a window.location.href
import { Link, useNavigate, Navigate , useLocation} from 'react-router-dom';
import logo from '../assets/logo-los-maestros.svg';
import { registrarCliente, obtenerSesion, rutasPorRol  } from '../services/usuarioService';
import regionesComunas from '../mocks/regionesComunas.json';

//las regiones son las llaves del objeto
const REGIONES = Object.keys(regionesComunas);

//formulario vacio
const formularioVacio = {
    rut: '', nombre: '', apellidos: '', correo: '', clave: '',
    region: '', comuna: '', direccion: '',
    tipoCliente: 'particular',
};

export default function Registro() {
    const [formulario, setFormulario] = useState(formularioVacio);
    //reemplaza a mostrarError y ocultarError: si error tiene texto se muestra, si esta vacio se oculta
    const [error, setError] = useState('');

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

    //actualiza solo el campo que se esta escribiendo
    function cambiarCampo(e) {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    }

    //al cambiar de region, la comuna anterior ya no sirve, por eso se vacia
    function cambiarRegion(e) {
        setFormulario({ ...formulario, region: e.target.value, comuna: '' });
    }

    //marcado = contratista, desmarcado = particular
    function cambiarTipoCliente(e) {
        const tipo = e.target.checked ? 'contratista' : 'particular';
        setFormulario({ ...formulario, tipoCliente: tipo });
    }

    //prevent default cancela que se recargue la pagina al hacer submit para manejarlo nosotros
    async function manejarSubmit(event) {
        event.preventDefault();

        try {
            //el service valida los campos, revisa que el rut y el correo no esten repetidos,
            //crea la cuenta e inicia la sesion. si algo falla lanza un error y el catch muestra su mensaje
            await registrarCliente(formulario);
            setError('');
            //viene del link de registrarse que agregamos al login
            navigate(location.state?.desde || '/mis-pedidos');
        } catch (e) {
            setError(e.message);
        }
    }

    //las comunas de la region elegida, si no hay region es una lista vacia
    const comunas = regionesComunas[formulario.region] || [];

    return (
        <main className="flex-1">
            <div className="page-shell relative py-8">
                {/*left 0 top 8 son las coordenadas*/}
                <Link to="/"
                    className="absolute left-0 top-8 text-sm font-semibold text-stone-500 hover:text-amber-700">
                    ← Volver al inicio
                </Link>

                {/*mi cuenta y logo de la tienda*/}
                <div className="flex flex-col items-center pt-18">
                    <h1 className="section-title text-center">Mi Cuenta</h1>
                    <img className="mt-3 size-16" src={logo} alt="Logo Ferretería Los Maestros" />
                </div>

                {/*mx auto centra el elemento horizontalmente
                margin top separa el recuadro de lo que esta arriba
                en pantallas grandes el padding es de 8, aumenta
                mx auto es margin left auto, reparte el espacio horizontal sobrante a ambos lados
                en este caso centra el recuadro en la pantalla horizontalmente*/}
                <div className="mx-auto mt-8 w-full max-w-md rounded-xl border border-stone-300 bg-white p-6 sm:p-8">
                    {/*sm grid cols 2 significa 2 columnas en pantallas grandes
                    por defecto 1*/}

                    {/*registrarse*/}
                    <div className="flex h-full flex-col rounded-lg border border-stone-200 p-5 sm:p-6">
                        <h2 className="text-lg font-bold">Registrarse</h2>

                        <form onSubmit={manejarSubmit} className="mt-4 flex flex-1 flex-col space-y-4" noValidate>

                            {/*el error solo se dibuja si tiene texto*/}
                            {error && (
                                <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                                    role="alert">{error}</p>
                            )}

                            <div>
                                <label className="mb-1 block text-sm font-semibold" htmlFor='rut'>Rut</label>
                                <input id="rut" name="rut" type="text" maxLength="100" required
                                    value={formulario.rut} onChange={cambiarCampo}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold" htmlFor='nombre'>Nombre</label>
                                <input id="nombre" name="nombre" type="text" maxLength="100" required
                                    value={formulario.nombre} onChange={cambiarCampo}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold" htmlFor='apellidos'>Apellidos</label>
                                <input id="apellidos" name="apellidos" type="text" maxLength="100" required
                                    value={formulario.apellidos} onChange={cambiarCampo}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold" htmlFor='correo'>Correo electrónico</label>
                                <input id="correo" name="correo" type="email" maxLength="100" required
                                    value={formulario.correo} onChange={cambiarCampo}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold" htmlFor='clave'>Contraseña</label>
                                <input id="clave" name="clave" type="password" maxLength="10" required
                                    value={formulario.clave} onChange={cambiarCampo}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                                <p className="mt-1 text-xs text-stone-500">Entre 4 y 10 caracteres.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div>
                                    <label className="mb-1 block text-sm font-semibold" htmlFor="region">Región</label>
                                    {/*las opciones se crean recorriendo las regiones del json*/}
                                    <select id="region" name="region" required
                                        value={formulario.region} onChange={cambiarRegion}
                                        className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500">
                                        <option value="" disabled>Seleccionar</option>
                                        {REGIONES.map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold" htmlFor="comuna">Comuna</label>
                                    {/*se desactiva mientras no haya una region elegida*/}
                                    <select id="comuna" name="comuna" required
                                        disabled={comunas.length === 0}
                                        value={formulario.comuna} onChange={cambiarCampo}
                                        className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500 disabled:opacity-50">
                                        <option value="" disabled>Seleccionar</option>
                                        {comunas.map((comuna) => (
                                            <option key={comuna} value={comuna}>{comuna}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold" htmlFor='direccion'>Dirección</label>
                                <input id="direccion" name="direccion" type="text" maxLength="100" required
                                    value={formulario.direccion} onChange={cambiarCampo}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                            </div>

                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input type="checkbox"
                                    checked={formulario.tipoCliente === 'contratista'} onChange={cambiarTipoCliente}
                                    className="size-4 rounded border-stone-300 accent-amber-600" />
                                ¿Eres contratista?
                            </label>

                            <button className="add-button mt-auto w-full" type="submit">Registrarse</button>
                            <p className="text-center text-sm text-stone-500">¿Ya tienes una cuenta? <Link className="font-semibold text-amber-700 hover:underline" to="/login">Ingresar</Link></p>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
