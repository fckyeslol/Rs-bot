// cotizador.js
// Flujo de cotización conversacional (máquina de estados).
// Lleva al cliente: elegir producto -> dar cantidad o medidas -> recibir cotización.
//
// El "estado" de cada cliente se guarda en el objeto `sesion` que index.js
// mantiene por número de WhatsApp. Aquí solo leemos/escribimos sesion.paso
// y sesion.producto.

const { PRODUCTOS, buscarProducto, formatPrecio } = require("./pricing");

const WHATSAPP_HUMANO = "https://wa.me/573154133225";
const EMAIL = "comercial@rspublicidad.com.co";

const PIE = "\n\nEscribe *menú* para volver al inicio.";

// Pasos posibles del flujo
const PASO = {
  ELEGIR_PRODUCTO: "COTIZA_PRODUCTO",
  PEDIR_CANTIDAD: "COTIZA_CANTIDAD",
  PEDIR_MEDIDAS: "COTIZA_MEDIDAS",
};

// Menú inicial de cotización: lista los productos cotizables numerados.
function menuCotizar(sesion) {
  sesion.paso = PASO.ELEGIR_PRODUCTO;
  sesion.producto = null;

  let texto = "💰 *Cotización en línea*\n\n¿Qué producto quieres cotizar? Responde con el número:\n\n";
  PRODUCTOS.forEach((p, i) => {
    texto += `*${i + 1}*  ${p.nombre}\n`;
  });
  texto += "\n*0*  📞 Prefiero hablar con un asesor";
  texto += PIE;
  return texto;
}

// Paso 1: el cliente eligió un producto del menú de cotización.
function elegirProducto(texto, sesion) {
  if (texto === "0") {
    reiniciar(sesion);
    return (
      "📞 *Te paso con un asesor*\n\n" +
      "Escríbenos directo y te cotizamos personalmente:\n\n" +
      `📲 WhatsApp: ${WHATSAPP_HUMANO}\n📧 Email: ${EMAIL}` +
      PIE
    );
  }

  const idx = parseInt(texto, 10) - 1;
  const prod = PRODUCTOS[idx];

  if (!prod) {
    return (
      "No encontré esa opción 🤔\n\nResponde con el número de un producto de la lista, o escribe *menú*."
    );
  }

  sesion.producto = prod.clave;

  if (prod.modelo === "cantidad") {
    sesion.paso = PASO.PEDIR_CANTIDAD;
    let texto2 = `🖨️ *${prod.nombre}*\n\n¿Qué cantidad necesitas? Responde con el número:\n\n`;
    prod.paquetes.forEach((pk, i) => {
      texto2 += `*${i + 1}*  ${pk.unidades} unidades\n`;
    });
    texto2 += PIE;
    return texto2;
  }

  // modelo m2
  sesion.paso = PASO.PEDIR_MEDIDAS;
  return (
    `🏗️ *${prod.nombre}*\n\n` +
    "Escríbeme las medidas en metros con el formato *ancho x alto*.\n" +
    "Ejemplos: `1x2`  ·  `0.85x2`  ·  `1,5 x 3`" +
    PIE
  );
}

// Paso 2a: cotización por cantidad (litografía / POP).
function cotizarPorCantidad(texto, sesion) {
  const prod = buscarProducto(sesion.producto);
  if (!prod) {
    reiniciar(sesion);
    return "Algo salió mal, volvamos a empezar. Escribe *menú*.";
  }

  const idx = parseInt(texto, 10) - 1;
  const paquete = prod.paquetes[idx];

  if (!paquete) {
    return "Elige una de las cantidades de la lista (responde con el número), o escribe *menú*.";
  }

  reiniciar(sesion);
  return cotizacion(prod.nombre, `${paquete.unidades} unidades`, paquete.precio);
}

// Paso 2b: cotización por medidas (gran formato).
function cotizarPorMedidas(texto, sesion) {
  const prod = buscarProducto(sesion.producto);
  if (!prod) {
    reiniciar(sesion);
    return "Algo salió mal, volvamos a empezar. Escribe *menú*.";
  }

  const medidas = parseMedidas(texto);
  if (!medidas) {
    return (
      "No pude leer las medidas 🤔\n\n" +
      "Envíalas como *ancho x alto* en metros. Ejemplo: `1x2` o `0.85x2`."
    );
  }

  const { ancho, alto } = medidas;
  let area = ancho * alto;
  const areaCobrada = Math.max(area, prod.minM2 || 0);
  const total = areaCobrada * (prod.precioM2 || 0);

  const detalle = `${ancho} m × ${alto} m = ${area.toFixed(2)} m²`;
  reiniciar(sesion);
  return cotizacion(prod.nombre, detalle, total);
}

// Construye el mensaje final de cotización.
function cotizacion(nombre, detalle, total) {
  let cuerpo;
  if (total > 0) {
    cuerpo =
      `Producto: *${nombre}*\n` +
      `Detalle: ${detalle}\n` +
      `💵 Total estimado: *${formatPrecio(total)}*\n\n` +
      "_Valor referencial; puede variar según acabados y material. " +
      "Para confirmar y agendar tu pedido:_";
  } else {
    // Precio aún no cargado en pricing.js
    cuerpo =
      `Producto: *${nombre}*\n` +
      `Detalle: ${detalle}\n` +
      "💵 Precio: *por confirmar*\n\n" +
      "_Ya registré lo que necesitas. Un asesor te confirma el valor exacto enseguida:_";
  }

  return (
    "✅ *Tu cotización*\n\n" +
    cuerpo +
    `\n📲 WhatsApp: ${WHATSAPP_HUMANO}\n📧 ${EMAIL}\n\n` +
    "¿Quieres cotizar otro producto? Escribe *3*." +
    PIE
  );
}

// Lee "1x2", "0.85x2", "1,5 x 3", "1.5 por 2" -> { ancho, alto }
function parseMedidas(texto) {
  const limpio = texto.toLowerCase().replace(/,/g, ".").replace(/por/g, "x");
  const m = limpio.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const ancho = parseFloat(m[1]);
  const alto = parseFloat(m[2]);
  if (!(ancho > 0) || !(alto > 0)) return null;
  return { ancho, alto };
}

function reiniciar(sesion) {
  sesion.paso = null;
  sesion.producto = null;
}

// ¿La sesión está dentro del flujo de cotización?
function enFlujo(sesion) {
  return (
    sesion.paso === PASO.ELEGIR_PRODUCTO ||
    sesion.paso === PASO.PEDIR_CANTIDAD ||
    sesion.paso === PASO.PEDIR_MEDIDAS
  );
}

// Maneja un mensaje cuando la sesión ya está dentro del flujo.
function manejar(texto, sesion) {
  switch (sesion.paso) {
    case PASO.ELEGIR_PRODUCTO:
      return elegirProducto(texto, sesion);
    case PASO.PEDIR_CANTIDAD:
      return cotizarPorCantidad(texto, sesion);
    case PASO.PEDIR_MEDIDAS:
      return cotizarPorMedidas(texto, sesion);
    default:
      return menuCotizar(sesion);
  }
}

module.exports = { menuCotizar, manejar, enFlujo, reiniciar };
