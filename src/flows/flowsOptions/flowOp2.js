const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*COTIZACIÓN DESTINO INTERNACIONAL*";
const validMonths = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const flowOp2 = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Elegiste *Cotizar mi viaje internacional*, con gusto te damos seguimiento"
  )
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        nameInternational: ctx.body,
        type_of_serviceInternational: type_of_Service,
      });
    }
  )
  .addAnswer(
    "¿Qué destino deseas visitar?\n*(EJEMPLO):* Colombia",
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
    "¿Mes del año deseado para viajar?\n*(EJEMPLO):* Enero",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const userResponse = ctx.body.toLowerCase();
      if (!validMonths.includes(userResponse)) {
        return fallBack();
      }

      const myState = state.getMyState();
      await state.update({
        ...myState,
        travelMonthInternational: userResponse,
      });
    }
  )
  .addAnswer(
    "¿Cuántos días desea viajar?",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const numberOfDays = parseInt(ctx.body, 10);
      if (isNaN(numberOfDays)) {
        return fallBack();
      }

      const myState = state.getMyState();
      await state.update({ ...myState, travelDaysInternational: numberOfDays });
    }
  )
  .addAnswer(
    "Número de personas incluidas usted",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const numberOfPeople = parseInt(ctx.body, 10);
      if (isNaN(numberOfPeople)) {
        return fallBack();
      }

      const myState = state.getMyState();
      await state.update({ ...myState, peopleInternational: numberOfPeople });
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
  .addAnswer(
    'Si su plan es todo incluido por favor escriba *"TODO INCLUIDO"*.\nSi es solo hospedaje, escriba *"HOSPEDAJE"*',
    { capture: true },
    async (ctx, { state, flowDynamic, fallBack }) => {
      const validResponse = ctx.body.toUpperCase();
      if (validResponse !== "TODO INCLUIDO" && validResponse !== "HOSPEDAJE") {
        return fallBack();
      }

      const myState = state.getMyState();
      await state.update({ ...myState, planInternational: ctx.body });

      try {
        const db = await connectDB();
        const myState = state.getMyState();
        const collection = db.collection("cotizaciones");
        console.log("Connected Successfully to MongoDB!");

        const insertResult = await collection.insertOne({
          type_of_service: myState.type_of_serviceInternational,
          name: myState.nameInternational,
          destinationInternational: myState.destinationInternational,
          travelMonth: myState.travelMonthInternational,
          travelDays: myState.travelDaysInternational,
          peopleInternational: myState.peopleInternational,
          minorsInternational: myState.minorsInternational,
          planInternational: myState.planInternational,
          phoneNumberClientInternational:
            myState.phoneNumberClientInternational,
        });

        console.log(insertResult);
        console.log("Summary has been sent to MongoDB!");

        const summaryInternational = `
          *COTIZACIÓN DE DESTINO INTERNACIONAL:*
          Nombre: ${myState.nameInternational}
          Destino: ${myState.destinationInternational}
          Mes deseado para viajar: ${myState.travelMonthInternational}
          Días de viaje: ${myState.travelDaysInternational}
          Número de personas: ${myState.peopleInternational}
          Menores de edad (edades): ${myState.minorsInternational}
          Plan: ${myState.planInternational}
          Número de celular: ${myState.phoneNumberClientInternational}
        `;

        await flowDynamic([
          {
            body: `Este es el resumen de tu cotización:\n${summaryInternational}`,
          },
          {
            body:
              `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento.\nAgradecemos mucho tu paciencia, *${myState.nameInternational}*.` +
              "\n\n" +
              "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*",
          },
        ]);
      } catch (error) {
        console.error("Error MongoDB:", error);
      }
    }
  );

module.exports = flowOp2;
