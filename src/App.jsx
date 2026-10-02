//routes es en el contenedor de rutas
//route cada ruta individual
import { Routes, Route } from 'react-router-dom';

import LayoutNormal from './layouts/LayoutNormal';
import LayoutAdmin from './layouts/LayoutAdmin';

import Home from './pages/Home';
import Productos from './pages/Productos.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Registro from './pages/Registro';
import SobreNosotros from './pages/SobreNosotros';
import Envios from './pages/Envios';
import MisPedidos from './pages/MisPedidos';
import MiCredito from './pages/MiCredito';
import VistaBlog from './pages/VistaBlog';
import Pago from './pages/Pago';
import CompraExitosa from './pages/CompraExitosa';
import CompraFallida from './pages/CompraFallida';

import VendedorInventario from './pages/vendedor/VendedorInventario';
import VendedorGestionPedidos from './pages/vendedor/VendedorGestionPedidos';

import AdminGestionPedidos from './pages/admin/AdminGestionPedidos';
import AdminInventario from './pages/admin/AdminInventario';
import AdminGestionUsuarios from './pages/admin/AdminGestionUsuarios';
import AdminGestionUsuariosEditar from './pages/admin/AdminGestionUsuariosEditar';
import AdminReportes from './pages/admin/AdminReportes';
import AdminHistorial from './pages/admin/AdminHistorial';
import AdminHistorialVer from './pages/admin/AdminHistorialVer';
import AdminCredito from './pages/admin/AdminCredito.jsx'

const linksVendedor = [
  { ruta: '/vendedor/inventario', texto: 'Inventario' },
  { ruta: '/vendedor/pedidos', texto: 'Gestión de pedidos' },
];

const linksAdmin = [
  { ruta: '/admin/pedidos', texto: 'Gestión de pedidos' },
  { ruta: '/admin/inventario', texto: 'Inventario' },
  { ruta: '/admin/usuarios', texto: 'Gestión de usuarios' },
  { ruta: '/admin/reportes', texto: 'Reportes' },
  { ruta: '/admin/historial', texto: 'Historial' },
  { ruta: '/admin/credito', texto: 'Crédito'},
];

export default function App() {
  return (
    <Routes>
      {/* */}
      {/*element le dice que componente mostrar en esa ruta
      al estar los layout a la misma altura o nivel dentro de routes
      dibujar uno destruye el otro*/}
      <Route element={<LayoutNormal />}>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/producto/:codigo" element={<DetalleProducto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/vista-blog" element={<VistaBlog />} />
      </Route>

      <Route element={<LayoutNormal rol="cliente" />}>
        <Route path="/envios" element={<Envios />} />
        <Route path="/pago" element={<Pago />} />
        <Route path="/compra-exitosa" element={<CompraExitosa />} />
        <Route path="/compra-fallida" element={<CompraFallida />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/mi-credito" element={<MiCredito />} />
      </Route>

      {/*links y subtitulo son datos para el layoutpanel*/}
      <Route element={<LayoutAdmin links={linksVendedor} subtitulo="Panel de vendedor" rol="vendedor" />}>
        <Route path="/vendedor/inventario" element={<VendedorInventario />} />
        <Route path="/vendedor/pedidos" element={<VendedorGestionPedidos />} />
      </Route>

      <Route element={<LayoutAdmin links={linksAdmin} subtitulo="Panel de administrador" rol="admin" />}>
        <Route path="/admin/pedidos" element={<AdminGestionPedidos />} />
        <Route path="/admin/inventario" element={<AdminInventario />} />
        <Route path="/admin/usuarios" element={<AdminGestionUsuarios />} />
        <Route path="/admin/usuarios/:id" element={<AdminGestionUsuariosEditar />} />
        <Route path="/admin/reportes" element={<AdminReportes />} />
        <Route path="/admin/historial" element={<AdminHistorial />} />
        <Route path="/admin/historial/:id" element={<AdminHistorialVer />} />
        <Route path="/admin/credito" element={<AdminCredito /> } />
      </Route>
    </Routes>
  );
}
