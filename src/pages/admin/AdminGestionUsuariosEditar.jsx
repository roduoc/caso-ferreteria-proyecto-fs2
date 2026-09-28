import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerUsuario, actualizarUsuario, ROLES } from '../../services/usuarioService';
import regionesComunas from '../../mocks/regionesComunas.json';

//los const que estan afuera son los que no cambian
//los const dentro de la funcion dependen del estado
const NOMBRE_ROL = { admin: 'Admin', vendedor: 'Vendedor', cliente: 'Cliente' };

const REGIONES = Object.keys(regionesComunas);

export default function AdminGestionUsuariosEditar() {
    //useParams lee el id de la url, por ejemplo /admin/usuarios/3
    const { id } = useParams();
    const usuarioId = Number(id);

    //formulario representa a un usuario
    const [formulario, setFormulario] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [noEncontrado, setNoEncontrado] = useState(false);

    //pide el usuario y llena el formulario con sus datos actuales
    useEffect(() => {
        obtenerUsuario(usuarioId)
            .then((usuario) => {
                setFormulario({
                    id: usuario.id,
                    rut: usuario.rut,
                    rol: usuario.rol,
                    nombre: usuario.nombre,
                    apellidos: usuario.apellidos,
                    correo: usuario.correo,
                    region: usuario.region,
                    comuna: usuario.comuna,
                    direccion: usuario.direccion,
                });
                setNoEncontrado(false);
                setMensaje(null);
            })
            .catch(() => setNoEncontrado(true));
    }, [usuarioId]);

    //actualiza solo el campo que se esta escribiendo
    function cambiarCampo(e) {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    }

    function cambiarRegion(e) {
        setFormulario({ ...formulario, region: e.target.value, comuna: '' });
    }

    async function guardar(e) {
        //evita que el formulario recargue la pagina
        e.preventDefault();
        try {
            await actualizarUsuario(usuarioId, formulario);
            setMensaje({ tipo: 'exito', texto: 'Cambios guardados correctamente' });
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message });
        }
    }

    const claseInput = 'w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500';

    if (noEncontrado) {
        return (
            <div className="flex-1 px-8 py-10">
                <p className="text-center text-red-600 font-semibold">Usuario no encontrado</p>
            </div>
        );
    }

    //muestra un espacio vacio mientras los datos del usuario todavia no llegan
    if (!formulario || formulario.id !== usuarioId) {
        return <div className="flex-1 px-8 py-10" />;
    }

    //las comunas de la region elegida, o ninguna si no hay region
    const comunas = regionesComunas[formulario.region] || [];

    return (
        //en el caso de flex row crece y ocupa todo el espacio disponible horizontal
        <div className="flex-1 px-8 py-10">

            <h1 className="text-3xl font-semibold text-stone-900 text-center mb-10 mt-4">Editar usuario - Administrador</h1>

            {/*mx auto centra horizontalmente el elemento
            p es padding, espacio interno*/}
            <div className="mx-auto w-full max-w-2xl rounded-xl border border-stone-300 bg-white p-6 sm:p-8">
                {/*space y 4 agrega espacio vertical entre los elementos*/}
                <form onSubmit={guardar} className="space-y-4" noValidate>

                    {/*mensaje de exito o error arriba del formulario*/}
                    {mensaje && (
                        <p role="alert"
                            className={mensaje.tipo === 'exito'
                                ? 'rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700'
                                : 'rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700'}>
                            {mensaje.texto}
                        </p>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">

                        <div>
                            <label className="mb-1 block text-sm font-semibold" htmlFor="rut">RUT</label>
                            <input id="rut" name="rut" type="text" maxLength="9"
                                value={formulario.rut} onChange={cambiarCampo} className={claseInput} />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold" htmlFor="rol">Rol</label>
                            {/*las opciones se crean recorriendo el arreglo de roles del service*/}
                            <select id="rol" name="rol" value={formulario.rol} onChange={cambiarCampo} className={claseInput}>
                                {ROLES.map((rol) => (
                                    <option key={rol} value={rol}>{NOMBRE_ROL[rol]}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold" htmlFor="nombre">Nombre</label>
                            <input id="nombre" name="nombre" type="text" maxLength="50"
                                value={formulario.nombre} onChange={cambiarCampo} className={claseInput} />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold" htmlFor="apellidos">Apellidos</label>
                            <input id="apellidos" name="apellidos" type="text" maxLength="100"
                                value={formulario.apellidos} onChange={cambiarCampo} className={claseInput} />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-semibold" htmlFor="correo">Correo electrónico</label>
                            <input id="correo" name="correo" type="email" maxLength="100"
                                value={formulario.correo} onChange={cambiarCampo} className={claseInput} />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold" htmlFor="region">Región</label>
                            <select id="region" name="region" value={formulario.region} onChange={cambiarRegion} className={claseInput}>
                                <option value="">Selecciona una región</option>
                                {REGIONES.map((region) => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold" htmlFor="comuna">Comuna</label>
                            {/*se desactiva mientras no haya una region elegida*/}
                            <select id="comuna" name="comuna" value={formulario.comuna} onChange={cambiarCampo}
                                disabled={comunas.length === 0} className={`${claseInput} disabled:opacity-50`}>
                                <option value="">Selecciona una comuna</option>
                                {comunas.map((comuna) => (
                                    <option key={comuna} value={comuna}>{comuna}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-semibold" htmlFor="direccion">Dirección</label>
                            <input id="direccion" name="direccion" type="text" maxLength="300"
                                value={formulario.direccion} onChange={cambiarCampo} className={claseInput} />
                        </div>

                    </div>

                    <button className="add-button w-full" type="submit">Guardar cambios</button>
                </form>
            </div>

            <p className="mt-6 text-center">
                <Link to="/admin/usuarios" className="text-sm font-semibold text-amber-700 hover:underline">
                    Volver a la lista de usuarios
                </Link>
            </p>
        </div>
    );
}
