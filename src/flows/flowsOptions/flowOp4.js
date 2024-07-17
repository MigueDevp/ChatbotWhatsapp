const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowOp4 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Cambios en mi reserva*, con gusto te damos seguimiento")
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic(
      "¿Cuál es el nombre completo del contratante?\n_(Nombre de la persona titular en el contrato)_"
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ contractorName: ctx.body });
    return await flowDynamic(`¿Destino del contrato? \n*(Ejemplo:):* Mazatlán`);
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({
      contractDestination: ctx.body,
      phoneNumberClientChangeReservation: ctx.from,
    });
    return await flowDynamic(
      `¿Cuál es el motivo del cambio de tu reserva? \n*(Argumenta el motivo de tu deseo de cambiar tu reserva)*`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ changeReason: ctx.body });
    const myState = state.getMyState();
    const changeReservation = `
      *SOLICITUD DE CAMBIO DE RESERVA:*
      Nombre del contratante: ${myState.contractorName}
      Destino del contrato: ${myState.contractDestination}
      Motivo del cambio: ${myState.changeReason}
      Número de celular: ${myState.phoneNumberClientChangeReservation}
    `;
    await flowDynamic(
      `Este es el resumen de tu solicitud:\n${changeReservation}`
    );
    return await flowDynamic(
      `Tu solicitud ha sido enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para poder autorizar tu cambio en tu reserva.\nAgradecemos mucho tu paciencia.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menu principal escribiendo la palabra *MENU*"
    );
  });

module.exports = flowOp4;
