import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import TarjetaProducto from './TarjetaProducto';

const producto = {
  codigo: 'HM001',
  nombre: 'Martillo carpintero 500g',
  categoria: 'Herramientas',
  marca: 'Stanley',
  unidad: 'Unidad',
  precio: 7990,
  stock: 20,
};

describe('TarjetaProducto', () => {
  it('renderiza la información recibida mediante props', () => {
    render(
      <MemoryRouter>
        <TarjetaProducto producto={producto} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: producto.nombre })).toBeInTheDocument();
    expect(screen.getByText('20 unidades disponibles')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver producto' })).toHaveAttribute('href', '/producto/HM001');
  });

  it('muestra un mensaje cuando el producto no tiene stock', () => {
    render(
      <MemoryRouter>
        <TarjetaProducto producto={{ ...producto, stock: 0 }} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Sin stock')).toBeInTheDocument();
  });
});
