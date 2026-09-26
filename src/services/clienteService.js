import clientesMock from '../mocks/clientes.json';
import usuariosMock from '../mocks/usuarios.json';
import { crearClienteDTO } from '../models/Cliente';
import { leer, esperar } from './storage';

const CLAVE = 'clientes';
const CLAVE_USUARIOS = 'usuarios';

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
