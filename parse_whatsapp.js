// parse_whatsapp.js
// Procesa TODOS los .txt exportados de WhatsApp que estén en la carpeta ./data
// y genera archivos estructurados en ./data/salida:
//   - mensajes.csv                (cada mensaje: archivo, fecha, hora, remitente, texto)
//   - cotizaciones_detectadas.csv (mensajes donde se detecta precio y/o producto)
//   - resumen.txt                 (estadísticas)
//
// Uso:  node parse_whatsapp.js
// No requiere dependencias externas.

const fs = require("fs");
const path = require("path");

const DIR_DATA = path.join(__dirname, "data");
const DIR_SALIDA = path.join(DIR_DATA, "salida");

// ── Detección de líneas de WhatsApp ──
// Cubre formatos comunes de Android e iOS, 12h/24h, con o sin corchetes.
// Ejemplos:
//   12/06/24, 3:45 p. m. - Rafa: Hola
//   12/6/2024, 15:45 - Cliente: ¿precio?
//   [12/06/24, 3:45:10 p. m.] Rafa: Hola
const RE_LINEA = new RegExp(
  "^\\[?" +
    "(\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4})" + // fecha
    ",?\\s+" +
    "(\\d{1,2}:\\d{2}(?::\\d{2})?)" + // hora
    "\\s*(a\\.?\\s?m\\.?|p\\.?\\s?m\\.?|AM|PM)?" + // am/pm opcional
    "\\]?\\s*[-–]?\\s*" +
    "([^:]{1,60}?):\\s" + // remitente
    "([\\s\\S]*)$" // mensaje
);

// Precios: $ 1.234.567 / 1,234,567 / 50000 / "50 mil" / "50k"
const RE_PRECIO = /\$\s?\d{1,3}(?:[.,]\d{3})+|\$\s?\d{4,}|\b\d{1,3}(?:[.,]\d{3})+\b|\b\d+\s?(?:mil|k)\b/gi;

const PRODUCTOS = [
  "tarjeta", "pendon", "pendón", "volante", "afiche", "poster", "póster",
  "brochure", "plegable", "carpeta", "revista", "catalogo", "catálogo",
  "calendario", "talonario", "papeleria", "papelería", "libro", "agenda",
  "valla", "vinilo", "microperforado", "pasacalle", "backing", "roll up",
  "acrilico", "acrílico", "letrero", "aviso", "neon", "neón", "señaletica",
  "señalética", "totem", "tótem", "stand", "mug", "camisa", "gorra", "usb",
  "manilla", "boligrafo", "bolígrafo", "souvenir", "merchandising", "logo",
];

function listarTxt() {
  if (!fs.existsSync(DIR_DATA)) return [];
  return fs
    .readdirSync(DIR_DATA)
    .filter((f) => f.toLowerCase().endsWith(".txt") && f.toLowerCase() !== "leeme.txt");
}

// Parsea un archivo en una lista de mensajes { fecha, hora, remitente, texto }.
function parsearArchivo(contenido) {
  const lineas = contenido.split(/\r?\n/);
  const mensajes = [];
  let actual = null;

  for (const linea of lineas) {
    const m = linea.match(RE_LINEA);
    if (m) {
      if (actual) mensajes.push(actual);
      actual = {
        fecha: m[1],
        hora: (m[2] + " " + (m[3] || "")).trim(),
        remitente: m[4].trim(),
        texto: (m[5] || "").trim(),
      };
    } else if (actual) {
      // Continuación de un mensaje multilínea.
      actual.texto += "\n" + linea;
    }
    // Líneas antes del primer mensaje (encabezados de cifrado) se ignoran.
  }
  if (actual) mensajes.push(actual);
  return mensajes;
}

function detectarPrecios(texto) {
  const encontrados = texto.match(RE_PRECIO);
  return encontrados ? Array.from(new Set(encontrados.map((s) => s.trim()))) : [];
}

function detectarProductos(texto) {
  const t = texto.toLowerCase();
  return PRODUCTOS.filter((p) => t.includes(p));
}

// Escapa un campo para CSV.
function csv(campo) {
  const s = String(campo == null ? "" : campo);
  return '"' + s.replace(/"/g, '""') + '"';
}

function main() {
  const archivos = listarTxt();
  if (archivos.length === 0) {
    console.log(
      "No encontré archivos .txt en la carpeta 'data'.\n" +
        "Exporta tus chats de WhatsApp (Exportar chat → Sin multimedia) y\n" +
        "deja los .txt dentro de la carpeta 'data'. Luego vuelve a correr este script."
    );
    return;
  }

  fs.mkdirSync(DIR_SALIDA, { recursive: true });

  const filasMensajes = [["archivo", "fecha", "hora", "remitente", "mensaje"]];
  const filasCotiz = [
    ["archivo", "fecha", "hora", "remitente", "mensaje", "precios_detectados", "productos_detectados"],
  ];

  let totalMensajes = 0;
  let totalCotiz = 0;
  const porArchivo = [];

  for (const archivo of archivos) {
    const contenido = fs.readFileSync(path.join(DIR_DATA, archivo), "utf8");
    const mensajes = parsearArchivo(contenido);
    totalMensajes += mensajes.length;

    let cotizEnArchivo = 0;
    for (const msg of mensajes) {
      filasMensajes.push([archivo, msg.fecha, msg.hora, msg.remitente, msg.texto]);

      const precios = detectarPrecios(msg.texto);
      const productos = detectarProductos(msg.texto);
      if (precios.length > 0 || productos.length > 0) {
        filasCotiz.push([
          archivo,
          msg.fecha,
          msg.hora,
          msg.remitente,
          msg.texto,
          precios.join(" | "),
          productos.join(" | "),
        ]);
        if (precios.length > 0) {
          cotizEnArchivo++;
          totalCotiz++;
        }
      }
    }
    porArchivo.push({ archivo, mensajes: mensajes.length, conPrecio: cotizEnArchivo });
  }

  const aCSV = (filas) => filas.map((f) => f.map(csv).join(",")).join("\n");
  fs.writeFileSync(path.join(DIR_SALIDA, "mensajes.csv"), "﻿" + aCSV(filasMensajes), "utf8");
  fs.writeFileSync(
    path.join(DIR_SALIDA, "cotizaciones_detectadas.csv"),
    "﻿" + aCSV(filasCotiz),
    "utf8"
  );

  let resumen = "RESUMEN DEL PROCESAMIENTO DE CHATS\n";
  resumen += "===================================\n\n";
  resumen += `Archivos procesados: ${archivos.length}\n`;
  resumen += `Mensajes totales: ${totalMensajes}\n`;
  resumen += `Mensajes con precio detectado: ${totalCotiz}\n\n`;
  resumen += "Detalle por archivo:\n";
  for (const a of porArchivo) {
    resumen += `  - ${a.archivo}: ${a.mensajes} mensajes, ${a.conPrecio} con precio\n`;
  }
  fs.writeFileSync(path.join(DIR_SALIDA, "resumen.txt"), resumen, "utf8");

  console.log(resumen);
  console.log("Listo. Archivos generados en: data/salida/");
}

main();
