const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*COTIZACIÓN DE TRANSPORTE VAN*";

const flowSubmenuOp2 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Van*, con gusto te damos seguimiento.")

  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        nameVan: ctx.body,
        type_of_serviceVan: type_of_Service,
      });
    }
  )

  .addAnswer(
    "¿Cuál es el destino de la Van? \n*(EJEMPLO):* Playa del Carmen.",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        destinationVan: ctx.body,
        numberCellphoneClientVan: ctx.from,
      });
    }
  )

  .addAnswer(
    "¿Cuál es la fecha en la que planeas realizar este viaje?",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, travelDateVan: ctx.body });
    }
  )

  .addAnswer(
    "¿Qué movimientos o paradas adicionales necesitas hacer una vez en el destino? Esto nos ayuda a entender mejor tus necesidades de transporte en el lugar.",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, movementsVan: ctx.body });

      try {
        const db = await connectDB();
        const myState = state.getMyState();
        const collection = db.collection("cotizaciones");
        console.log("Connected Successfully to MongoDB!");

        const insertResult = await collection.insertOne({
          type_of_service: myState.type_of_serviceVan,
          name: myState.nameVan,
          destination: myState.destinationVan,
          travelDate: myState.travelDateVan,
          movements: myState.movementsVan,
          numberCellphoneClient: myState.numberCellphoneClientVan,
        });

        console.log(insertResult);
        console.log("Summary has been sent to MongoDB!");

        const summaryVan = `
          *COTIZACIÓN DE VAN:*
          Nombre: ${myState.nameVan}
          Destino de la Van: ${myState.destinationVan}
          Fecha del viaje: ${myState.travelDateVan}
          Movimientos adicionales en el destino: ${myState.movementsVan}
          Número de celular: ${myState.numberCellphoneClientVan}
        `;

        await flowDynamic([
          {
            body: `Este es el resumen de tu cotización de Van:\n${summaryVan}`,
          },
          {
            body:
              `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.nameVan}*.` +
              "\n\n" +
              "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*",
          },
        ]);
      } catch (error) {
        console.error("Error MongoDB:", error);
        await flowDynamic(
          "Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo más tarde."
        );
      }
    }
  );

module.exports = flowSubmenuOp2;
