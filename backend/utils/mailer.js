// utils/mailer.js
const nodemailer = require("nodemailer");

const SENDER = `"MakanFit" <${process.env.SMTP_FROM}>`;
const CODE_EXPIRY_MINUTES = 10;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Shared template for sending one-time codes
const sendCodeEmail = async ({ to, subject, purpose, code }) => {
  const text = [
    `Your MakanFit ${purpose} code is: ${code}`,
    `This code expires in ${CODE_EXPIRY_MINUTES} minutes.`,
    "If you did not request this code, you can safely ignore this email.",
  ].join("\n\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 480px;">
      <h2 style="color: #059669; margin-bottom: 16px;">MakanFit</h2>
      <p>Use the following code to ${purpose}:</p>

      <div style="
        background-color: #f0fdf4;
        border-radius: 8px;
        padding: 20px;
        margin: 24px 0;
        text-align: center;
      ">
        <span style="
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #065f46;
        ">${code}</span>
      </div>

      <p>This code expires in <strong>${CODE_EXPIRY_MINUTES} minutes</strong>.</p>
      <p style="color: #666; font-size: 13px;">
        If you did not request this code, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">
        This is an automated message from MakanFit. Please do not reply.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: SENDER,
    to,
    subject,
    text,
    html,
  });
};

// Send password reset code
const sendPasswordResetEmail = async (to, code) => {
  await sendCodeEmail({
    to,
    subject: "Your MakanFit Password Reset Code",
    purpose: "reset your password",
    code,
  });
};

// Send email verification code
const sendVerificationEmail = async (email, code) => {
  await sendCodeEmail({
    to: email,
    subject: "Verify Your MakanFit Email Address",
    purpose: "verify your email address",
    code,
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
};
