import clientesMock from '../mocks/clientes.json';
import usuariosMock from '../mocks/usuarios.json';
import { crearClienteDTO } from '../models/Cliente';
import { leer, esperar, guardar } from './storage';

const CLAVE = 'clientes';
const CLAVE_USUARIOS = 'usuarios';

export const TIPOS_CLIENTE = ['particular', 'contratista']; 

function calcularCuentaCorriente(tipoCliente, cuentaCorrienteHabilitada) {
  return tipoCliente === 'contratista' && cuentaCorrienteHabilitada === true;
}

//devuelve todos los clientes con sus datos de usuario
export async function listarClientes() {
  await esperar();
  const clientes = leer(CLAVE, clientesMock);
  const usuarios = leer(CLAVE_USUARIOS, usuariosMock);

  //por cada cliente busca su usuario, tienen el mismo id

  //el return de adentro retorna un dto por cliente
  //map junta esos dto en una lista
  //el primer return retorna esa lista
  return clientes.map((cliente) => {
    const usuario = usuarios.find((u) => u.id === cliente.id);
    return crearClienteDTO(cliente, usuario);
  });
}

//devuelve un cliente segun su id
export async function obtenerCliente(id) {
  await esperar();
  const clientes = leer(CLAVE, clientesMock);
  const usuarios = leer(CLAVE_USUARIOS, usuariosMock);

  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) throw new Error('Cliente no encontrado');

  const usuario = usuarios.find((u) => u.id === id);
  return crearClienteDTO(cliente, usuario);
}

export async function crearCliente(id, datos) {
  await esperar();
  if (!TIPOS_CLIENTE.includes(datos.tipoCliente)) {
    throw new Error('Selecciona si el cliente es particular o contratista');
  }
 
  const clientes = leer(CLAVE, clientesMock);
  if (clientes.some((c) => c.id === id)) throw new Error('Este usuario ya es cliente');
 
  const nuevo = {
    id,
    tipoCliente: datos.tipoCliente,
    cuentaCorrienteHabilitada: calcularCuentaCorriente(datos.tipoCliente, datos.cuentaCorrienteHabilitada),
    saldoAdeudado: 0,
  };
 
  clientes.push(nuevo);
  guardar(CLAVE, clientes);
 
  const usuarios = leer(CLAVE_USUARIOS, usuariosMock);
  const usuario = usuarios.find((u) => u.id === id);
  return crearClienteDTO(nuevo, usuario);
}

//actualiza si es particular o contratista y si tiene cuenta corriente habilitada
export async function actualizarCliente(id, datos) {
  await esperar();
  if (!TIPOS_CLIENTE.includes(datos.tipoCliente)) {
    throw new Error('Selecciona si el cliente es particular o contratista');
  }
 
  const clientes = leer(CLAVE, clientesMock);
  const indice = clientes.findIndex((c) => c.id === id);
  if (indice === -1) throw new Error('Cliente no encontrado');
 
  const cuentaCorriente = calcularCuentaCorriente(datos.tipoCliente, datos.cuentaCorrienteHabilitada);
 
  //si se le quita la cuenta corriente a alguien que debe, se perderia la forma de cobrarle
  if (!cuentaCorriente && clientes[indice].saldoAdeudado > 0) {
    throw new Error('No se puede quitar la cuenta corriente a un cliente con deuda pendiente');
  }
 
  clientes[indice] = {
    ...clientes[indice],
    tipoCliente: datos.tipoCliente,
    cuentaCorrienteHabilitada: cuentaCorriente,
  };
 
  guardar(CLAVE, clientes);
 
  const usuarios = leer(CLAVE_USUARIOS, usuariosMock);
  const usuario = usuarios.find((u) => u.id === id);
  return crearClienteDTO(clientes[indice], usuario);
}

export async function eliminarCliente(id) {
  await esperar();
  const clientes = leer(CLAVE, clientesMock);
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) throw new Error('Cliente no encontrado');
 
  if (cliente.saldoAdeudado > 0) {
    throw new Error('El cliente tiene deuda pendiente en su cuenta corriente');
  }
 
  guardar(CLAVE, clientes.filter((c) => c.id !== id));
}
