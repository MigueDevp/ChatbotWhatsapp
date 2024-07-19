const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*COTIZACIÓN DE TOUR*";

const flowSubmenuOp7 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Tour*, con gusto te damos seguimiento.")
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ name: ctx.body, type_of_service: type_of_Service });
    }
  )
  .addAnswer(
    "¿Cuál es el destino del tour que deseas cotizar?\n*(EJEMPLO):* Ciudad de México.",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        destination: ctx.body,
        numberCellClient: ctx.from,
      });
    }
  )
  .addAnswer(
    "¿Para cuántas personas incluidas usted?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ numberOfPeople: ctx.body });
    }
  )
  .addAction(async (_, { state, flowDynamic }) => {
    const myState = state.getMyState();
    const summaryTour = `
        *COTIZACIÓN DE TOUR:*
        Nombre: ${myState.name}
        Destino del tour: ${myState.destination}
        Número de personas: ${myState.numberOfPeople}
        Número de celular: ${myState.numberCellClient}
      `;

    try {
      const db = await connectDB();
      const collection = db.collection("cotizaciones");
      console.log("Connected Successfully to MongoDB!");

      const insertResult = await collection.insertOne({
        type_of_service: myState.type_of_service,
        name: myState.name,
        destination: myState.destination,
        numberOfPeople: myState.numberOfPeople,
        numberCellClient: myState.numberCellClient,
      });

      console.log(insertResult);
      console.log("Summary has been sent to MongoDB!");

      await flowDynamic([
        {
          body: `Este es el resumen de tu cotización de tour:\n${summaryTour}`,
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

module.exports = flowSubmenuOp7;
