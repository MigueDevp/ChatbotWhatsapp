const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*COTIZACIÓN DE TRANSPORTE SPRINTER*";

const flowSubmenuOp3 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Sprinter*, con gusto te damos seguimiento.")
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ name: ctx.body, type_of_service: type_of_Service });
    }
  )
  .addAnswer(
    "¿Cuál es el destino de la Sprinter? \n*(EJEMPLO):* Puerto Vallarta.",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        destination: ctx.body,
        numberCellphoneClient: ctx.from,
      });
    }
  )
  .addAnswer(
    "¿Cuál es la fecha en la que planeas realizar este viaje?",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, travelDate: ctx.body });
    }
  )
  .addAnswer(
    "¿Qué movimientos o paradas adicionales necesitas hacer una vez en el destino? Esto nos ayuda a entender mejor tus necesidades de transporte en el lugar.",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, movements: ctx.body });
    }
  )
  .addAction(async (_, { state, flowDynamic }) => {
    const myState = state.getMyState();
    const summarySprinter = `
        *COTIZACIÓN DE SPRINTER:*
        Nombre: ${myState.name}
        Destino de la Sprinter: ${myState.destination}
        Fecha del viaje: ${myState.travelDate}
        Movimientos adicionales en el destino: ${myState.movements}
        Número de celular: ${myState.numberCellphoneClient}
      `;

    try {
      const db = await connectDB();
      const collection = db.collection("cotizaciones");
      console.log("Connected Successfully to MongoDB!");

      const insertResult = await collection.insertOne({
        type_of_service: myState.type_of_service,
        name: myState.name,
        destination: myState.destination,
        travelDate: myState.travelDate,
        movements: myState.movements,
        numberCellphoneClient: myState.numberCellphoneClient,
      });

      console.log(insertResult);
      console.log("Summary has been sent to MongoDB!");

      await flowDynamic([
        {
          body: `Este es el resumen de tu cotización de Sprinter:\n${summarySprinter}`,
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

module.exports = flowSubmenuOp3;
