//dto de salida de producto: la forma que tienen los productos que reciben los componentes
export function crearProductoDTO(p) {
  return {
    codigo: p.codigo,
    nombre: p.nombre,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    marca: p.marca,
    unidad: p.unidad,
    precio: p.precio,
    stock: p.stock,
    stockMinimo: p.stockMinimo,
    //true si quedan pocas unidades, sirve para marcar el producto en el inventario como stock bajo
    stockBajo: p.stock <= p.stockMinimo,
  };
}
