const cron = require('node-cron');
const LoanEMI = require('../models/LoanEMI');
const Loan = require('../models/Loan');
const AuditLog = require('../models/AuditLog');
const nodemailer = require('nodemailer'); // Assume basic nodemailer integration

// Helper to send email notification
const sendNotification = async (email, subject, message) => {
  try {
    const { sendEmail } = require('../utils/emailSender') || {};
    if (sendEmail) {
      await sendEmail(email, subject, message);
    } else {
      console.log(`[Email to ${email}]: ${subject} - ${message}`);
    }
  } catch (error) {
    console.error(`Cron Failed to send email: ${error.message}`);
  }
};

// Run every day at 12:01 AM
cron.schedule('1 0 * * *', async () => {
  console.log('Running Loan Missed EMI Job...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all pending EMIs where due date is before today
    const overdueEMIs = await LoanEMI.find({
      paymentStatus: 'Pending',
      dueDate: { $lt: today }
    }).populate('userId', 'email fullName');

    for (let emi of overdueEMIs) {
      // Check if already processed to avoid duplicate penalties
      // Since it's marked as pending, we'll mark it Overdue.
      
      const loan = await Loan.findById(emi.loanId);
      if (!loan) continue;

      emi.paymentStatus = 'Overdue';
      
      // Calculate penalty (e.g., 2% of EMI amount)
      emi.latePenalty = Math.round(emi.emiAmount * 0.02);
      await emi.save();

      // Log in Audit
      await AuditLog.create({
        action: 'EMI Overdue',
        performedBy: emi.userId._id, // System action targeting user
        targetUser: emi.userId._id,
        details: `EMI #${emi.emiNumber} for Loan ${loan.loanAccountNumber} marked overdue. Penalty of ₹${emi.latePenalty} applied.`
      });

      // Send Email Notification
      await sendNotification(
        emi.userId.email,
        'Loan EMI Overdue Alert',
        `Dear ${emi.userId.fullName},\n\nYour EMI #${emi.emiNumber} of ₹${emi.emiAmount} for Loan Account ${loan.loanAccountNumber} was due on ${new Date(emi.dueDate).toLocaleDateString()}. It has now been marked as Overdue and a late penalty of ₹${emi.latePenalty} has been applied.\n\nPlease pay immediately to avoid further charges.`
      );
    }

    console.log(`Loan Missed EMI Job completed. Processed ${overdueEMIs.length} EMIs.`);
  } catch (error) {
    console.error('Error in Loan Missed EMI Job:', error);
  }
});
