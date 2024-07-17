const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowSubmenuOp1 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Autobús*, con gusto te damos seguimiento.")
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic("¿Cuál es tu nombre?");
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ name: ctx.body });
    return await flowDynamic(
      "¿Cuál es el destino del autobús? \n*(EJEMPLO):* Tehotihuacán."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({
      destination: ctx.body,
      numberCellphoneClient: ctx.from,
    });
    return await flowDynamic(
      "¿Cuál es la fecha en la que planeas realizar este viaje?"
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ travelDate: ctx.body });
    return await flowDynamic(
      "¿Qué movimientos o paradas adicionales necesitas hacer una vez en el destino? Esto nos ayuda a entender mejor tus necesidades de transporte en el lugar."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ movements: ctx.body });
    const myState = state.getMyState();
    const summaryBus = `
      *COTIZACIÓN DE AUTOBÚS:*
      Nombre: ${myState.name}
      Destino del autobús: ${myState.destination}
      Fecha del viaje: ${myState.travelDate}
      Movimientos adicionales en el destino: ${myState.movements}
      Número de celular: ${myState.numberCellphoneClient}
    `;
    await flowDynamic(
      `Este es el resumen de tu cotización de autobús:\n${summaryBus}`
    );
    return await flowDynamic(
      `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.name}*.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menu principal escribiendo la palabra *MENU*"
    );
  });

module.exports = flowSubmenuOp1;
