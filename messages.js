// messages.js
// Mensajes prearmados del bot de WhatsApp de RS Publicidad.
// Toda la información proviene del sitio web oficial.
//
// La navegación es por CÓDIGOS (sin memoria de sesión):
//   Menú principal:  1, 2, 3, 4, 5, 6
//   Submenú servicios:  11, 12, 13, 14
//   Submenú productos:  21, 22, 23, 24, 25
//
// Para cambiar lo que responde el bot, edita solo los textos de abajo.

const WHATSAPP_HUMANO = "https://wa.me/573154133225";
const EMAIL = "comercial@rspublicidad.com.co";
const WEB = "https://www.rspublicidad.com.co";
const INSTAGRAM = "https://instagram.com/rs.publicidad";
const DIRECCION = "Cra. 41 No. 51 - 69, Barranquilla, Colombia";
const TELEFONO = "+57 315 413 3225";

const PIE = "\n\nEscribe *menú* para volver al inicio.";

/* ───────────────────────── MENÚ PRINCIPAL ───────────────────────── */

const BIENVENIDA = `¡Hola! 👋 Bienvenido/a a *RS Publicidad* 🎨🖨️
_Imprenta online · Diseño & Producción · Barranquilla, Colombia_

Creamos e imprimimos tus ideas con la más alta calidad. ¿En qué te podemos ayudar hoy?

Responde con un *número*:

*1*  📐 Servicios
*2*  📦 Productos / catálogo
*3*  💰 Cotizar un proyecto
*4*  🏢 Quiénes somos
*5*  📍 Ubicación y contacto
*6*  📞 Hablar con un asesor`;

/* ───────────────────────── 1 · SERVICIOS ───────────────────────── */

const SERVICIOS = `📐 *Nuestros servicios*

Cuatro frentes de trabajo, una misma promesa: alta calidad, asesoría real y entregas en los tiempos convenidos.

*11*  ✏️ Imagen Corporativa & Diseño
*12*  🖨️ Litografía & Impresos
*13*  🏗️ Gran Formato e Impresión Digital
*14*  🎁 Material POP & Souvenir

Responde con el número del servicio para ver el detalle.${PIE}`;

const SERV_DISENO = `✏️ *01 · Imagen Corporativa & Diseño*

Propuestas integrales en diseño gráfico publicitario y creación de imagen corporativa, atendiendo los requerimientos y necesidades de cada cliente. Comunicación estratégica y tendencias actuales.

Incluye: Logos · Identidad visual · Campañas publicitarias · Desarrollo de marca · Fotografía publicitaria.

¿Lo cotizamos? Escribe *3*.${PIE}`;

const SERV_LITO = `🖨️ *02 · Litografía & Impresos*

Estructura tecnológica novedosa para ofrecer impresos de alta calidad: revistas, catálogos, carpetas, plegables, libros, agendas, volantes, afiches, calendarios, tarjetas y papelería corporativa.

Ver el catálogo de productos de litografía: escribe *21*.
¿Lo cotizamos? Escribe *3*.${PIE}`;

const SERV_GF = `🏗️ *03 · Gran Formato e Impresión Digital*

Tintas solventes y eco solvente para mayor fijación y nitidez: pendones, vallas, pasacalles, backing, vinilos, microperforados y floographic. Acabados en acrílico, cajas de luz, señalización y decoración.

Ver productos de gran formato: escribe *22*.
¿Lo cotizamos? Escribe *3*.${PIE}`;

const SERV_POP = `🎁 *04 · Material POP & Souvenir*

Material POP a nivel empresarial como apoyo a campañas: regalos de fidelización, merchandising para ferias y congresos, regalos institucionales y navideños. Mugs, camisas, gorras, USBs, bolígrafos y más.

Ver productos POP: escribe *25*.
¿Lo cotizamos? Escribe *3*.${PIE}`;

/* ───────────────────────── 2 · PRODUCTOS ───────────────────────── */

const PRODUCTOS = `📦 *Nuestros productos*

Todo lo producimos en casa con los más altos estándares. Elige una categoría:

*21*  🖨️ Litografía
*22*  🏗️ Gran Formato
*23*  ✨ Avisos & Acabados
*24*  🎪 Stands
*25*  🎁 Material POP

Mira ejemplos en Instagram: ${INSTAGRAM}${PIE}`;

const PROD_LITO = `🖨️ *Litografía*

• Tarjetas de presentación
• Afiches & volantes
• Brochures corporativos
• Carpetas corporativas
• Revistas & catálogos
• Plegables corporativos
• Cuadernos, agendas & bloc de notas
• Calendarios de pared y escritorio
• Talonarios & recibos
• Papelería corporativa
• Libros & bitácoras

¿Cotizamos alguno? Escribe *3*.${PIE}`;

const PROD_GF = `🏗️ *Gran Formato*

• Pendones roll up y tipo araña
• Publi poster
• Vallas exteriores
• Microperforado
• Vinilo adhesivo
• Vinilo decorativo

¿Cotizamos alguno? Escribe *3*.${PIE}`;

const PROD_AVISOS = `✨ *Avisos & Acabados*

• Avisos en acrílico
• Letreros corporativos 3D
• Letreros de fachada
• Avisos luminosos & neón
• Avisos en caja de luz
• Decoración interior comercial
• Señalética, habladores & tótem
• Publicaciones en acrílico

¿Cotizamos alguno? Escribe *3*.${PIE}`;

const PROD_STANDS = `🎪 *Stands*

• Stand personalizado
• Stand pop up display

Ideales para ferias, congresos y activaciones de marca.
¿Cotizamos el tuyo? Escribe *3*.${PIE}`;

const PROD_POP = `🎁 *Material POP*

• Souvenir & merchandising
• Mugs · USBs · manillas y más
• Camisas, gorras, bolígrafos
• Regalos institucionales y navideños

¿Cotizamos alguno? Escribe *3*.${PIE}`;

/* ───────────────────────── 3 · COTIZAR ───────────────────────── */

const COTIZAR = `💰 *Cotiza tu proyecto sin compromiso*

Cuéntanos qué necesitas: producto, cantidad, medidas y fecha de entrega; y te enviamos una cotización a la medida.

Puedes responder por aquí mismo con los detalles, o contactarnos directo:

📲 WhatsApp asesor: ${WHATSAPP_HUMANO}
📧 Email: ${EMAIL}
🌐 Web: ${WEB}

Te asesoramos sin compromiso. 🙌${PIE}`;

/* ───────────────────────── 4 · SOMOS ───────────────────────── */

const SOMOS = `🏢 *Somos RS Publicidad*

Una empresa dedicada al diseño publicitario y a la producción de impresos con la más alta calidad. Aliados estratégicos de empresas que quieren comunicar mejor.

Contamos con un equipo multidisciplinario y talentoso, con atención personalizada: asesoría y acompañamiento en todo el proceso para alcanzar tus objetivos de mercado.

🏅 *Trabajos destacados:* Centro Médico CMC (letrero 3D), fachadas Nazareth & Uniminuto, avisos Grupo Bosc · Chiko's · Good Mood, stand Salud Familiar IPS y más, en Barranquilla y la región Caribe.${PIE}`;

/* ───────────────────────── 5 · UBICACIÓN ───────────────────────── */

const UBICACION = `📍 *Ubicación y contacto*

🏢 Sede: ${DIRECCION}
📞 Teléfono: ${TELEFONO}
📧 Email: ${EMAIL}
🌐 Web: ${WEB}
📷 Instagram: ${INSTAGRAM}

🕗 Horario: Lunes a Viernes, 8:00 a.m. – 6:00 p.m.
¡Te esperamos!${PIE}`;

/* ───────────────────────── 6 · ASESOR ───────────────────────── */

const ASESOR = `📞 *Hablar con un asesor*

Con gusto te atendemos personalmente. Escríbenos directo y un miembro del equipo te responderá:

📲 WhatsApp: ${WHATSAPP_HUMANO}
📧 Email: ${EMAIL}

🕗 Horario de atención: Lunes a Viernes, 8:00 a.m. – 6:00 p.m.${PIE}`;

/* ───────────────────────── FALLBACK ───────────────────────── */

const NO_ENTIENDO = `No estoy seguro de haber entendido 🤔

Responde con un número del menú, o escribe *menú* para ver todas las opciones.`;

/* ───────────────── MAPA DE RESPUESTAS POR CÓDIGO ───────────────── */
// index.js usa este objeto para responder. La clave es lo que escribe
// el cliente; el valor es el mensaje que recibe.

const RESPUESTAS = {
  // menú principal
  "1": SERVICIOS,
  "2": PRODUCTOS,
  "3": COTIZAR,
  "4": SOMOS,
  "5": UBICACION,
  "6": ASESOR,
  // submenú servicios
  "11": SERV_DISENO,
  "12": SERV_LITO,
  "13": SERV_GF,
  "14": SERV_POP,
  // submenú productos
  "21": PROD_LITO,
  "22": PROD_GF,
  "23": PROD_AVISOS,
  "24": PROD_STANDS,
  "25": PROD_POP,
};

module.exports = {
  BIENVENIDA,
  NO_ENTIENDO,
  RESPUESTAS,
};
