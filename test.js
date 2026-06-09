// test.js
// Prueba la lógica de respuestas y el flujo de cotización sin Twilio.
// Ejecuta:  node test.js

const { procesarMensaje } = require("./index");

// Simula una conversación: una misma sesión para varios mensajes seguidos.
function conversacion(nombre, pasos) {
  const sesion = { paso: null, producto: null, visto: Date.now() };
  console.log("\n===== " + nombre + " =====");
  let ok = true;
  for (const entrada of pasos) {
    const r = procesarMensaje(entrada, sesion);
    const valido = typeof r === "string" && r.length > 0;
    if (!valido) ok = false;
    console.log('> "' + entrada + '"  ->  ' + r.split("\n")[0]);
  }
  return ok;
}

let todoOk = true;

// Navegación básica del menú
todoOk = conversacion("Menú y submenús", [
  "Hola", "1", "13", "2", "21", "4", "5", "6", "menú",
]) && todoOk;

// Cotización por cantidad (litografía): producto 1 = tarjetas
todoOk = conversacion("Cotizar tarjetas (por cantidad)", [
  "3", "1", "2",
]) && todoOk;

// Cotización por medidas (gran formato): producto 6 = pendón
todoOk = conversacion("Cotizar pendón (por medidas)", [
  "3", "6", "0.85x2",
]) && todoOk;

// Cotización con medidas mal escritas, luego corregidas
todoOk = conversacion("Medidas inválidas y corrección", [
  "3", "7", "no sé", "1,5 x 3",
]) && todoOk;

// Cancelar a mitad de cotización con "menú"
todoOk = conversacion("Cancelar a mitad de flujo", [
  "3", "1", "menú", "2",
]) && todoOk;

// Pasar a asesor desde el menú de cotización
todoOk = conversacion("Pedir asesor (opción 0)", [
  "3", "0",
]) && todoOk;

console.log("\nResultado global: " + (todoOk ? "TODO OK ✅" : "HAY FALLOS ❌"));
process.exit(todoOk ? 0 : 1);
