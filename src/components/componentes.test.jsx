import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Footer from './Footer';
import FooterAdmin from './FooterAdmin';
import Navbar from './Navbar';
import NavbarAdmin from './NavbarAdmin';
import TarjetaPedido from './TarjetaPedido';
import TarjetaStock from './TarjetaStock';
import { agregarAlCarrito } from '../services/carritoService';
import { iniciarSesion, obtenerSesion } from '../services/usuarioService';

const enRouter = (componente) => render(<MemoryRouter>{componente}</MemoryRouter>);

describe('navegación pública y de administrador', () => {
  it('muestra enlaces públicos, registro, catálogo y contador del carrito sin iniciar sesión', async () => {
    enRouter(<><Navbar /><Footer /><FooterAdmin /></>);
    expect(screen.getAllByRole('link', { name: 'Crear cuenta' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Productos' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Carrito con 0 productos/i })).toBeInTheDocument();
    await agregarAlCarrito('MC001', 2);
    await waitFor(() => expect(screen.getByRole('link', { name: /Carrito con 2 productos/i })).toBeInTheDocument());
  });

  it('permite abrir y cerrar el menú móvil y cerrar sesión', async () => {
    await iniciarSesion('juan.perez@gmail.com', '1234');
    enRouter(<Navbar />);
    expect(screen.getAllByRole('link', { name: 'Mis pedidos' }).length).toBeGreaterThan(0);
    await userEvent.click(document.getElementById('menu-button'));
    expect(document.getElementById('mobile-menu')).not.toHaveAttribute('hidden');
    fireEvent.click(screen.getAllByRole('link', { name: 'Cerrar sesión' })[0]);
    expect(obtenerSesion()).toBeNull();
  });

  it('muestra el panel y cierra sesión desde su cabecera', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    enRouter(<NavbarAdmin />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.getElementById('mobile-menu')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('link', { name: 'Cerrar sesión' })[0]);
    expect(obtenerSesion()).toBeNull();
  });
});

describe('tarjetas de gestión', () => {
  const pedido = { id: 18, estado: 'Pendiente' };
  const producto = { codigo: 'MC001', nombre: 'Cemento', precio: 5990, stock: 2, stockBajo: true, stockMinimo: 5 };

  it('muestra los cuatro estados y guarda el estado elegido', async () => {
    const onCambiarEstado = vi.fn().mockResolvedValue(undefined);
    render(<TarjetaPedido pedido={pedido} onCambiarEstado={onCambiarEstado} />);
    expect(screen.getAllByRole('option')).toHaveLength(4);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Despachado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Editar estado' }));
    await waitFor(() => expect(onCambiarEstado).toHaveBeenCalledWith(18, 'Despachado'));
    expect(await screen.findByText('Estado actualizado correctamente')).toBeInTheDocument();
  });

  it('muestra el error si no se puede cambiar el estado', async () => {
    render(<TarjetaPedido pedido={pedido} onCambiarEstado={vi.fn().mockRejectedValue(new Error('Estado bloqueado'))} />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar estado' }));
    expect(await screen.findByText('Estado bloqueado')).toBeInTheDocument();
  });

  it('muestra stock bajo y permite editar precio, stock y eliminar', async () => {
    const onGuardar = vi.fn().mockResolvedValue(undefined);
    const onEliminar = vi.fn();
    render(<TarjetaStock producto={producto} onGuardar={onGuardar} onEliminar={onEliminar} mostrarStockBajo />);
    expect(screen.getByText(/Stock bajo:/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Nuevo precio'), { target: { value: '6500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Editar precio' }));
    await waitFor(() => expect(onGuardar).toHaveBeenCalledWith('MC001', { precio: '6500' }));
    fireEvent.change(screen.getByPlaceholderText('Nueva cantidad'), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Editar cantidad' }));
    await waitFor(() => expect(onGuardar).toHaveBeenCalledWith('MC001', { stock: '8' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onEliminar).toHaveBeenCalledWith('MC001');
  });

  it('muestra un error al fallar la actualización y oculta acciones opcionales', async () => {
    render(<TarjetaStock producto={{ ...producto, stockBajo: false }} onGuardar={vi.fn().mockRejectedValue(new Error('Precio inválido'))} mostrarStockBajo />);
    expect(screen.queryByText(/Stock bajo:/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar precio' }));
    expect(await screen.findByText('Precio inválido')).toBeInTheDocument();
  });
});
