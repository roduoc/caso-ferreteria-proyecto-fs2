import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarClientes } from '../../services/clienteService';

export default function AdminHistorial() {
    const [clientes, setClientes] = useState([]);
    const [buscarId, setBuscarId] = useState('');
    const [buscarNombre, setBuscarNombre] = useState('');

    //pide los clientes al service
    useEffect(() => {
        listarClientes().then(setClientes);
    }, []);

    const textoId = buscarId.trim();

    const textoNombre = buscarNombre.trim().toLowerCase();
    //revisa si id esta vacio o es igual al id de un cliente
    const clientesFiltrados = clientes.filter((c) =>
        (textoId === '' || String(c.id) === textoId) &&
        c.nombreCompleto.toLowerCase().includes(textoNombre)
    );

    return (
        //en el caso de flex row crece y ocupa todo el espacio disponible horizontal
        <div className="flex-1 px-8 py-10">
            <h1 className="text-3xl font-semibold text-stone-900 text-center mb-10">Historial de pedidos - Vista Administrador</h1>

            {/*space y 4 agrega espacio vertical entre cada tarjeta
            max w 5xl para que las tarjetas ocupen mas ancho*/}
            <div className="max-w-5xl mx-auto space-y-4">

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

                {/*si hay clientes cargados pero ninguno coincide con la busqueda*/}
                {clientes.length > 0 && clientesFiltrados.length === 0 && (
                    <p className="text-center text-stone-500">No se encontraron clientes.</p>
                )}

                {/*una tarjeta por cada cliente*/}
                {clientesFiltrados.map((cliente) => (
                    <div key={cliente.id} className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 bg-white rounded-lg border border-stone-200 p-6">

                        {/*flex para que el id quede a la izquierda, al lado del nombre*/}
                        <div className="flex items-center gap-4">
                            {/*p de parrafo
                            parrafo envuelve un pedazo de texto*/}

                            {/*leading controla la altura de cada linea de texto*/}
                            <span className="block text-lg leading-7 text-stone-900">#{cliente.id}</span>

                            <div>
                                <p className="font-medium text-lg text-stone-800">{cliente.nombreCompleto}</p>
                                <p className="text-sm text-stone-500">{cliente.correo}</p>
                            </div>
                        </div>

                        {/*justify self end le dice al elemento que no se estire a todo su ancho y ocupe solo
                        su tamano natural y que se pegue a la derecha
                        el link lleva a /admin/historial/ mas el id del cliente, por ejemplo /admin/historial/3*/}
                        <Link to={`/admin/historial/${cliente.id}`} className="add-button justify-self-start sm:justify-self-end">
                            Ver historial de compras
                        </Link>
                    </div>
                ))}

            </div>
        </div>
    );
}
