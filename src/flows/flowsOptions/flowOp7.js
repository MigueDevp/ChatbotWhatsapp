const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*FACTURACIÓN*";

const flowOp7 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Facturación*")
  .addAnswer(
    "¿Cuál es el nombre completo del contratante?\n_(Nombre de la persona titular en el contrato)_",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        fullName: ctx.body,
        type_of_service: type_of_Service,
      });
    }
  )
  .addAnswer(
    "Por favor, envía una foto clara del comprobante de pago.",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ paymentProof: ctx.body });
    }
  )
  .addAnswer(
    "Ahora, por favor envía tu constancia fiscal en formato PDF.",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        fiscalCertificate: ctx.body,
        phoneNumberClient: ctx.from,
      });
    }
  )
  .addAction(async (_, { state, flowDynamic }) => {
    const myState = state.getMyState();

    const summaryBilling = `
      *SOLICITUD DE FACTURACIÓN:*
      Nombre completo del contratante: ${myState.fullName}
      Comprobante de pago: ${myState.paymentProof}
      Constancia fiscal: ${myState.fiscalCertificate}
      Número de celular: ${myState.phoneNumberClient}
    `;

    try {
      const db = await connectDB();
      const collection = db.collection("cotizaciones");

      const insertResult = await collection.insertOne({
        type_of_service: myState.type_of_service,
        fullName: myState.fullName,
        paymentProof: myState.paymentProof,
        fiscalCertificate: myState.fiscalCertificate,
        phoneNumberClient: myState.phoneNumberClient,
      });

      console.log(insertResult);
      console.log("Request has been sent to MongoDB!");

      await flowDynamic([
        {
          body: `Este es el resumen de tu solicitud de facturación:\n${summaryBilling}`,
        },
        {
          body:
            `Tu solicitud ha sido correctamente enviada. En breve nos pondremos en contacto vía WhatsApp para continuar con tu facturación. Gracias por tu paciencia.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*.",
        },
      ]);
    } catch (error) {
      console.error("Error MongoDB:", error);
    }
  });

module.exports = flowOp7;
