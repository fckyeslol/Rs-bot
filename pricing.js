// pricing.js
// ───────────────────────────────────────────────────────────────
//  LISTA DE PRECIOS DE RS PUBLICIDAD  (editable)
// ───────────────────────────────────────────────────────────────
//  Aquí defines los productos que el bot puede cotizar y sus precios.
//
//  Hay dos modelos de cotización:
//
//   • modelo: "cantidad"  → se cotiza por paquetes de unidades.
//        Cada paquete tiene { unidades, precio }.  El "precio" es el
//        TOTAL en pesos colombianos (COP) por ese paquete.
//
//   • modelo: "m2"        → se cotiza por metro cuadrado.
//        Defines "precioM2" (COP por m²) y "minM2" (área mínima a cobrar).
//
//  IMPORTANTE: ahora todos los precios están en 0 = "por confirmar".
//  Cuando tengas tu lista, reemplaza los 0 por los valores reales.
//  Mientras estén en 0, el bot toma los datos del cliente y le dice
//  que la cotización exacta la confirma un asesor.
// ───────────────────────────────────────────────────────────────

const MONEDA = "COP"; // Pesos colombianos

const PRODUCTOS = [
  // ───────── LITOGRAFÍA (por cantidad) ─────────
  {
    clave: "tarjetas",
    nombre: "Tarjetas de presentación",
    modelo: "cantidad",
    paquetes: [
      { unidades: 100, precio: 0 },
      { unidades: 500, precio: 0 },
      { unidades: 1000, precio: 0 },
    ],
  },
  {
    clave: "volantes",
    nombre: "Volantes",
    modelo: "cantidad",
    paquetes: [
      { unidades: 500, precio: 0 },
      { unidades: 1000, precio: 0 },
      { unidades: 2000, precio: 0 },
    ],
  },
  {
    clave: "afiches",
    nombre: "Afiches / Posters",
    modelo: "cantidad",
    paquetes: [
      { unidades: 50, precio: 0 },
      { unidades: 100, precio: 0 },
      { unidades: 250, precio: 0 },
    ],
  },
  {
    clave: "brochures",
    nombre: "Brochures / Plegables",
    modelo: "cantidad",
    paquetes: [
      { unidades: 100, precio: 0 },
      { unidades: 500, precio: 0 },
      { unidades: 1000, precio: 0 },
    ],
  },
  {
    clave: "carpetas",
    nombre: "Carpetas corporativas",
    modelo: "cantidad",
    paquetes: [
      { unidades: 100, precio: 0 },
      { unidades: 250, precio: 0 },
      { unidades: 500, precio: 0 },
    ],
  },

  // ───────── GRAN FORMATO (por m²) ─────────
  {
    clave: "pendon",
    nombre: "Pendón Roll Up",
    modelo: "m2",
    precioM2: 0,
    minM2: 0,
  },
  {
    clave: "valla",
    nombre: "Valla exterior",
    modelo: "m2",
    precioM2: 0,
    minM2: 0,
  },
  {
    clave: "vinilo",
    nombre: "Vinilo adhesivo",
    modelo: "m2",
    precioM2: 0,
    minM2: 0,
  },
  {
    clave: "microperforado",
    nombre: "Microperforado",
    modelo: "m2",
    precioM2: 0,
    minM2: 0,
  },

  // ───────── MATERIAL POP (por cantidad) ─────────
  {
    clave: "mugs",
    nombre: "Mugs personalizados",
    modelo: "cantidad",
    paquetes: [
      { unidades: 12, precio: 0 },
      { unidades: 50, precio: 0 },
      { unidades: 100, precio: 0 },
    ],
  },
  {
    clave: "camisas",
    nombre: "Camisas / Gorras",
    modelo: "cantidad",
    paquetes: [
      { unidades: 12, precio: 0 },
      { unidades: 50, precio: 0 },
      { unidades: 100, precio: 0 },
    ],
  },
];

// Formatea un número como precio en COP: 1234567 -> "$ 1.234.567"
function formatPrecio(valor) {
  try {
    return "$ " + new Intl.NumberFormat("es-CO").format(Math.round(valor));
  } catch (_e) {
    return "$ " + Math.round(valor).toString();
  }
}

// Busca un producto por su clave
function buscarProducto(clave) {
  return PRODUCTOS.find((p) => p.clave === clave) || null;
}

module.exports = { MONEDA, PRODUCTOS, formatPrecio, buscarProducto };
