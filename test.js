// test.js
// Prueba rápida de la lógica de respuestas sin necesidad de Twilio.
// Ejecuta:  node test.js

const { elegirRespuesta } = require("./index");

const casos = [
  // saludos / menú
  "Hola", "buenas tardes", "MENÚ", "volver",
  // menú principal
  "1", "2", "3", "4", "5", "6",
  // submenú servicios
  "11", "12", "13", "14",
  // submenú productos
  "21", "22", "23", "24", "25",
  // frases libres / desconocido
  "necesito unas tarjetas", "99",
];

let ok = 0;
for (const c of casos) {
  const r = elegirRespuesta(c);
  const valido = typeof r === "string" && r.length > 0;
  if (valido) ok++;
  const estado = valido ? "OK" : "XX";
  const primeraLinea = r.split("\n")[0];
  console.log("[" + estado + '] "' + c + '" -> ' + primeraLinea);
}

console.log("\nResultado: " + ok + "/" + casos.length + " respuestas generadas correctamente.");
process.exit(ok === casos.length ? 0 : 1);
