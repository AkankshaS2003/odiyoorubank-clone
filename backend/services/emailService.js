const nodemailer = require('nodemailer');

const printOTPToTerminal = (options) => {
  const border = '========================================';
  const title = '📧 [EMAIL / OTP NOTIFICATION]';
  const to = `To: ${options.email}`;
  const subject = `Subject: ${options.subject}`;
  const msg = `Message:\n${options.message}`;
  
  const fullLog = `\n${border}\n${title}\n${to}\n${subject}\n${msg}\n${border}\n`;
  
  // Write to all standard output and error streams to guarantee immediate visibility
  console.log(fullLog);
};

const sendEmail = async (options) => {
  // ALWAYS print the email & OTP message prominently in the terminal log
  printOTPToTerminal(options);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD?.replace(/\s/g, '')
    }
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
