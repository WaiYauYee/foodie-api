const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === "465",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendPasswordResetEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"MakanFit" <${process.env.SMTP_FROM}>`,
    to,
    subject: "Your MakanFit password reset code",
    text: `Your reset code is ${code}. It expires in 10 minutes. If you didn't request this, ignore this email.`,
    html: `<p>Your MakanFit reset code:</p>
           <h2 style="letter-spacing:6px">${code}</h2>
           <p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>`,
  });
};

module.exports = { sendPasswordResetEmail };