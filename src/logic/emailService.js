// Servicio de correo transaccional.
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export const sendConfirmationEmail = async (to, token) => {
  if (!process.env.SMTP_HOST) {
    console.log(`[DEV] Confirmación para ${to}: /api/auth/confirm/${token}`);
    return;
  }
  const url = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/confirm/${token}`;
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    to,
    subject: 'Confirma tu cuenta',
    html: `<p>Confirma tu cuenta: <a href="${url}">${url}</a></p>`,
  });
};