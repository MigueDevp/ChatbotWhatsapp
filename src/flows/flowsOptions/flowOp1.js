const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");

const type_of_Service = "*COTIZACIÓN VIAJE NACIONAL*";

const flowOp1 = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Elegiste *Cotizar mi viaje nacional*, con gusto te damos seguimiento"
  )
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        nameNational: ctx.body,
        type_of_serviceNational: type_of_Service,
      });
    }
  )
  .addAnswer(
    "¿Qué destino deseas visitar?\n*(EJEMPLO):* Cancún",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        destinationNational: ctx.body,
        phoneNumberClientNational: ctx.from,
      });
    }
  )
  .addAnswer(
    "¿Cuáles son sus fechas de interés?\n*(EJEMPLO:)* 12 de febrero al 18 de febrero",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, datesNational: ctx.body });
    }
  )
  .addAnswer(
    "Número de personas incluidas usted",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const numberOfPeople = parseInt(ctx.body, 10);
      if (isNaN(numberOfPeople)) {
        return fallBack();
      }

      const myState = state.getMyState();
      await state.update({ ...myState, peopleNational: numberOfPeople });
    }
  )
  .addAnswer(
    '¿Lleva menores de edad? Si es así, ¿qué edades tienen?\n*(Ejemplo A):* 5\n*(Ejemplo B):* 5 y 14\n*(Ejemplo C):* 5, 14 y 8\nSi no van menores de edad, escriba *"NO"*',
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, minorsNational: ctx.body });
    }
  )
  .addAnswer(
    'Si su plan es todo incluido por favor escriba *"TODO"*.\nSi es solo hospedaje, escriba *"HOSPEDAJE"*',
    { capture: true, delay: 0 },
    async (ctx, { state, flowDynamic, fallBack }) => {
      const validResponse = ctx.body.toUpperCase();

      if (validResponse !== "TODO" && validResponse !== "HOSPEDAJE") {
        return fallBack();
      }

      const planNational = validResponse === "TODO" ? "Todo Incluído" : "Hospedaje";

      const myState = state.getMyState();
      await state.update({ ...myState, planNational });

      const updatedState = state.getMyState(); 

      const summaryNational = `
        *COTIZACIÓN DE DESTINO NACIONAL:*
        Nombre: ${updatedState.nameNational}
        Destino: ${updatedState.destinationNational}
        Fechas: ${updatedState.datesNational}
        Número de personas: ${updatedState.peopleNational}
        Menores de edad (edades): ${updatedState.minorsNational}
        Plan: ${updatedState.planNational}
        Número de celular: ${updatedState.phoneNumberClientNational}
      `;

      await flowDynamic([
        { body: `Este es el resumen de tu cotización:\n${summaryNational}` },
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento.\nAgradecemos mucho tu paciencia, *${updatedState.nameNational}*.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*",
        },
      ]);

      (async () => {
        try {
          const db = await connectDB();
          const collection = db.collection("cotizaciones");
          const updatedState = state.getMyState(); 

          await collection.insertOne({
            type_of_service: updatedState.type_of_serviceNational,
            name: updatedState.nameNational,
            destinationNational: updatedState.destinationNational,
            datesNational: updatedState.datesNational,
            peopleNational: updatedState.peopleNational,
            minorsNational: updatedState.minorsNational,
            planNational: updatedState.planNational,
            phoneNumberClientNational: updatedState.phoneNumberClientNational,
          });

          console.log("Summary has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️" <angelrr.ti22@utsjr.edu.mx>',
            to: "miguedevp@gmail.com",
            subject: "Cotización de Viaje Nacional",
            text: `¡Hola Ejecutiva de TRAVELMR!, Tienes una nueva cotización:\n${summaryNational}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", {
            summaryNational,
          });
        } catch (error) {
          console.error("Error MongoDB:", error);
        }
      })();
    }
  );

module.exports = flowOp1;
