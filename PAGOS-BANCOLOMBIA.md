# Botón Bancolombia por APIs — Guía de integración

Esta guía resume cómo conectar el bot con el **Botón Bancolombia** para que confirme pagos automáticamente. El código ya tiene el esqueleto listo (`pagos.js` + el webhook `/webhook/bancolombia` en `index.js`); lo que falta es el trámite con Bancolombia y completar el contrato real.

## Paso 1 — Vincular tu comercio (lo haces tú, no es autoservicio)

El Botón Bancolombia por APIs requiere onboarding con el banco:

1. Contacta a tu **ejecutivo comercial / gerente de cuenta de Bancolombia** y pide vincular tu comercio al *Botón Bancolombia con integración por APIs*.
2. Requisitos:
   - Tu comercio y el cliente deben tener **cuenta activa** que permita créditos y débitos.
   - Debes estar inscrito en **Clave Dinámica** (desde la App Bancolombia).
3. Negocia las **tarifas** por transacción con tu gerente.

## Paso 2 — Acceso de desarrollador

1. Entra a **developer.bancolombia.com** (API Market) y crea tu cuenta.
2. Solicita las credenciales **Client-Id** y **Client-Secret** por el formulario de la mesa de ayuda (soportedevs.bancolombia.com).
3. Pide acceso al **Sandbox** para probar sin dinero real.
4. Descarga la **documentación técnica** del API del Botón Bancolombia: endpoints, payloads y el mecanismo de confirmación (webhook/firma). La autenticación es **OAuth 2.0 + JWT**.

## Paso 3 — Completar el código (cuando tengas el sandbox)

En `pagos.js`, ajusta donde dice `TODO` con el contrato real:

- La URL del token y los parámetros del OAuth2.
- El endpoint y el payload de creación de cobro (`crearCobro`).
- El mecanismo de validación de firma del webhook (`validarWebhook`).

En `index.js`, el endpoint `POST /webhook/bancolombia` ya recibe la notificación; completa el bloque `TODO` para leer el estado del pago, marcar el pedido como pagado y (opcional) avisar al cliente por WhatsApp.

## Paso 4 — Variables de entorno (en Railway → Variables)

```
BANCOLOMBIA_CLIENT_ID=...
BANCOLOMBIA_CLIENT_SECRET=...
BANCOLOMBIA_TOKEN_URL=...
BANCOLOMBIA_API_URL=...
BANCOLOMBIA_WEBHOOK_SECRET=...
PUBLIC_URL=https://rs-bot-production.up.railway.app
```

La URL que registras en Bancolombia para la confirmación es:
`https://rs-bot-production.up.railway.app/webhook/bancolombia`

## Flujo final (cómo quedará)

1. El cliente acepta una cotización con Rafa.
2. El bot genera un cobro con `crearCobro()` y le envía el **link / Botón Bancolombia**.
3. El cliente paga desde su cuenta Bancolombia.
4. Bancolombia llama a `/webhook/bancolombia` con el resultado.
5. El bot **valida la firma**, confirma el pago y le responde al cliente "¡Pago recibido! ✅".

## Importante

- **Prueba todo en sandbox antes de producción.** No conectes dinero real hasta validar el flujo completo.
- Nunca subas las credenciales al repo: van solo en las Variables de Railway (este proyecto ya las ignora en git).
- Mientras no haya credenciales, la integración está **desactivada** y el bot funciona normal.
