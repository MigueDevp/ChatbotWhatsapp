const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowOp6 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Rembolsos*")
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic(
      "¿Cuál es el nombre completo del contratante?\n_(Nombre de la persona titular en el contrato)_"
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ fullName: ctx.body });
    return await flowDynamic(
      `¿Cuál es el destino del contrato?\n*(Ejemplo):* Bacalár.`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ destination: ctx.body, phoneNumberClient: ctx.from });
    return await flowDynamic(
      "Por favor, indícanos cuál es el motivo de tu solicitud de rembolso."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ reason: ctx.body });
    const myState = state.getMyState();
    const summaryRembolsos = `
      *SOLICITUD DE REMBOLSO:*
      Nombre completo del contratante: ${myState.fullName}
      Destino del contrato: ${myState.destination}
      Motivo de la solicitud: ${myState.reason}
      Número de celular: ${myState.phoneNumberClient}
    `;
    await flowDynamic(
      `Este es el resumen de tu solicitud de rembolso:\n${summaryRembolsos}`
    );
    return await flowDynamic(
      `Tu solicitud ha sido correctamente enviada. En breve nos pondremos en contacto vía WhatsApp para continuar con el proceso de rembolso. Gracias por tu paciencia.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*"
    );
  });

module.exports = flowOp6;
