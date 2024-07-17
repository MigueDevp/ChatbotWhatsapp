const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowOp7 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Facturación*")
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic(
      "¿Cuál es el nombre completo del contratante?\n_(Nombre de la persona titular en el contrato)_"
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ fullName: ctx.body });
    return await flowDynamic(
      "Por favor, envía una foto clara del comprobante de pago."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ paymentProof: ctx.body });
    return await flowDynamic(
      "Ahora, por favor envía tu constancia fiscal en formato PDF."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({
      fiscalCertificate: ctx.body,
      phoneNumberClient: ctx.from,
    });
    const myState = state.getMyState();
    const summaryBilling = `
      *SOLICITUD DE FACTURACIÓN:*
      Nombre completo del contratante: ${myState.fullName}
      Comprobante de pago: ${myState.paymentProof}
      Constancia fiscal: ${myState.fiscalCertificate}
      Número de celular: ${myState.phoneNumberClient}
    `;
    // await flowDynamic(
      //`Este es el resumen de tu solicitud de facturación:\n${summaryBilling}`
    //);
    return await flowDynamic(
      `Tu solicitud ha sido correctamente enviada. En breve nos pondremos en contacto vía WhatsApp para continuar con tu facturación. Gracias por tu paciencia.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*."
    );
  });

module.exports = flowOp7;
