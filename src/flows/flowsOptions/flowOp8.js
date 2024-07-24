const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { connectDB } = require("../../../database/db_connection");

const type_of_Service = "*VISA AMERICANA*";

const flowOp8 = addKeyword(EVENTS.ACTION)
  .addAnswer("Elegiste *Visa Americana*")
  .addAnswer(
    `
*REQUISITOS:*

- Ife(INE).
- Pasaporte.
- Acta de nacimiento.

Nuestros servicios consisten en la asesoría y gestoría de tu trámite, entrevista y llenado de formatos DS-160. Si es trámite por primera vez, te agendamos tus dos citas consulares. La primera cita será para la toma de huellas y revisado de documentos. La segunda cita es la entrevista con el consulado. Tu trámite lo puedes llevar a cabo en Guadalajara, Monterrey o la Ciudad de México.

Costo de nuestro servicio *$1499.00 pesos.*
Costo de la visa *$160 dlls.*

Recuerda que nadie tiene la facultad de garantizarte la aprobación de la visa Americana. Los consulados son incorruptibles, y el veredicto dependerá de la situación de cada persona en especial. No te dejes engañar.

También contamos con el servicio de traslado ejecutivo al Consulado de entrevistas.

Para revisar y darle una mejor asesoría, puede visitarnos en nuestras oficinas. Con gusto, un ejecutivo certificado lo atenderá.
    `
  )
  .addAnswer(
    "Si deseas tramitar tu visa, por favor escribe *SI*. \nSi no es así, escribe *NO*.",
    { capture: true },
    async (ctx, { flowDynamic, state }) => {
      const response = ctx.body.toLowerCase();
      if (response === "si" || response === "sí") {
        await state.update({
          phoneNumberClientVA: ctx.from,
          type_of_serviceVA: type_of_Service,
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
    await state.update({ ifePhotoVA: ctx.body });
    return await flowDynamic(
      "Ahora, por favor envía una foto clara de tu Pasaporte."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ passportPhotoVA: ctx.body });
    return await flowDynamic(
      "Por último, por favor envía una foto clara de tu Acta de nacimiento."
    );
  })
  .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ birthCertificatePhotoVA: ctx.body });

    /*const summaryVisa = `
      *SOLICITUD DE VISA AMERICANA:*
      Número de celular: ${myState.phoneNumberClientVA}
      Foto de Ife(INE): ${myState.ifePhotoVA}
      Foto de Pasaporte: ${myState.passportPhotoVA}
      Foto de Acta de nacimiento: ${myState.birthCertificatePhotoVA}
    `;*/

    try {
      const db = await connectDB();
      const collection = db.collection("cotizaciones");
      const myState = state.getMyState();

      const insertResult = await collection.insertOne({
        type_of_service: myState.type_of_serviceVA,
        phoneNumberClient: myState.phoneNumberClientVA,
        ifePhoto: myState.ifePhotoVA,
        passportPhoto: myState.passportPhotoVA,
        birthCertificatePhoto: myState.birthCertificatePhotoVA,
      });

      console.log(insertResult);
      console.log("Visa request has been sent to MongoDB!");

      await flowDynamic([
        {
          body:
            `Tu información ha sido correctamente enviada. En unos momentos te pondremos en contacto vía WhatsApp con un ejecutivo de TravelMR para continuar con tu trámite de visa. Gracias por tu paciencia.` +
            "\n\n" +
            "Si necesitas seguir usando nuestro servicio puedes volver al menú principal escribiendo la palabra *INICIO*.",
        },
      ]);
    } catch (error) {
      console.error("Error MongoDB:", error);
    }
  });

module.exports = flowOp8;
