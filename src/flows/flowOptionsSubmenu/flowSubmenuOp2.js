const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");

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

      const myStateNow = state.getMyState();

      const summaryVanShow = `
        *COTIZACIÓN DE VAN:*
        Nombre: ${myStateNow.nameVan}
        Destino de la Van: ${myStateNow.destinationVan}
        Fecha del viaje: ${myStateNow.travelDateVan}
        Número de celular: ${myStateNow.numberCellphoneClientVan}
      `;


      const summaryVan = `
        *COTIZACIÓN DE VAN:*
        Nombre: ${myStateNow.nameVan}
        Destino de la Van: ${myStateNow.destinationVan}
        Fecha del viaje: ${myStateNow.travelDateVan}
        Movimientos adicionales en el destino: ${myStateNow.movementsVan}
        Número de celular: ${myStateNow.numberCellphoneClientVan}
      `;


      await flowDynamic([
        {
          body: `Este es el resumen de tu cotización de Van:\n${summaryVanShow}`,
        },
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.nameVan}*.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*",
        },
      ]);

      (async () => {
        try {
          const db = await connectDB();
          const collection = db.collection("cotizaciones");
          const myState = state.getMyState();

          await collection.insertOne({
            type_of_service: myState.type_of_serviceVan,
            name: myState.nameVan,
            destination: myState.destinationVan,
            travelDate: myState.travelDateVan,
            movements: myState.movementsVan,
            numberCellphoneClient: myState.numberCellphoneClientVan,
          });

          console.log("Summary has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️"',
            to: "travelmrbot@gmail.com",
            subject: "Cotización de Van",
            text: `¡Hola Ejecutiv@ de TRAVELMR!, Tienes una nueva cotización:\n${summaryVan}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", {
            summaryVan,
          });
        } catch (error) {
          console.error("Error MongoDB:", error);
        }
      })();
    }
  );

module.exports = flowSubmenuOp2;
