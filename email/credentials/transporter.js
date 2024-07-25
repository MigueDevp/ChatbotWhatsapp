const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "angelrr.ti22@utsjr.edu.mx",
    pass: "kwrujbfeofaummku",
  },
});



module.exports = transporter;