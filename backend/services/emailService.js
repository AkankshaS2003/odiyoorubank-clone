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
  return;
};

module.exports = sendEmail;
