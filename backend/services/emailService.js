const nodemailer = require('nodemailer');

const printOTPToTerminal = (options) => {
  const border = '========================================';
  const title = '📧 [MOCK EMAIL / OTP NOTIFICATION]';
  const to = `To: ${options.email}`;
  const subject = `Subject: ${options.subject}`;
  const msg = `Message:\n${options.message}`;
  
  const fullLog = `\n${border}\n${title}\n${to}\n${subject}\n${msg}\n${border}\n`;
  
  // Write to all standard output and error streams to guarantee immediate visibility
  console.log(fullLog);
  console.error(fullLog);
  process.stdout.write(fullLog);
  process.stderr.write(fullLog);
};

const sendEmail = async (options) => {
  // ALWAYS print the email & OTP message prominently in the terminal log
  printOTPToTerminal(options);

  if (process.env.MOCK_EMAIL === 'true' || !process.env.SMTP_HOST || process.env.SMTP_HOST.includes('mailtrap')) {
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s/g, '') : undefined
      }
    });

    const message = {
      from: `${process.env.FROM_NAME || 'Odiyooru Bank'} <${process.env.FROM_EMAIL || 'noreply@odiyoorubank.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    if (options.attachments) {
      message.attachments = options.attachments;
    }

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.warn('⚠️ SMTP Email delivery failed, but OTP was printed to terminal above:', err.message);
  }
};

module.exports = sendEmail;
