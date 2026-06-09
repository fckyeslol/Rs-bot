// index.js
// Bot de WhatsApp para RS Publicidad — Twilio + Express + OpenAI (RAG).
//
// Arquitectura híbrida:
//   • Menú por códigos (1, 2, 11, 21...) y cotización en línea  → CÓDIGO
//     determinista: rápido y exacto (nunca inventa precios).
//   • Saludos y preguntas en lenguaje natural                   → LLM
//     (OpenAI) con tono humano, anclado a la base de conocimiento
//     real (knowledge.js). Si no hay API key o falla, usa un
//     respaldo y el bot nunca se rompe.
//
// El estado de cada conversación (paso de cotización + historial para
// el LLM) se guarda en memoria por número de WhatsApp.

const express = require("express");
const twilio = require("twilio");
const M = require("./messages");
const cotizador = require("./cotizador");
const trabajos = require("./trabajos");
const llm = require("./llm");

const app = express();
app.use(express.urlencoded({ extended: false }));

const { MessagingResponse } = twilio.twiml;

// ───────── Sesiones en memoria ─────────
const sesiones = new Map();
const SESION_TTL_MS = 30 * 60 * 1000; // 30 min de inactividad

function obtenerSesion(id) {
  const ahora = Date.now();
  let s = sesiones.get(id);
  if (!s) {
    s = { paso: null, producto: null, historial: [], visto: ahora };
    sesiones.set(id, s);
  }
  s.visto = ahora;
  return s;
}

function limpiarSesiones() {
  const ahora = Date.now();
  for (const [id, s] of sesiones) {
    if (ahora - s.visto > SESION_TTL_MS) sesiones.delete(id);
  }
}

// Palabras que piden EXPLÍCITAMENTE volver al menú.
const COMANDOS_MENU = ["menu", "volver", "inicio", "atras", "cancelar"];

// Palabras que disparan la galería de trabajos.
const PALABRAS_TRABAJOS = [
  "trabajo", "trabajos", "portafolio", "portfolio", "galeria",
  "ejemplos", "muestras", "fotos", "imagenes", "proyectos",
];

function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

// Decide la respuesta. Devuelve un string (async porque a veces consulta el LLM).
async function procesarMensaje(mensajeUsuario, sesion) {
  const texto = normalizar(mensajeUsuario);

  // 1) Pedido explícito de menú → cancela cualquier flujo y muestra el menú.
  if (COMANDOS_MENU.includes(texto)) {
    cotizador.reiniciar(sesion);
    return M.BIENVENIDA;
  }

  // 2) Si está dentro del flujo de cotización, lo maneja el cotizador (exacto).
  if (cotizador.enFlujo(sesion)) {
    return cotizador.manejar(texto, sesion);
  }

  // 3) Opción 3 = iniciar cotización en línea.
  if (texto === "3") {
    return cotizador.menuCotizar(sesion);
  }

  // 4) Galería de trabajos: opción 7 o palabras clave ("fotos", "ejemplos"...).
  if (texto === "7" || PALABRAS_TRABAJOS.some((p) => texto.includes(p))) {
    return trabajos.galeria(); // devuelve { texto, media }
  }

  // 5) Navegación por códigos del menú / submenús (respuestas exactas).
  if (M.RESPUESTAS[texto]) {
    return M.RESPUESTAS[texto];
  }

  // 6) Cualquier otra cosa (saludos, preguntas libres) → LLM con tono humano.
  const respuestaLLM = await llm.responder(mensajeUsuario, sesion.historial);
  if (respuestaLLM) {
    sesion.historial.push({ role: "user", content: mensajeUsuario });
    sesion.historial.push({ role: "assistant", content: respuestaLLM });
    if (sesion.historial.length > 12) {
      sesion.historial = sesion.historial.slice(-12);
    }
    return respuestaLLM;
  }

  // 7) Respaldo si el LLM no está disponible: mostramos el menú de bienvenida.
  return M.BIENVENIDA;
}

// ───────── Webhook de Twilio ─────────
app.post("/webhook", async (req, res) => {
  limpiarSesiones();

  const id = req.body.From || "anon";
  const entrante = req.body.Body || "";
  const sesion = obtenerSesion(id);

  let respuesta;
  try {
    respuesta = await procesarMensaje(entrante, sesion);
  } catch (err) {
    console.error("Error procesando mensaje:", err.message);
    respuesta = M.BIENVENIDA;
  }

  const twiml = new MessagingResponse();
  const msg = twiml.message();
  if (typeof respuesta === "string") {
    msg.body(respuesta);
  } else {
    // Respuesta con imágenes: { texto, media: [urls] }
    if (respuesta.texto) msg.body(respuesta.texto);
    (respuesta.media || []).forEach((url) => msg.media(url));
  }
  res.type("text/xml").send(twiml.toString());
});

app.get("/", (_req, res) => {
  res.send("Bot de WhatsApp de RS Publicidad activo ✅");
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Bot de RS Publicidad escuchando en el puerto ${PORT}`);
  });
}

module.exports = { app, procesarMensaje };
