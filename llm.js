// llm.js
// Cliente de OpenAI para respuestas con tono humano, ancladas (RAG) a la
// base de conocimiento real de RS Publicidad. Nunca inventa información.
//
// Requiere la variable de entorno OPENAI_API_KEY.
// Si no está configurada o la API falla, responder() devuelve null y el
// bot usa una respuesta de respaldo (no se rompe).

const OpenAI = require("openai");
const { DATOS, buscarContexto } = require("./knowledge");
const { CATALOGO } = require("./productos");

// Catálogo + variables a pedir por producto, para que Richard sepa qué
// ofrecemos y qué datos necesita para cotizar.
const CATALOGO_TXT = CATALOGO.map(
  (p) => `- ${p.nombre}: ${p.info} Para cotizar pide: ${p.variables.join("; ")}.`
).join("\n");

// El modelo y la URL base se eligen por variables de entorno, así el mismo
// código sirve para OpenAI o para DeepSeek (que es compatible con el SDK):
//
//   • OpenAI   → OPENAI_API_KEY=sk-...        (sin OPENAI_BASE_URL)
//                OPENAI_MODEL=gpt-4o-mini
//   • DeepSeek → OPENAI_API_KEY=sk-...(de DeepSeek)
//                OPENAI_BASE_URL=https://api.deepseek.com
//                OPENAI_MODEL=deepseek-v4-flash
const MODELO = process.env.OPENAI_MODEL || "gpt-4o-mini";
const BASE_URL = process.env.OPENAI_BASE_URL || undefined;

let cliente = null;
function getCliente() {
  if (cliente) return cliente;
  if (!process.env.OPENAI_API_KEY) return null;
  cliente = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: BASE_URL, // undefined = usa OpenAI por defecto
  });
  return cliente;
}

function construirSystemPrompt(contexto) {
  return [
    `Eres *Richard Castelar*, del equipo de diseño de ${DATOS.empresa}, una imprenta y agencia de diseño en ${DATOS.ciudad}.`,
    "Atiendes por WhatsApp como una persona real, NUNCA como un bot. Eres cálido, cercano y natural. Tuteas.",
    "",
    "ESTILO (muy importante):",
    "- Mensajes CORTOS, como un chat real: 1 a 3 líneas. Nada de párrafos largos ni textos gigantes.",
    "- Una sola idea por mensaje. Si necesitas varios datos, pídelos en una lista breve.",
    "- Máximo 1 emoji, y solo si suma. Nunca digas que eres IA, bot o asistente virtual.",
    "",
    "QUÉ HACES:",
    "- Si el cliente menciona o pide un producto, confírmale con naturalidad que sí lo hacemos y pídele SOLO los datos que falten para cotizar (mira la lista de abajo). Pídelos en una lista corta o uno a uno.",
    "- Si pide ver qué productos hay, enuméraselos brevemente desde el CATÁLOGO.",
    "- ENTIENDE las aclaraciones y correcciones. Si el cliente dice 'no, mejor...' o aclara algo (ej. 'unos stickers para mi laptop'), ajústate a lo que quiere decir; NO repitas el mismo mensaje anterior.",
    "- Si algo no está en el catálogo ni el contexto, dilo con sinceridad y ofrece confirmarlo con el equipo. No inventes.",
    "- Mantén la charla viva: termina con una pregunta corta que ayude a avanzar.",
    "",
    "REGLAS QUE NUNCA ROMPES:",
    "1. Usa SOLO la información del CATÁLOGO y el CONTEXTO. No inventes servicios, productos, precios, plazos ni promociones.",
    "2. NUNCA des un precio ni un plazo exacto. Si preguntan cuánto cuesta, pide los datos del producto y di que le confirmas el valor enseguida.",
    "3. Habla solo de RS Publicidad. Responde en español. Resalta con *asteriscos*.",
    "",
    "CATÁLOGO Y QUÉ PEDIR PARA COTIZAR:",
    CATALOGO_TXT,
    "",
    "Datos de contacto si los piden:",
    `- WhatsApp/Tel: ${DATOS.telefono}`,
    `- Email: ${DATOS.email}`,
    `- Instagram: ${DATOS.instagram}`,
    DATOS.horario ? `- Horario: ${DATOS.horario}` : "- Horario: si lo preguntan y no estás seguro, ofrece confirmarlo.",
    "",
    "CONTEXTO (tu única fuente de verdad sobre lo que ofrece RS Publicidad):",
    contexto,
  ].join("\n");
}

// Genera una respuesta humana basada en el contexto recuperado.
// `historial` es un array opcional de turnos previos:
//   [{ role: "user"|"assistant", content: "..." }]
// Devuelve string, o null si no se pudo (sin key / error).
async function responder(mensajeUsuario, historial = []) {
  const api = getCliente();
  if (!api) return null;

  const chunks = buscarContexto(mensajeUsuario, 4);
  const contexto = chunks.map((c) => "• " + c.texto).join("\n");

  const mensajes = [
    { role: "system", content: construirSystemPrompt(contexto) },
    ...historial.slice(-6), // últimos turnos para dar continuidad
    { role: "user", content: mensajeUsuario },
  ];

  try {
    const resp = await api.chat.completions.create({
      model: MODELO,
      messages: mensajes,
      temperature: 0.7,
      max_tokens: 220, // mensajes cortos, estilo chat
    });
    const texto = resp.choices?.[0]?.message?.content?.trim();
    return texto || null;
  } catch (err) {
    console.error("Error llamando a OpenAI:", err.message);
    return null;
  }
}

module.exports = { responder, disponible: () => !!getCliente() };
