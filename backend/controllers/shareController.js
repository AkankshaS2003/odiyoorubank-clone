const User = require('../models/User');
const SavingsAccount = require('../models/SavingsAccount');
const Transaction = require('../models/Transaction');
const SystemSettings = require('../models/SystemSettings');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Helper to generate unique ID
const generateUniqueId = (prefix) => {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
};

// --- GET SETTINGS ---
exports.getShareSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne() || await SystemSettings.create({});
    res.json({
      success: true,
      data: {
        sharePrice: settings.sharePrice || 100,
        minShares: settings.minShares || 10,
        maxShares: settings.maxShares || 1000
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- UPDATE SETTINGS (ADMIN) ---
exports.updateShareSettings = async (req, res) => {
  try {
    const { sharePrice, minShares, maxShares } = req.body;
    let settings = await SystemSettings.findOne();
    if (!settings) settings = new SystemSettings({});

    settings.sharePrice = sharePrice || settings.sharePrice;
    settings.minShares = minShares || settings.minShares;
    settings.maxShares = maxShares || settings.maxShares;

    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- PURCHASE SHARES ---
exports.purchaseShares = async (req, res) => {
  try {
    const { shares, tpin } = req.body;
    const userId = req.user.id;

    if (!shares || shares <= 0) {
      throw new Error('Please enter a valid number of shares');
    }

    const user = await User.findById(userId).select('+tpinHash');
    if (!user) throw new Error('User not found');

    // TPIN Validation
    if (!user.tpinActive || !user.tpinHash) {
      throw new Error('Transaction PIN not set up. Please set up your TPIN first.');
    }
    if (user.tpinLocked) {
      throw new Error('Your Transaction PIN is locked due to multiple failed attempts. Please unlock it.');
    }
    const isMatch = await bcrypt.compare(tpin, user.tpinHash);
    if (!isMatch) {
      user.failedTpinAttempts = (user.failedTpinAttempts || 0) + 1;
      user.tpinLastFailed = Date.now();
      if (user.failedTpinAttempts >= 3) {
        user.tpinLocked = true;
      }
      await user.save();
      return res.status(401).json({ 
        success: false, 
        error: `Invalid Transaction PIN. Attempt ${user.failedTpinAttempts} of 3.` 
      });
    }

    // Reset failed attempts on success
    user.failedTpinAttempts = 0;

    // Membership & Eligibility Validation
    if (user.membershipStatus !== 'approved') {
      throw new Error('You must be an active member to purchase share capital.');
    }

    const settings = await SystemSettings.findOne() || await SystemSettings.create({});
    const sharePrice = settings.sharePrice || 100;
    const minShares = settings.minShares || 10;
    const maxShares = settings.maxShares || 1000;

    if (shares < minShares) throw new Error(`Minimum ${minShares} shares must be purchased.`);
    if (shares > maxShares) throw new Error(`Maximum ${maxShares} shares allowed per transaction.`);
    
    // Validate Total Shares limit if needed, but per transaction is applied here.
    const totalCost = shares * sharePrice;

    const account = await SavingsAccount.findOne({ userId });
    if (!account) throw new Error('Savings account not found');
    if (account.status !== 'Active') throw new Error(`Savings account is ${account.status}`);
    if (account.balance < totalCost) throw new Error(`Insufficient balance. Requires ₹${totalCost}`);
    
    const minimumSavingsBalance = settings.minimumSavingsBalance || 500;
    if ((account.balance - totalCost) < minimumSavingsBalance) {
      throw new Error(`Transaction failed. Minimum balance of ₹${minimumSavingsBalance} must be maintained.`);
    }

    // Debit Savings Account
    account.balance -= totalCost;
    account.totalWithdrawals += totalCost;
    account.lastTransactionDate = Date.now();
    await account.save();

    // Generate Transaction & Certificate IDs
    const referenceNumber = generateUniqueId('TXN');
    const transactionId = `TXN-${Date.now()}`;
    
    settings.shareCertificateCounter = (settings.shareCertificateCounter || 0) + 1;
    await settings.save();
    
    // SC-YYYY-000001
    const year = new Date().getFullYear();
    const certNumStr = String(settings.shareCertificateCounter).padStart(6, '0');
    const certificateNo = `SC-${year}-${certNumStr}`;

    // Create Transactions
    const debitTxn = new Transaction({
      userId,
      accountId: account._id,
      amount: totalCost,
      type: 'Share Capital Purchase Debit',
      status: 'Completed',
      referenceNumber,
      senderAccount: account.accountNumber,
      receiverAccount: 'Internal Share Capital',
      paymentChannel: 'Internal',
      remarks: `Purchase of ${shares} shares @ ₹${sharePrice}`
    });
    await debitTxn.save();

    const creditTxn = new Transaction({
      userId,
      accountId: account._id, // Linking to user for record, though it's internal pool
      amount: totalCost,
      type: 'Share Capital Credit',
      status: 'Completed',
      referenceNumber,
      senderAccount: account.accountNumber,
      receiverAccount: 'Internal Share Capital',
      paymentChannel: 'Internal',
      remarks: `Credit for ${shares} shares to Internal Pool`
    });
    await creditTxn.save();

    // Update User Record
    user.sharesOwned = (user.sharesOwned || 0) + shares;
    user.shareCapitalInvested = (user.shareCapitalInvested || 0) + totalCost;
    
    user.sharePurchases.push({
      purchaseDate: Date.now(),
      shares,
      price: sharePrice,
      amount: totalCost,
      transactionId,
      referenceNumber,
      certificateNo
    });

    await user.save();

    res.json({
      success: true,
      message: 'Shares purchased successfully',
      data: {
        sharesOwned: user.sharesOwned,
        investment: user.shareCapitalInvested,
        certificateNo
      }
    });

  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// --- DECLARE DIVIDEND (ADMIN) ---
exports.declareDividend = async (req, res) => {
  try {
    const { dividendRate } = req.body;
    if (!dividendRate || dividendRate <= 0) {
      throw new Error('Invalid dividend rate');
    }

    const rateDecimal = parseFloat(dividendRate) / 100;
    const year = new Date().getFullYear().toString();

    // Find all users with shares
    const users = await User.find({ sharesOwned: { $gt: 0 } });

    let totalPayout = 0;
    for (let user of users) {
      const investment = user.shareCapitalInvested || 0;
      const dividendAmount = Math.floor(investment * rateDecimal);

      if (dividendAmount > 0) {
        // Find user's savings account
        const account = await SavingsAccount.findOne({ userId: user._id });
        if (account && account.status === 'Active') {
          account.balance += dividendAmount;
          account.totalDeposits += dividendAmount;
          account.lastTransactionDate = Date.now();
          await account.save();

          const referenceNumber = generateUniqueId('DIV');
          const transactionId = `DIV-${Date.now()}-${user._id}`;

          // Create Transaction
          const creditTxn = new Transaction({
            userId: user._id,
            accountId: account._id,
            amount: dividendAmount,
            type: 'Dividend Credit',
            status: 'Completed',
            referenceNumber,
            senderAccount: 'Internal Dividend Pool',
            receiverAccount: account.accountNumber,
            paymentChannel: 'Internal',
            remarks: `Dividend Credit for ${year} @ ${dividendRate}%`
          });
          await creditTxn.save();

          // Update User
          user.totalDividendEarned = (user.totalDividendEarned || 0) + dividendAmount;
          user.dividendHistory.push({
            year,
            rate: dividendRate,
            investment,
            amount: dividendAmount,
            paymentDate: Date.now(),
            transactionId
          });
          await user.save();

          totalPayout += dividendAmount;
        }
      }
    }

    res.json({
      success: true,
      message: `Dividend declared successfully. Total payout: ₹${totalPayout}`
    });

  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// --- GET ALL SHARE PURCHASES (ADMIN) ---
exports.getAllSharePurchases = async (req, res) => {
  try {
    const users = await User.find({ 'sharePurchases.0': { $exists: true } });
    
    let allPurchases = [];
    users.forEach(user => {
      user.sharePurchases.forEach(purchase => {
        allPurchases.push({
          customerId: user.customerId,
          fullName: user.fullName,
          memberId: user.memberId,
          ...purchase.toObject()
        });
      });
    });

    // Sort by date desc
    allPurchases.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

    res.json({ success: true, data: allPurchases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- GET ALL DIVIDEND HISTORY (ADMIN) ---
exports.getAllDividendHistory = async (req, res) => {
  try {
    const users = await User.find({ 'dividendHistory.0': { $exists: true } });
    
    let allDividends = [];
    users.forEach(user => {
      user.dividendHistory.forEach(div => {
        allDividends.push({
          customerId: user.customerId,
          fullName: user.fullName,
          memberId: user.memberId,
          ...div.toObject()
        });
      });
    });

    // Sort by date desc
    allDividends.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    res.json({ success: true, data: allDividends });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- GET SHARE CERTIFICATE PDF ---
exports.getShareCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    // Find the user who owns this certificate
    const user = await User.findOne({ 'sharePurchases.certificateNo': certificateId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }

    // Ensure authorization (User can only view their own, Admin can view any)
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const purchase = user.sharePurchases.find(p => p.certificateNo === certificateId);
    if (!purchase) {
      return res.status(404).json({ success: false, error: 'Certificate details not found' });
    }

    // Find Savings Account for display
    const account = await SavingsAccount.findOne({ userId: user._id });
    const accountNumber = account ? account.accountNumber : 'N/A';

    // Generate PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Share_Certificate_${certificateId}.pdf"`);

    doc.pipe(res);

    // Draw Certificate Border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(4).stroke('#0F4C81');
    doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).lineWidth(1).stroke('#0F4C81');

    // Title / Bank Name
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#0F4C81')
       .text('Odiyooru Souharda Cooperative Society Ltd', 50, 70, { align: 'center', width: doc.page.width - 100 });
    
    doc.fontSize(12).fillColor('#666666')
       .text('Main Branch, Odiyooru', { align: 'center', width: doc.page.width - 100 });
       
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold').fontSize(36).fillColor('#D4AF37')
       .text('SHARE CERTIFICATE', { align: 'center', width: doc.page.width - 100 });

    // Certificate Details
    doc.font('Helvetica').fontSize(14).fillColor('#333333');
    const startY = doc.y + 20;
    
    doc.text(`Certificate Number: ${purchase.certificateNo}`, 50, startY, { lineBreak: false });
    doc.text(`Issue Date: ${new Date().toLocaleDateString('en-IN')}`, 50, startY, { align: 'right', width: doc.page.width - 100 });
    
    const midY = startY + 40;
    doc.fontSize(16).text('This is to certify that', 50, midY, { align: 'center', width: doc.page.width - 100 });
    
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#0F4C81')
       .text(`${user.fullName}`, 50, midY + 30, { align: 'center', width: doc.page.width - 100 });
       
    doc.font('Helvetica').fontSize(16).fillColor('#333333')
       .text('is the Registered Holder of Shares in the Cooperative Society.', 50, midY + 70, { align: 'center', width: doc.page.width - 100 });
       
    // Table of details
    const tableTop = midY + 120;
    const labelX = 250;
    const valueX = 450;
    const lineSpacing = 25;

    doc.fontSize(14);
    
    const details = [
      { label: 'Customer ID:', value: user.customerId || 'N/A' },
      { label: 'Membership Number:', value: user.memberId || 'N/A' },
      { label: 'Savings Account No:', value: accountNumber },
      { label: 'Number of Shares:', value: `${purchase.shares}` },
      { label: 'Price Per Share:', value: `Rs. ${purchase.price.toFixed(2)}` },
      { label: 'Total Investment:', value: `Rs. ${purchase.amount.toFixed(2)}` },
      { label: 'Purchase Date:', value: new Date(purchase.purchaseDate).toLocaleDateString('en-IN') }
    ];

    details.forEach((item, i) => {
      const currentY = tableTop + (i * lineSpacing);
      doc.font('Helvetica-Bold').text(item.label, labelX, currentY, { lineBreak: false });
      doc.font('Helvetica').text(item.value, valueX, currentY, { lineBreak: false });
    });

    // Signatures
    const sigY = doc.page.height - 100;
    
    doc.moveTo(100, sigY).lineTo(250, sigY).stroke('#333333');
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#333333')
       .text('Customer Signature', 100, sigY + 10, { width: 150, align: 'center' });

    doc.moveTo(doc.page.width - 250, sigY).lineTo(doc.page.width - 100, sigY).stroke('#333333');
    doc.text('Authorized Signatory', doc.page.width - 250, sigY + 10, { width: 150, align: 'center' });

    doc.end();

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
