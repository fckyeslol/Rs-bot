// index.js
// Bot de WhatsApp de RS Publicidad — Twilio + Express + OpenAI.
//
// 100% conversacional, con la persona de Richard Castelar (equipo de diseño).
// Flujo:
//   • Saludo            → se presenta Richard (template).
//   • Producto puntual  → info del producto + variables para cotizar (template).
//   • "¿qué productos?" → lista de productos → al elegir uno, su template.
//   • Variables dadas   → cierre: precio si está cargado, o pasa a asesor.
//   • Fotos / trabajos  → galería de imágenes.
//   • Cualquier otra cosa → responde el LLM (Richard) breve y humano.
//
// El estado de cada conversación se guarda en memoria por número.

const express = require("express");
const twilio = require("twilio");
const productos = require("./productos");
const trabajos = require("./trabajos");
const llm = require("./llm");
const pagos = require("./pagos");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // para el webhook de pagos (JSON)

const { MessagingResponse } = twilio.twiml;

// ───────── Sesiones en memoria ─────────
const sesiones = new Map();
const SESION_TTL_MS = 30 * 60 * 1000;

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

// Saludos "puros" y comandos de reinicio.
const SALUDOS = [
  "hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "buen dia",
  "que tal", "hey", "hi", "hello", "ola", "saludos", "menu", "inicio", "volver",
];

// Disparadores de la galería de trabajos.
const PALABRAS_TRABAJOS = [
  "trabajo", "trabajos", "portafolio", "galeria", "ejemplos", "muestras",
  "fotos", "proyectos",
];

function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

async function procesarMensaje(mensajeUsuario, sesion) {
  const texto = normalizar(mensajeUsuario);

  // 1) Saludo / reinicio → Richard se presenta.
  if (SALUDOS.includes(texto)) {
    sesion.paso = null;
    sesion.producto = null;
    return productos.SALUDO;
  }

  // 2) Galería de trabajos (imágenes).
  if (PALABRAS_TRABAJOS.some((p) => texto.includes(p))) {
    return trabajos.galeria();
  }

  // 3) Si está dando las variables de un producto:
  //    - si menciona OTRO producto distinto, cambia a ese.
  //    - si no, toma su respuesta como las variables y cierra.
  if (sesion.paso === "VARIABLES" && sesion.producto) {
    const otro = productos.detectar(texto);
    if (otro && otro.clave !== sesion.producto) {
      sesion.producto = otro.clave;
      return productos.plantilla(otro);
    }
    const p = productos.CATALOGO.find((x) => x.clave === sesion.producto);
    sesion.paso = null;
    sesion.producto = null;
    if (p) return productos.cerrar(p, mensajeUsuario);
  }

  // 4) ¿Mencionó un producto puntual? → info + variables.
  const prod = productos.detectar(texto);
  if (prod) {
    sesion.paso = "VARIABLES";
    sesion.producto = prod.clave;
    return productos.plantilla(prod);
  }

  // 5) ¿Pide ver todos los productos? → lista.
  if (productos.pideLista(texto)) {
    sesion.paso = "ELIGIENDO";
    sesion.producto = null;
    return productos.listar();
  }

  // 6) Cualquier otra cosa → Richard (LLM) breve y humano.
  const respuestaLLM = await llm.responder(mensajeUsuario, sesion.historial);
  if (respuestaLLM) {
    sesion.historial.push({ role: "user", content: mensajeUsuario });
    sesion.historial.push({ role: "assistant", content: respuestaLLM });
    if (sesion.historial.length > 12) sesion.historial = sesion.historial.slice(-12);
    return respuestaLLM;
  }

  // 7) Respaldo si no hay LLM disponible.
  return productos.SALUDO;
}

// ───────── Webhook de Twilio (WhatsApp) ─────────
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
    respuesta = productos.SALUDO;
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

// ───────── Webhook de confirmación de pago (Botón Bancolombia) ─────────
// Aislado del bot. Si no hay credenciales, no hace nada.
app.post("/webhook/bancolombia", (req, res) => {
  if (!pagos.activo()) return res.sendStatus(503);
  if (!pagos.validarWebhook(req)) {
    console.error("Webhook Bancolombia: firma inválida o no validada");
    return res.sendStatus(401);
  }
  // TODO: leer estado del pago, marcar pedido pagado y avisar al cliente.
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Bot de RS Publicidad escuchando en el puerto ${PORT}`);
  });
}

module.exports = { app, procesarMensaje };
