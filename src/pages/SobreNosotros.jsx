import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
//los estilos del mapa, antes venian del <link> a unpkg.com en el head
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
//las imagenes del marcador son importadas a mano
import iconoMarcador from 'leaflet/dist/images/marker-icon.png';
import iconoMarcadorRetina from 'leaflet/dist/images/marker-icon-2x.png';
import sombraMarcador from 'leaflet/dist/images/marker-shadow.png';

//coordenadas
const UBICACION_TIENDA = [-29.9027, -71.2519];

const iconoTienda = L.icon({
    iconUrl: iconoMarcador,
    iconRetinaUrl: iconoMarcadorRetina,
    shadowUrl: sombraMarcador,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function SobreNosotros() {
    const [correo, setCorreo] = useState('');
    //lo que escribe la persona en el recuadro del formulario
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [exito, setExito] = useState(false);

    useEffect(() => {
            if (!error) return;
            const temporizador = setTimeout(() => setError(null), 3000);
            //si llega otro mensaje antes de los 3 segundos, se cancela el temporizador anterior
            return () => clearTimeout(temporizador);
        }, [error]);

    function enviar(event) {
        event.preventDefault();

        //checkValidity revisa las reglas que escribimos como input del formulario de contacto
        if (!correo.trim() || !mensaje.trim() || !event.target.checkValidity()) {
            setError('Debes ingresar un correo válido y escribir un mensaje.');
            setExito(false);
            return;
        }

        setError('');
        setCorreo('');
        setMensaje('');
        setExito(true);
    }

    return (
        <main className="flex-1">
            <div className="page-shell py-10">
                <h1 className="text-3xl font-semibold text-stone-900 text-center">Contacto</h1>

                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">

                    {/*columna izquierda*/}
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">Nuestra historia</h2>
                        {/*text justify justifica el texto
                        leading controla el espacio vertical entre lineas de texto*/}
                        <p className="mt-3 leading-7 text-stone-600 text-justify">
                            Ferretería Los Maestros nació en La Serena con el objetivo de ofrecer materiales de
                            construcción y herramientas de calidad a hogares y profesionales de la región. A lo largo
                            de los años, nos hemos consolidado como un referente local, atendiendo tanto a clientes
                            particulares como a contratistas, siempre con un servicio cercano y personalizado.
                        </p>

                        <address className="mt-6 space-y-2 text-stone-700">
                            <p><strong className="font-semibold text-stone-900">Dirección:</strong> La Serena, Región de
                                Coquimbo</p>
                            <p><strong className="font-semibold text-stone-900">Teléfono:</strong> +56 51 200 0000</p>
                            <p><strong className="font-semibold text-stone-900">Horario de atención:</strong> Lunes a viernes,
                                9:00 a 19:00 hrs. Sábados, 9:00 a 14:00 hrs.</p>
                        </address>

                        <h3 className="mt-8 text-lg font-bold text-stone-900">Contáctanos</h3>
                        <form onSubmit={enviar} className="mt-4 space-y-4" noValidate>

                            {error && (
                                <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                                    role="alert">{error}</p>
                            )}
                            {exito && (
                                <p className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"
                                    role="status">Mensaje enviado correctamente.</p>
                            )}

                            <div>
                                <label className="mb-1 block text-sm font-semibold" htmlFor="contacto-correo">Correo
                                    electrónico</label>
                                <input id="contacto-correo" name="correo" type="email" maxLength="100" required
                                    value={correo} onChange={(e) => setCorreo(e.target.value)}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold" htmlFor="contacto-mensaje">Mensaje</label>
                                <textarea id="contacto-mensaje" name="mensaje" rows="4" maxLength="500" required
                                    value={mensaje} onChange={(e) => setMensaje(e.target.value)}
                                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500"></textarea>
                            </div>

                            <button className="add-button w-full sm:w-auto" type="submit">Enviar mensaje</button>
                        </form>
                    </div>

                    {/*columna derecha*/}
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">Cómo llegar</h2>
                        <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                            <MapContainer center={UBICACION_TIENDA} zoom={15} style={{ height: '100%', minHeight: '350px' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={UBICACION_TIENDA} icon={iconoTienda} eventHandlers={{ add: (e) => e.target.openPopup() }}>
                                    <Popup>Ferretería Los Maestros</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
