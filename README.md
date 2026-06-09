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
2. **Render** (gratis) para alojar el código.
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

### 3. Desplegar en Render
- Entra a <https://render.com> → **New → Web Service** → conecta tu repositorio.
- Configura:
  - **Build Command:** `npm install`
  - **Start Command:** `npm start`
  - **Environment:** Node
- (Opcional) En **Environment Variables** agrega `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` si más adelante envías mensajes salientes.
- Render te dará una URL como: `https://rs-publicidad-bot.onrender.com`

### 4. Conectar Twilio con tu servidor
- En la consola de Twilio, abre la configuración del Sandbox de WhatsApp.
- En el campo **"When a message comes in"** pega tu URL del webhook:

  ```
  https://TU-URL.onrender.com/webhook
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
