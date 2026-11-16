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
import {
  clientesDePrueba, pedidos, rutasCatalogo, sesionDePrueba, simularApi,
} from '../test/apiSimulada';

describe('HU 4: catálogo sin autenticación', () => {
  it('UT-06: muestra nombre, precio y el stock actualizado al entrar', async () => {
    simularApi(rutasCatalogo({ MC001: { stock: 7 } }));
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

  it('UT-18: ofrece crédito habilitado y envía la modalidad de cuenta corriente', async () => {
    sesionDePrueba(4);
    const fetch = simularApi({
      ...rutasCatalogo(),
      'GET /api/clientes/4': { cuerpo: clientesDePrueba[1] },
      'POST /api/pedidos': { estado: 201, cuerpo: { id: 8, total: 9980 } },
    });
    await agregarAlCarrito('MC001');
    mostrarPago();
    const opcion = await screen.findByRole('radio', { name: /Cuenta corriente|Pagar con crédito/i });
    fireEvent.click(opcion);
    fireEvent.click(screen.getByRole('button', { name: /Confirmar pago|Confirmar compra a crédito/i }));
    expect(await screen.findByText('Compra registrada')).toBeInTheDocument();
    expect(JSON.parse(fetch.mock.lastCall[1].body)).toMatchObject({
      clienteId: 4, medioPago: 'cuenta_corriente', entrega: { modalidad: 'despacho' },
    });
  });

  it('UT-19: no muestra crédito a un cliente particular', async () => {
    sesionDePrueba(3);
    const fetch = simularApi({
      ...rutasCatalogo(),
      'GET /api/clientes/3': { cuerpo: clientesDePrueba[0] },
    });
    await agregarAlCarrito('MC001');
    mostrarPago();
    await waitFor(() => expect(fetch.mock.calls.some(([url]) => url.endsWith('/api/clientes/3'))).toBe(true));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirmar pago' })).toBeEnabled());
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

  it('UT-05 / UT-23: impide entrar a un cliente', async () => {
    sesionDePrueba(3);
    mostrarPanel();
    expect(screen.getByText('Inicia sesión')).toBeInTheDocument();
  });

  it('UT-05 / UT-23: permite entrar a un administrador', async () => {
    sesionDePrueba(1);
    mostrarPanel();
    expect(screen.getByText('Historial de clientes')).toBeInTheDocument();
  });
});

describe('HU 10 y HU 12: consultas de pedidos', () => {
  it('UT-16: muestra al cliente solo sus pedidos y su estado actual', async () => {
    sesionDePrueba(3);
    simularApi({
      'GET /api/pedidos/cliente/3': { cuerpo: [pedidos[0], pedidos[2]] },
      'GET /api/clientes/3': { cuerpo: clientesDePrueba[0] },
    });
    render(<MemoryRouter><MisPedidos /></MemoryRouter>);
    expect(await screen.findByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Entregado')).toBeInTheDocument();
    expect(screen.queryByText('En preparación')).not.toBeInTheDocument();
  });

  it('UT-23: permite al administrador buscar un cliente y ver fechas y montos de sus compras', async () => {
    sesionDePrueba(1);
    simularApi({
      'GET /api/clientes': { cuerpo: clientesDePrueba },
      'GET /api/clientes/3': { cuerpo: clientesDePrueba[0] },
      'GET /api/pedidos/cliente/3': { cuerpo: [pedidos[0], pedidos[2]] },
    });
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
