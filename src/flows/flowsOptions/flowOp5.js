const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowOp5 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Estado de mi adeudo*")
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic(
      "¿Cuál es el nombre completo del contratante?\n_(Nombre de la persona titular en el contrato)_"
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ fullName: ctx.body });
    return await flowDynamic(
      `¿Cuál es el destino del contrato?\n*(Ejemplo):* Cancún.`
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ destination: ctx.body, phoneNumberClient: ctx.from });
    const myState = state.getMyState();
    const summaryAdeudo = `
      *SOLICITUD DE ESTADO DE ADEUDO:*
      Nombre completo del contratante: ${myState.fullName}
      Destino del contrato: ${myState.destination}
      Número de celular: ${myState.phoneNumberClient}
    `;
    await flowDynamic(
      `Este es el resumen de tu solicitud de estado de adeudo:\n${summaryAdeudo}`
    );
    return await flowDynamic(
      `Tu solicitud ha sido correctamente enviada. En breve nos pondremos en contacto vía WhatsApp para brindarte tu *ESTADO DE ADEUDO*, Gracias por tu paciencia.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menu principal escribiendo la palabra *MENU*"
    );
  });

module.exports = flowOp5;
