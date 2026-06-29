const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const Contact = require('../models/Contact');
const KnowledgeBase = require('../models/KnowledgeBase');
const SystemSettings = require('../models/SystemSettings');
const ServiceApplication = require('../models/ServiceApplication');
const FixedDeposit = require('../models/FixedDeposit');
const SavingsAccount = require('../models/SavingsAccount');
const { getEmbedding } = require('../services/embeddingService');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const nodemailer = require('nodemailer');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    
    const serviceLoans = await ServiceApplication.find({ applicationType: /Loan/i });
    const totalLoans = serviceLoans.length;
    const approvedLoans = serviceLoans.filter(l => l.status === 'Approved').length;
    const pendingLoans = serviceLoans.filter(l => l.status === 'Pending').length;
    const rejectedLoans = serviceLoans.filter(l => l.status === 'Rejected').length;

    const totalAccounts = await Account.countDocuments();
    
    // Calculate total deposits (Legacy Accounts + FD + Savings)
    const accounts = await Account.find();
    const legacyDeposits = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    const fds = await FixedDeposit.find();
    const fdDeposits = fds.reduce((acc, curr) => acc + curr.principalAmount, 0);

    const savings = await SavingsAccount.find();
    const savingsBalance = savings.reduce((acc, curr) => acc + curr.balance, 0);

    const totalDeposits = legacyDeposits + fdDeposits + savingsBalance;

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalEmployees,
        totalLoans,
        approvedLoans,
        pendingLoans,
        rejectedLoans,
        totalAccounts,
        totalDeposits
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all loans
// @route   GET /api/admin/loans
// @access  Private/Admin or Employee
const getAllLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find().populate('userId', 'fullName email phone accountNumber');

    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update loan status
// @route   PUT /api/admin/loan/:id
// @access  Private/Admin
const updateLoanStatus = async (req, res, next) => {
  try {
    let loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    loan = await Loan.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
      returnDocument: 'after',
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages
// @route   GET /api/admin/messages
// @access  Private/Admin
const getMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Reply to Contact Message
// @route   POST /api/admin/messages/:id/reply
// @access  Private/Admin
const replyToMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    const message = await Contact.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    if (!replyText) {
      return res.status(400).json({ success: false, error: 'Reply text is required' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
        pass: process.env.SMTP_PASS || 'ethereal.pass',
      },
    });

    const mailOptions = {
      from: `"Odiyooru Souharda" <${process.env.SMTP_USER || 'noreply@odiyoorubank.in'}>`,
      to: message.email,
      subject: 'Re: Your Inquiry with Odiyooru Souharda Cooperative Society',
      text: replyText,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, data: 'Reply sent successfully' });
  } catch (error) {
    console.error('Failed to send reply email:', error);
    res.status(500).json({ success: false, error: 'Failed to send reply email' });
  }
};

// Helper to chunk text
const chunkText = (text, maxLength = 1000, overlap = 200) => {
  const chunks = [];
  let startIndex = 0;
  
  // Clean double spaces or duplicate empty lines
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n').trim();
  
  while (startIndex < cleanText.length) {
    let endIndex = startIndex + maxLength;
    
    if (endIndex < cleanText.length) {
      // Find the last space/newline near the boundary to avoid breaking words
      const lastSpace = cleanText.lastIndexOf(' ', endIndex);
      if (lastSpace > startIndex + (maxLength / 2)) {
        endIndex = lastSpace;
      }
    }
    
    const chunk = cleanText.substring(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    startIndex = endIndex - overlap;
    if (startIndex >= cleanText.length || endIndex >= cleanText.length) break;
  }
  return chunks;
};

// @desc    Upload document, extract, chunk, embed, and index in KnowledgeBase
// @route   POST /api/admin/upload
// @access  Private/Admin
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const { title, category } = req.body;
    const documentTitle = title || req.file.originalname;
    const documentCategory = category || 'General';
    const filename = req.file.originalname;
    const ext = filename.split('.').pop().toLowerCase();

    let extractedText = '';

    // 1. Extract text based on file format
    if (ext === 'txt') {
      extractedText = req.file.buffer.toString('utf-8');
    } else if (ext === 'pdf') {
      try {
        const parser = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse.PDFParse || pdfParse);
        const data = await parser(req.file.buffer);
        extractedText = data.text;
      } catch (err) {
        return res.status(400).json({ success: false, error: `Failed to parse PDF file: ${err.message}` });
      }
    } else if (ext === 'docx') {
      try {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = result.value;
      } catch (err) {
        return res.status(400).json({ success: false, error: `Failed to parse DOCX file: ${err.message}` });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' });
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ success: false, error: 'The uploaded file contains no text.' });
    }

    // 2. Chunk text
    const chunks = chunkText(extractedText, 1000, 200);

    // 3. Delete existing chunks for this source (Update/Overwrite logic)
    await KnowledgeBase.deleteMany({ source: filename });

    // 4. Generate embeddings and store chunks in parallel batches
    const indexedChunksCount = chunks.length;
    const BATCH_SIZE = 5; // Process 5 chunks concurrently to avoid rate limits

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (chunkTextContent) => {
        // Generate embedding vector
        const embedding = await getEmbedding(chunkTextContent);
        
        // Store in MongoDB
        await KnowledgeBase.create({
          title: documentTitle,
          category: documentCategory,
          content: chunkTextContent,
          source: filename,
          embedding
        });
      }));
    }

    res.status(200).json({
      success: true,
      message: `Document "${documentTitle}" successfully parsed and indexed!`,
      data: {
        filename,
        title: documentTitle,
        category: documentCategory,
        chunksIndexed: indexedChunksCount
      }
    });

  } catch (error) {
    console.error('Error in uploadDocument:', error);
    next(error);
  }
};

// @desc    Get all indexed documents (grouped or detail)
// @route   GET /api/admin/documents
// @access  Private/Admin
const getDocuments = async (req, res, next) => {
  try {
    const { detail } = req.query;

    if (detail === 'true') {
      // Return list of all individual chunks
      const chunks = await KnowledgeBase.find().select('-embedding').sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: chunks.length,
        data: chunks
      });
    }

    // Group chunks by file source for main listing dashboard view
    const documents = await KnowledgeBase.aggregate([
      {
        $group: {
          _id: "$source",
          title: { $first: "$title" },
          category: { $first: "$category" },
          chunkCount: { $sum: 1 },
          createdAt: { $first: "$createdAt" },
          sampleContent: { $first: "$content" }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Error in getDocuments:', error);
    next(error);
  }
};

// @desc    Delete indexed document (deletes all chunks matching that source)
// @route   DELETE /api/admin/document/:id
// @access  Private/Admin
const deleteDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const mongoose = require('mongoose');

    // First try to find a chunk by ID to get the source filename
    let sourceFilename = '';
    
    if (mongoose.Types.ObjectId.isValid(documentId)) {
      const chunk = await KnowledgeBase.findById(documentId);
      if (chunk) {
        sourceFilename = chunk.source;
      }
    }
    
    if (!sourceFilename) {
      // If not found by ID, check if the ID parameter is actually the source filename
      const match = await KnowledgeBase.findOne({ source: documentId });
      if (match) {
        sourceFilename = match.source;
      }
    }

    if (!sourceFilename) {
      // Fallback: just try to delete by the documentId assuming it's the filename
      sourceFilename = documentId;
    }

    // Delete all chunks associated with this file source
    const result = await KnowledgeBase.deleteMany({ source: sourceFilename });

    res.status(200).json({
      success: true,
      message: `Successfully deleted document and all its ${result.deletedCount} chunks.`,
      data: {
        source: sourceFilename,
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Error in deleteDocument:', error);
    next(error);
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    settings = await SystemSettings.findByIdAndUpdate(settings._id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (for management)
// @route   GET /api/admin/users
// @access  Private/Admin or Employee
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/user/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, {
      returnDocument: 'after',
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (Active/Suspended)
// @route   PUT /api/admin/user/:id/status
// @access  Private/Admin or Manager
const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
      returnDocument: 'after',
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create cooperative staff employee
// @route   POST /api/admin/users
// @access  Private/Admin
const createEmployee = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: role || 'employee'
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all membership applications
// @route   GET /api/admin/memberships
// @access  Private/Admin
const getMemberships = async (req, res, next) => {
  try {
    const users = await User.find({ membershipStatus: { $in: ['pending', 'approved', 'rejected'] } })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update membership status
// @route   PUT /api/admin/membership/:id/status
// @access  Private/Admin
const updateMembershipStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let updateData = { membershipStatus: status };

    if (status === 'approved') {
      const user = await User.findById(req.params.id);
      if (!user.memberId) {
        updateData.memberId = `ODI-M-${Math.floor(10000 + Math.random() * 90000)}`;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: 'after',
      runValidators: true
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer 360 view by customerId
// @route   GET /api/admin/customer/:custId
// @access  Private/Admin
const getCustomerByCustId = async (req, res, next) => {
  try {
    const { custId } = req.params;
    
    // 1. Find User by customerId (case-insensitive)
    const user = await User.findOne({ customerId: new RegExp(`^${custId}$`, 'i') }).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Customer not found with this ID' });
    }

    const userId = user._id;

    // 2. Fetch all related entities
    const legacyAccounts = await Account.find({ userId });
    const savingsAccounts = await SavingsAccount.find({ userId });
    const fixedDeposits = await FixedDeposit.find({ userId });
    
    let recurringDeposits = [];
    if (mongoose.models.RecurringDeposit) {
      recurringDeposits = await mongoose.model('RecurringDeposit').find({ userId });
    }

    const loans = await Loan.find({ userId });
    const serviceApplications = await ServiceApplication.find({ userId });

    // 3. Assemble 360-degree profile
    const customerProfile = {
      user,
      legacyAccounts,
      savingsAccounts,
      fixedDeposits,
      recurringDeposits,
      loans,
      serviceApplications
    };

    res.status(200).json({ success: true, data: customerProfile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllLoans,
  updateLoanStatus,
  getMessages,
  uploadDocument,
  getDocuments,
  deleteDocument,
  getSettings,
  updateSettings,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  createEmployee,
  replyToMessage,
  getMemberships,
  updateMembershipStatus,
  getCustomerByCustId
};

