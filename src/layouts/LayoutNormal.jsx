//outlet es el espacio dentro del layout donde react router pone la pagina 
//correspondiente a la url
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LayoutNormal() {
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