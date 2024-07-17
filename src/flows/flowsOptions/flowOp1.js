const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowOp1 = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Elegiste *Cotizar mi viaje nacional*, con gusto te damos seguimiento"
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
    await state.update({ ...myState, destinationNational: ctx.body });
    await state.update({ ...myState, phoneNumberClientNational: ctx.from });
    return await flowDynamic(
      `¿Cuáles son sus fechas de interés?\n(Ejemplo: 12 de febrero al 18 de febrero)`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ ...myState, datesNational: ctx.body });
    return await flowDynamic(`Número de personas incluidas usted`);
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ ...myState, peopleNational: ctx.body });
    return await flowDynamic(
      `¿Lleva menores de edad? Si es así, ¿qué edades tienen?\n*(Ejemplo A):* 5\n*(Ejemplo B):* 5 y 14\n*(Ejemplo C):* 5, 14 y 8\nSi no van menores de edad, escriba *"NO"*`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ ...myState, minorsNational: ctx.body });
    return await flowDynamic(
      `Si su plan es todo incluido por favor escriba *"TODO INCLUIDO"*.\nSi es solo hospedaje, escriba *"HOSPEDAJE"*`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    const myState = state.getMyState();
    await state.update({ ...myState, planNational: ctx.body });
    const summaryNational = `
      *COTIZACIÓN DE DESTINO NACIONAL:*
      Nombre: ${myState.name}
      Destino: ${myState.destinationNational}
      Fechas: ${myState.datesNational}
      Número de personas: ${myState.peopleNational}
      Menores de edad (edades): ${myState.minorsNational}
      Plan: ${ctx.body}
      Número de celular: ${myState.phoneNumberClientNational}
    `;
    await flowDynamic(`Este el resumen de tu cotización:\n${summaryNational}`);
    return await flowDynamic(
      `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento.\nAgradecemos mucho tu paciencia, *${myState.name}*.` 
      +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menu principal escribiendo la palabra *MENU*"
    );
  });

module.exports = flowOp1;
