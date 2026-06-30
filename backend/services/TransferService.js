const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const LedgerEntry = require('../models/LedgerEntry');
const SavingsAccount = require('../models/SavingsAccount');

/**
 * TransferService manages all money movement within the cooperative bank.
 * It executes transfers as atomic MongoDB transactions, enforcing balance checks
 * and creating double-entry ledger records.
 */
class TransferService {
  /**
   * Execute a Fund Transfer
   * @param {Object} params
   * @param {String} params.transferType - e.g. "Internal Transfer", "NEFT", "Loan Disbursement"
   * @param {Number} params.amount - Amount to transfer
   * @param {String} params.senderAccount - Account number to debit (null if system/external)
   * @param {String} params.receiverAccount - Account number to credit (null if external)
   * @param {String} params.userId - Initiating User ID
   * @param {String} params.paymentChannel - "Internal", "NEFT", "IMPS", "RTGS", "System"
   * @param {String} params.remarks - Transaction remarks
   */
  static async executeTransfer({
    transferType,
    amount,
    senderAccount,
    receiverAccount,
    userId,
    paymentChannel = 'Internal',
    remarks = ''
  }) {
    if (!amount || amount <= 0) {
      throw new Error('Transfer amount must be greater than zero');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let sender = null;
      let receiver = null;

      // 1. Lock and validate Sender Account
      if (senderAccount) {
        sender = await SavingsAccount.findOne({ accountNumber: senderAccount }).session(session);
        if (!sender) {
          throw new Error('Sender account not found');
        }
        if (sender.status !== 'Active') {
          throw new Error(`Sender account is ${sender.status}`);
        }
        if (sender.balance < amount) {
          throw new Error('Insufficient balance in sender account');
        }
        // Deduct Balance
        sender.balance -= amount;
        sender.totalWithdrawals += amount;
        sender.lastTransactionDate = new Date();
        await sender.save({ session });
      }

      // 2. Lock and validate Receiver Account
      if (receiverAccount) {
        receiver = await SavingsAccount.findOne({ accountNumber: receiverAccount }).session(session);
        if (!receiver) {
          throw new Error('Receiver account not found');
        }
        if (receiver.status !== 'Active' && receiver.status !== 'Dormant') { // Dormant can receive funds usually, but let's just allow it
          throw new Error(`Receiver account is ${receiver.status}`);
        }
        // Add Balance
        receiver.balance += amount;
        receiver.totalDeposits += amount;
        receiver.lastTransactionDate = new Date();
        await receiver.save({ session });
      }

      // 3. Create Transaction Record
      const referenceNumber = `TRF${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const transaction = new Transaction({
        userId,
        amount,
        type: transferType,
        status: 'Completed',
        referenceNumber,
        senderAccount: senderAccount || 'SYSTEM',
        receiverAccount: receiverAccount || 'EXTERNAL',
        paymentChannel,
        remarks,
        accountId: sender ? sender._id : (receiver ? receiver._id : null)
      });
      await transaction.save({ session });

      // 4. Create Ledger Entries (Double Entry)
      const debitEntry = new LedgerEntry({
        transactionId: transaction._id,
        accountId: senderAccount || 'SYSTEM_CASH',
        amount,
        entryType: 'Debit',
        transferType
      });
      await debitEntry.save({ session });

      const creditEntry = new LedgerEntry({
        transactionId: transaction._id,
        accountId: receiverAccount || 'EXTERNAL_BANK',
        amount,
        entryType: 'Credit',
        transferType
      });
      await creditEntry.save({ session });

      // 5. Commit Transaction
      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        transactionId: transaction._id,
        referenceNumber,
        message: 'Transfer successful'
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('TransferService Error:', error.message);
      
      // We could optionally log a Failed transaction outside the session here if we wanted,
      // but for atomic strictness, failing completely is safer.
      throw error;
    }
  }
}

module.exports = TransferService;
