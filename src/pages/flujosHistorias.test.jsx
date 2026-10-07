import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Pago from './Pago';
import Productos from './Productos';
import MisPedidos from './MisPedidos';
import LayoutAdmin from '../layouts/LayoutAdmin';
import AdminHistorial from './admin/AdminHistorial';
import AdminHistorialVer from './admin/AdminHistorialVer';
import { agregarAlCarrito } from '../services/carritoService';
import { obtenerCliente } from '../services/clienteService';
import { actualizarProducto } from '../services/productoService';
import { cerrarSesion, iniciarSesion } from '../services/usuarioService';

describe('HU 4: catálogo sin autenticación', () => {
  it('muestra nombre, precio y el stock actualizado al entrar', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    await actualizarProducto('MC001', { stock: 7 });
    cerrarSesion();
    render(<MemoryRouter initialEntries={['/productos']}><Productos /></MemoryRouter>);
    const nombre = await screen.findByRole('heading', { name: 'Cemento Polpaico gris 25 kg' });
    const tarjeta = nombre.closest('article');
    expect(tarjeta).toHaveTextContent('Stock disponible: 7');
    expect(tarjeta).toHaveTextContent('$5.990');
    expect(localStorage.getItem('sesion')).toBeNull();
  });
});

describe('pago con crédito', () => {
  function mostrarPago() {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/pago', state: { modalidad: 'despacho', direccion: 'Calle 1', comuna: 'La Serena' } }]}>
        <Routes>
          <Route path="/pago" element={<Pago />} />
          <Route path="/compra-exitosa" element={<p>Compra registrada</p>} />
          <Route path="/carrito" element={<p>Carrito vacío</p>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('ofrece crédito habilitado y confirma el cargo completo a la deuda', async () => {
    const sesion = await iniciarSesion('ana.torres@gmail.com', '1234');
    const saldoAnterior = (await obtenerCliente(sesion.id)).saldoAdeudado;
    await agregarAlCarrito('MC001');
    mostrarPago();
    const opcion = await screen.findByRole('radio', { name: /Cuenta corriente|Pagar con crédito/i });
    fireEvent.click(opcion);
    fireEvent.click(screen.getByRole('button', { name: /Confirmar pago|Confirmar compra a crédito/i }));
    expect(await screen.findByText('Compra registrada')).toBeInTheDocument();
    expect((await obtenerCliente(sesion.id)).saldoAdeudado).toBe(saldoAnterior + 5990 + 3990);
  });

  it('no muestra crédito a un cliente particular', async () => {
    await iniciarSesion('juan.perez@gmail.com', '1234');
    await agregarAlCarrito('MC001');
    mostrarPago();
    await waitFor(() => expect(screen.getByText('Pago al contado')).toBeInTheDocument());
    expect(screen.queryByRole('radio', { name: /Pagar con crédito/i })).not.toBeInTheDocument();
  });
});

describe('HU 3 y HU 12: acceso al panel', () => {
  function mostrarPanel() {
    render(
      <MemoryRouter initialEntries={['/admin/historial']}>
        <Routes>
          <Route path="/login" element={<p>Inicia sesión</p>} />
          <Route element={<LayoutAdmin links={[]} subtitulo="Panel" rol="admin" />}>
            <Route path="/admin/historial" element={<p>Historial de clientes</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  }

  it('impide entrar a un cliente', async () => {
    await iniciarSesion('juan.perez@gmail.com', '1234');
    mostrarPanel();
    expect(screen.getByText('Inicia sesión')).toBeInTheDocument();
  });

  it('permite entrar a un administrador', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    mostrarPanel();
    expect(screen.getByText('Historial de clientes')).toBeInTheDocument();
  });
});

describe('HU 10 y HU 12: consultas de pedidos', () => {
  it('muestra al cliente solo sus pedidos y su estado actual', async () => {
    await iniciarSesion('juan.perez@gmail.com', '1234');
    render(<MemoryRouter><MisPedidos /></MemoryRouter>);
    expect(await screen.findByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Entregado')).toBeInTheDocument();
    expect(screen.queryByText('En preparación')).not.toBeInTheDocument();
  });

  it('permite al administrador buscar un cliente y ver fechas y montos de sus compras', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    render(
      <MemoryRouter initialEntries={['/admin/historial']}>
        <Routes>
          <Route path="/admin/historial" element={<AdminHistorial />} />
          <Route path="/admin/historial/:id" element={<AdminHistorialVer />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText('Juan Pérez Díaz')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre'), { target: { value: 'Juan' } });
    expect(screen.queryByText('Ana Torres Fuentes')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Ver historial de compras' }));
    expect(await screen.findByText('15/09/2026')).toBeInTheDocument();
    expect(screen.getByText('$34.760')).toBeInTheDocument();
  });
});
