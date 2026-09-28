import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarUsuarios, crearUsuario, eliminarUsuario, ROLES } from '../../services/usuarioService';
import regionesComunas from '../../mocks/regionesComunas.json';

//el texto que se muestra para cada rol
const NOMBRE_ROL = { admin: 'Admin', vendedor: 'Vendedor', cliente: 'Cliente' };

//las regiones son las llaves del objeto
const REGIONES = Object.keys(regionesComunas);

//formulario vacio
const formularioVacio = {
    rut: '', rol: 'cliente', nombre: '', apellidos: '', correo: '', clave: '',
    region: '', comuna: '', direccion: '',
    tipoCliente: 'particular', cuentaCorrienteHabilitada: false,
};

export default function AdminGestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [formulario, setFormulario] = useState(formularioVacio);
    const [buscarId, setBuscarId] = useState('');
    const [buscarNombre, setBuscarNombre] = useState('');

    //error, uno para el formulario de crear y otro para cuando se elimina un usuario
    const [mensajeCrear, setMensajeCrear] = useState(null);
    const [mensajeEliminar, setMensajeEliminar] = useState(null);

    //pide todos los usuarios al service una sola vez, cuando la pagina aparece
    useEffect(() => {
        listarUsuarios().then(setUsuarios);
    }, []);

    useEffect(() => {
        if (!mensajeCrear) return;
        const temporizador = setTimeout(() => setMensajeCrear(null), 3000);
        //si llega otro mensaje antes de los 3 segundos, se cancela el temporizador anterior
        return () => clearTimeout(temporizador);
    }, [mensajeCrear]);

    useEffect(() => {
        if (!mensajeEliminar) return;
        const temporizador = setTimeout(() => setMensajeEliminar(null), 3000);
        return () => clearTimeout(temporizador);
    }, [mensajeEliminar]);

    //actualiza solo el campo que se esta escribiendo
    function cambiarCampo(e) {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    }

    //al cambiar de region, la comuna anterior ya no sirve, por eso se vacia
    function cambiarRegion(e) {
        setFormulario({ ...formulario, region: e.target.value, comuna: '' });
    }

    function cambiarTipoCliente(e) {
        //marcado = contratista, desmarcado = particular
        const tipo = e.target.checked ? 'contratista' : 'particular';
        setFormulario({ ...formulario, tipoCliente: tipo, cuentaCorrienteHabilitada: false });
    }

    //se usa e.target.checked (true o false)
    function cambiarCuentaCorriente(e) {
        setFormulario({ ...formulario, cuentaCorrienteHabilitada: e.target.checked });
    }

    //crea el usuario con el service y lo agrega al final de la lista
    async function crear(e) {
        //evita que el formulario recargue la pagina
        e.preventDefault();
        try {
            const nuevo = await crearUsuario(formulario);
            setUsuarios((lista) => [...lista, nuevo]);
            setFormulario(formularioVacio);
            setMensajeCrear({ tipo: 'exito', texto: `Usuario ${nuevo.nombreCompleto} creado correctamente` });
        } catch (error) {
            setMensajeCrear({ tipo: 'error', texto: error.message });
        }
    }

    //elimina el usuario con el service y lo saca de la lista
    async function eliminar(usuario) {
        try {
            await eliminarUsuario(usuario.id);
            setUsuarios((lista) => lista.filter((u) => u.id !== usuario.id));
            setMensajeEliminar({ tipo: 'exito', texto: `Usuario ${usuario.nombreCompleto} eliminado correctamente` });
        } catch (error) {
            setMensajeEliminar({ tipo: 'error', texto: error.message });
        }
    }

    //las comunas de la region elegida en el formulario
    //devuelve uno de los dos valores
    const comunas = regionesComunas[formulario.region] || [];

    const textoId = buscarId.trim();
    const textoNombre = buscarNombre.trim().toLowerCase();
    const usuariosFiltrados = usuarios.filter((u) =>
        (textoId === '' || String(u.id) === textoId) &&
        u.nombreCompleto.toLowerCase().includes(textoNombre)
    );

    const claseInput = 'w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500';

    return (
        //en el caso de flex row crece y ocupa todo el espacio disponible horizontal
        <div className="flex-1 px-8 py-10">
            <h1 className="text-3xl font-semibold text-stone-900 text-center mb-10">Gestión de usuarios - Vista Administrador</h1>

            {/*space y 4 agrega espacio vertical entre cada tarjeta
            max w 5xl para que las tarjetas ocupen mas ancho*/}
            <div className="max-w-5xl mx-auto space-y-4">

                {/*formulario para crear usuarios, con los mismos campos que el de editar mas la contrasena*/}
                <form onSubmit={crear} className="bg-white rounded-lg border border-stone-200 p-6" noValidate>
                    <h2 className="font-medium text-lg text-stone-800 mb-4">Agregar usuario</h2>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <input name="rut" placeholder="RUT (sin puntos ni guion)" maxLength="9"
                            value={formulario.rut} onChange={cambiarCampo} className={claseInput} />
                        <input name="nombre" placeholder="Nombre" maxLength="50"
                            value={formulario.nombre} onChange={cambiarCampo} className={claseInput} />
                        <input name="apellidos" placeholder="Apellidos" maxLength="100"
                            value={formulario.apellidos} onChange={cambiarCampo} className={claseInput} />
                        <input name="correo" type="email" placeholder="Correo electrónico" maxLength="100"
                            value={formulario.correo} onChange={cambiarCampo} className={claseInput} />
                        <input name="clave" type="password" placeholder="Contraseña (4 a 10 caracteres)" maxLength="10"
                            value={formulario.clave} onChange={cambiarCampo} className={claseInput} />
                        {/*las opciones se crean recorriendo el arreglo de roles del service*/}
                        <select name="rol" value={formulario.rol} onChange={cambiarCampo} className={claseInput}>
                            {ROLES.map((rol) => (
                                <option key={rol} value={rol}>{NOMBRE_ROL[rol]}</option>
                            ))}
                        </select>

                        <select name="region" value={formulario.region} onChange={cambiarRegion} className={claseInput}>
                            <option value="">Selecciona una región</option>
                            {REGIONES.map((region) => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>

                        {/*se desactiva mientras no haya una region elegida*/}
                        <select name="comuna" value={formulario.comuna} onChange={cambiarCampo}
                            disabled={comunas.length === 0} className={`${claseInput} disabled:opacity-50`}>
                            <option value="">Selecciona una comuna</option>
                            {comunas.map((comuna) => (
                                <option key={comuna} value={comuna}>{comuna}</option>
                            ))}
                        </select>
                        <input name="direccion" placeholder="Dirección" maxLength="300"
                            value={formulario.direccion} onChange={cambiarCampo} className={claseInput} />

                        {/*datos de cliente solo aparecen si el rol elegido es cliente
                        si lo de la izquierda es verdadero devuelve lo de la derecha*/}
                        {formulario.rol === 'cliente' && (
                            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer">
                                <input type="checkbox" name="tipoCliente"
                                    checked={formulario.tipoCliente === 'contratista'}
                                    onChange={cambiarTipoCliente}
                                    className="accent-amber-600 w-4 h-4" />
                                Es contratista
                            </label>
                        )}

                        {/*la cuenta corriente solo se puede habilitar para contratistas*/}
                        {formulario.rol === 'cliente' && formulario.tipoCliente === 'contratista' && (
                            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer">
                                <input type="checkbox" name="cuentaCorrienteHabilitada"
                                    checked={formulario.cuentaCorrienteHabilitada}
                                    onChange={cambiarCuentaCorriente}
                                    className="accent-amber-600 w-4 h-4" />
                                Cuenta corriente habilitada
                            </label>
                        )}
                    </div>

                    <button type="submit" className="add-button mt-4">Agregar usuario</button>

                    {mensajeCrear && (
                        <p role="alert" className={`mt-3 text-sm font-semibold ${mensajeCrear.tipo === 'exito' ? 'text-green-700' : 'text-red-600'}`}>
                            {mensajeCrear.texto}
                        </p>
                    )}
                </form>

                {/*buscadores: en celulares uno debajo del otro, en pantallas grandes al lado*/}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="search" placeholder="Buscar por id (ej: 3)"
                        value={buscarId}
                        onChange={(e) => setBuscarId(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-amber-500" />
                    <input type="search" placeholder="Buscar por nombre"
                        value={buscarNombre}
                        onChange={(e) => setBuscarNombre(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-amber-500" />
                </div>

                {mensajeEliminar && (
                    <p role="alert" className={`text-sm font-semibold ${mensajeEliminar.tipo === 'exito' ? 'text-green-700' : 'text-red-600'}`}>
                        {mensajeEliminar.texto}
                    </p>
                )}

                {usuariosFiltrados.map((usuario) => (
                    <div key={usuario.id} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 bg-white rounded-lg border border-stone-200 p-6">
                        <div className="flex items-center gap-4">
                            <span className="block text-lg leading-7 text-stone-900">#{usuario.id}</span>
                            <div>
                                <p className="font-medium text-lg text-stone-800">{usuario.nombreCompleto}</p>
                                <p className="text-sm text-stone-500">{usuario.correo}</p>
                            </div>
                        </div>
                        <p className="text-left sm:text-center font-semibold text-stone-600">{NOMBRE_ROL[usuario.rol]}</p>

                        {/*justify self end le dice al elemento que no se estire a todo su ancho y ocupe solo
                        su tamano natural y que se pegue a la derecha*/}
                        <div className="flex gap-2 justify-self-start sm:justify-self-end">
                            {/*lleva a /admin/usuarios/ mas el id, por ejemplo /admin/usuarios/3*/}
                            <Link to={`/admin/usuarios/${usuario.id}`} className="add-button">Editar</Link>
                            <button type="button"
                                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                onClick={() => eliminar(usuario)}>
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}
