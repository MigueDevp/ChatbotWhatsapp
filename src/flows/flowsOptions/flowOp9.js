const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowOp9 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Visa Canadiense*")
  .addAction(async (_, { flowDynamic }) => {
    const message = `
*REQUISITOS:*

- Ife(INE).
- Pasaporte.
- Acta de nacimiento.

Nuestros servicios consisten en la asesoría y gestoría de tu trámite.

Costo de nuestro servicio *$1499.00 pesos.*
Costo de la visa *$100 dlls canadienses.*

Recuerda que nadie tiene la facultad de garantizarte la aprobación de la visa, los consulados son incorruptibles, y el veredicto dependerá de la situación de cada persona en especial, no te dejes engañar. Para revisar y darle una mejor asesoría, puede visitarnos en nuestras oficinas. Con gusto, un ejecutivo certificado lo atenderá.
    `;
    await flowDynamic(message);
  })
  .addAction(async (_, { flowDynamic }) => {
    await new Promise((resolve) => setTimeout(resolve, 8000));
    return await flowDynamic(
      "Si deseas tramitar tu visa, por favor escribe *SI*. Si no es así, escribe *NO*."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state, gotoFlow }) => {
    const response = ctx.body.toLowerCase();
    if (response === 'si' || response === 'sí') {
      await state.update({ phoneNumberClient: ctx.from });
      return await flowDynamic(
        "Perfecto, comenzaremos con la recopilación de tus documentos. Por favor, envía una foto clara de tu Ife(INE)."
      );
    } else if (response === 'no') {
      return await flowDynamic(
        "Gracias por tu tiempo. Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*."
      );
    } else {
      return await flowDynamic(
        "Respuesta no válida. Por favor escribe *SI* o *NO*."
      );
    }
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ ifePhoto: ctx.body });
    return await flowDynamic(
      "Ahora, por favor envía una foto clara de tu Pasaporte."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ passportPhoto: ctx.body });
    return await flowDynamic(
      "Por último, por favor envía una foto clara de tu Acta de nacimiento."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ birthCertificatePhoto: ctx.body });
    const myState = state.getMyState();
    const summaryVisa = `
      *SOLICITUD DE VISA CANADIENSE:*
      Número de celular: ${myState.phoneNumberClient}
      Foto de Ife(INE): ${myState.ifePhoto}
      Foto de Pasaporte: ${myState.passportPhoto}
      Foto de Acta de nacimiento: ${myState.birthCertificatePhoto}
    `;
    console.log(summaryVisa);
    /*await flowDynamic(
      `Este es el resumen de tu solicitud de visa:\n${summaryVisa}`
    );*/
    
    return await flowDynamic(
      `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para continuar con tu trámite de visa. Gracias por tu paciencia.` +
        "\n\n" +
        "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*."
    );
  });

module.exports = flowOp9;