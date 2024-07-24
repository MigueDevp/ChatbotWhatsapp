const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");


const flowRecibirDocumento = addKeyword(EVENTS.DOCUMENT).addAnswer(
    "Documento PDF recibido como constancia fiscal",
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      await state.update({
        fiscalCertificate: ctx.body,
        phoneNumberClientF: ctx.from,
      });

 });

 module.exports = flowRecibirDocumento;
