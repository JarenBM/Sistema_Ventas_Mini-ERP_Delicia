// Importación de los módulos necesarios para el código de app.js

// Módulo para leer entrada del usuario desde la consola
const readline = require('readline');

// Importamos todas las funciones de lógica del archivo ventas.js
const ventas = require('./services/ventas.js');


// Configuración de la salida y entrada de datos (interfaz)

// Creamos la interfaz para leer desde el teclado y mostrar en pantalla
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// La función principal  - MENÚ DEL SISTEMA
function mostrarMenu() {
  console.log('\n--------Bienvenido al Sistema de Ventas - Panadería Delicia--------');
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

/**
 * Pregunta al usuario qué opción del menú desea ejecutar
 * y dirige a la función correspondiente
 */

function preguntarOpcion() {
  // Pregunta al usuario y espera su respuesta
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
        // Si la opción no es válida, mostrar error y repetir
        console.log('Opcion no valida, por favor intente nuevamente.');
        mostrarMenu();
        preguntarOpcion();
    }
  });
}

// Funciones para la gestión de ventas

function registrarVenta() {
  // Función interna que se llama a sí misma para agregar productos 
  function agregarProducto() {
    // Preguntar qué producto quiere agregar
    rl.question('Producto (nombre o ID): ', (entradaProducto) => {
       // Validación de ingreso de datos, para evitar texto vacio
      if (!entradaProducto.trim()) {
        console.log('Entrada no valida');
        agregarProducto();
        return;
      }
      // Preguntar la cantidad que se desea
      rl.question('Cantidad: ', (cantidadStr) => {
        const cantidad = parseInt(cantidadStr);

        // Validación para que la cantidad sea positivo mayor a 0
        if (isNaN(cantidad) || cantidad <= 0) {
          console.log('Cantidad debe ser un numero mayor a 0');
          agregarProducto();
          return;
        }
        // Intentar agregar el producto al carrito
        const resultado = ventas.agregarAlCarrito(entradaProducto, cantidad);
        console.log(resultado.mensaje);
         // Preguntar si se quiere agregar otro producto
        rl.question('¿Agregar otro producto? (s/n): ', (respuesta) => {
          if (respuesta.toLowerCase() === 's') {
            agregarProducto(); // Continuar agregando productos
          } else {
            // Vuelve al menú principal automáticamente
            mostrarMenu();
            preguntarOpcion();
          }
        });
      });
    });
  }
   // Iniciar el proceso de agregar productos
  agregarProducto();
}

/**
 * Muestra todos los productos disponibles en el catálogo
 * con su ID, nombre, precio y categoría
 */

function listarProductos() {
  // Mostrar la lista de productos desde el módulo de ventas
  const productos = ventas.listarProductos();
  console.log('\nProductos disponibles:');
  // Recorrer y mostrar cada producto
  productos.forEach(p => {
    console.log(`${p.id}. ${p.nombre} - S/${p.precio.toFixed(2)} (${p.categoria})`);
  });
    // Volver automáticamente al menú principal 
  mostrarMenu();
  preguntarOpcion();
}
/**
 * Busca un producto específico por nombre o ID
 * y muestra su información si lo encuentra
 */
function buscarProducto() {
  rl.question('Ingrese el nombre o ID del producto a buscar: ', (entrada) => {
    // Buscar producto en el catálogo
    const producto = ventas.buscarProducto(entrada);
    if (producto) {
      //Si se encuentra el producto - se muestra la información
      console.log(`Producto encontrado: ${producto.nombre} - S/${producto.precio.toFixed(2)} (${producto.categoria})`);
    } else {
      console.log('Producto no encontrado');
    }
    // Vuelve automáticamente al menú
    mostrarMenu();
    preguntarOpcion();
  });
}
/**
 * Se muestra el contenido actual del carrito de compras con todos los productos
 */
function verCarrito() {
  // Obtener productos del carrito
  const carrito = ventas.verCarrito();
  console.log('\nCarrito actual:');
  
  if (carrito.length === 0) {
    console.log('El carrito esta vacio');
    // Si está vacío, muestra opciones igualmente
    mostrarOpcionesCarrito();
  } else {
    // Mostrar cada producto con su cantidad y total de monto por el precio
    carrito.forEach((item, index) => {
      const subtotal = item.producto.precio * item.cantidad;
      console.log(`${index + 1}. ${item.producto.nombre} - ${item.cantidad} x S/${item.producto.precio.toFixed(2)} = S/${subtotal.toFixed(2)}`);
    });
     // Mostrar opciones de gestión del carrito
    mostrarOpcionesCarrito();
  }
}
/**
 * Muestra las opciones disponibles para gestionar el carrito
 * y procesa la selección del usuario
 */
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
        // Vaciar todo el carrito
        const mensaje = ventas.vaciarCarrito();
        console.log(mensaje);
        // Después de vaciar el, vuelve al menú principal
        mostrarMenu();
        preguntarOpcion();
        break;
      case '3':
        // Vuelve al menú principal sin cambios
        mostrarMenu();
        preguntarOpcion();
        break;
      default:
        console.log('Opcion no valida');
        mostrarOpcionesCarrito(); // Repetir opciones
    }
  });
}
/**
 * Se calcula el monto total y muestra el total de la compra actual incluyendo el subtotal e IGV
 */
function calcularTotal() {
    // Calcular todos los montos totales
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
/**
 * Se genera y muestra el ticket de compra final, también registra la venta y vacía el carrito
 */
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
/**
 * Se muestra reportes y estadísticas del sistema
 */
function mostrarReportes() {
  // Obtener datos para reportes
  const reportes = ventas.generarReportes();
  
  console.log('\n--- REPORTES ---');
  // Mostrar top 3 productos más caros
  console.log('\nTop 3 productos mas caros:');
  reportes.productosMasCaros.forEach((producto, index) => {
    console.log(`${index + 1}. ${producto.nombre} - S/${producto.precio.toFixed(2)}`);
  });
   // Mostrar productos más vendidos
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
/**
 * Se borra o vacía completamente el carrito de compras
 */
function vaciarCarrito() {
  const mensaje = ventas.vaciarCarrito();
  console.log(mensaje);
  // Vuelve automáticamente al menú principal
  mostrarMenu();
  preguntarOpcion();
}
/**
 * Función que inicia la aplicación, se muestra el menú principal y espera la primera interacción
 */
function iniciar() {
  mostrarMenu();
  preguntarOpcion(); // Esperar selección del usuario
}
// Se ejecuta la aplicación
iniciar();