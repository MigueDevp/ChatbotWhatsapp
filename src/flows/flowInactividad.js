const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowInactividad = addKeyword(EVENTS.ACTION).addAnswer(
  "Proceso terminado por inactividad. Si deseas continuar, escribe *MENU* para volver al menú principal."
);

console.log("INACTIVIDAD EXEDIÓ 15 MINUTOS");

module.exports = flowInactividad;
