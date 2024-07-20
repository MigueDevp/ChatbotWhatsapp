const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*SOLICITUD DE CAMBIO DE RESERVA*";

const flowOp4 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Cambios en mi reserva*, con gusto te damos seguimiento")
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
    "¿Destino del contrato? \n*(Ejemplo:):* Mazatlán",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        contractDestinationChange: ctx.body,
        phoneNumberClientChangeReservation: ctx.from,
      });
    }
  )
  .addAnswer(
    "¿Cuál es el motivo del cambio de tu reserva? \n*(Argumenta el motivo de tu deseo de cambiar tu reserva)*",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      await state.update({ changeReason: ctx.body });

      const myState = state.getMyState();

      const changeReservation = `
        *SOLICITUD DE CAMBIO DE RESERVA:*
        Nombre del contratante: ${myState.contractorNameChange}
        Destino del contrato: ${myState.contractDestinationChange}
        Motivo del cambio: ${myState.changeReason}
        Número de celular: ${myState.phoneNumberClientChangeReservation}
      `;

      try {
        const db = await connectDB();
        const collection = db.collection("cotizaciones");
        const myState = state.getMyState();
        console.log("Connected Successfully to MongoDB!");

        const insertResult = await collection.insertOne({
          type_of_service: myState.type_of_serviceReserva,
          contractorName: myState.contractorNameChange,
          contractDestination: myState.contractDestinationChange,
          changeReason: myState.changeReason,
          phoneNumberClientChangeReservation:
            myState.phoneNumberClientChangeReservation,
        });

        console.log(insertResult);
        console.log("Change reservation request has been sent to MongoDB!");

        await flowDynamic([
          { body: `Este es el resumen de tu solicitud:\n${changeReservation}` },
          {
            body:
              `Tu solicitud ha sido enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para poder autorizar tu cambio en tu reserva.\nAgradecemos mucho tu paciencia.` +
              "\n\n" +
              "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*",
          },
        ]);
      } catch (error) {
        console.error("Error MongoDB:", error);
      }
    }
  );

module.exports = flowOp4;
