const { Resend } = require("resend");

console.log("RESEND_API_KEY =", process.env.RESEND_API_KEY);

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = resend;