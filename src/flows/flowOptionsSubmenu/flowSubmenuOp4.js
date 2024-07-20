const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*COTIZACIÓN DE SERVICIO DE RENTA DE AUTO*";

const flowSubmenuOp4 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Auto*, con gusto te damos seguimiento.")

  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ nameAuto: ctx.body, type_of_serviceAuto: type_of_Service });
    }
  )

  .addAnswer(
    `¿Cuál es tu punto de recolección?\n\nEl punto de *RECOLECCIÓN* hace referencia al lugar donde te ubicas geográficamente, esto para ofrecerte un proveedor cercano a tu ubicación.\n*(Ejemplo):* San Juan del Río, Querétaro.`,
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        pointOfCollection: ctx.body,
        phoneNumberClientAuto: ctx.from,
      });
    }
  )

  .addAnswer(
    "¿Para cuántas personas incluidas usted?",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, numberOfPeopleAuto: ctx.body });
    }
  )

  .addAnswer(
    "¿Cuál es la fecha deseada para rentar la unidad?\n*(Ejemplo):* 12 de febrero",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, rentalDateAuto: ctx.body });

      try {
        const db = await connectDB();
        const collection = db.collection("cotizaciones");
        const myState = state.getMyState();
        console.log("Connected Successfully to MongoDB!");

        const insertResult = await collection.insertOne({
          type_of_service: myState.type_of_serviceAuto,
          name: myState.nameAuto,
          pointOfCollection: myState.pointOfCollection,
          numberOfPeople: myState.numberOfPeopleAuto,
          rentalDate: myState.rentalDateAuto,
          phoneNumberClientAuto: myState.phoneNumberClientAuto,
        });

        console.log(insertResult);
        console.log("Summary has been sent to MongoDB!");

        const summaryAuto = `
          *COTIZACIÓN DE AUTO:*
          Nombre: ${myState.nameAuto}
          Punto de recolección: ${myState.pointOfCollection}
          Número de personas: ${myState.numberOfPeopleAuto}
          Fecha deseada: ${myState.rentalDateAuto}
          Número de celular: ${myState.phoneNumberClientAuto}
        `;

        await flowDynamic([
          {
            body: `Este es el resumen de tu cotización de auto:\n${summaryAuto}`,
          },
          {
            body:
              `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.nameAuto}*.` +
              "\n\n" +
              "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *MENU*",
          },
        ]);
      } catch (error) {
        console.error("Error MongoDB:", error);
        await flowDynamic(
          "Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo más tarde."
        );
      }
    }
  );

module.exports = flowSubmenuOp4;
