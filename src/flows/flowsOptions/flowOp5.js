const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*SOLICITUD DE ESTADO DE ADEUDO CLIENTE*";

const flowOp5 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Estado de mi adeudo*")

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
    "¿Cuál es el destino del contrato?\n*(Ejemplo):* Cancún.",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        destination: ctx.body,
        phoneNumberClient: ctx.from,
      });
    }
  )

  .addAction(async (_, { state, flowDynamic }) => {
    const myState = state.getMyState();

    const summaryAdeudo = `
      *SOLICITUD DE ESTADO DE ADEUDO:*
      Nombre completo del contratante: ${myState.fullName}
      Destino del contrato: ${myState.destination}
      Número de celular: ${myState.phoneNumberClient}
    `;

    try {
      const db = await connectDB();
      const collection = db.collection("cotizaciones");
      console.log("Connected Successfully to MongoDB!");

      const insertResult = await collection.insertOne({
        type_of_service: myState.type_of_service,
        fullName: myState.fullName,
        destination: myState.destination,
        phoneNumberClient: myState.phoneNumberClient,
      });

      console.log(insertResult);
      console.log("Request for account status has been sent to MongoDB!");

      await flowDynamic([
        {
          body: `Este es el resumen de tu solicitud de estado de adeudo:\n${summaryAdeudo}`,
        },
        {
          body:
            `Tu solicitud ha sido correctamente enviada. En breve nos pondremos en contacto vía WhatsApp para brindarte tu *ESTADO DE ADEUDO*. Gracias por tu paciencia.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*",
        },
      ]);
    } catch (error) {
      console.error("Error MongoDB:", error);
    }
  });

module.exports = flowOp5;
