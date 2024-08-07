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
      const myState = state.getMyState();
      await state.update({
        ...myState,
        destinationStatus: ctx.body,
        phoneNumberClientStatus: ctx.from,
      });

      const myStateNow = state.getMyState();
      const summaryAdeudoShow = `
        *SOLICITUD DE ESTADO DE ADEUDO:*
        Nombre completo del contratante: ${myStateNow.fullNameStatus}
        Destino del contrato: ${myStateNow.destinationStatus}
        Número de celular: ${myStateNow.phoneNumberClientStatus}
      `;

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

      (async () => {
        try {
          const db = await connectDB();
          const collection = db.collection("cotizaciones");
          const myState = state.getMyState();

          await collection.insertOne({
            type_of_service: myState.type_of_serviceStatus,
            fullName: myState.fullNameStatus,
            destination: myState.destinationStatus,
            phoneNumberClient: myState.phoneNumberClientStatus,
          });

          console.log("Request for account status has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️" <angelrr.ti22@utsjr.edu.mx>',
            to: "miguedevp@gmail.com",
            subject: "Solicitud estado de adeudo",
            text: `¡Hola Ejecutiv@ de TRAVELMR!, Tienes una nueva cotización:\n${summaryAdeudoShow}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", {
            summaryAdeudoShow,
          });
        } catch (error) {
          console.error("Error MongoDB:", error);
          await flowDynamic(
            "Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo más tarde."
          );
        }
      })();
    }
  );

module.exports = flowOp5;
