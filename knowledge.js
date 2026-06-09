// knowledge.js
// ───────────────────────────────────────────────────────────────
//  BASE DE CONOCIMIENTO de RS Publicidad (RAG ligero)
// ───────────────────────────────────────────────────────────────
//  Toda la información de abajo es REAL, tomada del sitio web oficial.
//  El bot SOLO puede responder con base en estos textos; no inventa.
//
//  Cada elemento de CHUNKS es un "fragmento" de conocimiento. El
//  recuperador (buscarContexto) elige los más relevantes para la
//  pregunta del cliente y se los pasa al LLM como única fuente.
//
//  Para enseñarle algo nuevo al bot, agrega un chunk aquí. (Si más
//  adelante quieres un RAG con embeddings, esta misma lista sirve
//  como corpus.)
// ───────────────────────────────────────────────────────────────

// Datos de contacto verificados (del sitio).
const DATOS = {
  empresa: "RS Publicidad",
  ciudad: "Barranquilla, Colombia",
  direccion: "Cra. 41 No. 51 - 69, Barranquilla, Colombia",
  telefono: "+57 315 413 3225",
  whatsapp: "https://wa.me/573154133225",
  email: "comercial@rspublicidad.com.co",
  web: "https://www.rspublicidad.com.co",
  instagram: "https://instagram.com/rs.publicidad",
  // ⚠️ Horario: ajústalo si es distinto. Si no estás seguro, déjalo vacío ("")
  // y el bot ofrecerá confirmarlo con un asesor en vez de inventarlo.
  horario: "Lunes a Viernes, 8:00 a.m. – 6:00 p.m.",
};

const CHUNKS = [
  {
    tema: "quienes somos",
    texto:
      "RS Publicidad es una empresa de Barranquilla (Colombia) dedicada al diseño publicitario y a la producción de impresos con la más alta calidad. Cuenta con un equipo multidisciplinario y talentoso, ofrece atención personalizada y se posiciona como aliado estratégico de empresas que quieren comunicar mejor. Trabaja con entregas en los tiempos convenidos.",
  },
  {
    tema: "servicio diseño imagen corporativa logos marca",
    texto:
      "Servicio 1 — Imagen Corporativa & Diseño: propuestas integrales en diseño gráfico publicitario y creación de imagen corporativa, según las necesidades de cada cliente. Incluye logos, identidad visual, campañas publicitarias, desarrollo de marca y fotografía publicitaria. Comunicación estratégica y tendencias actuales.",
  },
  {
    tema: "servicio litografia impresos revistas tarjetas papeleria",
    texto:
      "Servicio 2 — Litografía & Impresos: estructura tecnológica novedosa para impresos de alta calidad. Productos: revistas, catálogos, carpetas, plegables, libros, agendas, volantes, afiches, calendarios, tarjetas y papelería corporativa.",
  },
  {
    tema: "servicio gran formato pendones vallas vinilos impresion digital",
    texto:
      "Servicio 3 — Gran Formato e Impresión Digital: tintas solventes y eco solventes para mayor fijación y nitidez. Productos: pendones, vallas, pasacalles, backing, vinilos, microperforados y floographic. Acabados en acrílico, cajas de luz, señalización y decoración.",
  },
  {
    tema: "servicio material pop souvenir merchandising regalos",
    texto:
      "Servicio 4 — Material POP & Souvenir: material POP empresarial como apoyo a campañas, regalos de fidelización, merchandising para ferias y congresos, regalos institucionales y navideños. Productos: mugs, camisas, gorras, USBs, bolígrafos y más.",
  },
  {
    tema: "productos litografia catalogo",
    texto:
      "Productos de litografía: tarjetas de presentación, afiches y volantes, brochures corporativos, carpetas corporativas, revistas y catálogos, plegables corporativos, cuadernos, agendas y bloc de notas, calendarios de pared y escritorio, talonarios y recibos, papelería corporativa, libros y bitácoras.",
  },
  {
    tema: "productos gran formato catalogo",
    texto:
      "Productos de gran formato: pendones roll up y tipo araña, publi poster, vallas exteriores, microperforado, vinilo adhesivo y vinilo decorativo.",
  },
  {
    tema: "productos avisos acabados letreros senaletica",
    texto:
      "Productos de avisos y acabados: avisos en acrílico, letreros corporativos 3D, letreros de fachada, avisos luminosos y neón, avisos en caja de luz, decoración interior comercial, señalética, habladores y tótems, publicaciones en acrílico.",
  },
  {
    tema: "productos stands ferias",
    texto:
      "Productos de stands: stand personalizado y stand pop up display. Ideales para ferias, congresos y activaciones de marca.",
  },
  {
    tema: "productos material pop merchandising mugs usb",
    texto:
      "Productos de material POP: souvenir y merchandising, mugs, USBs, manillas, camisas, gorras, bolígrafos y regalos institucionales y navideños.",
  },
  {
    tema: "trabajos clientes portafolio",
    texto:
      "Trabajos destacados de RS Publicidad: letrero corporativo 3D para Centro Médico CMC; fachadas para Nazareth y Uniminuto; avisos para Grupo Bosc, Chiko's y Good Mood; stand para Salud Familiar IPS; además de proyectos de imagen corporativa, gran formato y litografía para empresas de Barranquilla y la región Caribe.",
  },
  {
    tema: "cotizar precios cotizacion presupuesto",
    texto:
      "Para cotizar, el cliente puede usar la cotización en línea del bot escribiendo el número 3, donde elige el producto e indica cantidad o medidas. Los precios exactos los confirma un asesor. RS Publicidad asesora sin compromiso.",
  },
  {
    tema: "contacto ubicacion direccion telefono horario",
    texto:
      `Contacto de RS Publicidad: sede en ${DATOS.direccion}. Teléfono ${DATOS.telefono}. Email ${DATOS.email}. WhatsApp ${DATOS.whatsapp}. Instagram ${DATOS.instagram}. Web ${DATOS.web}.` +
      (DATOS.horario ? ` Horario de atención: ${DATOS.horario}.` : ""),
  },
];

// Quita tildes y pasa a minúsculas para comparar.
function normalizar(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Palabras de relleno que NO deben usarse para recuperar (no aportan tema).
const STOPWORDS = new Set([
  "donde", "como", "cual", "cuales", "para", "por", "que", "los", "las",
  "una", "uno", "del", "con", "sin", "mas", "muy", "este", "esta", "esto",
  "tienen", "tiene", "hacen", "hace", "puedo", "puede", "quiero", "necesito",
  "estan", "esta", "soy", "son", "ustedes", "tengo", "hay", "algo", "sobre",
  "y", "o", "el", "la", "lo", "un", "me", "te", "se", "su", "de", "en", "a",
]);

// Recuperador por solapamiento de RAÍCES de palabra (RAG ligero).
// Devuelve los `k` chunks más relevantes a la consulta. Usar raíces
// (primeros caracteres) hace que "ubicados" calce con "ubicación", etc.
function buscarContexto(consulta, k = 4) {
  const palabras = normalizar(consulta)
    .split(/[^a-z0-9ñ]+/i)
    .filter((p) => p.length >= 4 && !STOPWORDS.has(p));

  if (palabras.length === 0) {
    // Sin palabras útiles: devolvemos lo esencial (somos + contacto).
    return [CHUNKS[0], CHUNKS[CHUNKS.length - 1]];
  }

  const puntuados = CHUNKS.map((c) => {
    const base = normalizar(c.tema + " " + c.texto);
    let score = 0;
    for (const p of palabras) {
      const raiz = p.slice(0, 5); // raíz: primeros 5 caracteres
      if (base.includes(raiz)) score += 1;
    }
    return { c, score };
  });

  const relevantes = puntuados
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((x) => x.c);

  // Si nada coincidió, devolvemos contexto general para no dejar al LLM a ciegas.
  if (relevantes.length === 0) return [CHUNKS[0], CHUNKS[CHUNKS.length - 1]];
  return relevantes;
}

module.exports = { DATOS, CHUNKS, buscarContexto };
