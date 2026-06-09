// trabajos.js
// Galería de trabajos realizados por RS Publicidad.
//
// Las imágenes NO se descargan: se envían directamente desde su URL
// pública en el sitio web. Twilio las adjunta al mensaje de WhatsApp.
// Si actualizas una foto en la web, el bot manda la nueva automáticamente.
//
// Para agregar o quitar trabajos, edita la lista TRABAJOS de abajo.
// Cada imagen debe ser una URL pública (https) en formato JPG/PNG.

const BASE = "https://rs-publicidad.vercel.app/assets/instagram/";

const TRABAJOS = [
  { titulo: "Imagen corporativa · diseño de marca", img: "page-04.jpg" },
  { titulo: "Gran formato · impresión digital", img: "page-17.jpg" },
  { titulo: "Letrero 3D · Centro Médico CMC", img: "page-22.jpg" },
  { titulo: "Fachadas · Nazareth & Uniminuto", img: "page-23.jpg" },
  { titulo: "Avisos · Grupo Bosc, Chiko's, Good Mood", img: "page-24.jpg" },
  { titulo: "Litografía · producción en planta", img: "page-05.jpg" },
  { titulo: "Stand · Salud Familiar IPS", img: "page-32.jpg" },
];

// WhatsApp/Twilio permite hasta 10 imágenes por mensaje.
const MAX_MEDIA = 10;

// Devuelve { texto, media: [urls] } para enviar la galería.
function galeria() {
  const lista = TRABAJOS.map((t) => "• " + t.titulo).join("\n");
  const texto =
    "🏅 *Algunos de nuestros trabajos*\n\n" +
    lista +
    "\n\nProyectos en Barranquilla y la región Caribe. ¿Quieres algo similar? Escribe *3* para cotizar." +
    "\n\nEscribe *menú* para volver al inicio.";

  const media = TRABAJOS.slice(0, MAX_MEDIA).map((t) => BASE + t.img);
  return { texto, media };
}

module.exports = { TRABAJOS, galeria };
