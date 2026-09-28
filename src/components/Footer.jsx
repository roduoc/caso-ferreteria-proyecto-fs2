import { Link, NavLink } from 'react-router-dom';

function Footer() {
    return (
        <footer id="contacto" className="bg-stone-900 text-stone-300">
            <div className="page-shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <h2 className="text-lg font-bold text-white">Ferretería Los Maestros</h2>
                    <p className="mt-3 max-w-md text-sm leading-6">
                        Materiales, herramientas y ferretería general para hogares y profesionales.
                    </p>
                </div>

                <div>
                    <h2 className="font-bold text-white">Enlaces</h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li><NavLink className="footer-link" to="/">Inicio</NavLink></li>
                        <li><NavLink className="footer-link" to="/productos">Productos</NavLink></li>
                        <li><NavLink className="footer-link" to="/carrito">Carrito</NavLink></li>
                        <li><NavLink className="footer-link" to="/vista-blog">Blog</NavLink></li>
                    </ul>
                </div>

                <div>
                    <h2 className="font-bold text-white">Mi cuenta</h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li><NavLink className="footer-link" to="/login">Ingresar</NavLink></li>
                        <li><NavLink className="footer-link" to="/registro">Crear cuenta</NavLink></li>
                        <li><NavLink className="footer-link" to="/carrito">Mi carrito</NavLink></li>
                    </ul>
                </div>

                <div>
                    <h2 className="font-bold text-white">Contacto</h2>
                    <address className="mt-3 space-y-2 text-sm not-italic">
                        <p>La Serena, Región de Coquimbo</p>
                        <p>
                            <a className="footer-link" href="tel:+56512000000">+56 51 200 0000</a>
                        </p>
                        <p>
                            <a className="footer-link" href="mailto:ventas@losmaestros.cl">ventas@losmaestros.cl</a>
                        </p>
                    </address>
                    <NavLink className="footer-link mt-3 inline-block text-sm" to="/sobre-nosotros">
                        Información de contacto
                    </NavLink>
                </div>
            </div>

            <div className="border-t border-stone-700 py-4 text-center text-xs">
                Proyecto académico DSY1104 · 2026
            </div>
        </footer>
    );
}

export default Footer;