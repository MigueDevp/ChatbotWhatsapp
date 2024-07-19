const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*SOLICITUD DE REMBOLSO*";

const flowOp6 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Rembolsos*")
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
    "¿Cuál es el destino del contrato?\n*(Ejemplo):* Bacalár.",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        destination: ctx.body,
        phoneNumberClient: ctx.from,
      });
    }
  )
  .addAnswer(
    "Por favor, indícanos cuál es el motivo de tu solicitud de rembolso.",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ reason: ctx.body });
    }
  )
  .addAction(async (_, { state, flowDynamic }) => {
    const myState = state.getMyState();

    const summaryRembolsos = `
      *SOLICITUD DE REMBOLSO:*
      Nombre completo del contratante: ${myState.fullName}
      Destino del contrato: ${myState.destination}
      Motivo de la solicitud: ${myState.reason}
      Número de celular: ${myState.phoneNumberClient}
    `;

    try {
      const db = await connectDB();
      const collection = db.collection("cotizaciones");

      const insertResult = await collection.insertOne({
        type_of_service: myState.type_of_service,
        fullName: myState.fullName,
        destination: myState.destination,
        reason: myState.reason,
        phoneNumberClient: myState.phoneNumberClient,
      });

      console.log(insertResult);
      console.log("Request has been sent to MongoDB!");

      await flowDynamic([
        {
          body: `Este es el resumen de tu solicitud de rembolso:\n${summaryRembolsos}`,
        },
        {
          body:
            `Tu solicitud ha sido correctamente enviada. En breve nos pondremos en contacto vía WhatsApp para continuar con el proceso de rembolso. Gracias por tu paciencia.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*",
        },
      ]);
    } catch (error) {
      console.error("Error MongoDB:", error);
    }
  });

module.exports = flowOp6;