import { useEffect, useState } from 'react';
import { listarProductos, actualizarProducto, crearProducto, eliminarProducto } from '../../services/productoService';
import TarjetaStock from '../../components/TarjetaStock';

//valores vacios del formulario, se usan al inicio y para limpiarlo
const formularioVacio = {
    codigo: '', nombre: '', categoria: '', subcategoria: '', marca: '', unidad: '',
    precio: '', stock: '', stockMinimo: '',
};

export default function AdminInventario() {
    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(formularioVacio);
    const [buscarCodigo, setBuscarCodigo] = useState('');
    const [buscarNombre, setBuscarNombre] = useState('');
    const [mensajeCrear, setMensajeCrear] = useState(null);
    const [mensajeEliminar, setMensajeEliminar] = useState(null);

    //pide los productos al service una sola vez, cuando la pagina aparece
    useEffect(() => {
        listarProductos().then(setProductos);
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

    //igual que en la vista del vendedor
    async function guardarCambios(codigo, cambios) {
        const actualizado = await actualizarProducto(codigo, cambios);
        setProductos((lista) => lista.map((p) => (p.codigo === codigo ? actualizado : p)));
    }

    //solo el admin: elimina el producto y lo saca de la lista
    async function eliminar(codigo) {
        try {
            await eliminarProducto(codigo);
            //filtra para que se muestren todos los productos menos el eliminado
            setProductos((lista) => lista.filter((p) => p.codigo !== codigo));
            setMensajeEliminar({ tipo: 'exito', texto: `Producto ${codigo} eliminado correctamente` });
        } catch (error) {
            setMensajeEliminar({ tipo: 'error', texto: error.message });
        }
    }

    //solo el admin: crea el producto y lo agrega al final de la lista
    async function crear(e) {
    //evita que el formulario recargue la pagina
    e.preventDefault();

    //el formulario se envia asi tal cual, todas las validaciones las hace el service
    try {
        //formulario es el producto que creamos con los campos del formulario
        const nuevo = await crearProducto(formulario);
        setProductos((lista) => [...lista, nuevo]);
        setFormulario(formularioVacio);
        setMensajeCrear({ tipo: 'exito', texto: `Producto ${nuevo.codigo} creado correctamente` });
    } catch (error) {
        setMensajeCrear({ tipo: 'error', texto: error.message });
    }
}

    //actualiza solo el campo que se esta escribiendo
    //e.target.name es el name del input, por ejemplo codigo, marca o stockMinimo
    function cambiarCampo(e) {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    }

    const productosFiltrados = productos.filter((p) =>
        p.codigo.toLowerCase().includes(buscarCodigo.trim().toLowerCase()) &&
        p.nombre.toLowerCase().includes(buscarNombre.trim().toLowerCase())
    );

    const claseInput = 'rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-amber-500';

    return (
        <div className="flex-1 px-8 py-10">
            <h1 className="text-3xl font-semibold text-stone-900 text-center mb-10">Consulta de stock - Vista Administrador</h1>

            <div className="max-w-5xl mx-auto space-y-4">

                {/*formulario para crear productos, solo existe en la vista del admin*/}
                <form onSubmit={crear} className="bg-white rounded-lg border border-stone-200 p-6">

                    <h2 className="font-medium text-lg text-stone-800 mb-4">Agregar producto</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <input name="codigo" placeholder="Código" value={formulario.codigo} onChange={cambiarCampo} className={claseInput} />
                        <input name="nombre" placeholder="Nombre" value={formulario.nombre} onChange={cambiarCampo} className={claseInput} />
                        <input name="marca" placeholder="Marca" value={formulario.marca} onChange={cambiarCampo} className={claseInput} />
                        <input name="categoria" placeholder="Categoría" value={formulario.categoria} onChange={cambiarCampo} className={claseInput} />
                        <input name="subcategoria" placeholder="Subcategoría" value={formulario.subcategoria} onChange={cambiarCampo} className={claseInput} />
                        <input name="unidad" placeholder="Unidad (ej: Saco, Unidad)" value={formulario.unidad} onChange={cambiarCampo} className={claseInput} />
                        <input name="precio" type="number" min="1" placeholder="Precio" value={formulario.precio} onChange={cambiarCampo} className={claseInput} />
                        <input name="stock" type="number" min="0" placeholder="Cantidad" value={formulario.stock} onChange={cambiarCampo} className={claseInput} />
                        <input name="stockMinimo" type="number" min="0" placeholder="Stock mínimo" value={formulario.stockMinimo} onChange={cambiarCampo} className={claseInput} />
                    </div>
                    <button type="submit" className="add-button mt-4">Agregar producto</button>

                    {/*mensaje del formulario, verde si se creo, rojo si hubo un error*/}
                    {mensajeCrear && (
                        <p role="alert" className={`mt-3 text-sm font-semibold ${mensajeCrear.tipo === 'exito' ? 'text-green-700' : 'text-red-600'}`}>
                            {mensajeCrear.texto}
                        </p>
                    )}

                </form>

                {/*buscadores: en celulares uno debajo del otro, en pantallas grandes lado a lado*/}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="search" placeholder="Buscar por código (ej: MC001)"
                        value={buscarCodigo}
                        onChange={(e) => setBuscarCodigo(e.target.value)}
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

                {/*la misma tarjeta del vendedor, pero con onEliminar para que aparezca el boton
                y mostrarStockBajo para que aparezca la alerta de stock bajo*/}
                {productosFiltrados.map((producto) => (
                    <TarjetaStock key={producto.codigo} producto={producto}
                        onGuardar={guardarCambios} onEliminar={eliminar} mostrarStockBajo />
                ))}

            </div>
        </div>
    );
}