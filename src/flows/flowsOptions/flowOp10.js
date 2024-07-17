const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowOp10 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Vuelos* con gusto te damos seguimiento.")
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic("¿Cuál es tu nombre?");
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ name: ctx.body });
    return await flowDynamic(
      "¿Cuál es el destino de tu vuelo?\n*(EJEMPLO): Bogotá, Colombia*"
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ destinationFlight: ctx.body });
    await state.update({ phoneNumberClientFlight: ctx.from });
    return await flowDynamic(
      "¿Su vuelo es sencillo o redondo?\n\nSi su vuelo es sencillo escriba *SENCILLO*\nSi su vuelo es redondo escriba *REDONDO*"
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ flightType: ctx.body });
    return await flowDynamic(
      "¿Cuáles son sus fechas de interés?\n*(EJEMPLO 1):* si su vuelo es *redondo*, _13 de enero al 22 de enero_\n*(EJEMPLO 2):* si su vuelo es *sencillo*, _13 de enero_"
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ flightDates: ctx.body });
    return await flowDynamic("¿Cuántas personas abordo incluidas usted?");
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ flightPeople: ctx.body });
    return await flowDynamic(
      `¿Lleva menores de edad? Si es así, ¿qué edades tienen?\n*(Ejemplo A):* 5\n*(Ejemplo B):* 5 y 14\n*(Ejemplo C):* 5, 14 y 8\nSi no van menores de edad, escriba *"NO"*`
    );
  })
  .addAction({ capture: true }, async (ctx, { state }) => {
    const myState = state.getMyState();
    await state.update({ flightMinors: ctx.body });
  })
  .addAction(async (_, { flowDynamic, state }) => {
    const myState = state.getMyState();
    const summaryFlight = `
      *COTIZACIÓN DE VUELO:*
      Nombre: ${myState.name}
      Destino: ${myState.destinationFlight}
      Tipo de vuelo: ${myState.flightType}
      Fechas de interés: ${myState.flightDates}
      Número de personas: ${myState.flightPeople}
      Menores de edad (edades): ${myState.flightMinors}
      Número de celular: ${myState.phoneNumberClientFlight}
    `;
    await flowDynamic(
      `Este es el resumen de tu cotización de vuelo:\n${summaryFlight}`
    );
    return await flowDynamic(
      `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.name}*.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menu principal escribiendo la palabra *MENU*"
    );
  });

module.exports = flowOp10;
