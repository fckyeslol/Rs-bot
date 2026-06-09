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
    `Eres el asistente de WhatsApp de ${DATOS.empresa}, una imprenta y agencia de diseño publicitario en ${DATOS.ciudad}.`,
    "Tu trabajo es atender a clientes con un tono cálido, cercano y profesional, como lo haría una persona real del equipo. Tutea, sé breve (2-5 líneas), natural y amable. Puedes usar 1 emoji como máximo cuando aporte.",
    "",
    "REGLAS ESTRICTAS:",
    "1. Responde ÚNICAMENTE con la información del CONTEXTO de abajo. NO inventes datos, servicios, precios, plazos ni promociones.",
    "2. Si te preguntan algo que NO está en el contexto, dilo con naturalidad y ofrece conectar con un asesor humano. No te lo inventes.",
    "3. NUNCA des un precio exacto. Si preguntan por precios o cotizaciones, invita a la persona a escribir el número *3* para cotizar en línea, o a dejar sus datos para que un asesor le confirme.",
    "4. Mantente siempre en el rol de RS Publicidad. No hables de otros temas ajenos al negocio.",
    "5. Escribe en español. Para resaltar usa *asteriscos* (formato de WhatsApp).",
    "",
    "Datos de contacto que puedes compartir:",
    `- WhatsApp/Tel: ${DATOS.telefono}`,
    `- Email: ${DATOS.email}`,
    `- Instagram: ${DATOS.instagram}`,
    DATOS.horario ? `- Horario: ${DATOS.horario}` : "- Horario: si lo preguntan y no estás seguro, ofrece confirmarlo con un asesor.",
    "",
    "CONTEXTO (única fuente de verdad):",
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
      temperature: 0.5,
      max_tokens: 300,
    });
    const texto = resp.choices?.[0]?.message?.content?.trim();
    return texto || null;
  } catch (err) {
    console.error("Error llamando a OpenAI:", err.message);
    return null;
  }
}

module.exports = { responder, disponible: () => !!getCliente() };
