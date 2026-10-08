import { useState, useEffect } from 'react';
import { ESTADOS_PEDIDO } from '../models/Pedido';

//tarjeta de un pedido en la gestion de pedidos
//pedido: el pedido a mostrar
//onCambiarEstado: funcion que recibe el id y el estado nuevo, la entrega la pagina
export default function TarjetaPedido({ pedido, onCambiarEstado }) {
    //el select parte marcando el estado actual del pedido
    const [estadoElegido, setEstadoElegido] = useState(pedido.estado);
    const [mensaje, setMensaje] = useState(null);
    //al presionar editar estado se llama a guardarEstado
    //que a su vez llama a onCambiarEstado, que es en realidad guardarEstado de la pagina
    async function guardarEstado() {
        try {
            await onCambiarEstado(pedido.id, estadoElegido);
            setMensaje({ tipo: 'exito', texto: 'Estado actualizado correctamente' });
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message });
        }
    }

    useEffect(() => {
            if (!mensaje) return;
            const temporizador = setTimeout(() => setMensaje(null), 3000);
            //si llega otro mensaje antes de los 3 segundos, se cancela el temporizador anterior
            return () => clearTimeout(temporizador);
        }, [mensaje]);

    //numero del pedido
    const numero = pedido.id

    return (
        //tarjeta: numero de pedido a la izquierda, estado al centro, boton a la derecha
        //grid grid-cols-3 para que las 3 columnas midan lo mismo sin importar el largo del contenido
        //items center para alinear verticalmente
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 bg-white rounded-lg border border-stone-200 p-6">
            <p className="font-medium text-lg text-stone-800">
                <span className="text-sm text-stone-400 block">Número de pedido</span>
                #{numero}
            </p>

            <p className="text-left sm:text-center text-stone-600">
                <span className="text-sm text-stone-400 block">Estado</span>
                <span className="font-semibold text-xl">{pedido.estado}</span>
            </p>

            {/*sm:w-48 le da un ancho fijo a esta columna
            asi el mensaje no la ensancha y todas las tarjetas quedan alineadas*/}
            <div className="flex flex-col gap-2 justify-self-start sm:justify-self-end w-full sm:w-48">
                {/*las opciones del select se crean recorriendo el arreglo de estados*/}
                <label className="text-sm text-stone-400 block text-center" htmlFor={`estado-${pedido.id}`}>Estado</label>
                <select
                    id={`estado-${pedido.id}`}
                    value={estadoElegido}
                    onChange={(e) => setEstadoElegido(e.target.value)}
                    className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-amber-500">
                    {ESTADOS_PEDIDO.map((estado) => (
                        <option key={estado} value={estado}>{estado}</option>
                    ))}
                </select>
                <button type="button" className="add-button" onClick={guardarEstado}>Editar estado</button>

                {/*el mensaje solo aparece despues de presionar el boton
                verde si salio bien, rojo si hubo un error*/}
                {mensaje && (
                    <p role="alert" className={`text-sm font-semibold ${mensaje.tipo === 'exito' ? 'text-green-700' : 'text-red-600'}`}>
                        {mensaje.texto}
                    </p>
                )}
            </div>
        </div>
    );
}