const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

//FUNCION PRINCIPAL QUE RECIBE CUALQUIER MENSAJE Y ENVIA EL FORMATO DEL MENSJE DE BIENVENIDA
const flowWelcome = addKeyword(EVENTS.WELCOME).addAnswer([
  "❤️ *¡Hola Viajero!* ❤️\n\nSoy el Chatbot de TravelMR, es un placer tenerte con nosotros. 🫶 \n" +
    "\n" +
    "Puedes ver nuestra cartelera de viajes ingresando en el siguiente enlace \n" +
    " -> https://travelmr.com.mx/view/viajes \n" +
    "\n\n" +
    "Si deseas ver el menú de opciones de este chatbot escribe la palabra: *INICIO*",
]);

module.exports = flowWelcome;
