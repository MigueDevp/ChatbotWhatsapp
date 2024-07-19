const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*COTIZACIÓN DESTINO INTERNACIONAL*";
const flowOp2 = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Elegiste *Cotizar mi viaje internacional*, con gusto te damos seguimiento"
  )
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ name: ctx.body, type_of_service: type_of_Service });
    }
  )
  .addAnswer(
    "¡Un placer conocerte! ¿Qué destino deseas visitar?",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        destinationInternational: ctx.body,
        phoneNumberClientInternational: ctx.from,
      });
    }
  )
  .addAnswer(
    "¿Mes del año deseado para viajar?\n*(EJEMPLO): Enero*",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, travelMonth: ctx.body });
    }
  )
  .addAnswer(
    "¿Cuántos días desea viajar?",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, travelDays: ctx.body });
    }
  )
  .addAnswer(
    "Número de personas incluidas usted",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, peopleInternational: ctx.body });
    }
  )
  .addAnswer(
    '¿Lleva menores de edad? Si es así, ¿qué edades tienen?\n*(Ejemplo A):* 5\n*(Ejemplo B):* 5 y 14\n*(Ejemplo C):* 5, 14 y 8\nSi no van menores de edad, escriba *"NO"*',
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, minorsInternational: ctx.body });
    }
  )
  .addAction(async (ctx, { state, flowDynamic }) => {
    try {
      const db = await connectDB();
      const collection = db.collection("cotizaciones");
      console.log("Connected Successfully to MongoDB!");
      const myState = state.getMyState();
      const insertResult = await collection.insertOne({
        type_of_service: myState.type_of_service,
        name: myState.name,
        destinationInternational: myState.destinationInternational,
        travelMonth: myState.travelMonth,
        travelDays: myState.travelDays,
        peopleInternational: myState.peopleInternational,
        minorsInternational: myState.minorsInternational,
        phoneNumberClientInternational: myState.phoneNumberClientInternational,
      });

      console.log(insertResult);
      console.log("Summary has been sent to MongoDB!");
      const summaryInternational = `
        *COTIZACIÓN DE DESTINO INTERNACIONAL:*
        Nombre: ${myState.name}
        Destino: ${myState.destinationInternational}
        Mes deseado para viajar: ${myState.travelMonth}
        Días de viaje: ${myState.travelDays}
        Número de personas: ${myState.peopleInternational}
        Menores de edad (edades): ${myState.minorsInternational}
        Número de celular: ${myState.phoneNumberClientInternational}
      `;

      await flowDynamic([
        {
          body: `Este es el resumen de tu cotización:\n${summaryInternational}`,
        },
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
  });

module.exports = flowOp2;
