import { useState } from 'react';
import sinImagen from '../assets/sin-imagen.svg';

//tarjeta de un producto en la consulta de stock
//onGuardar: funcion que recibe el codigo y los cambios, los entrega a la pagina
export default function TarjetaStock({ producto, onGuardar, onEliminar, mostrarStockBajo }) {
    //lo que el usuario escribe en cada input
    const [nuevoPrecio, setNuevoPrecio] = useState('');
    const [nuevaCantidad, setNuevaCantidad] = useState('');
    const [mensaje, setMensaje] = useState(null);

    //guarda el cambio
    //si el service rechaza el valor, muestra el mensaje de error
    //limpiar input limpia el input

    //al pasarle a una funcion(guardar) la funcion setnuevacantidad con un argumento
    //se convierte en limpiarinput y al setearla como vacia se vacia

    //al presionar el boton actualizar en la tarjeta se llama a guardar
    //que a su vez llama a onguardar que es en realidad guardar cambios
    async function guardar(cambios, limpiarInput, textoExito) {
        try {
            await onGuardar(producto.codigo, cambios);
            limpiarInput('');
            setMensaje({ tipo: 'exito', texto: textoExito });
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message });
        }
    }

    return (
        //flex items center para que la foto y el texto queden alineados verticalmente al medio
        //gap 6 separa la foto, el texto y los botones
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white rounded-lg border border-stone-200 p-6">
            <img src={sinImagen} alt={producto.nombre}
                className="size-24 shrink-0 rounded-lg border border-stone-200 object-cover" />

            {/*flex 1 es necesario para que el contenido se extienda, en este caso
            el bloque de texto, ocupando el espacio disponible restante de los otros dos elementos*/}
            <div className="sm:flex-1">
                <p className="font-medium text-lg text-stone-800">{producto.nombre}</p>
                <p className="mt-1 text-stone-600">Precio: <span className="font-semibold">${producto.precio.toLocaleString('es-CL')}</span></p>
                <p className="text-stone-600">Cantidad: <span className="font-semibold">{producto.stock}</span></p>


                {mostrarStockBajo && producto.stockBajo && (
                    <p className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-sm font-semibold text-amber-800">
                        Stock bajo: el mínimo es {producto.stockMinimo}
                    </p>
                )}

                {mensaje && (
                    <p role="alert" className={`mt-2 text-sm font-semibold ${mensaje.tipo === 'exito' ? 'text-green-700' : 'text-red-600'}`}>
                        {mensaje.texto}
                    </p>
                )}

            </div>

            {/*con flex wrap lo que se sale de la linea pasa a la linea siguiente*/}
            <div className="flex flex-wrap sm:flex-nowrap gap-4">

                <div className="flex flex-col gap-2">

                    <input type="number" min="0" placeholder="Nuevo precio"
                        value={nuevoPrecio}
                        onChange={(e) => setNuevoPrecio(e.target.value)}
                        className="w-28 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-amber-500" />
                    <button type="button" className="add-button"
                        onClick={() => guardar({ precio: nuevoPrecio }, setNuevoPrecio, 'Precio actualizado correctamente')}>
                        Editar precio
                    </button>
                </div>

                <div className="flex flex-col gap-2">

                    <input type="number" min="0" placeholder="Nueva cantidad"
                        value={nuevaCantidad}
                        onChange={(e) => setNuevaCantidad(e.target.value)}
                        className="w-28 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-amber-500" />
                    <button type="button" className="add-button"
                        onClick={() => guardar({ stock: nuevaCantidad }, setNuevaCantidad, 'Cantidad actualizada correctamente')}>
                        Editar cantidad
                    </button>

                </div>

                {/*el boton solo aparece si la pagina entrego onEliminar*/}
                {onEliminar && (
                    //w-full en celulares ocupa todo el ancho, asi queda abajo de los otros botones
                    //sm:w-auto en pantallas grandes vuelve a su tamano normal, al lado de los otros
                    //justify end manda el boton hacia abajo
                    //w auto significa que el boton mide solo lo que mide su contenido
                    <div className="flex flex-col justify-end sm:w-auto">
                        <button type="button"
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                            onClick={() => onEliminar(producto.codigo)}>
                            Eliminar
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}