const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const flowInactividad = require("../flowInactividad");

const type_of_Service = "*COTIZACIÓN VIAJE NACIONAL*";

const flowOp1 = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Elegiste *Cotizar mi viaje nacional*, con gusto te damos seguimiento"
  )
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        nameNational: ctx.body,
        type_of_serviceNational: type_of_Service,
      });
    }
  )
  .addAnswer(
    "¿Qué destino deseas visitar?\n*(EJEMPLO):* Cancún",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        destinationNational: ctx.body,
        phoneNumberClientNational: ctx.from,
      });
    }
  )
  .addAnswer(
    "¿Cuáles son sus fechas de interés?\n*(EJEMPLO:)* 12 de febrero al 18 de febrero",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, datesNational: ctx.body });
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
      await state.update({ ...myState, peopleNational: numberOfPeople });
    }
  )
  .addAnswer(
    '¿Lleva menores de edad? Si es así, ¿qué edades tienen?\n*(Ejemplo A):* 5\n*(Ejemplo B):* 5 y 14\n*(Ejemplo C):* 5, 14 y 8\nSi no van menores de edad, escriba *"NO"*',
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, minorsNational: ctx.body });
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
      await state.update({ ...myState, planNational: ctx.body });

      try {
        const db = await connectDB();
        const collection = db.collection("cotizaciones");
        console.log("Connected Successfully to MongoDB!");
        const myState = state.getMyState();
        const insertResult = await collection.insertOne({
          type_of_service: myState.type_of_serviceNational,
          name: myState.nameNational,
          destinationNational: myState.destinationNational,
          datesNational: myState.datesNational,
          peopleNational: myState.peopleNational,
          minorsNational: myState.minorsNational,
          planNational: myState.planNational,
          phoneNumberClientNational: myState.phoneNumberClientNational,
        });

        console.log(insertResult);
        console.log("Summary has been sent to MongoDB!");

        const summaryNational = `
        *COTIZACIÓN DE DESTINO NACIONAL:*
        Nombre: ${myState.nameNational}
        Destino: ${myState.destinationNational}
        Fechas: ${myState.datesNational}
        Número de personas: ${myState.peopleNational}
        Menores de edad (edades): ${myState.minorsNational}
        Plan: ${myState.planNational}
        Número de celular: ${myState.phoneNumberClientNational}
      `;

        await flowDynamic([
          { body: `Este es el resumen de tu cotización:\n${summaryNational}` },
          {
            body:
              `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento.\nAgradecemos mucho tu paciencia, *${myState.nameNational}*.` +
              "\n\n" +
              "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*",
          },
        ]);
      } catch (error) {
        console.error("Error MongoDB:", error);
      }
    }
  );

module.exports = flowOp1;
