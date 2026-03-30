import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_APP_PASS,
  },
});

export const sendNotificationsEmail = async (email, invoiceNumbers) => {
  const mailOptions = {
    from: '"InvoiceManager" <ddudzik1706@gmail.com>',
    to: email,
    subject: `Zbliżający się termin płatności`,
    text: `Zbliża się termin płatności faktur. Liczba faktur z terminem kończącym się do 7 dni: ${invoiceNumbers}`,
    html: ``,
  };

  transporter.sendMail(mailOptions);
};
