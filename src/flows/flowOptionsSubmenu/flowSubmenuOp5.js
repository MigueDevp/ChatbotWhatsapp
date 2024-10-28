const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");
const type_of_Service = "*COTIZACIÓN DE TRASLADO*";

const flowSubmenuOp5 = addKeyword(EVENTS.ACTION)
  .addAnswer("Has elegido cotizar *Traslados*, con gusto te damos seguimiento.")

  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        nameT: ctx.body,
        type_of_serviceT: type_of_Service,
      });
    }
  )

  .addAnswer(
    `¿A qué aeropuerto necesitas trasladarte?\n\nPor favor proporciona el nombre completo del aeropuerto.\n_(En caso de que tu traslado no sea al aeropuerto, escribe "no")_`,
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        airportNameT: ctx.body,
        phoneNumberClientTransfer: ctx.from,
      });
    }
  )

  .addAnswer(
    `Nombre del lugar u hotel de destino.\n*(Ejemplo):* Fiesta Americana Inn`,
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, hotelNameT: ctx.body });
    }
  )

  .addAnswer(
    "¿Para cuántas personas incluidas usted?",
    { capture: true },
    async (ctx, { state, flowDynamic, fallBack }) => {
      const numberOfPeople = parseInt(ctx.body, 10);
      if (isNaN(numberOfPeople)) {
        return fallBack();
      }

      const myState = state.getMyState();
      await state.update({ ...myState, numberOfPeopleTransfer: numberOfPeople });

      const myStateNow = state.getMyState();

      const summaryTransfer = `
        *COTIZACIÓN DE TRASLADO:*
        Nombre: ${myStateNow.nameT}
        Aeropuerto de traslado: ${myStateNow.airportNameT}
        Hotel de destino: ${myStateNow.hotelNameT}
        Número de personas: ${myStateNow.numberOfPeopleTransfer}
        Número de celular: ${myStateNow.phoneNumberClientTransfer}
      `;

      await flowDynamic([
        {
          body: `Este es el resumen de tu cotización de traslado:\n${summaryTransfer}`,
        },
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento. Agradecemos mucho tu paciencia, *${myState.nameT}*.` +
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
            type_of_service: myState.type_of_serviceT,
            name: myState.nameT,
            airportName: myState.airportNameT,
            hotelName: myState.hotelNameT,
            numberOfPeople: myState.numberOfPeopleTransfer,
            phoneNumberClientTransfer: myState.phoneNumberClientTransfer,
          });

          console.log("Summary has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️"<angelrr.ti22@utsjr.edu.mx>',
            to: "travelmrbot@gmail.com",
            subject: "Cotización de traslado",
            text: `¡Hola Ejecutiv@ de TRAVELMR!, Tienes una nueva cotización:\n${summaryTransfer}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", {
            summaryTransfer,
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

module.exports = flowSubmenuOp5;
