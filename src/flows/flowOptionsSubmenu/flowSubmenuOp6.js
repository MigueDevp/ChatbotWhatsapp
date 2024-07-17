const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowSubmenuOp7 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Tour*, con gusto te damos seguimiento")
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic("¿Cuál es tu nombre?");
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ name: ctx.body });
    return await flowDynamic(
      "¿Cuál es el destino del tour que deseas cotizar?\n *(EJEMPLO):* Ciudad de México."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ destination: ctx.body, numberCellClient: ctx.from});
    return await flowDynamic("¿Para cuántas personas incluidas usted?");
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ numberOfPeople: ctx.body });
    const myState = state.getMyState();
    const summaryTour = `
      *COTIZACIÓN DE TOUR:*
      Nombre: ${myState.name}
      Destino del tour: ${myState.destination}
      Número de personas: ${myState.numberOfPeople}
      Número de celular: ${myState.numberCellClient}
    `;
    await flowDynamic(
      `Este es el resumen de tu cotización de tour:\n${summaryTour}`
    );
    return await flowDynamic(
      `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.name}*.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menu principal escribiendo la palabra *MENU*"
    );
  });

module.exports = flowSubmenuOp7;
