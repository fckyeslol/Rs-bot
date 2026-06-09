// index.js
// Bot de WhatsApp para RS Publicidad usando Twilio + Express.
// Cuando una persona escribe cualquier mensaje, recibe un menú interactivo.
// La navegación es por códigos (1, 2... / 11, 12... / 21, 22...) sin
// necesidad de guardar estado de sesión. Ver mapa en messages.js.

const express = require("express");
const twilio = require("twilio");
const M = require("./messages");

const app = express();
app.use(express.urlencoded({ extended: false }));

const { MessagingResponse } = twilio.twiml;

// Palabras que disparan el menú de bienvenida
const SALUDOS = [
  "hola", "buenas", "buenos dias", "buenas tardes", "buenas noches",
  "menu", "inicio", "info", "informacion", "volver", "atras",
  "hi", "hello", "ola", "start", "empezar",
];

// Normaliza el texto: minúsculas, sin tildes, sin espacios sobrantes
function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function elegirRespuesta(mensajeUsuario) {
  const texto = normalizar(mensajeUsuario);

  // ¿Es un código del menú o submenú? (1, 11, 21, etc.)
  if (M.RESPUESTAS[texto]) return M.RESPUESTAS[texto];

  // ¿Es un saludo o pide el menú/volver?
  if (SALUDOS.includes(texto)) return M.BIENVENIDA;

  // ¿El mensaje contiene un saludo dentro de una frase ("hola, necesito...")?
  if (SALUDOS.some((s) => texto.includes(s))) return M.BIENVENIDA;

  // Ante cualquier otro mensaje mostramos la bienvenida.
  // Cámbialo por M.NO_ENTIENDO si prefieres pedir que aclaren.
  return M.BIENVENIDA;
}

// Webhook que Twilio llamará cuando llegue un mensaje de WhatsApp
app.post("/webhook", (req, res) => {
  const entrante = req.body.Body || "";
  const respuesta = elegirRespuesta(entrante);

  const twiml = new MessagingResponse();
  twiml.message(respuesta);

  res.type("text/xml").send(twiml.toString());
});

// Endpoint de salud para verificar que el servidor está vivo
app.get("/", (_req, res) => {
  res.send("Bot de WhatsApp de RS Publicidad activo ✅");
});

const PORT = process.env.PORT || 3000;
// Solo arranca el servidor si se ejecuta directamente (node index.js),
// no cuando se importa desde test.js.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Bot de RS Publicidad escuchando en el puerto ${PORT}`);
  });
}

module.exports = { app, elegirRespuesta };
