import { llamarApi } from './api';

export const TIPOS_CLIENTE = ['particular', 'contratista'];

function datosCliente(datos) {
  if (!TIPOS_CLIENTE.includes(datos.tipoCliente)) {
    throw new Error('Selecciona si el cliente es particular o contratista');
  }
  return {
    tipoCliente: datos.tipoCliente,
    cuentaCorrienteHabilitada: datos.tipoCliente === 'contratista' && datos.cuentaCorrienteHabilitada === true,
  };
}

export async function listarClientes() {
  return llamarApi('/api/clientes');
}

export async function obtenerCliente(id) {
  return llamarApi(`/api/clientes/${encodeURIComponent(id)}`);
}

//al crear un usuario cliente, el backend ya crea ambos registros juntos
export async function crearCliente(id, datos) {
  return llamarApi('/api/clientes', {
    metodo: 'POST',
    datos: { id: Number(id), ...datosCliente(datos) },
  });
}

export async function actualizarCliente(id, datos) {
  return llamarApi(`/api/clientes/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    datos: datosCliente(datos),
  });
}

export async function eliminarCliente(id) {
  await llamarApi(`/api/clientes/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}
