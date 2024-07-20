const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*COTIZACIÓN DE VUELO*";

const flowOp10 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Vuelos* con gusto te damos seguimiento.")
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ nameFlight: ctx.body, type_of_serviceFlight: type_of_Service });
    }
  )
  .addAnswer(
    "¿Cuál es el destino de tu vuelo?\n*(EJEMPLO): Bogotá, Colombia*",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ destinationFlight: ctx.body });
      await state.update({ phoneNumberClientFlight: ctx.from });
    }
  )
  .addAnswer(
    "¿Su vuelo es sencillo o redondo?\n\nSi su vuelo es sencillo escriba *SENCILLO*\nSi su vuelo es redondo escriba *REDONDO*",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ flightType: ctx.body });
    }
  )
  .addAnswer(
    "¿Cuáles son sus fechas de interés?\n*(EJEMPLO 1):* si su vuelo es *redondo*, _13 de enero al 22 de enero_\n*(EJEMPLO 2):* si su vuelo es *sencillo*, _13 de enero_",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ flightDates: ctx.body });
    }
  )
  .addAnswer(
    "¿Cuántas personas abordo incluidas usted?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ flightPeople: ctx.body });
    }
  )
  .addAnswer(
    `¿Lleva menores de edad? Si es así, ¿qué edades tienen?\n*(Ejemplo A):* 5\n*(Ejemplo B):* 5 y 14\n*(Ejemplo C):* 5, 14 y 8\nSi no van menores de edad, escriba *"NO"*`,
    { capture: true },
    async (ctx, { flowDynamic, state }) => {
      await state.update({ flightMinors: ctx.body });

      const myState = state.getMyState();
      const summaryFlight = `
        *COTIZACIÓN DE VUELO:*
        Nombre: ${myState.nameFlight}
        Destino: ${myState.destinationFlight}
        Tipo de vuelo: ${myState.flightType}
        Fechas de interés: ${myState.flightDates}
        Número de personas: ${myState.flightPeople}
        Menores de edad (edades): ${myState.flightMinors}
        Número de celular: ${myState.phoneNumberClientFlight}
      `;

      try {
        const db = await connectDB();
        const collection = db.collection("cotizaciones");

        const insertResult = await collection.insertOne({
          type_of_service: myState.type_of_serviceFlight,
          name: myState.nameFlight,
          destinationFlight: myState.destinationFlight,
          flightType: myState.flightType,
          flightDates: myState.flightDates,
          flightPeople: myState.flightPeople,
          flightMinors: myState.flightMinors,
          phoneNumberClientFlight: myState.phoneNumberClientFlight,
        });

        console.log(insertResult);
        console.log("Flight quotation has been sent to MongoDB!");

        await flowDynamic(
          `Este es el resumen de tu cotización de vuelo:\n${summaryFlight}`
        );
        return await flowDynamic(
          `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.nameFlight}*.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*"
        );
      } catch (error) {
        console.error("Error MongoDB:", error);
        return await flowDynamic(
          "Hubo un error al enviar tu cotización. Por favor, inténtalo de nuevo más tarde."
        );
      }
    }
  );

module.exports = flowOp10;
