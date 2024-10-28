const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");
const type_of_Service = "*COTIZACIÓN DE SERVICIO DE RENTA DE AUTO*";

const flowSubmenuOp4 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Auto*, con gusto te damos seguimiento.")

  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        nameAuto: ctx.body,
        type_of_serviceAuto: type_of_Service,
      });
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
    async (ctx, { state, fallBack }) => {
      const numberOfPeopleAuto = parseInt(ctx.body, 10);
      if (isNaN(numberOfPeopleAuto)) {
        return fallBack();
      }
      const myState = state.getMyState();
      await state.update({
        ...myState,
        numberOfPeopleAuto: numberOfPeopleAuto,
      });
    }
  )

  .addAnswer(
    "¿Cuál es la fecha deseada para rentar la unidad?\n*(Ejemplo):* 12 de febrero",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, rentalDateAuto: ctx.body });

      const myStateNow = state.getMyState();

      const summaryAuto = `
        *COTIZACIÓN DE AUTO:*
        Nombre: ${myStateNow.nameAuto}
        Punto de recolección: ${myStateNow.pointOfCollection}
        Número de personas: ${myStateNow.numberOfPeopleAuto}
        Fecha deseada: ${myStateNow.rentalDateAuto}
        Número de celular: ${myStateNow.phoneNumberClientAuto}
      `;

      await flowDynamic([
        {
          body: `Este es el resumen de tu cotización de auto:\n${summaryAuto}`,
        },
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myStateNow.nameAuto}*.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*",
        },
      ]);

      (async () => {
        try {
          const db = await connectDB();
          const collection = db.collection("cotizaciones");

          await collection.insertOne({
            type_of_service: myStateNow.type_of_serviceAuto,
            name: myStateNow.nameAuto,
            pointOfCollection: myStateNow.pointOfCollection,
            numberOfPeople: myStateNow.numberOfPeopleAuto,
            rentalDate: myStateNow.rentalDateAuto,
            phoneNumberClientAuto: myStateNow.phoneNumberClientAuto,
          });

          console.log("Summary has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️"',
            to: "travelmrbot@gmail.com",
            subject: "Cotización de renta de auto",
            text: `¡Hola Ejecutiv@ de TRAVELMR!, Tienes una nueva cotización:\n${summaryAuto}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", {
            summaryAuto,
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

module.exports = flowSubmenuOp4;
