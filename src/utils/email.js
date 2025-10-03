const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendMail({ to, subject, html, attachments }) {
  const from = process.env.SMTP_FROM || 'no-reply@example.com';
  const info = await transporter.sendMail({ from, to, subject, html, attachments });
  logger.info('Email sent: %s', info.messageId);
  return info;
}

module.exports = { transporter, sendMail };
