const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*COTIZACIÓN DE TRASLADO*";

const flowSubmenuOp6 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Traslados*, con gusto te damos seguimiento.")
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ name: ctx.body, type_of_service: type_of_Service });
    }
  )
  .addAnswer(
    `¿A qué aeropuerto necesitas trasladarte?\n\nPor favor proporciona el nombre completo del aeropuerto.\n_(En caso de que tu traslado no sea al aeropuerto, escribe "no")_`,
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        airportName: ctx.body,
        phoneNumberClientTransfer: ctx.from,
      });
    }
  )
  .addAnswer(
    `Nombre del lugar u hotel de destino.\n*(Ejemplo):* Fiesta Americana Inn`,
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, hotelName: ctx.body });
    }
  )
  .addAnswer(
    "¿Para cuántas personas incluidas usted?",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, numberOfPeople: ctx.body });
    }
  )
  .addAction(async (_, { state, flowDynamic }) => {
    const myState = state.getMyState();
    const summaryTransfer = `
        *COTIZACIÓN DE TRASLADO:*
        Nombre: ${myState.name}
        Aeropuerto de traslado: ${myState.airportName}
        Hotel de destino: ${myState.hotelName}
        Número de personas: ${myState.numberOfPeople}
        Número de celular: ${myState.phoneNumberClientTransfer}
      `;

    try {
      const db = await connectDB();
      const collection = db.collection("cotizaciones");
      console.log("Connected Successfully to MongoDB!");

      const insertResult = await collection.insertOne({
        type_of_service: myState.type_of_service,
        name: myState.name,
        airportName: myState.airportName,
        hotelName: myState.hotelName,
        numberOfPeople: myState.numberOfPeople,
        phoneNumberClientTransfer: myState.phoneNumberClientTransfer,
      });

      console.log(insertResult);
      console.log("Summary has been sent to MongoDB!");

      await flowDynamic([
        {
          body: `Este es el resumen de tu cotización de traslado:\n${summaryTransfer}`,
        },
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.name}*.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*",
        },
      ]);
    } catch (error) {
      console.error("Error MongoDB:", error);
      await flowDynamic(
        "Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo más tarde."
      );
    }
  });

module.exports = flowSubmenuOp6;
