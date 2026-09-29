//usesearchparams lee lo que va despues del ? en la url
//permite cambiar entre los articulos sin  destruir el componente y cambiar su contenido
import { Link, useSearchParams } from 'react-router-dom';
import sinImagen from '../assets/sin-imagen.svg';

//la llave es la que va en la url: ?articulo=herramientas
const publicaciones = {
    herramientas: {
        categoria: 'Consejos',
        titulo: 'Cómo elegir una herramienta para el hogar',
        resumen: 'Algunos consejos básicos para comprar herramientas que realmente sirvan para los trabajos de la casa.',
        contenido: [
            'Antes de comprar una herramienta es importante pensar para qué trabajo se va a utilizar y con qué frecuencia. Para arreglos pequeños no siempre se necesita el modelo más caro, pero sí conviene elegir una herramienta cómoda y resistente.',
            'También se recomienda revisar el tamaño, el peso y los materiales. Un mango firme y antideslizante ayuda a trabajar con mayor seguridad. En herramientas eléctricas se debe comprobar la potencia, el largo del cable y los accesorios incluidos.',
            'Para comenzar, un kit sencillo puede incluir martillo, alicate, destornilladores, cinta métrica y llave ajustable. Después se pueden agregar otras herramientas según las necesidades de cada proyecto.',
        ],
        consejo: 'Revisa siempre el stock y compara las características antes de comprar.',
    },
    reparacion: {
        categoria: 'Construcción',
        titulo: 'Materiales básicos para una reparación',
        resumen: 'Una lista sencilla para preparar reparaciones pequeñas sin comprar materiales de más.',
        contenido: [
            'Para una reparación pequeña primero se debe revisar bien la zona y calcular aproximadamente cuánto material será necesario. Esto ayuda a evitar viajes extra y también reduce los sobrantes.',
            'Algunos materiales comunes son cemento, mortero, arena, tornillos, cinta de enmascarar y pintura. La elección depende del tipo de superficie y de si el trabajo será realizado en interior o exterior.',
            'Además de los materiales, es bueno tener elementos de seguridad como guantes, lentes y mascarilla. Antes de comenzar hay que limpiar el lugar y leer las indicaciones de cada producto.',
        ],
        consejo: 'Si tienes dudas sobre una medida o material, anótala antes de venir a la ferretería.',
    },
};

export default function VistaBlog() {
    //cuando cambia el ?articulo= de la url, la pagina se vuelve a dibujar sola
    //use search params vigila el cambio y redibuja
    const [parametros] = useSearchParams();
    //aqui se busca en la url el parametro llamado articulo y se obtiene su valor
    const claveArticulo = parametros.get('articulo');

    //si la llave no existe o no viene en la url, se muestra la de herramientas
    const publicacion = publicaciones[claveArticulo] || publicaciones.herramientas;

    return (
        <main className="flex-1">
            {/*en react 19 el title se puede escribir aqui y react lo pone en el head
            reemplaza a document.title*/}
            <title>{`${publicacion.titulo} | Blog Los Maestros`}</title>

            <section className="border-b border-amber-200 bg-amber-50">
                <div className="page-shell py-10 sm:py-14">
                    <Link className="text-sm font-semibold text-stone-500 hover:text-amber-700" to="/">← Volver al inicio</Link>
                    <p className="mt-8 text-xs font-bold uppercase tracking-widest text-amber-700">{publicacion.categoria}</p>
                    <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{publicacion.titulo}</h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">{publicacion.resumen}</p>
                </div>
            </section>

            <div className="page-shell grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
                <article className="rounded-xl border border-stone-200 bg-white p-6 sm:p-9">
                    <img className="mb-7 h-56 w-full rounded-lg bg-stone-100 object-contain p-8" src={sinImagen} alt="Publicación sin imagen disponible" />
                    {/*un parrafo por cada texto del contenido, reemplaza al map con innerHTML*/}
                    <div className="space-y-5 leading-8 text-stone-700">
                        {publicacion.contenido.map((parrafo, indice) => (
                            <p key={indice}>{parrafo}</p>
                        ))}
                    </div>
                    <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Consejo de Los Maestros</p>
                        <p className="mt-2 font-semibold">{publicacion.consejo}</p>
                    </div>
                </article>

                <aside className="h-fit rounded-xl border border-stone-200 bg-white p-5" aria-labelledby="other-posts-title">
                    <h2 id="other-posts-title" className="text-lg font-bold">Más publicaciones</h2>
                    <div className="mt-4 space-y-3">
                        <Link className="block rounded-lg border border-stone-200 p-4 hover:border-amber-500 hover:bg-amber-50" to="/vista-blog?articulo=herramientas">
                            <span className="text-xs font-bold uppercase text-amber-700">Consejos</span>
                            <strong className="mt-1 block">Cómo elegir una herramienta</strong>
                        </Link>
                        <Link className="block rounded-lg border border-stone-200 p-4 hover:border-amber-500 hover:bg-amber-50" to="/vista-blog?articulo=reparacion">
                            <span className="text-xs font-bold uppercase text-amber-700">Construcción</span>
                            <strong className="mt-1 block">Materiales para una reparación</strong>
                        </Link>
                    </div>
                </aside>
            </div>
        </main>
    );
}
