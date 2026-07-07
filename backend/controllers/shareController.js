const User = require('../models/User');
const SavingsAccount = require('../models/SavingsAccount');
const Transaction = require('../models/Transaction');
const SystemSettings = require('../models/SystemSettings');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

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

    // Generate PDF (A4 Portrait)
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'portrait',
      margin: 40
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Share_Certificate_${certificateId}.pdf"`);

    doc.pipe(res);

    const width = doc.page.width;
    const height = doc.page.height;

    // Draw Double-Line Border with ornaments
    doc.rect(20, 20, width - 40, height - 40).lineWidth(3).stroke('#0F4C81');
    doc.rect(26, 26, width - 52, height - 52).lineWidth(1).stroke('#D4AF37');

    // Subtle Watermark
    const logoPath = path.join(__dirname, '../../public/logo-bg.png');
    if (fs.existsSync(logoPath)) {
      doc.save();
      doc.opacity(0.05);
      doc.image(logoPath, width / 2 - 150, height / 2 - 150, { width: 300 });
      doc.restore();
    }

    // Bank Logo at top center
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, width / 2 - 40, 40, { fit: [80, 80] });
    }

    doc.moveDown(6);

    // Title / Bank Name
    doc.font('Times-Bold').fontSize(24).fillColor('#002366')
       .text('ODIYOORU SOUHARDA', { align: 'center' });
    doc.fontSize(16).text('COOPERATIVE SOCIETY LTD.', { align: 'center' });
       
    doc.font('Times-Roman').fontSize(12).fillColor('#666666')
       .text('Main Branch, Odiyooru', { align: 'center' });
       
    doc.moveDown(1.5);
    
    // Certificate Title
    doc.font('Times-Bold').fontSize(28).fillColor('#D4AF37')
       .text('SHARE CERTIFICATE', { align: 'center' });

    doc.moveDown(2);

    // Formal Paragraph
    doc.font('Times-Roman').fontSize(14).fillColor('#333333');
    doc.text(`This is to certify that ${user.fullName} is the registered holder of share capital in the cooperative society, subject to the Cooperative Societies Act, rules, and bylaws of the bank.`, 50, doc.y, { align: 'center', width: width - 100, lineGap: 5 });
    
    doc.moveDown(2);

    // Member Details Table
    const tableTop = doc.y + 10;
    const rowHeight = 25;
    const col1X = 60;
    const col2X = 180;
    const col3X = width / 2 + 10;
    const col4X = width / 2 + 130;
    
    const detailsLeft = [
      { label: 'Certificate No:', value: purchase.certificateNo },
      { label: 'Customer Name:', value: user.fullName },
      { label: 'Customer ID:', value: user.customerId || 'N/A' },
      { label: 'Membership No:', value: user.memberId || 'N/A' },
      { label: 'Savings A/C:', value: accountNumber },
    ];
    
    const detailsRight = [
      { label: 'Issue Date:', value: new Date().toLocaleDateString('en-IN') },
      { label: 'Purchase Date:', value: new Date(purchase.purchaseDate).toLocaleDateString('en-IN') },
      { label: 'Shares Count:', value: `${purchase.shares}` },
      { label: 'Face Value:', value: `Rs. ${purchase.price.toFixed(2)}` },
      { label: 'Total Invested:', value: `Rs. ${purchase.amount.toFixed(2)}` },
    ];

    // Draw Table borders
    doc.lineWidth(1).strokeColor('#E2E8F0');
    doc.rect(50, tableTop, width - 100, detailsLeft.length * rowHeight).stroke();
    
    for (let i = 1; i < detailsLeft.length; i++) {
      doc.moveTo(50, tableTop + (i * rowHeight)).lineTo(width - 50, tableTop + (i * rowHeight)).stroke();
    }
    doc.moveTo(width / 2, tableTop).lineTo(width / 2, tableTop + detailsLeft.length * rowHeight).stroke();

    // Fill Table data
    for (let i = 0; i < detailsLeft.length; i++) {
      const currentY = tableTop + (i * rowHeight) + 7;
      
      doc.font('Times-Bold').fontSize(11).fillColor('#0F4C81');
      doc.text(detailsLeft[i].label, col1X, currentY);
      doc.font('Times-Roman').fillColor('#333333');
      doc.text(detailsLeft[i].value, col2X, currentY);

      doc.font('Times-Bold').fillColor('#0F4C81');
      doc.text(detailsRight[i].label, col3X, currentY);
      doc.font('Times-Roman').fillColor('#333333');
      doc.text(detailsRight[i].value, col4X, currentY);
    }

    // Signatures
    const sigY = doc.page.height - 100;
    
    doc.moveTo(80, sigY).lineTo(230, sigY).lineWidth(1).stroke('#333333');
    doc.font('Times-Bold').fontSize(12).fillColor('#333333')
       .text('Customer Signature', 80, sigY + 10, { width: 150, align: 'center' });

    doc.moveTo(width - 230, sigY).lineTo(width - 80, sigY).stroke('#333333');
    doc.text('Authorized Signatory', width - 230, sigY + 10, { width: 150, align: 'center' });

    doc.end();

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
