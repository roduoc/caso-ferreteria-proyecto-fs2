import { useEffect, useState } from 'react';
import { listarProductos, actualizarProducto } from '../../services/productoService';
import TarjetaStock from '../../components/TarjetaStockVendedor';

export default function VendedorInventario() {
    const [productos, setProductos] = useState([]);

    //useEffect con [] se ejecuta una sola vez, cuando la pagina aparece
    //aqui se piden los productos al service
    useEffect(() => {
        listarProductos().then(setProductos);
    }, []);

    //la pagina le entrega esta funcion a cada tarjeta
    //guarda el cambio con el service y reemplaza ese producto en la lista

   
    async function guardarCambios(codigo, cambios) {
        const actualizado = await actualizarProducto(codigo, cambios);
        setProductos((lista) => lista.map((p) => (p.codigo === codigo ? actualizado : p)));
    }

    return (
        //en el caso de flex row crece y ocupa todo el espacio disponible horizontal
        <div className="flex-1 px-8 py-10">
            <h1 className="text-3xl font-semibold text-stone-900 text-center mb-10">Consulta de stock - Vista Vendedor</h1>

            {/*space y 4 agrega espacio vertical entre cada tarjeta de producto
            max w 5xl para que las tarjetas ocupen mas ancho*/}
            <div className="max-w-5xl mx-auto space-y-4">

                {/*se crea una por cada producto
                la pagina le pasa el producto a mostrar*/}
                {productos.map((producto) => (
                    <TarjetaStock key={producto.codigo} producto={producto} onGuardar={guardarCambios} />
                ))}

            </div>
        </div>
    );
}