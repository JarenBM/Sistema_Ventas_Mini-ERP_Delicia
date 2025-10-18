const productos = require('../data/productos.js');

let carrito = [];
let ventasRealizadas = [];

function buscarProducto(entrada) {
  const producto = productos.find(p => 
    p.nombre.toLowerCase() === entrada.toLowerCase() || 
    p.id === parseInt(entrada)
  );
  return producto;
}

function agregarAlCarrito(entradaProducto, cantidad) {
  const producto = buscarProducto(entradaProducto);
  
  if (!producto) {
    return { exito: false, mensaje: 'Producto no encontrado' };
  }
  
  if (isNaN(cantidad) || cantidad <= 0) {
    return { exito: false, mensaje: 'Cantidad debe ser un numero mayor a 0' };
  }
  
  const itemExistente = carrito.find(item => item.producto.id === producto.id);
  
  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({ producto, cantidad });
  }
  
  const subtotal = producto.precio * cantidad;
  return { 
    exito: true, 
    mensaje: `${producto.nombre} agregado (${cantidad} x S/${producto.precio.toFixed(2)} = S/${subtotal.toFixed(2)})` 
  };
}

function eliminarDelCarrito(entrada) {
  const index = carrito.findIndex(item => 
    item.producto.nombre.toLowerCase() === entrada.toLowerCase() || 
    item.producto.id === parseInt(entrada)
  );
  
  if (index === -1) {
    return { exito: false, mensaje: 'Producto no encontrado en el carrito' };
  }
  
  const productoEliminado = carrito[index].producto.nombre;
  carrito.splice(index, 1);
  return { exito: true, mensaje: `${productoEliminado} eliminado del carrito` };
}

function vaciarCarrito() {
  carrito = [];
  return 'Carrito vaciado';
}

function verCarrito() {
  return carrito;
}

function calcularTotales() {
  const subtotal = carrito.reduce((sum, item) => 
    sum + (item.producto.precio * item.cantidad), 0
  );
  
  let descuento = 0;
  if (subtotal > 100) {
    descuento = subtotal * 0.15;
  } else if (subtotal >= 50) {
    descuento = subtotal * 0.10;
  } else if (subtotal >= 20) {
    descuento = subtotal * 0.05;
  }
  
  const baseImponible = subtotal - descuento;
  const igv = baseImponible * 0.18;
  const total = baseImponible + igv;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    descuento: parseFloat(descuento.toFixed(2)),
    igv: parseFloat(igv.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
}

function generarTicket() {
  if (carrito.length === 0) {
    return { exito: false, mensaje: 'El carrito esta vacio' };
  }
  
  const totales = calcularTotales();
  
  let ticket = 'RESUMEN DE COMPRA\n';
  ticket += '---------------------\n';
  ticket += 'Producto       Cant.   Precio   Subtotal\n';
  
  carrito.forEach(item => {
    const nombre = item.producto.nombre.length > 15 ? 
      item.producto.nombre.substring(0, 12) + '...' : item.producto.nombre;
    const subtotal = item.producto.precio * item.cantidad;
    ticket += `${nombre.padEnd(15)} ${item.cantidad.toString().padEnd(6)} ${item.producto.precio.toFixed(2).padEnd(7)} ${subtotal.toFixed(2)}\n`;
  });
  
  ticket += '---------------------\n';
  ticket += `Subtotal: S/${totales.subtotal.toFixed(2)}\n`;
  ticket += `Descuento: S/${totales.descuento.toFixed(2)}\n`;
  ticket += `IGV (18%): S/${totales.igv.toFixed(2)}\n`;
  ticket += `TOTAL FINAL: S/${totales.total.toFixed(2)}\n\n`;
  ticket += '¡Gracias por su compra!';
  
  ventasRealizadas.push({
    items: [...carrito],
    totales: totales,
    fecha: new Date()
  });
  
  vaciarCarrito();
  
  return { exito: true, ticket: ticket };
}

function generarReportes() {
  const productosMasCaros = [...productos]
    .sort((a, b) => b.precio - a.precio)
    .slice(0, 3);
  
  const ventasPorProducto = {};
  ventasRealizadas.forEach(venta => {
    venta.items.forEach(item => {
      const nombre = item.producto.nombre;
      if (!ventasPorProducto[nombre]) {
        ventasPorProducto[nombre] = 0;
      }
      ventasPorProducto[nombre] += item.cantidad;
    });
  });
  
  const productosMasVendidos = Object.entries(ventasPorProducto)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalesCarrito = calcularTotales();
  
  return {
    productosMasCaros,
    productosMasVendidos,
    resumenCarrito: {
      totalItems,
      montoAcumulado: totalesCarrito.subtotal
    }
  };
}

function listarProductos() {
  return productos;
}

module.exports = {
  buscarProducto,
  agregarAlCarrito,
  eliminarDelCarrito,
  vaciarCarrito,
  verCarrito,
  calcularTotales,
  generarTicket,
  generarReportes,
  listarProductos
};