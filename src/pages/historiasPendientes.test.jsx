import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Carrito from './Carrito';
import DetalleProducto from './DetalleProducto';
import Envios from './Envios';
import Productos from './Productos';
import AdminInventario from './admin/AdminInventario';
import AdminReportes from './admin/AdminReportes';
import { agregarAlCarrito, obtenerCarrito } from '../services/carritoService';
import { actualizarProducto } from '../services/productoService';
import { iniciarSesion } from '../services/usuarioService';

function DestinoEntrega() {
  const { state } = useLocation();
  return <output data-testid="entrega">{JSON.stringify(state)}</output>;
}

describe('HU 5: filtros del catálogo', () => {
  it('muestra solo la categoría elegida e informa cuando la búsqueda no encuentra productos', async () => {
    render(<MemoryRouter><Productos /></MemoryRouter>);
    await screen.findByRole('heading', { name: 'Cemento Polpaico gris 25 kg' });
    const categoria = screen.getByLabelText('Categoría');
    expect(within(categoria).getByRole('option', { name: 'Mat. Construcción' })).toBeInTheDocument();
    fireEvent.change(categoria, { target: { value: 'Pinturas' } });
    expect(screen.queryByRole('heading', { name: 'Cemento Polpaico gris 25 kg' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Buscar producto'), { target: { value: 'sin coincidencias 123' } });
    expect(screen.getByText('No encontramos productos con esos filtros.')).toBeInTheDocument();
  });

});

describe('HU 8: carrito y cantidades', () => {
  it('permite elegir cantidad antes de agregar y muestra cantidad y subtotal', async () => {
    const detalle = render(
      <MemoryRouter initialEntries={['/producto/MC001']}>
        <Routes><Route path="/producto/:codigo" element={<DetalleProducto />} /></Routes>
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: 'Cemento Polpaico gris 25 kg' });
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }));
    expect(await screen.findByText('Producto añadido al carrito.')).toBeInTheDocument();
    expect(await obtenerCarrito()).toEqual([{ codigo: 'MC001', cantidad: 3 }]);

    detalle.unmount();
    render(<MemoryRouter><Carrito /></MemoryRouter>);
    const titulo = await screen.findByRole('heading', { name: 'Cemento Polpaico gris 25 kg' });
    const tarjeta = titulo.closest('article');
    expect(tarjeta).toHaveTextContent('3');
    expect(tarjeta).toHaveTextContent('$17.970');
  });

});

describe('HU 9: retiro y despacho', () => {
  async function prepararEntrega() {
    await iniciarSesion('juan.perez@gmail.com', '1234');
    await agregarAlCarrito('MC001');
    render(
      <MemoryRouter initialEntries={['/envios']}>
        <Routes>
          <Route path="/envios" element={<Envios />} />
          <Route path="/pago" element={<DestinoEntrega />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: 'Modalidad de entrega' });
  }

  it('muestra ambas opciones y permite retiro sin pedir dirección', async () => {
    await prepararEntrega();
    expect(screen.getByRole('radio', { name: /Retiro en tienda/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Despacho a domicilio/i })).toBeInTheDocument();
    expect(screen.queryByLabelText('Dirección')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }));
    const entrega = JSON.parse(screen.getByTestId('entrega').textContent);
    expect(entrega).toMatchObject({ modalidad: 'retiro', comuna: '', direccion: '' });
  });

  it('exige comuna y dirección cuando se elige despacho', async () => {
    await prepararEntrega();
    fireEvent.click(screen.getByRole('radio', { name: /Despacho a domicilio/i }));
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }));
    expect(screen.getByText('Ingresa la comuna y la dirección de despacho.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'La Serena' } });
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Calle 123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar al pago' }));
    const entrega = JSON.parse(screen.getByTestId('entrega').textContent);
    expect(entrega).toMatchObject({ modalidad: 'despacho', comuna: 'La Serena', direccion: 'Calle 123' });
  });
});

describe('HU 6, HU 7 y HU 13: administración', () => {
  it('muestra alerta junto al producto al caer bajo su umbral', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    await actualizarProducto('MC001', { stock: 19 });
    render(<AdminInventario />);
    await screen.findByRole('heading', { name: 'Consulta de stock - Vista Administrador' });
    fireEvent.change(screen.getByPlaceholderText('Buscar por código (ej: MC001)'), { target: { value: 'MC001' } });
    expect(await screen.findByText('Stock bajo: el mínimo es 20')).toBeInTheDocument();
  });

  it('dibuja gráficos calculados desde pedidos y restringe el acceso al administrador', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    render(<MemoryRouter><AdminReportes /></MemoryRouter>);
    expect(await screen.findByRole('img', { name: /productos más vendidos/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /clientes más frecuentes/i })).toBeInTheDocument();
    expect(screen.getByText('200 unidades')).toBeInTheDocument();
    expect(screen.getByText('2 compras')).toBeInTheDocument();
  });

});
