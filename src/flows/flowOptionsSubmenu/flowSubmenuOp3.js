const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");
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

      const myStateNow = state.getMyState();

      const summarySprinterShow = `
        *COTIZACIÓN DE SPRINTER:*
        Nombre: ${myStateNow.nameSpr}
        Destino de la Sprinter: ${myStateNow.destinationSpr}
        Fecha del viaje: ${myStateNow.travelDateSpr}
        Número de celular: ${myStateNow.numberCellphoneClientSpr}
      `;


      const summarySprinter = `
        *COTIZACIÓN DE SPRINTER:*
        Nombre: ${myStateNow.nameSpr}
        Destino de la Sprinter: ${myStateNow.destinationSpr}
        Fecha del viaje: ${myStateNow.travelDateSpr}
        Movimientos adicionales en el destino: ${myStateNow.movementsSpr}
        Número de celular: ${myStateNow.numberCellphoneClientSpr}
      `;



      await flowDynamic([
        {
          body: `Este es el resumen de tu cotización de Sprinter:\n${summarySprinterShow}`,
        },
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.nameSpr}*.` +
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
            type_of_service: myState.type_of_serviceSpr,
            name: myState.nameSpr,
            destination: myState.destinationSpr,
            travelDate: myState.travelDateSpr,
            movements: myState.movementsSpr,
            numberCellphoneClient: myState.numberCellphoneClientSpr,
          });

          console.log("Summary has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️" <angelrr.ti22@utsjr.edu.mx>',
            to: "miguedevp@gmail.com",
            subject: "Cotización de Sprinter",
            text: `¡Hola Ejecutiva de TRAVELMR!, Tienes una nueva cotización:\n${summarySprinter}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", {
            summarySprinter,
          });
        } catch (error) {
          console.error("Error MongoDB:", error);
        }
      })();
    }
  );

module.exports = flowSubmenuOp3;
