import sinImagen from '../../assets/sin-imagen.svg';

export default function AdminReportes() {
    return (
        //en el caso de flex row crece y ocupa todo el espacio disponible horizontal
        <div className="flex-1 px-8 py-10">
            <h1 className="text-3xl font-semibold text-stone-900 text-center mb-20">Reportes - Vista Administrador</h1>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-white rounded-lg border border-stone-200 p-6">
                    <h2 className="text-stone-800 font-medium mb-4">10 clientes más frecuentes</h2>
                    <img src={sinImagen}
                        alt="Gráfico de los 10 clientes más frecuentes" className="w-full h-auto rounded" />
                </div>

                <div className="bg-white rounded-lg border border-stone-200 p-6">
                    <h2 className="text-stone-800 font-medium mb-4">10 productos más vendidos</h2>
                    <img src={sinImagen}
                        alt="Gráfico de los 10 productos más vendidos" className="w-full h-auto rounded" />
                </div>

            </div>
        </div>
    );
}