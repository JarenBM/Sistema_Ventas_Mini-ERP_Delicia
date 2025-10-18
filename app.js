const readline = require('readline');
const ventas = require('./services/ventas.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function mostrarMenu() {
  console.log('\nBienvenido al sistema Delicia');
  console.log('1. Registrar venta');
  console.log('2. Listar productos');
  console.log('3. Buscar producto');
  console.log('4. Ver carrito');
  console.log('5. Calcular total');
  console.log('6. Generar ticket');
  console.log('7. Reportes');
  console.log('8. Vaciar carrito');
  console.log('9. Salir');
}

function preguntarOpcion() {
  rl.question('\nSeleccione una opcion: ', (opcion) => {
    switch(opcion) {
      case '1':
        registrarVenta();
        break;
      case '2':
        listarProductos();
        break;
      case '3':
        buscarProducto();
        break;
      case '4':
        verCarrito();
        break;
      case '5':
        calcularTotal();
        break;
      case '6':
        generarTicket();
        break;
      case '7':
        mostrarReportes();
        break;
      case '8':
        vaciarCarrito();
        break;
      case '9':
        console.log('¡Hasta luego!');
        rl.close();
        return;
      default:
        console.log('Opcion no valida, por favor intente nuevamente.');
        mostrarMenu();
        preguntarOpcion();
    }
  });
}

function registrarVenta() {
  function agregarProducto() {
    rl.question('Producto (nombre o ID): ', (entradaProducto) => {
      if (!entradaProducto.trim()) {
        console.log('Entrada no valida');
        agregarProducto();
        return;
      }
      
      rl.question('Cantidad: ', (cantidadStr) => {
        const cantidad = parseInt(cantidadStr);
        
        if (isNaN(cantidad) || cantidad <= 0) {
          console.log('Cantidad debe ser un numero mayor a 0');
          agregarProducto();
          return;
        }
        
        const resultado = ventas.agregarAlCarrito(entradaProducto, cantidad);
        console.log(resultado.mensaje);
        
        rl.question('¿Agregar otro producto? (s/n): ', (respuesta) => {
          if (respuesta.toLowerCase() === 's') {
            agregarProducto();
          } else {
            // Vuelve al menú principal automáticamente
            mostrarMenu();
            preguntarOpcion();
          }
        });
      });
    });
  }
  
  agregarProducto();
}

function listarProductos() {
  const productos = ventas.listarProductos();
  console.log('\nProductos disponibles:');
  productos.forEach(p => {
    console.log(`${p.id}. ${p.nombre} - S/${p.precio.toFixed(2)} (${p.categoria})`);
  });
  // Vuelve automáticamente al menú
  mostrarMenu();
  preguntarOpcion();
}

function buscarProducto() {
  rl.question('Ingrese el nombre o ID del producto a buscar: ', (entrada) => {
    const producto = ventas.buscarProducto(entrada);
    if (producto) {
      console.log(`Producto encontrado: ${producto.nombre} - S/${producto.precio.toFixed(2)} (${producto.categoria})`);
    } else {
      console.log('Producto no encontrado');
    }
    // Vuelve automáticamente al menú
    mostrarMenu();
    preguntarOpcion();
  });
}

function verCarrito() {
  const carrito = ventas.verCarrito();
  console.log('\nCarrito actual:');
  
  if (carrito.length === 0) {
    console.log('El carrito esta vacio');
    // Si está vacío, muestra opciones igualmente
    mostrarOpcionesCarrito();
  } else {
    carrito.forEach((item, index) => {
      const subtotal = item.producto.precio * item.cantidad;
      console.log(`${index + 1}. ${item.producto.nombre} - ${item.cantidad} x S/${item.producto.precio.toFixed(2)} = S/${subtotal.toFixed(2)}`);
    });
    
    mostrarOpcionesCarrito();
  }
}

function mostrarOpcionesCarrito() {
  console.log('\nOpciones del carrito:');
  console.log('1. Eliminar producto');
  console.log('2. Vaciar carrito completo');
  console.log('3. Volver al menu principal');
  
  rl.question('Seleccione una opcion: ', (opcion) => {
    switch(opcion) {
      case '1':
        rl.question('Ingrese nombre o ID del producto a eliminar: ', (entrada) => {
          const resultado = ventas.eliminarDelCarrito(entrada);
          console.log(resultado.mensaje);
          // Después de eliminar, vuelve a mostrar el carrito actualizado
          verCarrito();
        });
        break;
      case '2':
        const mensaje = ventas.vaciarCarrito();
        console.log(mensaje);
        // Después de vaciar, vuelve al menú principal
        mostrarMenu();
        preguntarOpcion();
        break;
      case '3':
        // Vuelve al menú principal
        mostrarMenu();
        preguntarOpcion();
        break;
      default:
        console.log('Opcion no valida');
        mostrarOpcionesCarrito();
    }
  });
}

function calcularTotal() {
  const totales = ventas.calcularTotales();
  console.log('\nCalculo de totales:');
  console.log(`Subtotal: S/${totales.subtotal.toFixed(2)}`);
  console.log(`Descuento: S/${totales.descuento.toFixed(2)}`);
  console.log(`IGV (18%): S/${totales.igv.toFixed(2)}`);
  console.log(`TOTAL FINAL: S/${totales.total.toFixed(2)}`);
  
  // Después de calcular, pregunta si quiere volver al menú
  rl.question('\nPresione Enter para volver al menu...', () => {
    mostrarMenu();
    preguntarOpcion();
  });
}

function generarTicket() {
  const resultado = ventas.generarTicket();
  if (resultado.exito) {
    console.log('\n' + resultado.ticket);
  } else {
    console.log(resultado.mensaje);
  }
  
  // Después de generar ticket (o si falla), vuelve al menú
  rl.question('\nPresione Enter para volver al menu...', () => {
    mostrarMenu();
    preguntarOpcion();
  });
}

function mostrarReportes() {
  const reportes = ventas.generarReportes();
  
  console.log('\n--- REPORTES ---');
  
  console.log('\nTop 3 productos mas caros:');
  reportes.productosMasCaros.forEach((producto, index) => {
    console.log(`${index + 1}. ${producto.nombre} - S/${producto.precio.toFixed(2)}`);
  });
  
  console.log('\nProductos mas vendidos:');
  if (reportes.productosMasVendidos.length === 0) {
    console.log('No hay ventas registradas aun');
  } else {
    reportes.productosMasVendidos.forEach(([nombre, cantidad], index) => {
      console.log(`${index + 1}. ${nombre} - ${cantidad} unidades`);
    });
  }
  
  console.log('\nResumen del carrito actual:');
  console.log(`Total de items: ${reportes.resumenCarrito.totalItems}`);
  console.log(`Monto acumulado: S/${reportes.resumenCarrito.montoAcumulado.toFixed(2)}`);
  
  // Después de mostrar reportes, vuelve al menú
  rl.question('\nPresione Enter para volver al menu...', () => {
    mostrarMenu();
    preguntarOpcion();
  });
}

function vaciarCarrito() {
  const mensaje = ventas.vaciarCarrito();
  console.log(mensaje);
  // Vuelve automáticamente al menú principal
  mostrarMenu();
  preguntarOpcion();
}

function iniciar() {
  mostrarMenu();
  preguntarOpcion();
}

iniciar();