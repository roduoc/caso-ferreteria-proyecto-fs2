export function crearClienteDTO(cliente, usuario) {
  return {
    id: cliente.id,
    rut: usuario.rut,
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    nombreCompleto: `${usuario.nombre} ${usuario.apellidos}`,
    correo: usuario.correo,
    //datos de la direccion, para prellenar la vista de envio
    region: usuario.region,
    comuna: usuario.comuna,
    direccion: usuario.direccion,
    
    tipoCliente: cliente.tipoCliente,
    cuentaCorrienteHabilitada: cliente.cuentaCorrienteHabilitada,
    saldoAdeudado: cliente.saldoAdeudado,
  };
}