const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");

const type_of_Service = "*COTIZACIÓN DESTINO INTERNACIONAL*";
const validMonths = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const flowOp2 = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Elegiste *Cotizar mi viaje internacional*, con gusto te damos seguimiento"
  )
  .addAnswer(
    "¿Cuál es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({
        nameInternational: ctx.body,
        type_of_serviceInternational: type_of_Service,
      });
    }
  )
  .addAnswer(
    "¿Qué destino deseas visitar?\n*(EJEMPLO):* Colombia",
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({
        ...myState,
        destinationInternational: ctx.body,
        phoneNumberClientInternational: ctx.from,
      });
    }
  )
  .addAnswer(
    "¿Mes del año deseado para viajar?\n*(EJEMPLO):* Enero",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const userResponse = ctx.body.toLowerCase();
      if (!validMonths.includes(userResponse)) {
        return fallBack();
      }

      const myState = state.getMyState();
      await state.update({
        ...myState,
        travelMonthInternational: userResponse,
      });
    }
  )
  .addAnswer(
    "¿Cuántos días desea viajar?",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const numberOfDays = parseInt(ctx.body, 10);
      if (isNaN(numberOfDays)) {
        return fallBack();
      }

      const myState = state.getMyState();
      await state.update({ ...myState, travelDaysInternational: numberOfDays });
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
      await state.update({ ...myState, peopleInternational: numberOfPeople });
    }
  )
  .addAnswer(
    '¿Lleva menores de edad? Si es así, ¿qué edades tienen?\n*(Ejemplo A):* 5\n*(Ejemplo B):* 5 y 14\n*(Ejemplo C):* 5, 14 y 8\nSi no van menores de edad, escriba *"NO"*',
    { capture: true },
    async (ctx, { state }) => {
      const myState = state.getMyState();
      await state.update({ ...myState, minorsInternational: ctx.body });
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

      const planInternational = validResponse === "TODO" ? "Todo Incluído" : "Hospedaje";

      const myState = state.getMyState();
      await state.update({ ...myState, planInternational });

      const updatedState = state.getMyState();

      const summaryInternational = `
        *COTIZACIÓN DE DESTINO INTERNACIONAL:*
        Nombre: ${updatedState.nameInternational}
        Destino: ${updatedState.destinationInternational}
        Mes deseado para viajar: ${updatedState.travelMonthInternational}
        Días de viaje: ${updatedState.travelDaysInternational}
        Número de personas: ${updatedState.peopleInternational}
        Menores de edad (edades): ${updatedState.minorsInternational}
        Plan: ${updatedState.planInternational}
        Número de celular: ${updatedState.phoneNumberClientInternational}
      `;

      await flowDynamic([
        { body: `Este es el resumen de tu cotización:\n${summaryInternational}` },
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para darte seguimiento.\nAgradecemos mucho tu paciencia, *${updatedState.nameInternational}*.` +
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
            type_of_service: updatedState.type_of_serviceInternational,
            name: updatedState.nameInternational,
            destinationInternational: updatedState.destinationInternational,
            travelMonth: updatedState.travelMonthInternational,
            travelDays: updatedState.travelDaysInternational,
            peopleInternational: updatedState.peopleInternational,
            minorsInternational: updatedState.minorsInternational,
            planInternational: updatedState.planInternational,
            phoneNumberClientInternational: updatedState.phoneNumberClientInternational,
          });

          console.log("Summary has been sent to MongoDB!");

          await transporter.sendMail({
            from: '"✈️🌎TRAVEL-BOT🌎✈️" <angelrr.ti22@utsjr.edu.mx>',
            to: "miguedevp@gmail.com",
            subject: "Cotización de Viaje Internacional",
            text: `¡Hola Ejecutiva de TRAVELMR!, Tienes una nueva cotización:\n${summaryInternational}`,
          });

          console.log("Cotización correctamente enviada por GMAIL", { summaryInternational });
        } catch (error) {
          console.error("Error MongoDB:", error);
        }
      })();
    }
  );

module.exports = flowOp2;
