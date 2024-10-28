const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");

const type_of_Service = "*COTIZACIÓN AUTOBÚS*";

const flowSubmenuOp1 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Autobús*, con gusto te damos seguimiento.")
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        nameBus: ctx.body,
        type_of_serviceBus: type_of_Service,
      });
    }
  )
  .addAnswer(
    "¿Cuál es el destino del autobús? \n*(EJEMPLO):* Teotihuacán.",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        destinationBus: ctx.body,
        numberCellphoneClientBus: ctx.from,
      });
    }
  )
  .addAnswer(
    "¿Cuál es la fecha en la que planeas realizar este viaje?",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, travelDateBus: ctx.body });
    }
  )
  .addAnswer(
    "¿Qué movimientos o paradas adicionales necesitas hacer una vez en el destino? Esto nos ayuda a entender mejor tus necesidades de transporte en el lugar.",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, movementsBus: ctx.body });

      const myStateNow = state.getMyState();

      const summaryBusShow = `
        *COTIZACIÓN DE AUTOBÚS:*
        Nombre: ${myStateNow.nameBus}
        Destino: ${myStateNow.destinationBus}
        Fecha del viaje: ${myStateNow.travelDateBus}
        Número de celular: ${myStateNow.numberCellphoneClientBus}
      `;

      const summaryBus = `
        *COTIZACIÓN DE AUTOBÚS:*
        Nombre: ${myStateNow.nameBus}
        Destino: ${myStateNow.destinationBus}
        Fecha del viaje: ${myStateNow.travelDateBus}
        Movimientos adicionales en el destino: ${myStateNow.movementsBus}
        Número de celular: ${myStateNow.numberCellphoneClientBus}
      `;

      await flowDynamic([
        {
          body: `Este es el resumen de tu cotización de autobús:\n${summaryBusShow}`,
        },
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento.\nAgradecemos mucho tu paciencia, *${myState.nameBus}*.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*",
        },
      ]);

      (async () => {
        try {
          const db = await connectDB();
          const collection = db.collection("cotizaciones");

          await collection.insertOne({
            type_of_service: myStateNow.type_of_serviceBus,
            name: myStateNow.nameBus,
            destinationBus: myStateNow.destinationBus,
            travelDateBus: myStateNow.travelDateBus,
            movementsBus: myStateNow.movementsBus,
            numberCellphoneClientBus: myStateNow.numberCellphoneClientBus,
          });

          console.log("Summary has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️" ',
            to: "travelmrbot@gmail.com",
            subject: "Cotización de Autobús",
            text: `¡Hola Ejecutiv@ de TRAVELMR!, Tienes una nueva cotización:\n${summaryBus}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", {
            summaryBus,
          });
        } catch (error) {
          console.error("Error MongoDB:", error);
        }
      })();
    }
  );

module.exports = flowSubmenuOp1;
