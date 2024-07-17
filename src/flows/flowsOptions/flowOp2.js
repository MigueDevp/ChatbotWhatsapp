const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowOp2 = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Elegiste *Cotizar mi viaje internacional*, con gusto te damos seguimiento"
  )
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic("¿Cuál es tu nombre?");
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ name: ctx.body });
    return await flowDynamic(
      `¡Un placer conocerte! ${ctx.body}\n¿Qué destino deseas visitar?`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ ...myState, destinationInternational: ctx.body });
    await state.update({
      ...myState,
      phoneNumberClientInternational: ctx.from,
    });
    return await flowDynamic(
      `¿Mes del año deseado para viajar?\n*(EJEMPLO): Enero*`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ ...myState, travelMonth: ctx.body });
    return await flowDynamic(`¿Cuántos días desea viajar?`);
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ ...myState, travelDays: ctx.body });
    return await flowDynamic(`Número de personas incluidas usted`);
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ ...myState, peopleInternational: ctx.body });
    return await flowDynamic(
      `¿Lleva menores de edad? Si es así, ¿qué edades tienen?\n*(Ejemplo A):* 5\n*(Ejemplo B):* 5 y 14\n*(Ejemplo C):* 5, 14 y 8\nSi no van menores de edad, escriba *"NO"*`
    );
  })
  .addAction({ capture: true }, async (ctx, { state }) => {
    const myState = state.getMyState();
    await state.update({ ...myState, minorsInternational: ctx.body });
  })
  .addAction(async (_, { flowDynamic, state }) => {
    const myState = state.getMyState();
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
    await flowDynamic(
      `Este está el resumen de tu cotización:\n${summaryInternational}`
    );
    return await flowDynamic(
      `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento.\nAgradecemos mucho tu paciencia, *${myState.name}*.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menu principal escribiendo la palabra *MENU*"
    );
  });

module.exports = flowOp2;
