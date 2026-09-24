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
                        <li><a className="footer-link" href="./index.html">Inicio</a></li>
                        <li><a className="footer-link" href="./productos.html">Productos</a></li>
                        <li><a className="footer-link" href="./carrito.html">Carrito</a></li>
                        <li><a className="footer-link" href="./vista_blog.html">Blog</a></li>
                    </ul>
                </div>

                <div>
                    <h2 className="font-bold text-white">Mi cuenta</h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li><a className="footer-link" href="./vista_login.html">Ingresar</a></li>
                        <li><a className="footer-link" href="./vista_registrarse.html">Crear cuenta</a></li>
                        <li><a className="footer-link" href="./carrito.html">Mi carrito</a></li>
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
                    <a className="footer-link mt-3 inline-block text-sm" href="./vista_contacto.html">
                        Información de contacto
                    </a>
                </div>
            </div>

            <div className="border-t border-stone-700 py-4 text-center text-xs">
                Proyecto académico DSY1104 · 2026
            </div>
        </footer>
    );
}

export default Footer;