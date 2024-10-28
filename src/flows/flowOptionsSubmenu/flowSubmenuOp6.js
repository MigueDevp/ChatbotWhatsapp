const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");
const type_of_Service = "*COTIZACIÓN DE TOUR*";

const flowSubmenuOp6 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Tour*, con gusto te damos seguimiento.")

  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        nameTour: ctx.body,
        type_of_serviceTour: type_of_Service,
      });
    }
  )

  .addAnswer(
    "¿Cuál es el destino del tour que deseas cotizar?\n*(EJEMPLO):* Ciudad de México.",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        destinationTour: ctx.body,
        numberCellClientTour: ctx.from,
      });
    }
  )

  .addAnswer(
    "¿Para cuántas personas incluidas usted?",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const numberOfPeopleTour = parseInt(ctx.body, 10);
      if (isNaN(numberOfPeopleTour)) {
        return fallBack();
      }
      const myState = state.getMyState();
      await state.update({
        ...myState,
        numberOfPeopleTour: numberOfPeopleTour,
      });
    }
  )

  .addAnswer(
    "¿Cuál es la fecha deseada para el tour?\n*(Ejemplo):* 12 de febrero",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, tourDate: ctx.body });

      const myStateNow = state.getMyState();

      const summaryTour = `
        *COTIZACIÓN DE TOUR:*
        Nombre: ${myStateNow.nameTour}
        Destino del tour: ${myStateNow.destinationTour}
        Número de personas: ${myStateNow.numberOfPeopleTour}
        Fecha deseada: ${myStateNow.tourDate}
        Número de celular: ${myStateNow.numberCellClientTour}
      `;

      await flowDynamic([
        {
          body: `Este es el resumen de tu cotización de tour:\n${summaryTour}`,
        },
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.nameTour}*.` +
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
            type_of_service: myState.type_of_serviceTour,
            name: myState.nameTour,
            destination: myState.destinationTour,
            numberOfPeople: myState.numberOfPeopleTour,
            tourDate: myState.tourDate,
            numberCellClient: myState.numberCellClientTour,
          });

          console.log("Summary has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️"<angelrr.ti22@utsjr.edu.mx>',
            to: "travelmrbot@gmail.com",
            subject: "Cotización de tour",
            text: `¡Hola Ejecutiv@ de TRAVELMR!, Tienes una nueva cotización:\n${summaryTour}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", {
            summaryTour,
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

module.exports = flowSubmenuOp6;
