# Bot de WhatsApp · RS Publicidad

Respuestas automáticas para WhatsApp con **Twilio**. Cuando una persona escribe *"Hola"* (o cualquier mensaje), el bot responde con un **menú interactivo** y entrega información prearmada según el número que elija el cliente.

```
1  📐 Servicios          →  11 Diseño · 12 Litografía · 13 Gran Formato · 14 Material POP
2  📦 Productos          →  21 Litografía · 22 Gran Formato · 23 Avisos & Acabados · 24 Stands · 25 Material POP
3  💰 Cotizar un proyecto
4  🏢 Quiénes somos
5  📍 Ubicación y contacto
6  📞 Hablar con un asesor
```

La navegación usa **códigos** (sin memoria de sesión): el cliente escribe `1` para ver servicios y luego `13` para el detalle de Gran Formato, por ejemplo. Escribir *menú* o *volver* regresa al inicio. Todo el contenido (servicios, catálogo de productos, trabajos destacados, contacto) proviene del sitio web de RS Publicidad.

---

## 📁 Archivos

| Archivo          | Para qué sirve |
|------------------|----------------|
| `index.js`       | Servidor que recibe los mensajes de Twilio y responde. |
| `messages.js`    | **Aquí editas los textos** de bienvenida, servicios, productos, etc. |
| `package.json`   | Dependencias del proyecto. |
| `.env.example`   | Plantilla de variables de entorno. |
| `test.js`        | Prueba la lógica sin necesidad de Twilio. |

> Para cambiar lo que responde el bot, edita **`messages.js`**. No necesitas tocar nada más.

---

## ✅ Recomendación de hosting

La forma más fácil y económica de tener esto en línea es **Render.com** (tiene plan gratuito) o **Railway.app**. Ambos despliegan directo desde un repositorio de GitHub y te dan una URL pública (https) que es justo lo que Twilio necesita para enviarte los mensajes.

Resumen del camino recomendado:

1. **Twilio Sandbox de WhatsApp** para probar gratis (sin número propio ni aprobación de Meta).
2. **Railway** (plan de $5/mes) para alojar el código. Ventaja sobre planes gratuitos: el servicio no se "duerme", así que las respuestas son siempre instantáneas.
3. Cuando ya funcione, solicitas un **número de WhatsApp de producción** en Twilio.

---

## 🚀 Puesta en marcha (paso a paso)

### 1. Crear cuenta en Twilio
- Entra a <https://www.twilio.com/try-twilio> y regístrate.
- En la consola busca **Messaging → Try it out → Send a WhatsApp message**.
- Activa el **Sandbox**: Twilio te da un número (ej. `+1 415 523 8886`) y un código tipo `join algo-algo`.
- Desde tu WhatsApp personal, envía ese código al número del sandbox para vincularte. Ya puedes recibir y enviar mensajes de prueba.

### 2. Subir el código a GitHub
- Crea un repositorio nuevo (privado o público).
- Sube esta carpeta completa **menos** el archivo `.env` (nunca subas tus credenciales).

### 3. Desplegar en Railway ($5/mes)
- Entra a <https://railway.app> → **New Project → Deploy from GitHub repo** → elige tu repositorio.
- Railway detecta Node automáticamente. No necesitas configurar Build ni Start (usa `npm install` y el `npm start` del `package.json`). Tampoco fijes `PORT`: Railway lo asigna solo y el código ya lo lee con `process.env.PORT`.
- (Opcional) En la pestaña **Variables** agrega `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` si más adelante envías mensajes salientes.
- Genera la URL pública: pestaña **Settings → Networking → Generate Domain**. Te dará algo como `https://rs-publicidad-bot.up.railway.app`.

### 4. Conectar Twilio con tu servidor
- En la consola de Twilio, abre la configuración del Sandbox de WhatsApp.
- En el campo **"When a message comes in"** pega tu URL del webhook:

  ```
  https://TU-URL.up.railway.app/webhook
  ```

- Método: **HTTP POST**. Guarda.

### 5. Probar
- Desde tu WhatsApp, escribe **"Hola"** al número del sandbox.
- Debes recibir el menú de bienvenida. Responde **1**, **2**, **3**… y verás cada respuesta. 🎉

---

## 🧪 Probar localmente (sin Twilio)

```bash
npm install
npm test       # verifica que todas las respuestas se generan
npm start      # levanta el servidor en http://localhost:3000
```

Para simular un mensaje entrante con curl:

```bash
curl -X POST http://localhost:3000/webhook \
  --data-urlencode "Body=Hola"
```

---

## 💰 Cotización en línea (precios)

Cuando el cliente elige la opción **3**, el bot abre un flujo conversacional: le pide el producto, luego la **cantidad** (litografía y material POP) o las **medidas en metros** (gran formato), y le devuelve la cotización ahí mismo.

Los precios se editan en **`pricing.js`**. Ahora están en `0`, así que el bot toma los datos y responde *"precio por confirmar"*. En cuanto reemplaces los `0` por tus valores reales, mostrará el total calculado automáticamente.

- Productos por **cantidad**: cada paquete tiene `{ unidades, precio }`, donde `precio` es el total en COP por ese paquete.
- Productos por **m²**: defines `precioM2` (COP por metro cuadrado) y `minM2` (área mínima a cobrar). El bot calcula `área × precioM2`.

Para agregar o quitar productos cotizables, edita la lista `PRODUCTOS` en `pricing.js`; el menú de cotización se arma solo a partir de ella.

> Nota: el bot recuerda en qué punto va cada conversación guardando el estado **en memoria** por número de WhatsApp (ideal para una sola instancia, como el plan Hobby de Railway). Si algún día escalas a varias réplicas, ese estado debería moverse a una base como Redis.

---

## 🤖 Respuestas humanas con IA (OpenAI o DeepSeek + RAG)

Para que el bot no suene "robótico", las preguntas en lenguaje natural se responden con un **LLM** (OpenAI o DeepSeek), pero **ancladas a la información real** de RS Publicidad (no inventa nada).

Cómo funciona (híbrido):

- Los **códigos del menú** (1, 2, 11, 21...) y la **cotización en línea** se responden con código exacto e instantáneo.
- Los **saludos y preguntas libres** ("¿hacen vallas?", "¿dónde están?", "necesito algo para una feria") van al LLM, que responde con tono cálido y humano.
- El LLM solo puede usar la base de conocimiento de **`knowledge.js`** (RAG ligero): un recuperador elige los fragmentos relevantes a cada pregunta y se los pasa como única fuente. Si preguntan algo que no está ahí, ofrece conectar con un asesor en vez de inventar. Nunca da precios exactos (deriva a la opción *3*).

Puedes usar **OpenAI** o **DeepSeek** (DeepSeek es compatible con el mismo SDK, así que el código es el mismo; solo cambian las variables). DeepSeek suele ser más económico.

**Opción A · OpenAI** — en Railway → **Variables**:

- `OPENAI_API_KEY` = tu key de <https://platform.openai.com/api-keys>
- `OPENAI_MODEL` = `gpt-4o-mini` (opcional, es el valor por defecto)

**Opción B · DeepSeek** — en Railway → **Variables**:

- `OPENAI_API_KEY` = tu key de <https://platform.deepseek.com>
- `OPENAI_BASE_URL` = `https://api.deepseek.com`
- `OPENAI_MODEL` = `deepseek-v4-flash`

> Nota: el modelo `deepseek-chat` se descontinúa el 24/07/2026; usa `deepseek-v4-flash` (rápido/económico) o `deepseek-v4-pro`.

Si algún día quitas la key, el bot sigue funcionando con el menú por números (no se rompe).

Para enseñarle algo nuevo al bot, agrega un fragmento a la lista `CHUNKS` en `knowledge.js`. Los datos de contacto y el horario se editan en el objeto `DATOS` del mismo archivo.

> 💡 Costo: cada pregunta en lenguaje natural es una llamada a OpenAI (con `gpt-4o-mini` el costo por mensaje es de fracciones de centavo). Los mensajes que usan el menú o la cotización **no** llaman al LLM, así que no cuestan nada.

---

## ✏️ Personalizar los mensajes

Abre `messages.js` y edita el texto entre las comillas. Algunos formatos útiles de WhatsApp:

- `*texto*` → **negrita**
- `_texto_` → _cursiva_
- Emojis y saltos de línea funcionan normal.

---

## 📈 Pasar a producción (número real)

Cuando el sandbox funcione bien:

1. En Twilio solicita un **WhatsApp Sender** (número propio). Requiere una cuenta de **Meta WhatsApp Business** y aprobación de Meta.
2. Repite el paso 4 (apuntar el webhook a tu URL) pero ahora sobre el número de producción.
3. Si quieres enviar mensajes proactivos (no solo responder), Meta exige usar **plantillas aprobadas**.

---

## 💡 Notas

- El bot, por defecto, ante un mensaje desconocido vuelve a mostrar el menú de bienvenida. Si prefieres que diga "no entendí", abre `index.js` y cambia el `return M.BIENVENIDA;` final por `return M.NO_ENTIENDO;`.
- Datos de contacto y enlaces ya están cargados desde el sitio web de RS Publicidad (WhatsApp 315 413 3225, email comercial@rspublicidad.com.co, Barranquilla).
