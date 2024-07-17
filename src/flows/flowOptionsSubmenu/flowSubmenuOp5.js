const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowSubmenuOp6 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Traslados*, con gusto te damos seguimiento.")
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic("¿Cuál es tu nombre?");
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ name: ctx.body });
    return await flowDynamic(
      `¿A qué aeropuerto necesitas trasladarte?\n\nPor favor proporciona el nombre completo del aeropuerto.\n_(En caso de que tu traslado no sea al aeropuerto, escribe "no")_`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ airportName: ctx.body });
    return await flowDynamic(
      `Nombre del lugar u hotel de destino.\n*(Ejemplo):* Fiesta Americana Inn`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ hotelName: ctx.body });
    return await flowDynamic("¿Para cuántas personas incluidas usted?");
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({
      numberOfPeople: ctx.body,
      phoneNumberClientTransfer: ctx.from,
    });
    const myState = state.getMyState();
    const summaryTransfer = `
      *COTIZACIÓN DE TRASLADO:*
      Nombre: ${myState.name}
      Aeropuerto de traslado: ${myState.airportName}
      Hotel de destino: ${myState.hotelName}
      Número de personas: ${myState.numberOfPeople}
      Número de celular: ${myState.phoneNumberClientTransfer}
    `;
    await flowDynamic(
      `Este es el resumen de tu cotización de traslado:\n${summaryTransfer}`
    );
    return await flowDynamic(
      `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.name}*.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menu principal escribiendo la palabra *MENU*"
    );
  });

module.exports = flowSubmenuOp6;
