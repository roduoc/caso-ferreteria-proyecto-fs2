import { useEffect, useState } from 'react';
import { listarProductos, actualizarProducto } from '../../services/productoService';
import TarjetaStock from '../../components/TarjetaStockVendedor';

export default function VendedorInventario() {
    const [productos, setProductos] = useState([]);
    const [buscarCodigo, setBuscarCodigo] = useState('');
    const [buscarNombre, setBuscarNombre] = useState('');

    //useEffect con [] se ejecuta una sola vez, cuando la pagina aparece
    //aqui se piden los productos al service

    //listar producto llama a producto service, al await esperar
    //esperar llama a la funcion esperar de storage
    //luego llama a leer
    //si hay productos en local storage los devuelve, sino, copia los json del mock
    //de local storage creamos los productos con producto dto
    //vuelve con la informacion de salida a la pagina
    useEffect(() => {
        listarProductos().then(setProductos);
    }, []);

    //la pagina le entrega esta funcion a cada tarjeta
    //guarda el cambio con el service y reemplaza ese producto en la lista

    async function guardarCambios(codigo, cambios) {
        //actualizado es el producto ya actualizado, en forma de dto
        const actualizado = await actualizarProducto(codigo, cambios);
        //recorre la lista de productos y cuando encuentra el codigo del que cambió
        //lo actualiza, si no, deja el producto que ya estaba
        setProductos((lista) => lista.map((p) => (p.codigo === codigo ? actualizado : p)));
    }

    const productosFiltrados = productos.filter((p) =>
        p.codigo.toLowerCase().includes(buscarCodigo.trim().toLowerCase()) &&
        p.nombre.toLowerCase().includes(buscarNombre.trim().toLowerCase())
    );

    return (
        //en el caso de flex row crece y ocupa todo el espacio disponible horizontal
        <div className="flex-1 px-8 py-10">
            <h1 className="text-3xl font-semibold text-stone-900 text-center mb-10">Consulta de stock - Vista Vendedor</h1>

            {/*space y 4 agrega espacio vertical entre cada tarjeta de producto
            max w 5xl para que las tarjetas ocupen mas ancho*/}
            <div className="max-w-5xl mx-auto space-y-4">

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

                {/*si hay productos cargados pero ninguno coincide con la busqueda*/}
                {productos.length > 0 && productosFiltrados.length === 0 && (
                    <p className="text-center text-stone-500">No se encontraron productos.</p>
                )}

                {/*se crea una por cada producto
                la pagina le pasa el producto a mostrar*/}
                {productosFiltrados.map((producto) => (
                    <TarjetaStock key={producto.codigo} producto={producto} onGuardar={guardarCambios} />
                ))}

            </div>
        </div>
    );
}