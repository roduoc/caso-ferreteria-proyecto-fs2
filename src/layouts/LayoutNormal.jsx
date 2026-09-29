//outlet es el espacio dentro del layout donde react router pone la pagina 
//correspondiente a la url
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { obtenerSesion } from '../services/usuarioService';

export default function LayoutNormal({rol}) {
    //use no memo excluye a este componente de la memorizacion automatica
    //en cada render se evaluan de nuevo todas las expresiones
    //se usa porque obtener sesion no recibe props ni estados, y eso significa
    //que nunca cambia para el compiler, entonces la ejecuta una sola vez y luego la lee desde ahí

    //obtener sesion lee localstorage, y localstorage esta fuera de react
    //cuando se inicia sesion localstorage cambia pero el compiler no se entera
    //y sigue leyendo el primer obtener sesion

    //la sesion ya se habia actualizado al iniciar sesion
    //pero al re renderizar con el cambio de url se vuelve a leer obtener session
    //la diferencia es que al re renderizar lo hace volviendo a leer las expresiones
    //y no leyendo las que ya habia

    //al cambiar de pagina se re renderiza layout y sus hijos
    //que es el outlet, o sea, la pagina actual se re renderiza tambien

    //cuando se cambia de outlet cambia el tipo de componente y se redibuja
    //pero el navbar no cambia entre vistas privadas y publicas de clientes

    'use no memo';

    //nos permite recordar la pagina actual para poder volver a ella despues de iniciar sesion
    //pero tambien es importante que usar use location redibuja cada vez que cambia la url

    const location = useLocation();

    //si este grupo de paginas pide un rol, se revisa la sesion igual que en LayoutAdmin
    //desde guarda la pagina a la que se queria entrar, para volver ahi despues del login
    if (rol) {
        const sesion = obtenerSesion();
        if (!sesion || sesion.rol !== rol) {
            //location, uselocation, devuelve un objeto con informacion de la url actual
            //como su pathname (/login),  search, lo que va despues de ?
            //y state, la nota que trajo si le enviaron una

            //state son datos que viajan con la navegacion
            //permite mandar datos a la pagina de destino sin ponerlos en la url
            //es como una nota

            //state le manda una nota a login con su ubicacion actual, la de uselocation

            //el state queda registrado a modo de return, quiere decir que
            //se guarda el state con la url en la que estabamos y se termina la funcion
            //antes de llegar a outlet, entonces no se muestra la pagina
            return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
        }
    }
    return (
        <>
        <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900">
            <Navbar />
            <Outlet />
            <Footer />
        </div>
            
        </>
        

    );
}