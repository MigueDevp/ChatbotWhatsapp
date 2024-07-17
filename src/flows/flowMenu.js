const { addKeyword } = require("@bot-whatsapp/bot");
const flowOp1 = require("./flowsOptions/flowOp1");
const flowOp2 = require("./flowsOptions/flowOp2");
const flowOp3 = require("./flowsOptions/flowOp3");
const flowOp4 = require("./flowsOptions/flowOp4");
const flowOp5 = require("./flowsOptions/flowOp5");
const flowOp6 = require("./flowsOptions/flowOp6");
const flowOp7 = require("./flowsOptions/flowOp7");
const flowOp8 = require("./flowsOptions/flowOp8");
const flowOp9 = require("./flowsOptions/flowOp9");
const flowOp10 = require("./flowsOptions/flowOp10");

//MENU PRINCIPAL DE ACCIONES DEL CHATBOT
const flowMenu = addKeyword("menu").addAnswer(
  "Este es el menu de opciones \n" +
    "\n" +
    "1. Cotizar destino *nacional* ✈️🌎 \n" +
    "2. Cotizar destino *internacional* 🌏✈️\n" +
    "3. Cotizar otros servicios 🚎 \n" +
    "4. Cambios en mi reserva ⏱️\n" +
    "5. Estado de mi adeudo ✅\n" +
    "6. Reembolsos ⬅️\n" +
    "7. Facturación 📄\n" +
    "8. Tu Visa Americana con TravelMR 🇺🇸\n" +
    "9. Tu Visa Canadiense con TravelMR 🇨🇦\n" +
    "  10. Vuelos ✈️↔️\n" +
    " 11. Salir" +
    "\n" +
    "\n" +
    "*Por favor ingresa una opcion acorde a su número* \n" +
    "\n" +
    "Por ejemplo: *1*",
  { capture: true },
  async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
    if (
      !["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"].includes(
        ctx.body
      )
    ) {
      return fallBack(
        "Respuesta no válida, por favor selecciona una de las opciones ."
      );
    }
    switch (ctx.body) {
      case "1":
        return gotoFlow(flowOp1);
      case "2":
        return gotoFlow(flowOp2);
      case "3":
        return gotoFlow(flowOp3);
      case "4":
        return gotoFlow(flowOp4);
      case "5":
        return gotoFlow(flowOp5);
      case "6":
        return gotoFlow(flowOp6);
      case "7":
        return gotoFlow(flowOp7);
      case "8":
        return gotoFlow(flowOp8);
      case "9":
        return gotoFlow(flowOp9);
      case "10":
        return gotoFlow(flowOp10);

      case "11":
        break;
    }
  }
);

module.exports = flowMenu;
