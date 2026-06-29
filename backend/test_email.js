require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log("Testing email configuration...");
  console.log("Host:", process.env.SMTP_HOST);
  console.log("Port:", process.env.SMTP_PORT);
  console.log("Email:", process.env.SMTP_EMAIL);
  console.log("Password:", process.env.SMTP_PASSWORD ? "***" : "Not Set");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD?.replace(/\s/g, '') // strip spaces just in case
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      subject: "Test Email from Odiyooru Bank",
      text: "This is a test email to verify SMTP configuration.",
    });
    console.log("Email sent successfully! Message ID:", info.messageId);
  } catch (error) {
    console.error("Failed to send email. Error:", error);
  }
}

testEmail();
