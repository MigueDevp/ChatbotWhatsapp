const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");
const transporter = require("../../../email/credentials/transporter");


const type_of_Service = "*VISA CANADIENSE*";

const flowOp9 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Visa Canadiense*")
  .addAnswer(
    `
*REQUISITOS:*

- Ife(INE).
- Pasaporte.
- Acta de nacimiento.

Nuestros servicios consisten en la asesoría y gestoría de tu trámite.

Costo de nuestro servicio *$1499.00 pesos.*
Costo de la visa *$100 dlls canadienses.*

Recuerda que nadie tiene la facultad de garantizarte la aprobación de la visa, los consulados son incorruptibles, y el veredicto dependerá de la situación de cada persona en especial, no te dejes engañar. Para revisar y darle una mejor asesoría, puede visitarnos en nuestras oficinas. Con gusto, un ejecutivo certificado lo atenderá.
    `
  )
  .addAnswer(
    "Si deseas tramitar tu visa, por favor escribe *SI*. \nSi no es así, escribe *NO*.",
    { capture: true },
    async (ctx, { flowDynamic, state }) => {
      const response = ctx.body.toLowerCase();
      if (response === "si" || response === "sí") {
        await state.update({
          phoneNumberClientVC: ctx.from,
          type_of_serviceVC: type_of_Service,
        });
        return await flowDynamic(
          "Perfecto, comenzaremos con la recopilación de tus documentos. Por favor, envía una foto clara de tu Ife(INE)."
        );
      } else if (response === "no") {
        return await flowDynamic(
          "Gracias por tu tiempo. Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*."
        );
      } else {
        return await flowDynamic(
          "Respuesta no válida. Por favor escribe *SI* o *NO*."
        );
      }
    }
  )
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ ifePhotoVC: ctx.body });
    return await flowDynamic(
      "Ahora, por favor envía una foto clara de tu Pasaporte."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ passportPhotoVC: ctx.body });
    return await flowDynamic(
      "Por último, por favor envía una foto clara de tu Acta de nacimiento."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ birthCertificatePhotoVC: ctx.body });
    const myState = state.getMyState();
    const summaryVisaC = `
      *SOLICITUD DE VISA CANADIENSE:*
      Número de celular: ${myState.phoneNumberClientVC}
      Foto de Ife(INE): ${myState.ifePhotoVC}
      Foto de Pasaporte: ${myState.passportPhotoVC}
      Foto de Acta de nacimiento: ${myState.birthCertificatePhotoVC}
    `;
    console.log(summaryVisaC);

    try {
      const db = await connectDB();
      const collection = db.collection("cotizaciones");

      const insertResult = await collection.insertOne({
        type_of_service: myState.type_of_serviceVC,
        phoneNumberClient: myState.phoneNumberClientVC,
        ifePhoto: myState.ifePhotoVC,
        passportPhoto: myState.passportPhotoVC,
        birthCertificatePhoto: myState.birthCertificatePhotoVC,
      });

      console.log(insertResult);
      console.log("Visa request has been sent to MongoDB!");

      const sendToGmail = await transporter.sendMail({
        from: '"✈️🌎TRAVEL-BOT🌎✈️"',
        to: "travelmrbot@gmail.com",
        subject: "Visa Canadiense",
        text: `¡Hola Ejecutiv@ de TRAVELMR!, Tienes una nueva cotización:\n${summaryVisaC}`,
      });

      console.log("Cotización correctamente enviada por GMAIL", {
        summaryVisaC,
      });

      return await flowDynamic(
        `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para continuar con tu trámite de visa. Gracias por tu paciencia.` +
          "\n\n" +
          "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*."
      );
    } catch (error) {
      console.error("Error MongoDB:", error);
      return await flowDynamic(
        "Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo más tarde."
      );
    }
  });

module.exports = flowOp9;
