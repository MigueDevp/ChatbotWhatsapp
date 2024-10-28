const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");

const type_of_Service = "*SOLICITUD DE CAMBIO DE RESERVA*";

const flowOp4 = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Elegiste *Cambios en mi reserva*, con gusto te damos seguimiento."
  )

  .addAnswer(
    "¿Cuál es el nombre completo del contratante?\n_(Nombre de la persona titular en el contrato)_",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        contractorNameChange: ctx.body,
        type_of_serviceReserva: type_of_Service,
      });
    }
  )

  .addAnswer(
    "¿Destino del contrato? \n*(Ejemplo:)* Mazatlán",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        contractDestinationChange: ctx.body,
        phoneNumberClientChangeReservation: ctx.from,
      });
    }
  )

  .addAnswer(
    "¿Cuál es el motivo del cambio de tu reserva? \n*(Argumenta el motivo de tu deseo de cambiar tu reserva)*",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, changeReason: ctx.body });

      const myStateNow = state.getMyState();

      const changeReservationShow = `
        *SOLICITUD DE CAMBIO DE RESERVA:*
        Nombre del contratante: ${myStateNow.contractorNameChange}
        Destino del contrato: ${myStateNow.contractDestinationChange}
        Número de celular: ${myStateNow.phoneNumberClientChangeReservation}
      `;

      const changeReservation = `
        *SOLICITUD DE CAMBIO DE RESERVA:*
        Nombre del contratante: ${myStateNow.contractorNameChange}
        Destino del contrato: ${myStateNow.contractDestinationChange}
        Motivo de cambio: ${myStateNow.changeReason}
        Número de celular: ${myStateNow.phoneNumberClientChangeReservation}
      `;

      await flowDynamic([
        {
          body: `Este es el resumen de tu solicitud:\n${changeReservationShow}`,
        },
        {
          body:
            `Tu solicitud ha sido enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para poder autorizar tu cambio en tu reserva.\nAgradecemos mucho tu paciencia.` +
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
            type_of_service: myState.type_of_serviceReserva,
            contractorName: myState.contractorNameChange,
            contractDestination: myState.contractDestinationChange,
            changeReason: myState.changeReason,
            phoneNumberClientChangeReservation:
              myState.phoneNumberClientChangeReservation,
          });

          console.log("Summary has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️"',
            to: "travelmrbot@gmail.com",
            subject: "Solicitud de cambio de reserva",
            text: `¡Hola Ejecutiv@ de TRAVELMR!, Tienes una nueva cotización:\n${changeReservation}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", {
            changeReservationShow,
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

module.exports = flowOp4;
