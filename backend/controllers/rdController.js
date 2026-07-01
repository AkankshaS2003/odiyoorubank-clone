const RecurringDeposit = require('../models/RecurringDeposit');
const RDInstallment = require('../models/RDInstallment');
const SavingsAccount = require('../models/SavingsAccount');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRD = async (req, res, next) => {
  try {
    const { monthlyAmount, tenureMonths, interestRate, nomineeDetails, autoDebit, linkedSavingsAccountId, otp } = req.body;
    
    const Otp = require('../models/Otp');
    const OtpAuditLog = require('../models/OtpAuditLog');
    const crypto = require('crypto');
    const hashOtp = (o) => crypto.createHash('sha256').update(o).digest('hex');

    const otpDoc = await Otp.findOne({ email: req.user.email }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ success: false, message: 'No OTP generated for this email' });
    }

    if (otpDoc.attempts >= 3) {
      return res.status(400).json({ success: false, message: 'This OTP verification flow is locked due to too many failed attempts. Please generate a new OTP.' });
    }

    if (new Date() > otpDoc.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (otpDoc.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'OTP already verified or used' });
    }

    const isMatch = hashOtp(otp) === otpDoc.otpHash;
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();

      await OtpAuditLog.create({
        email: req.user.email,
        action: 'Failed',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Failed transaction OTP attempt ${otpDoc.attempts}`
      });

      const remaining = 3 - otpDoc.attempts;
      return res.status(400).json({ 
        success: false, 
        message: remaining <= 0 
          ? 'Too many failed attempts. Verification locked. Please generate a new OTP.' 
          : `Invalid OTP. ${remaining} attempts remaining.` 
      });
    }

    // Success - delete OTP
    await Otp.deleteMany({ email: req.user.email });

    await OtpAuditLog.create({
      email: req.user.email,
      action: 'Verified',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Transaction OTP successfully verified for RD creation'
    });

    const linkedAccount = await SavingsAccount.findOne({ _id: linkedSavingsAccountId, userId: req.user.id });
    if (!linkedAccount) {
      return res.status(404).json({ success: false, message: 'Linked Savings Account not found' });
    }

    const newRD = await RecurringDeposit.create({
      userId: req.user.id,
      monthlyAmount,
      tenureMonths,
      interestRate,
      linkedSavingsAccount: linkedAccount._id,
      nomineeDetails,
      autoDebit
    });

    await AuditLog.create({
      action: 'RD Creation',
      performedBy: req.user.id,
      targetUser: req.user.id,
      details: `Created RD application for Rs ${monthlyAmount}/month for ${tenureMonths} months`
    });

    res.status(201).json({ success: true, data: newRD });
  } catch (error) {
    next(error);
  }
};

exports.getRDs = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const rds = await RecurringDeposit.find(query).populate('linkedSavingsAccount', 'accountNumber');
    res.status(200).json({ success: true, data: rds });
  } catch (error) {
    next(error);
  }
};

exports.getRDById = async (req, res, next) => {
  try {
    let rd = await RecurringDeposit.findById(req.params.id).populate('linkedSavingsAccount', 'accountNumber balance');
    console.log("RD findById result:", !!rd);
    
    if (!rd) {
      console.log("Falling back for ID:", req.params.id);
      // Fallback: If ID is a ServiceApplication ID from the dashboard
      const ServiceApplication = require('../models/ServiceApplication');
      const app = await ServiceApplication.findById(req.params.id);
      console.log("Service App found:", !!app, app ? app.applicationType : null);
      if (app && app.applicationType === 'Recurring Deposit') {
        rd = await RecurringDeposit.findOne({ userId: app.userId }).sort({ createdAt: -1 }).populate('linkedSavingsAccount', 'accountNumber balance');
        console.log("Found RD from user:", !!rd);
      }
    }

    if (!rd) return res.status(404).json({ success: false, message: 'RD Account not found' });
    
    if (req.user.role !== 'admin' && rd.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const installments = await RDInstallment.find({ rdId: rd._id }).sort({ installmentNumber: 1 });
    
    res.status(200).json({ success: true, data: { rd, installments } });
  } catch (error) {
    next(error);
  }
};

exports.adminApproveRD = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rd = await RecurringDeposit.findById(id);
    if (!rd) return res.status(404).json({ success: false, message: 'RD not found' });
    if (rd.status !== 'Pending Approval') {
      return res.status(400).json({ success: false, message: 'RD is not pending approval' });
    }

    const count = await RecurringDeposit.countDocuments({ status: { $ne: 'Pending Approval' } });
    const rdNumber = `RD${String(count + 1).padStart(5, '0')}`;
    
    rd.rdNumber = rdNumber;
    rd.status = 'Active';
    
    // Maturity Calculation
    const today = new Date();
    rd.depositDate = today;
    const maturityDate = new Date(today);
    maturityDate.setMonth(maturityDate.getMonth() + rd.tenureMonths);
    rd.maturityDate = maturityDate;

    // Generate schedule
    const installments = [];
    for (let i = 1; i <= rd.tenureMonths; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      installments.push({
        rdId: rd._id,
        installmentNumber: i,
        dueDate,
        amount: rd.monthlyAmount
      });
    }
    await RDInstallment.insertMany(installments);
    await rd.save();

    await AuditLog.create({
      action: 'Admin Approve RD',
      performedBy: req.user.id,
      targetUser: rd.userId,
      details: `Approved RD ${rdNumber}`
    });

    res.status(200).json({ success: true, data: rd });
  } catch (error) {
    next(error);
  }
};

const calculateMaturity = (rd, installments) => {
  // Quarterly compounding
  const r = rd.interestRate / 100;
  const n = 4; // Compounding quarterly
  let totalInterest = 0;
  
  installments.forEach(inst => {
    if (inst.status === 'Paid') {
      // Time in years for this installment
      const timeInMonths = (rd.maturityDate - inst.paidDate) / (1000 * 60 * 60 * 24 * 30.4375);
      if (timeInMonths > 0) {
        const t = timeInMonths / 12;
        const amt = inst.amount * Math.pow((1 + (r / n)), (n * t));
        totalInterest += (amt - inst.amount);
      }
    }
  });
  
  rd.interestEarned = Math.round(totalInterest);
  rd.maturityAmount = rd.totalDeposited + rd.interestEarned;
};

const checkMaturity = async (rd) => {
  const allInstallments = await RDInstallment.find({ rdId: rd._id });
  const allPaid = allInstallments.every(i => i.status === 'Paid');
  if (allPaid && allInstallments.length === rd.tenureMonths) {
    calculateMaturity(rd, allInstallments);
    rd.status = 'Matured';
    await rd.save();
    return true;
  }
  return false;
};

exports.payInstallmentFromSavings = async (req, res, next) => {
  try {
    const { installmentId } = req.body;
    const installment = await RDInstallment.findById(installmentId).populate('rdId');
    if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });
    if (installment.status === 'Paid') return res.status(400).json({ success: false, message: 'Already paid' });
    
    const rd = installment.rdId;
    if (rd.status !== 'Active') return res.status(400).json({ success: false, message: `RD is ${rd.status}` });
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(installment.dueDate);
    dueDate.setHours(0,0,0,0);
    if (today < dueDate) {
      return res.status(400).json({ success: false, message: 'Installment cannot be paid before its due date' });
    }

    const previousPending = await RDInstallment.findOne({ rdId: rd._id, installmentNumber: { $lt: installment.installmentNumber }, status: { $ne: 'Paid' } });
    if (previousPending) {
      return res.status(400).json({ success: false, message: 'Please pay previous installments first' });
    }

    const account = await SavingsAccount.findById(rd.linkedSavingsAccount);
    const totalToPay = installment.amount + (installment.penalty || 0);

    if (account.balance < totalToPay) {
      return res.status(400).json({ success: false, message: 'Insufficient balance in linked savings account' });
    }

    account.balance -= totalToPay;
    await account.save();

    const transaction = await Transaction.create({
      userId: req.user.id,
      accountId: account._id,
      amount: totalToPay,
      type: 'RD Installment',
      status: 'Completed'
    });

    installment.status = 'Paid';
    installment.paidDate = new Date();
    installment.transactionRef = transaction._id;
    await installment.save();

    rd.totalDeposited += installment.amount;
    rd.consecutiveMissedInstallments = 0;
    await rd.save();

    await checkMaturity(rd);

    await AuditLog.create({
      action: 'Installment Paid Savings',
      performedBy: req.user.id,
      targetUser: req.user.id,
      details: `Paid installment ${installment.installmentNumber} for RD ${rd.rdNumber}`
    });

    res.status(200).json({ success: true, message: 'Installment paid successfully' });
  } catch (error) {
    next(error);
  }
};

exports.createRazorpayOrderForInstallment = async (req, res, next) => {
  try {
    const { installmentId } = req.body;
    const installment = await RDInstallment.findById(installmentId);
    if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });
    
    const totalToPay = installment.amount + (installment.penalty || 0);
    
    const options = {
      amount: totalToPay * 100,
      currency: "INR",
      receipt: "rd_" + crypto.randomBytes(4).toString('hex')
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, data: { ...order, key_id: process.env.RAZORPAY_KEY_ID } });
  } catch (error) {
    next(error);
  }
};

exports.verifyRazorpayInstallment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, installmentId } = req.body;
    
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const installment = await RDInstallment.findById(installmentId).populate('rdId');
    const rd = installment.rdId;
    const totalToPay = installment.amount + (installment.penalty || 0);

    const transaction = await Transaction.create({
      userId: req.user.id,
      amount: totalToPay,
      type: 'RD Installment',
      razorpayOrderId,
      razorpayPaymentId,
      status: 'Completed'
    });

    installment.status = 'Paid';
    installment.paidDate = new Date();
    installment.transactionRef = transaction._id;
    await installment.save();

    rd.totalDeposited += installment.amount;
    rd.consecutiveMissedInstallments = 0;
    await rd.save();

    await checkMaturity(rd);

    await AuditLog.create({
      action: 'Installment Paid Razorpay',
      performedBy: req.user.id,
      targetUser: req.user.id,
      details: `Paid installment ${installment.installmentNumber} via Razorpay for RD ${rd.rdNumber}`
    });

    res.status(200).json({ success: true, message: 'Installment paid successfully via Razorpay' });
  } catch (error) {
    next(error);
  }
};

exports.requestSettlement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { settlementMode } = req.body;
    
    const rd = await RecurringDeposit.findById(id);
    if (!rd) return res.status(404).json({ success: false, message: 'RD not found' });
    if (rd.status !== 'Matured') return res.status(400).json({ success: false, message: 'RD is not Matured' });
    if (rd.userId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    rd.status = 'Pending Settlement Approval';
    rd.settlementDetails = {
      settlementMode,
      settlementDate: new Date(),
      settledAmount: rd.maturityAmount
    };
    await rd.save();
    
    res.status(200).json({ success: true, message: 'Settlement requested successfully' });
  } catch (error) {
    next(error);
  }
};

exports.adminApproveSettlement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rd = await RecurringDeposit.findById(id);
    if (!rd || rd.status !== 'Pending Settlement Approval') {
      return res.status(400).json({ success: false, message: 'Invalid RD for settlement approval' });
    }

    const TransferService = require('../services/TransferService');
    const SavingsAccount = require('../models/SavingsAccount');
    
    // Find linked account or default to user's main savings account
    let savingsAcc = null;
    if (rd.linkedSavingsAccount) {
      savingsAcc = await SavingsAccount.findById(rd.linkedSavingsAccount);
    } 
    if (!savingsAcc) {
      savingsAcc = await SavingsAccount.findOne({ userId: rd.userId });
    }

    if (!savingsAcc) {
      return res.status(400).json({ success: false, message: 'No Savings Account found to transfer maturity amount' });
    }

    if (rd.settlementDetails.settlementMode === 'Transfer to Savings') {
      const transferResult = await TransferService.executeTransfer({
        transferType: 'RD Maturity Credit',
        amount: rd.maturityAmount,
        senderAccount: null,
        receiverAccount: savingsAcc.accountNumber,
        userId: rd.userId,
        paymentChannel: 'System',
        remarks: `RD Maturity Settlement for ${rd.rdNumber}`
      });

      rd.status = 'Closed';
      rd.settlementDetails.transactionRef = transferResult.transactionId;
      rd.settlementDetails.processedBy = req.user.id;
      await rd.save();
      
      await AuditLog.create({
        action: 'Approve RD Settlement',
        performedBy: req.user.id,
        targetUser: rd.userId,
        details: `Settled RD ${rd.rdNumber} to savings`
      });

    } else if (rd.settlementDetails.settlementMode === 'Renew RD') {
      const count = await RecurringDeposit.countDocuments({ status: { $ne: 'Pending Approval' } });
      const newRdNumber = `RD${String(count + 1).padStart(5, '0')}`;
      
      const newRD = await RecurringDeposit.create({
        rdNumber: newRdNumber,
        userId: rd.userId,
        monthlyAmount: rd.monthlyAmount,
        tenureMonths: rd.tenureMonths,
        interestRate: rd.interestRate,
        linkedSavingsAccount: rd.linkedSavingsAccount,
        nomineeDetails: rd.nomineeDetails,
        autoDebit: rd.autoDebit,
        status: 'Active',
        depositDate: new Date()
      });
      
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + newRD.tenureMonths);
      newRD.maturityDate = maturityDate;
      
      const installments = [];
      for (let i = 1; i <= newRD.tenureMonths; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        installments.push({
          rdId: newRD._id,
          installmentNumber: i,
          dueDate,
          amount: newRD.monthlyAmount
        });
      }
      await RDInstallment.insertMany(installments);
      
      const transferResult = await TransferService.executeTransfer({
        transferType: 'RD Maturity Credit',
        amount: rd.maturityAmount,
        senderAccount: null,
        receiverAccount: savingsAcc.accountNumber,
        userId: rd.userId,
        paymentChannel: 'System',
        remarks: `RD Maturity (Renewed) Settlement for ${rd.rdNumber}`
      });
      
      newRD.totalDeposited = 0;
      await newRD.save();

      rd.status = 'Renewed';
      rd.settlementDetails.transactionRef = transferResult.transactionId;
      rd.settlementDetails.processedBy = req.user.id;
      await rd.save();
    }

    res.status(200).json({ success: true, message: 'Settlement approved' });
  } catch (error) {
    next(error);
  }
};

exports.reactivateRD = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rd = await RecurringDeposit.findById(id);
    if (!rd) return res.status(404).json({ success: false, message: 'RD not found' });
    if (rd.status !== 'Inactive') return res.status(400).json({ success: false, message: 'RD is not inactive' });
    
    rd.status = 'Active';
    rd.consecutiveMissedInstallments = 0;
    await rd.save();
    
    res.status(200).json({ success: true, message: 'RD Reactivated' });
  } catch(err) {
    next(err);
  }
};

// ==========================================
// RD Monthly Installment Payment Systems
// ==========================================

exports.searchByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const User = require('../models/User');
    const user = await User.findOne({ customerId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const rd = await RecurringDeposit.findOne({ userId: user._id, status: 'Active' });
    if (!rd) {
      return res.status(404).json({ success: false, message: 'No active Recurring Deposit found for this customer' });
    }

    const installments = await RDInstallment.find({ rdId: rd._id }).sort({ installmentNumber: 1 });
    
    const paidCount = installments.filter(inst => inst.status === 'Paid').length;
    const pendingCount = installments.filter(inst => inst.status === 'Pending').length;
    const overdueCount = installments.filter(inst => inst.status === 'Overdue').length;

    // Find the next due installment (first one that is Pending or Overdue)
    const nextInstallment = installments.find(inst => inst.status === 'Pending' || inst.status === 'Overdue');
    
    let penalty = 0;
    let totalPayable = 0;
    if (nextInstallment) {
      const today = new Date();
      if (new Date(nextInstallment.dueDate) < today) {
        penalty = Math.round(nextInstallment.amount * 0.02);
      }
      totalPayable = nextInstallment.amount + penalty;
    }

    // Get linked savings account details
    const linkedAccount = await SavingsAccount.findById(rd.linkedSavingsAccount);

    res.status(200).json({
      success: true,
      data: {
        customer: {
          id: user.customerId,
          name: user.fullName,
          mobile: user.phone,
          email: user.email
        },
        rd: {
          id: rd._id,
          rdNumber: rd.rdNumber || 'RD-' + rd._id.toString().slice(-6).toUpperCase(),
          status: rd.status,
          monthlyAmount: rd.monthlyAmount,
          interestRate: rd.interestRate,
          tenureMonths: rd.tenureMonths,
          depositDate: rd.depositDate,
          maturityDate: rd.maturityDate,
          openingDate: rd.createdAt,
          nextDueDate: nextInstallment ? nextInstallment.dueDate : null,
          installmentsPaid: paidCount,
          pendingInstallments: pendingCount,
          overdueInstallments: overdueCount,
          totalDeposited: rd.totalDeposited
        },
        linkedSavingsAccount: linkedAccount ? {
          accountNumber: linkedAccount.accountNumber,
          balance: linkedAccount.balance
        } : null,
        nextInstallment: nextInstallment ? {
          id: nextInstallment._id,
          installmentNumber: nextInstallment.installmentNumber,
          dueDate: nextInstallment.dueDate,
          amount: nextInstallment.amount,
          penalty,
          totalPayable
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.payInstallment = async (req, res, next) => {
  try {
    const { customerId, rdId, installmentId, amountPaid, paymentMode, remarks, signatureBase64 } = req.body;
    const User = require('../models/User');
    const user = await User.findOne({ customerId });
    if (!user) return res.status(404).json({ success: false, message: 'Customer ID not found' });

    const rd = await RecurringDeposit.findById(rdId);
    if (!rd) return res.status(404).json({ success: false, message: 'RD Account not found' });
    if (rd.status !== 'Active') return res.status(400).json({ success: false, message: `RD Account is not Active (Current status: ${rd.status})` });

    const installment = await RDInstallment.findById(installmentId);
    if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });
    if (installment.status === 'Paid') return res.status(400).json({ success: false, message: 'Installment is already paid' });

    // Ensure they are not paying out of order
    const priorPending = await RDInstallment.findOne({
      rdId,
      installmentNumber: { $lt: installment.installmentNumber },
      status: { $ne: 'Paid' }
    });
    if (priorPending) {
      return res.status(400).json({ success: false, message: 'Cannot pay this installment. Please clear previous outstanding installments first.' });
    }

    const todayRaw = new Date();
    const today = new Date(todayRaw);
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(installment.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (today < dueDate) {
      return res.status(400).json({ success: false, message: `Cannot pay early. This installment is due on ${dueDate.toLocaleDateString('en-GB')}. Please pay on or after the due date.` });
    }
    let penalty = 0;
    if (new Date(installment.dueDate) < todayRaw) {
      penalty = Math.round(installment.amount * 0.02);
    }
    const totalPayable = installment.amount + penalty;

    if (amountPaid !== totalPayable) {
      return res.status(400).json({ success: false, message: `Amount entered (₹${amountPaid}) must exactly match the Total Amount Payable (₹${totalPayable}).` });
    }

    // Digital signature validation removed

    let transactionId = null;
    let savingsAccount = null;

    if (paymentMode === 'Transfer from Linked Savings Account') {
      const SavingsAccount = require('../models/SavingsAccount');
      savingsAccount = await SavingsAccount.findOne({ userId: user._id });
      if (!savingsAccount) {
        return res.status(400).json({ success: false, message: 'No linked Savings Account found for this user.' });
      }
      if (savingsAccount.balance < totalPayable) {
        return res.status(400).json({ success: false, message: `Insufficient balance in linked Savings Account. Current balance: ₹${savingsAccount.balance}` });
      }

      savingsAccount.balance -= totalPayable;
      savingsAccount.totalWithdrawals = (savingsAccount.totalWithdrawals || 0) + totalPayable;
      await savingsAccount.save();

      // Sync user model savingsBalance
      user.savingsBalance = savingsAccount.balance;
      await user.save();
    }

    // Generate Transaction ID and Ref
    const paymentRef = 'REF-RD-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const receiptNum = 'RCPT-RD-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const transaction = await Transaction.create({
      userId: user._id,
      amount: totalPayable,
      type: 'RD Installment',
      status: 'Completed'
    });
    transactionId = transaction._id;

    // Update Installment
    installment.status = 'Paid';
    installment.paidDate = today;
    installment.penalty = penalty;
    installment.transactionRef = transactionId;
    installment.paymentMode = paymentMode;
    installment.paymentReference = paymentRef;
    installment.receiptNumber = receiptNum;
    installment.signatureBase64 = signatureBase64;
    installment.remarks = remarks;
    installment.ipAddress = req.ip;
    installment.userAgent = req.headers['user-agent'];
    await installment.save();

    // Update RD
    rd.totalDeposited += installment.amount;
    rd.consecutiveMissedInstallments = 0;
    await rd.save();

    // Log Audit Trail
    await AuditLog.create({
      action: 'RD Installment Paid',
      performedBy: req.user.id || user._id,
      targetUser: user._id,
      details: `Paid installment #${installment.installmentNumber} of ₹${totalPayable} for RD ${rd.rdNumber || rd._id}. Mode: ${paymentMode}`
    });

    res.status(200).json({
      success: true,
      message: 'Installment paid successfully!',
      data: {
        receiptNumber: receiptNum,
        transactionId: transaction._id,
        paymentReference: paymentRef,
        customerName: user.fullName,
        customerId: user.customerId,
        rdNumber: rd.rdNumber || 'RD-' + rd._id.toString().slice(-6).toUpperCase(),
        installmentNumber: installment.installmentNumber,
        installmentAmount: installment.amount,
        penaltyAmount: penalty,
        totalAmountPaid: totalPayable,
        paymentMode,
        paymentDate: today,
        signatureBase64
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.adminListInstallments = async (req, res, next) => {
  try {
    const { customerId, rdNumber, status } = req.query;
    let query = {};

    if (customerId) {
      const User = require('../models/User');
      const user = await User.findOne({ customerId: customerId.trim() });
      if (user) {
        const rds = await RecurringDeposit.find({ userId: user._id });
        query.rdId = { $in: rds.map(r => r._id) };
      } else {
        return res.status(200).json({ success: true, data: [] });
      }
    }

    if (rdNumber) {
      const rd = await RecurringDeposit.findOne({ rdNumber: rdNumber.trim() });
      if (rd) {
        query.rdId = rd._id;
      } else {
        return res.status(200).json({ success: true, data: [] });
      }
    }

    if (status) {
      query.status = status;
    }

    const installments = await RDInstallment.find(query)
      .populate({
        path: 'rdId',
        populate: { path: 'userId', select: 'fullName customerId phone email' }
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: installments });
  } catch (error) {
    next(error);
  }
};

exports.adminReverseInstallment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const installment = await RDInstallment.findById(id).populate('rdId');
    if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });
    if (installment.status !== 'Paid') return res.status(400).json({ success: false, message: 'Installment is not paid' });
    if (installment.reversed) return res.status(400).json({ success: false, message: 'Installment is already reversed' });

    const rd = installment.rdId;
    const totalRefund = installment.amount + (installment.penalty || 0);

    // Rollback balance if Transfer from Linked Savings Account
    if (installment.paymentMode === 'Transfer from Linked Savings Account') {
      const SavingsAccount = require('../models/SavingsAccount');
      const savingsAccount = await SavingsAccount.findOne({ userId: rd.userId });
      if (savingsAccount) {
        savingsAccount.balance += totalRefund;
        savingsAccount.totalWithdrawals = Math.max(0, (savingsAccount.totalWithdrawals || 0) - totalRefund);
        await savingsAccount.save();

        const User = require('../models/User');
        const user = await User.findById(rd.userId);
        if (user) {
          user.savingsBalance = savingsAccount.balance;
          await user.save();
        }
      }
    }

    // Mark as Reversed
    installment.status = 'Pending';
    installment.reversed = true;
    installment.reversedAt = new Date();
    installment.reversedBy = req.user.id;
    await installment.save();

    // Deduct deposited amount from RD
    rd.totalDeposited = Math.max(0, rd.totalDeposited - installment.amount);
    await rd.save();

    // Create standard reversal transaction log
    await Transaction.create({
      userId: rd.userId,
      amount: totalRefund,
      type: 'RD Installment',
      status: 'Failed',
      createdAt: new Date()
    });

    await AuditLog.create({
      action: 'RD Installment Reversed',
      performedBy: req.user.id,
      targetUser: rd.userId,
      details: `Reversed installment #${installment.installmentNumber} of ₹${totalRefund} for RD ${rd.rdNumber || rd._id}. Refunded to savings if applicable.`
    });

    res.status(200).json({ success: true, message: 'Installment payment reversed successfully.' });
  } catch (error) {
    next(error);
  }
};
