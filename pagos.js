// pagos.js
// ───────────────────────────────────────────────────────────────
//  Integración con el BOTÓN BANCOLOMBIA por APIs  (ESQUELETO)
// ───────────────────────────────────────────────────────────────
//  ⚠️ IMPORTANTE — LÉEME ANTES DE USAR
//
//  Esta es la ESTRUCTURA lista para conectar. Los endpoints exactos,
//  los nombres de los campos y el mecanismo de confirmación los entrega
//  Bancolombia cuando vinculas tu comercio y te dan acceso al sandbox
//  (developer.bancolombia.com). NO los inventamos aquí.
//
//  Donde veas "TODO" debes ajustar al contrato real de TU sandbox.
//
//  Autenticación: OAuth 2.0 con client_credentials (+ JWT), según la
//  documentación de Bancolombia.
//
//  Variables de entorno (ver .env.example):
//    BANCOLOMBIA_CLIENT_ID
//    BANCOLOMBIA_CLIENT_SECRET
//    BANCOLOMBIA_TOKEN_URL      (URL para pedir el token OAuth2)
//    BANCOLOMBIA_API_URL        (URL base de la API de cobros)
//    BANCOLOMBIA_WEBHOOK_SECRET (para validar las notificaciones)
//
//  Mientras no existan las credenciales, el módulo queda DESACTIVADO
//  y el bot funciona normal.
// ───────────────────────────────────────────────────────────────

// ¿Está configurada la integración? Si no, queda inactiva (no rompe nada).
function activo() {
  return Boolean(
    process.env.BANCOLOMBIA_CLIENT_ID &&
      process.env.BANCOLOMBIA_CLIENT_SECRET &&
      process.env.BANCOLOMBIA_TOKEN_URL &&
      process.env.BANCOLOMBIA_API_URL
  );
}

// Caché simple del token para no pedirlo en cada cobro.
let tokenCache = { value: null, expira: 0 };

// Obtiene un token OAuth2 (client_credentials). Patrón estándar; ajusta
// el cuerpo/headers exactos según la doc de tu sandbox.
async function obtenerToken() {
  const ahora = Date.now();
  if (tokenCache.value && ahora < tokenCache.expira) return tokenCache.value;

  const cred = Buffer.from(
    `${process.env.BANCOLOMBIA_CLIENT_ID}:${process.env.BANCOLOMBIA_CLIENT_SECRET}`
  ).toString("base64");

  const resp = await fetch(process.env.BANCOLOMBIA_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${cred}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    // TODO: confirmar 'scope' y demás parámetros con la doc de Bancolombia.
    body: "grant_type=client_credentials",
  });

  if (!resp.ok) {
    throw new Error(`Error obteniendo token Bancolombia: ${resp.status}`);
  }

  const data = await resp.json();
  // TODO: confirmar nombres reales ('access_token', 'expires_in').
  const segundos = Number(data.expires_in || 300);
  tokenCache = {
    value: data.access_token,
    expira: ahora + (segundos - 30) * 1000, // 30s de margen
  };
  return tokenCache.value;
}

// Crea un cobro / inicia la transferencia y devuelve los datos para
// redirigir al cliente al Botón Bancolombia.
//   datos = { referencia, valor, descripcion }
// Devuelve lo que responda la API (ej. una URL de pago / id de transacción).
async function crearCobro({ referencia, valor, descripcion }) {
  const token = await obtenerToken();

  const resp = await fetch(`${process.env.BANCOLOMBIA_API_URL}/cobros`, {
    // TODO: ajustar la ruta '/cobros' y el método al endpoint real.
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // TODO: ajustar los nombres de los campos al payload real del sandbox.
    body: JSON.stringify({
      referencia,
      valor,
      descripcion,
      // urlRetorno: process.env.PUBLIC_URL + "/pago/ok",
      // urlConfirmacion: process.env.PUBLIC_URL + "/webhook/bancolombia",
    }),
  });

  if (!resp.ok) {
    throw new Error(`Error creando cobro Bancolombia: ${resp.status}`);
  }
  return resp.json();
}

// Valida que una notificación (webhook) venga realmente de Bancolombia.
// TODO: implementar según el mecanismo de firma que indique la doc
// (suele ser un HMAC con un secreto, o una firma en un header).
function validarWebhook(req) {
  const secreto = process.env.BANCOLOMBIA_WEBHOOK_SECRET;
  if (!secreto) return false;

  // EJEMPLO de validación por header (ajustar al real):
  // const firma = req.headers["x-bancolombia-signature"];
  // const esperado = crypto.createHmac("sha256", secreto)
  //   .update(JSON.stringify(req.body)).digest("hex");
  // return firma === esperado;

  // Por ahora, sin el contrato real, NO damos por válido nada.
  return false;
}

module.exports = { activo, obtenerToken, crearCobro, validarWebhook };
