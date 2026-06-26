const cron = require('node-cron');
const RecurringDeposit = require('../models/RecurringDeposit');
const RDInstallment = require('../models/RDInstallment');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

const processRDAutoDebitAndPenalties = async () => {
  console.log('--- Running RD Daily Cron ---');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Process Auto Debits for installments due today (or before today and still pending)
    const pendingInstallments = await RDInstallment.find({ status: 'Pending' }).populate('rdId');
    
    for (const inst of pendingInstallments) {
      const rd = inst.rdId;
      if (rd.status !== 'Active') continue;

      const dueDate = new Date(inst.dueDate);
      dueDate.setHours(0,0,0,0);

      // If it's due today or was due in the past
      if (dueDate.getTime() <= today.getTime()) {
        if (rd.autoDebit) {
          // Attempt Auto Debit
          const account = await Account.findById(rd.linkedSavingsAccount);
          const totalToPay = inst.amount + inst.penalty;

          if (account && account.balance >= totalToPay) {
            // Success
            account.balance -= totalToPay;
            await account.save();

            const tx = await Transaction.create({
              userId: rd.userId,
              accountId: account._id,
              amount: totalToPay,
              type: 'RD Installment',
              status: 'Completed'
            });

            inst.status = 'Paid';
            inst.paidDate = new Date();
            inst.transactionRef = tx._id;
            await inst.save();

            rd.totalDeposited += inst.amount;
            rd.consecutiveMissedInstallments = 0;
            await rd.save();

            // Note: Maturity check could go here
          } else {
            // Failed Auto-Debit - don't mark as Failed status immediately, let it become Overdue if past due date
            // or mark as Failed for retry? The requirement says:
            // "If sufficient balance is not available: Mark installment as Failed, Do not deduct any amount, Notify the customer."
            inst.status = 'Failed';
            await inst.save();

            await AuditLog.create({
              action: 'Auto Debit Failed',
              performedBy: rd.userId,
              targetUser: rd.userId,
              details: `Auto debit failed for RD ${rd.rdNumber} installment ${inst.installmentNumber} due to insufficient funds.`
            });
            // TODO: Notify customer (email)
          }
        }
      }
    }

    // 2. Mark Overdue and Apply Penalty
    // Any Pending or Failed installment where dueDate is < today
    const overdues = await RDInstallment.find({ 
      status: { $in: ['Pending', 'Failed'] },
      dueDate: { $lt: today }
    }).populate('rdId');

    for (const inst of overdues) {
      const rd = inst.rdId;
      if (rd.status !== 'Active') continue;

      // If it just became overdue, or we need to recalculate penalty
      // Penalty: 1% of monthly amount per month overdue.
      // Let's calculate months overdue
      const dueDate = new Date(inst.dueDate);
      dueDate.setHours(0,0,0,0);
      
      const timeDiff = today.getTime() - dueDate.getTime();
      const daysOverdue = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      let monthsOverdue = Math.floor(daysOverdue / 30);
      if (daysOverdue > 0 && monthsOverdue === 0) monthsOverdue = 1; // Minimum 1 month penalty if overdue by a day

      const previousStatus = inst.status;
      inst.status = 'Overdue';
      inst.penalty = (inst.amount * 0.01) * monthsOverdue;
      await inst.save();

      if (previousStatus !== 'Overdue') {
        // Just became overdue
        rd.consecutiveMissedInstallments += 1;
        
        await AuditLog.create({
          action: 'Installment Overdue',
          performedBy: rd.userId, // System really, but we use userId
          targetUser: rd.userId,
          details: `Installment ${inst.installmentNumber} for RD ${rd.rdNumber} is overdue.`
        });
        
        // Notify customer
      }
      
      if (rd.consecutiveMissedInstallments > 3 && rd.status === 'Active') {
        rd.status = 'Inactive';
        await AuditLog.create({
          action: 'RD Inactive',
          performedBy: rd.userId,
          targetUser: rd.userId,
          details: `RD ${rd.rdNumber} became inactive due to >3 consecutive missed installments.`
        });
      }
      
      await rd.save();
    }

  } catch (error) {
    console.error('Error in RD Cron Job:', error);
  }
};

// Run daily at midnight
cron.schedule('0 0 * * *', processRDAutoDebitAndPenalties);

// For testing purposes during dev, we can also export the function
module.exports = { processRDAutoDebitAndPenalties };
