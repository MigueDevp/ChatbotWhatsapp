const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*COTIZACIÓN DE TRANSPORTE SPRINTER*";

const flowSubmenuOp3 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Sprinter*, con gusto te damos seguimiento.")

  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        nameSpr: ctx.body,
        type_of_serviceSpr: type_of_Service,
      });
    }
  )

  .addAnswer(
    "¿Cuál es el destino de la Sprinter? \n*(EJEMPLO):* Puerto Vallarta",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        destinationSpr: ctx.body,
        numberCellphoneClientSpr: ctx.from,
      });
    }
  )

  .addAnswer(
    "¿Cuál es la fecha en la que planeas realizar este viaje?",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, travelDateSpr: ctx.body });
    }
  )

  .addAnswer(
    "¿Qué movimientos o paradas adicionales necesitas hacer una vez en el destino? Esto nos ayuda a entender mejor tus necesidades de transporte en el lugar.",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, movementsSpr: ctx.body });

      try {
        const db = await connectDB();
        const myState = state.getMyState();
        const collection = db.collection("cotizaciones");
        console.log("Connected Successfully to MongoDB!");

        const insertResult = await collection.insertOne({
          type_of_service: myState.type_of_serviceSpr,
          name: myState.nameSpr,
          destination: myState.destinationSpr,
          travelDate: myState.travelDateSpr,
          movements: myState.movementsSpr,
          numberCellphoneClient: myState.numberCellphoneClientSpr,
        });

        console.log(insertResult);
        console.log("Summary has been sent to MongoDB!");

        const summarySprinter = `
          *COTIZACIÓN DE SPRINTER:*
          Nombre: ${myState.nameSpr}
          Destino de la Sprinter: ${myState.destinationSpr}
          Fecha del viaje: ${myState.travelDateSpr}
          Movimientos adicionales en el destino: ${myState.movementsSpr}
          Número de celular: ${myState.numberCellphoneClientSpr}
        `;

        await flowDynamic([
          {
            body: `Este es el resumen de tu cotización de Sprinter:\n${summarySprinter}`,
          },
          {
            body:
              `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.nameSpr}*.` +
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

module.exports = flowSubmenuOp3;
