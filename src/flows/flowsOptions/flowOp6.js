const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");

const type_of_Service = "*SOLICITUD DE REMBOLSO*";

const flowOp6 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Rembolsos*")

  .addAnswer(
    "¿Cuál es el nombre completo del contratante?\n_(Nombre de la persona titular en el contrato)_",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        fullNameRemb: ctx.body,
        type_of_serviceRemb: type_of_Service,
      });
    }
  )

  .addAnswer(
    "¿Cuál es el destino del contrato?\n*(Ejemplo):* Bacalár.",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        destinationRemb: ctx.body,
        phoneNumberClientRemb: ctx.from,
      });
    }
  )

  .addAnswer(
    "Por favor, indícanos cuál es el motivo de tu solicitud de rembolso.",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      const myState = state.getMyState();
      await state.update({...myState, reasonRemb: ctx.body });

      const myStateNow = state.getMyState();
      const summaryRembolsosShow = `
        *SOLICITUD DE REMBOLSO:*
        Nombre completo del contratante: ${myStateNow.fullNameRemb}
        Destino del contrato: ${myStateNow.destinationRemb}
        Número de celular: ${myStateNow.phoneNumberClientRemb}
      `;

      const summaryRembolsos = `
        *SOLICITUD DE REMBOLSO:*
        Nombre completo del contratante: ${myStateNow.fullNameRemb}
        Destino del contrato: ${myStateNow.destinationRemb}
        Motivo de rembolso: ${myStateNow.reasonRemb}
        Número de celular: ${myStateNow.phoneNumberClientRemb}
      `;


      await flowDynamic([
        {
          body: `Este es el resumen de tu solicitud de rembolso:\n${summaryRembolsosShow}`,
        },
        {
          body:
            `Tu solicitud ha sido correctamente enviada. En breve nos pondremos en contacto vía WhatsApp para continuar con el proceso de rembolso. Gracias por tu paciencia.` +
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
            type_of_service: myState.type_of_serviceRemb,
            fullName: myState.fullNameRemb,
            destination: myState.destinationRemb,
            reason: myState.reasonRemb,
            phoneNumberClient: myState.phoneNumberClientRemb,
          });

          console.log("Request has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️" <angelrr.ti22@utsjr.edu.mx>',
            to: "travelmrbot@gmail.com",
            subject: "Solicitud de rembolso",
            text: `¡Hola Ejecutiv@ de TRAVELMR!, Tienes una nueva cotización:\n${summaryRembolsos}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", {
            summaryRembolsosShow,
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

module.exports = flowOp6;
