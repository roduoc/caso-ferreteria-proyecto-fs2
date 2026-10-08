import { useEffect, useState } from 'react';
import { obtenerReporteVentas } from '../../services/reporteService';

function GraficoBarras({ titulo, datos, etiquetaValor }) {
    const maximo = Math.max(1, ...datos.map((dato) => dato.cantidad));

    return (
        <section className="rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="mb-5 font-medium text-stone-800">{titulo}</h2>
            {datos.length === 0 ? (
                <p className="text-sm text-stone-500">Todavía no hay compras para mostrar.</p>
            ) : (
                <div role="img" aria-label={`Gráfico de ${titulo.toLowerCase()}`} className="space-y-4">
                    {datos.map((dato) => (
                        <div key={dato.codigo || dato.id}>
                            <div className="mb-1 flex justify-between gap-3 text-sm">
                                <span className="truncate font-medium text-stone-700" title={dato.nombre}>{dato.nombre}</span>
                                <span className="shrink-0 font-semibold text-amber-800">{dato.cantidad} {etiquetaValor}</span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                                <div className="h-full rounded-full bg-amber-500" style={{ width: `${dato.cantidad / maximo * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default function AdminReportes() {
    const [reporte, setReporte] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        obtenerReporteVentas().then(setReporte).catch((e) => setError(e.message));
    }, []);

    return (
        <div className="flex-1 px-8 py-10">
            <h1 className="mb-10 text-center text-3xl font-semibold text-stone-900">Reportes - Vista Administrador</h1>
            {error && <p role="alert" className="mx-auto max-w-5xl text-red-700">{error}</p>}
            {!reporte && !error && <p className="text-center text-stone-500">Cargando reportes...</p>}
            {reporte && (
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
                    <GraficoBarras titulo="10 productos más vendidos" datos={reporte.productos} etiquetaValor="unidades" />
                    <GraficoBarras titulo="10 clientes más frecuentes" datos={reporte.clientes} etiquetaValor="compras" />
                </div>
            )}
        </div>
    );
}
