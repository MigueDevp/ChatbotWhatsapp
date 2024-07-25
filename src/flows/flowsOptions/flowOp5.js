const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");

const type_of_Service = "*SOLICITUD DE ESTADO DE ADEUDO CLIENTE*";

const flowOp5 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Estado de mi adeudo*")

  .addAnswer(
    "¿Cuál es el nombre completo del contratante?\n_(Nombre de la persona titular en el contrato)_",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        fullNameStatus: ctx.body,
        type_of_serviceStatus: type_of_Service,
      });
    }
  )

  .addAnswer(
    "¿Cuál es el destino del contrato?\n*(Ejemplo):* Cancún.",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      await state.update({
        destinationStatus: ctx.body,
        phoneNumberClientStatus: ctx.from,
      });

      const myState = state.getMyState();
      const summaryAdeudo = `
        *SOLICITUD DE ESTADO DE ADEUDO:*
        Nombre completo del contratante: ${myState.fullNameStatus}
        Destino del contrato: ${myState.destinationStatus}
        Número de celular: ${myState.phoneNumberClientStatus}
      `;

      const summaryAdeudoShow = `
        *SOLICITUD DE ESTADO DE ADEUDO:*
        Nombre completo del contratante: ${myState.fullNameStatus}
        Destino del contrato: ${myState.destinationStatus}
        Número de celular: ${myState.phoneNumberClientStatus}
      `;


      try {
        const db = await connectDB();
        const collection = db.collection("cotizaciones");
        const myState = state.getMyState();
        console.log("Connected Successfully to MongoDB!");

        const insertResult = await collection.insertOne({
          type_of_service: myState.type_of_serviceStatus,
          fullName: myState.fullNameStatus,
          destination: myState.destinationStatus,
          phoneNumberClient: myState.phoneNumberClientStatus,
        });

        console.log("Request for account status has been sent to MongoDB!");

        const sendToGmail = await transporter.sendMail({
          from: '"✈️🌎TRAVEL-BOT🌎✈️" <angelrr.ti22@utsjr.edu.mx>',
          to: "miguedevp@gmail.com",
          subject: "Solicitud estado de adeudo",
          text: `¡Hola Ejecutiva de TRAVELMR!, Tienes una nueva cotización:\n${summaryAdeudo}`,
        });

        console.log("Cotización correctamente enviada por GMAIL", {
          summaryAdeudo,
        });

        await flowDynamic([
          {
            body: `Este es el resumen de tu solicitud de estado de adeudo:\n${summaryAdeudoShow}`,
          },
          {
            body:
              `Tu solicitud ha sido correctamente enviada. En breve nos pondremos en contacto vía WhatsApp para brindarte tu *ESTADO DE ADEUDO*. Gracias por tu paciencia.` +
              "\n\n" +
              "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*",
          },
        ]);
      } catch (error) {
        console.error("Error MongoDB:", error);
      }
    }
  );

module.exports = flowOp5;
