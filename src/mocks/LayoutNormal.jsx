//outlet es el espacio dentro del layout donde react router pone la pagina
//correspondiente a la url
//navigate redirige a otra pagina apenas se dibuja
//uselocation dice en que url estamos
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { obtenerSesion } from '../services/usuarioService';

//rol es opcional: si no se pasa, las paginas quedan abiertas para todos
export default function LayoutNormal({ rol }) {
    //'use no memo' apaga el react compiler solo en este componente
    //el compiler guarda el resultado de obtenerSesion() la primera vez y no se entera
    //cuando cambia localStorage, asi que sin esto la sesion quedaria desactualizada
    'use no memo';
    const location = useLocation();

    //si este grupo de paginas pide un rol, se revisa la sesion igual que en LayoutAdmin
    //desde guarda la pagina a la que se queria entrar, para volver ahi despues del login
    if (rol) {
        const sesion = obtenerSesion();
        if (!sesion || sesion.rol !== rol) {
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
