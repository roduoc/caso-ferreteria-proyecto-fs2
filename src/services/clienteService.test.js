import { describe, expect, it } from 'vitest';
import { actualizarCliente, crearCliente, eliminarCliente, listarClientes, obtenerCliente } from './clienteService';
import { iniciarSesion, crearUsuario } from './usuarioService';

const datos = {
  rut: '176543218', nombre: 'María', apellidos: 'López', correo: 'maria@gmail.com',
  clave: 'abcd', rol: 'vendedor', region: 'Coquimbo', comuna: 'La Serena', direccion: 'Calle Uno 123',
};

describe('clienteService', () => {
  it('lista y obtiene clientes con sus datos de usuario', async () => {
    const clientes = await listarClientes();
    expect(clientes.some((c) => c.id === 4 && c.nombreCompleto && c.cuentaCorrienteHabilitada)).toBe(true);
    expect((await obtenerCliente(3)).correo).toBe('juan.perez@gmail.com');
    await expect(obtenerCliente(999)).rejects.toThrow(/no encontrado/i);
  });

  it('crea un registro de contratista con crédito y luego lo elimina', async () => {
    await iniciarSesion('admin@duoc.cl', '1234');
    const usuario = await crearUsuario(datos);
    const cliente = await crearCliente(usuario.id, { tipoCliente: 'contratista', cuentaCorrienteHabilitada: true });
    expect(cliente.saldoAdeudado).toBe(0);
    expect(cliente.cuentaCorrienteHabilitada).toBe(true);
    await expect(crearCliente(usuario.id, { tipoCliente: 'contratista' })).rejects.toThrow(/ya es cliente/i);
    await eliminarCliente(usuario.id);
    await expect(obtenerCliente(usuario.id)).rejects.toThrow(/no encontrado/i);
  });

  it('solo habilita crédito a contratistas y protege cuentas con deuda', async () => {
    await expect(crearCliente(90, { tipoCliente: 'otro' })).rejects.toThrow(/particular o contratista/i);
    const actualizado = await actualizarCliente(3, { tipoCliente: 'particular', cuentaCorrienteHabilitada: true });
    expect(actualizado.cuentaCorrienteHabilitada).toBe(false);
    await expect(actualizarCliente(4, { tipoCliente: 'particular' })).rejects.toThrow(/deuda pendiente/i);
    await expect(eliminarCliente(4)).rejects.toThrow(/deuda pendiente/i);
  });

  it('rechaza modificaciones a clientes inexistentes o tipos inválidos', async () => {
    await expect(actualizarCliente(3, { tipoCliente: 'otro' })).rejects.toThrow(/particular o contratista/i);
    await expect(actualizarCliente(999, { tipoCliente: 'particular' })).rejects.toThrow(/no encontrado/i);
    await expect(eliminarCliente(999)).rejects.toThrow(/no encontrado/i);
  });
});
