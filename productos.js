// productos.js
// ───────────────────────────────────────────────────────────────
//  Flujo conversacional de Richard Castellar (equipo de diseño).
//  Aquí viven los TEMPLATES: saludo, lista de productos, y por cada
//  producto su info corta + las variables que pedimos para cotizar.
//
//  EDÍTAME a tu gusto: textos, productos, palabras clave y variables.
//  Las variables son lo que el bot le pide al cliente para cotizar.
// ───────────────────────────────────────────────────────────────

const { buscarProducto, formatPrecio } = require("./pricing");

// ── Saludo (template) ──
const SALUDO =
  "¡Hola! Un gusto, te comunicas con *Richard Castellar* del equipo de diseño 🎨\n¿Cómo puedo ayudarte?";

// ── Catálogo ──
// clave    : id interno (coincide con pricing.js cuando hay precio)
// palabras : disparadores (se detectan como palabra completa)
// info     : descripción corta del producto
// variables: lo que le pedimos al cliente para cotizar
const CATALOGO = [
  {
    clave: "tarjetas",
    nombre: "Tarjetas de presentación",
    palabras: ["tarjeta", "tarjetas"],
    info: "Tarjetas full color, en varios papeles y acabados.",
    variables: ["¿Qué cantidad? (ej. 500, 1000)", "¿Una o dos caras?", "Acabado: mate, brillante o normal"],
  },
  {
    clave: "volantes",
    nombre: "Volantes",
    palabras: ["volante", "volantes", "flyer", "flyers"],
    info: "Volantes publicitarios.",
    variables: ["¿Qué cantidad?", "Tamaño: media carta (estándar)", "¿Una o dos caras?"],
  },
  {
    clave: "afiches",
    nombre: "Afiches / pósters",
    palabras: ["afiche", "afiches", "poster", "posters"],
    info: "Afiches y pósters a todo color.",
    variables: ["¿Qué cantidad?", "Tamaño: 50x35 cm (estándar), o dime si necesitas otra medida", "¿Papel mate o brillante?"],
  },
  {
    clave: "pendon",
    nombre: "Pendón",
    palabras: ["pendon", "pendones", "roll up", "rollup", "araña"],
    info: "Pendones en gran formato, con o sin estructura roll up.",
    variables: ["Medidas (ancho x alto en metros)", "¿Qué cantidad?", "¿Con estructura roll up o solo la lona?"],
  },
  {
    clave: "valla",
    nombre: "Vallas",
    palabras: ["valla", "vallas", "pasacalle", "pasacalles", "backing"],
    info: "Vallas e impresión de gran formato para exteriores.",
    variables: ["Medidas (ancho x alto)", "¿Qué cantidad?", "¿Incluye instalación?"],
  },
  {
    clave: "vinilo",
    nombre: "Vinilo adhesivo y stickers",
    palabras: ["vinilo", "adhesivo", "microperforado", "sticker", "stickers", "calcomania", "calcomanias"],
    info: "Vinilos adhesivos, stickers y microperforados para vidrios, paredes, vehículos, portátiles y más.",
    variables: ["Tamaño o medidas aproximadas", "¿Qué cantidad?", "¿Para qué superficie? (laptop, vidrio, pared, vehículo…)"],
  },
  {
    clave: "avisos",
    nombre: "Avisos y letreros",
    palabras: ["aviso", "avisos", "letrero", "letreros", "acrilico", "neon", "fachada", "totem", "señaletica", "senaletica"],
    info: "Avisos en acrílico, letreros 3D, de fachada, luminosos y señalética.",
    variables: ["¿Qué tipo de aviso? (acrílico, 3D, luminoso…)", "Medidas aproximadas", "¿Interior o exterior?"],
  },
  {
    clave: "stand",
    nombre: "Stands",
    palabras: ["stand", "stands", "pop up", "popup"],
    info: "Stands personalizados y pop up display para ferias y eventos.",
    variables: ["¿Qué tipo o tamaño de stand?", "¿Para qué evento o fecha?", "¿Qué espacio/medidas tienes?"],
  },
  {
    clave: "pop",
    nombre: "Material POP",
    palabras: ["souvenir", "merchandising", "mug", "mugs", "camisa", "camisas", "gorra", "gorras", "usb", "usbs", "manilla", "manillas", "esfero", "boligrafo"],
    info: "Material POP y souvenir: mugs, camisas, gorras, USBs, manillas y más.",
    variables: ["¿Qué artículo te interesa?", "¿Qué cantidad?", "¿Llevará logo o diseño?"],
  },
  {
    clave: "editorial",
    nombre: "Revistas, libros, agendas y catálogos",
    palabras: ["revista", "revistas", "libro", "libros", "agenda", "agendas", "catalogo", "catalogos", "bitacora", "bitacoras"],
    info: "Revistas, libros, agendas y catálogos.",
    variables: [
      "¿Qué cantidad?",
      "Tamaño: carta, media carta u oficio",
      "¿Cuántas páginas?",
      "¿A color o blanco y negro?",
    ],
  },
  {
    clave: "litografia",
    nombre: "Litografía y papelería",
    palabras: ["brochure", "brochures", "plegable", "plegables", "carpeta", "carpetas", "calendario", "calendarios", "talonario", "talonarios", "papeleria", "factura", "facturas"],
    info: "Litografía y papelería: brochures, carpetas, plegables, calendarios, talonarios y más.",
    variables: ["¿Qué producto necesitas?", "¿Qué cantidad?", "Tamaño: carta, media carta u oficio"],
  },
];

// Palabras que indican "muéstrame TODOS los productos / qué hacen".
const PIDE_LISTA = [
  "productos", "catalogo", "catalogos", "que hacen", "que ofrecen", "que venden",
  "servicios", "opciones", "todo lo que hacen", "que mas hacen", "portafolio",
];

function normalizar(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// ¿El texto menciona un producto? Coincidencia por palabra completa para
// evitar falsos positivos (ej. "estándar" no debe activar "stand").
function detectar(texto) {
  const t = normalizar(texto);
  for (const p of CATALOGO) {
    for (const palabra of p.palabras) {
      const w = normalizar(palabra);
      const hit = w.includes(" ")
        ? t.includes(w)
        : new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(t);
      if (hit) return p;
    }
  }
  return null;
}

function pideLista(texto) {
  const t = normalizar(texto);
  return PIDE_LISTA.some((w) => t.includes(normalizar(w)));
}

function listar() {
  const items = CATALOGO.map((p) => "• " + p.nombre).join("\n");
  return "Con gusto 🙌 Esto es lo que hacemos:\n\n" + items + "\n\n¿Cuál te interesa?";
}

// Template: info corta + variables que pedimos para cotizar.
function plantilla(prod) {
  const vars = prod.variables.map((v) => "• " + v).join("\n");
  return `*${prod.nombre}*\n${prod.info}\n\nPara cotizarte necesito:\n${vars}`;
}

// Cierre: si el precio está cargado y se puede calcular, lo da; si no,
// pasa a confirmación con el equipo.
function cerrar(prod, textoCliente) {
  const precio = calcularSiPosible(prod, textoCliente);
  if (precio != null) {
    return `¡Perfecto! Tu *${prod.nombre}* queda en *${formatPrecio(precio)}*. ¿Te lo confirmo y avanzamos? 😊`;
  }
  return "¡Genial, ya tengo los datos! 🙌 Déjame confirmarte el precio exacto en un momentico. ¿A nombre de quién va el pedido?";
}

// Cálculo best-effort usando pricing.js. Si el precio es 0 o no se puede
// interpretar la cantidad/medida, devuelve null (→ pasa a asesor).
function calcularSiPosible(prod, texto) {
  const data = buscarProducto(prod.clave);
  if (!data) return null;

  if (data.modelo === "cantidad" && Array.isArray(data.paquetes)) {
    const nums = (texto.match(/\d{2,6}/g) || []).map(Number);
    if (nums.length === 0) return null;
    const cantidad = Math.max(...nums);
    let mejor = null;
    let dif = Infinity;
    for (const pk of data.paquetes) {
      const d = Math.abs(pk.unidades - cantidad);
      if (d < dif) {
        dif = d;
        mejor = pk;
      }
    }
    if (mejor && mejor.precio > 0) return mejor.precio;
  }

  if (data.modelo === "m2" && data.precioM2 > 0) {
    const m = normalizar(texto).replace(/,/g, ".").match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
    if (m) {
      const area = Math.max(parseFloat(m[1]) * parseFloat(m[2]), data.minM2 || 0);
      return area * data.precioM2;
    }
  }

  return null;
}

// Cotización por clave + datos estructurados (la usa la herramienta del LLM).
// Devuelve { disponible, precioFmt, detalle } o { disponible:false, motivo }.
function cotizar(clave, opts = {}) {
  const { cantidad, ancho, alto } = opts;
  const data = buscarProducto(clave);
  if (!data) return { disponible: false, motivo: "producto sin precio configurado en pricing.js" };

  if (data.modelo === "cantidad" && Array.isArray(data.paquetes)) {
    if (!cantidad) return { disponible: false, motivo: "falta la cantidad" };
    let mejor = null;
    let dif = Infinity;
    for (const pk of data.paquetes) {
      const d = Math.abs(pk.unidades - cantidad);
      if (d < dif) {
        dif = d;
        mejor = pk;
      }
    }
    if (mejor && mejor.precio > 0) {
      return { disponible: true, precioFmt: formatPrecio(mejor.precio), detalle: `${mejor.unidades} unidades` };
    }
    return { disponible: false, motivo: "precio aún no cargado en pricing.js" };
  }

  if (data.modelo === "m2") {
    if (!(ancho > 0 && alto > 0)) return { disponible: false, motivo: "faltan las medidas (ancho x alto)" };
    if (data.precioM2 > 0) {
      const area = Math.max(ancho * alto, data.minM2 || 0);
      return { disponible: true, precioFmt: formatPrecio(area * data.precioM2), detalle: `${area.toFixed(2)} m²` };
    }
    return { disponible: false, motivo: "precio aún no cargado en pricing.js" };
  }

  return { disponible: false, motivo: "producto sin precio configurado" };
}

module.exports = { SALUDO, CATALOGO, detectar, pideLista, listar, plantilla, cerrar, cotizar };
