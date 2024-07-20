const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*COTIZACIÓN AUTOBÚS*";

const flowSubmenuOp1 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Autobús*, con gusto te damos seguimiento.")

  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ nameBus: ctx.body, type_of_serviceBus: type_of_Service });
    }
  )

  .addAnswer(
    "¿Cuál es el destino del autobús? \n*(EJEMPLO):* Tehotihuacán.",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        destinationBus: ctx.body,
        numberCellphoneClientBus: ctx.from,
      });
    }
  )

  .addAnswer(
    "¿Cuál es la fecha en la que planeas realizar este viaje?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ travelDateBus: ctx.body });
    }
  )

  .addAnswer(
    "¿Qué movimientos o paradas adicionales necesitas hacer una vez en el destino? Esto nos ayuda a entender mejor tus necesidades de transporte en el lugar.",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      await state.update({ movementsBus: ctx.body });

      try {
        const db = await connectDB();
        const myState = state.getMyState();
        const collection = db.collection("cotizaciones");
        console.log("Connected Successfully to MongoDB!");

        const insertResult = await collection.insertOne({
          type_of_service: myState.type_of_serviceBus,
          name: myState.nameBus,
          destinationBus: myState.destinationBus,
          travelDateBus: myState.travelDateBus,
          movementsBus: myState.movementsBus,
          numberCellphoneClientBus: myState.numberCellphoneClientBus,
        });

        console.log(insertResult);
        console.log("Summary has been sent to MongoDB!");

        const summaryBus = `
          *COTIZACIÓN DE AUTOBÚS:*
          Nombre: ${myState.nameBus}
          Destino: ${myState.destinationBus}
          Fecha del viaje: ${myState.travelDateBus}
          Movimientos adicionales en el destino: ${myState.movementsBus}
          Número de celular: ${myState.numberCellphoneClientBus}
        `;

        await flowDynamic([
          {
            body: `Este es el resumen de tu cotización de autobús:\n${summaryBus}`,
          },
          {
            body:
              `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento.\nAgradecemos mucho tu paciencia, *${myState.nameBus}*.` +
              "\n\n" +
              "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*",
          },
        ]);
      } catch (error) {
        console.error("Error MongoDB:", error);
      }
    }
  );

module.exports = flowSubmenuOp1;
