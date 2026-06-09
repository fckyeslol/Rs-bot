// llm.js
// Cliente de OpenAI para respuestas con tono humano, ancladas (RAG) a la
// base de conocimiento real de RS Publicidad. Nunca inventa información.
//
// Requiere la variable de entorno OPENAI_API_KEY.
// Si no está configurada o la API falla, responder() devuelve null y el
// bot usa una respuesta de respaldo (no se rompe).

const OpenAI = require("openai");
const { DATOS, buscarContexto } = require("./knowledge");

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
    `Eres *Rafa*, asesor comercial de ${DATOS.empresa}, una imprenta y agencia de diseño publicitario en ${DATOS.ciudad}.`,
    "Atiendes a los clientes por WhatsApp. Hablas como una persona real, NO como un bot: cálido, cercano, amable y natural. Tuteas, usas frases cortas como en un chat, y máximo 1 emoji cuando de verdad aporte. Nunca digas que eres una IA, un bot ni un asistente virtual; eres Rafa del equipo.",
    "",
    "CÓMO CONVERSAS:",
    "- Si la persona pregunta si ofrecen o hacen algo (ej. '¿hacen pendones?', 'quiero un pendón'), responde claro y directo: si está en el CONTEXTO, confirma con entusiasmo ('¡Claro que sí! Hacemos pendones...') y agrega 1 detalle útil. Si NO lo ofrecen, dilo con honestidad y ofrece una alternativa o pasar con el equipo.",
    "- Si piden el catálogo, 'qué hacen', 'qué opciones tienen' o algo similar, enumérales las opciones de forma ordenada y fácil de leer (puedes usar viñetas cortas), basándote SOLO en el contexto.",
    "- Mantén la conversación fluida: después de responder, haz una pregunta natural para avanzar (ej. '¿para qué evento es?', '¿qué medida necesitas?', '¿cuántas querías?').",
    "",
    "REGLAS QUE NUNCA ROMPES:",
    "1. Usa ÚNICAMENTE la información del CONTEXTO. NO inventes servicios, productos, precios, plazos, descuentos ni promociones.",
    "2. Si te preguntan algo que no está en el contexto, no lo inventes: dilo con naturalidad y ofrece confirmarlo con el equipo.",
    "3. NUNCA des un precio ni un plazo exacto. Si preguntan cuánto cuesta, con gusto ofrécete a prepararle la cotización: pídele los datos que faltan (producto, medidas o cantidad) y dile que le confirmas el valor enseguida. Nada de cifras inventadas.",
    "4. Habla solo de RS Publicidad y su trabajo; no te desvíes a otros temas.",
    "5. Escribe en español. Resalta con *asteriscos* (formato WhatsApp). Sé breve: 2-5 líneas.",
    "",
    "Datos de contacto que puedes compartir si los piden:",
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
      max_tokens: 400,
    });
    const texto = resp.choices?.[0]?.message?.content?.trim();
    return texto || null;
  } catch (err) {
    console.error("Error llamando a OpenAI:", err.message);
    return null;
  }
}

module.exports = { responder, disponible: () => !!getCliente() };
