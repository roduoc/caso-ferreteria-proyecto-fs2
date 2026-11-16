import { describe, expect, it } from 'vitest';
import { actualizarCliente, crearCliente, eliminarCliente, listarClientes, obtenerCliente } from './clienteService';
import { clientesDePrueba, sesionDePrueba, simularApi } from '../test/apiSimulada';

describe('clienteService', () => {
  it('UT-22: lista y consulta clientes con sus datos de usuario', async () => {
    sesionDePrueba(1);
    simularApi({
      'GET /api/clientes': { cuerpo: clientesDePrueba },
      'GET /api/clientes/3': { cuerpo: clientesDePrueba[0] },
      'GET /api/clientes/999': { estado: 404, cuerpo: { mensaje: 'Cliente no encontrado' } },
    });
    expect((await listarClientes()).find(({ id }) => id === 4)).toMatchObject({
      nombreCompleto: 'Ana Torres Fuentes', cuentaCorrienteHabilitada: true,
    });
    await expect(obtenerCliente(3)).resolves.toMatchObject({ correo: 'juan.perez@gmail.com' });
    await expect(obtenerCliente(999)).rejects.toThrow(/no encontrado/i);
  });

  it('UT-22: envía las operaciones de clientes y muestra los conflictos de deuda', async () => {
    sesionDePrueba(1);
    const cliente = { id: 6, tipoCliente: 'contratista', cuentaCorrienteHabilitada: true, saldoAdeudado: 0 };
    const fetch = simularApi({
      'POST /api/clientes': { estado: 201, cuerpo: cliente },
      'PUT /api/clientes/4': { estado: 409, cuerpo: { mensaje: 'El cliente tiene deuda pendiente' } },
      'DELETE /api/clientes/6': { estado: 204 },
    });
    await expect(crearCliente('6', cliente)).resolves.toEqual(cliente);
    expect(JSON.parse(fetch.mock.lastCall[1].body)).toEqual({
      id: 6, tipoCliente: 'contratista', cuentaCorrienteHabilitada: true,
    });
    await expect(actualizarCliente(4, { tipoCliente: 'particular' })).rejects.toThrow(/deuda pendiente/i);
    await expect(eliminarCliente(6)).resolves.toBeUndefined();
  });

  it('UT-22: valida el tipo de cliente antes de enviar la solicitud', async () => {
    await expect(crearCliente(90, { tipoCliente: 'otro' })).rejects.toThrow(/particular o contratista/i);
    await expect(actualizarCliente(3, { tipoCliente: 'otro' })).rejects.toThrow(/particular o contratista/i);
    expect(fetch).not.toHaveBeenCalled();
  });
});
