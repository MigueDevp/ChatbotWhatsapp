const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const flowMenu = require("../flowMenu");

const type_of_Service = "*COTIZACIÓN AUTOBÚS*";

const flowSubmenuOp1 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Autobús*, con gusto te damos seguimiento.")
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ name: ctx.body, type_of_service: type_of_Service });
    }
  )
  .addAnswer(
    "¿Cuál es el destino del autobús? \n*(EJEMPLO):* Tehotihuacán.",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        destination: ctx.body,
        numberCellphoneClient: ctx.from,
      });
    }
  )
  .addAnswer(
    "¿Cuál es la fecha en la que planeas realizar este viaje?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ travelDate: ctx.body });
    }
  )
  .addAnswer(
    "¿Qué movimientos o paradas adicionales necesitas hacer una vez en el destino? Esto nos ayuda a entender mejor tus necesidades de transporte en el lugar.",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ movements: ctx.body });
    }
  )
  .addAction(async (ctx, { state, flowDynamic }) => {
    const myState = state.getMyState();
    await state.update({ ...myState, plan: ctx.body });

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

      const summaryBus = `
        *COTIZACIÓN DE AUTOBÚS:*
        Nombre: ${myState.name}
        Destino: ${myState.destination}
        Fecha del viaje: ${myState.travelDate}
        Movimientos adicionales en el destino: ${myState.movements}
        Número de celular: ${myState.numberCellphoneClient}
      `;

      await flowDynamic([
        { body: `Este es el resumen de tu cotización de autobús:\n${summaryBus}` },
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento.\nAgradecemos mucho tu paciencia, *${myState.name}*.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*",
        },
      ]);
    } catch (error) {
      console.error("Error MongoDB:", error);
    }
  })

module.exports = {
  flowSubmenuOp1,
};
