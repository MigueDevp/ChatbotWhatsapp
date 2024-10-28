//DESARROLLADO POR MIGUEL ANGEL RAMIREZ RAMIREZ
//CHATBOT SOPORTE TECNICO PARA EMPRESA "LOGISTICA EN TURISMO INTERNACIONAL SA. DE CV."

//https://github.com/MigueDevp/Chatbot-Empresa-MR-LOGISTICA-EN-TURISMO-INTERNACIONAL-SA.-DE-CV..git

//DEPENDENCIAS DEL BOT
const { createBot, createProvider, createFlow } = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MongoAdapter = require("@bot-whatsapp/database/mongo");
//FLOWS PRINCIPALES
const flowWelcome = require("./src/flows/flowWelcome");
const flowMenu = require("./src/flows/flowMenu");
//LISTA DE FLOWS DEL MENÚ DE OPCIONES
const flowOp1 = require("./src/flows/flowsOptions/flowOp1");
const flowOp2 = require("./src/flows/flowsOptions/flowOp2");
const flowOp3 = require("./src/flows/flowsOptions/flowOp3");
const flowOp4 = require("./src/flows/flowsOptions/flowOp4");
const flowOp5 = require("./src/flows/flowsOptions/flowOp5");
const flowOp6 = require("./src/flows/flowsOptions/flowOp6");
const flowOp7 = require("./src/flows/flowsOptions/flowOp7");
const flowOp8 = require("./src/flows/flowsOptions/flowOp8");
const flowOp9 = require("./src/flows/flowsOptions/flowOp9");
const flowOp10 = require("./src/flows/flowsOptions/flowOp10");
//LISTA DE FLOWS SUBMENÚ
const flowSubmenuOp1 = require("./src/flows/flowOptionsSubmenu/flowSubmenuOp1");
const flowSubmenuOp2 = require("./src/flows/flowOptionsSubmenu/flowSubmenuOp2");
const flowSubmenuOp3 = require("./src/flows/flowOptionsSubmenu/flowSubmenuOp3");
const flowSubmenuOp4 = require("./src/flows/flowOptionsSubmenu/flowSubmenuOp4");
const flowSubmenuOp5 = require("./src/flows/flowOptionsSubmenu/flowSubmenuOp5");
const flowSubmenuOp6 = require("./src/flows/flowOptionsSubmenu/flowSubmenuOp6");


//FUNCION PRINCIPAL
const main = async () => {
  const adapterDB = new MongoAdapter({
    dbUri: "mongodb://localhost:27017",
    dbName: "cotizaciones",
  });

  //LISTA DE FLOWS
  const adapterFlow = createFlow([
    flowWelcome,
    flowMenu,
    flowOp1,
    flowOp2,
    flowOp3,
    flowOp4,
    flowOp5,
    flowOp6,
    flowOp7,
    flowOp8,
    flowOp9,
    flowOp10,
    flowSubmenuOp1,
    flowSubmenuOp2,
    flowSubmenuOp3,
    flowSubmenuOp4,
    flowSubmenuOp5,
    flowSubmenuOp6,
  ]);

  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};


main();
