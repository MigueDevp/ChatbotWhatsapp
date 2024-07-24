const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const flowOp7 = require("./flowsOptions/flowOp7");

const flowRecibirMedia = addKeyword(EVENTS.MEDIA).addAnswer(
    "He recibido tu foto o video como comprobante de pago",
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ paymentProof: ctx.body });
    }
  )
  /*.addAction(_, async({ gotoFlow }) => {
    return await gotoFlow(flowOp7);
  });*/

  module.exports = flowRecibirMedia;