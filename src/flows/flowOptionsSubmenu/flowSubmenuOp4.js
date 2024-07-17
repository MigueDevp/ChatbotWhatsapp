const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowSubmenuOp4 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Auto*, con gusto te damos seguimiento.")
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic("¿Cuál es tu nombre?");
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ name: ctx.body });
    return await flowDynamic(
      `¿Cuál es tu punto de recolección?\n\nEl punto de *RECOLECCIÓN* hace referencia al lugar donde te ubicas geográficamente, esto para ofrecerte un proveedor cercano a tu ubicación.\n*(Ejemplo):* San Juan del Rio, Querétaro.`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({
      pointOfCollection: ctx.body,
      phoneNumberClientAuto: ctx.from,
    });
    return await flowDynamic("¿Para cuántas personas incluidas usted?");
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ numberOfPeople: ctx.body });
    return await flowDynamic(
      "¿Cuál es la fecha deseada para rentar la unidad?\n*(Ejemplo):* 12 de febrero"
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ rentalDate: ctx.body });
    const myState = state.getMyState();
    const summaryAuto = `
      *COTIZACIÓN DE AUTO:*
      Nombre: ${myState.name}
      Punto de recolección: ${myState.pointOfCollection}
      Número de personas: ${myState.numberOfPeople}
      Fecha deseada: ${myState.rentalDate}
      Número de celular: ${myState.phoneNumberClientAuto}
    `;
    await flowDynamic(
      `Este es el resumen de tu cotización de auto:\n${summaryAuto}`
    );
    return await flowDynamic(
      `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.name}*.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menu principal escribiendo la palabra *MENU*"
    );
  });

module.exports = flowSubmenuOp4;
