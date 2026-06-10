const User = require('../models/User');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const Contact = require('../models/Contact');
const KnowledgeBase = require('../models/KnowledgeBase');
const { getEmbedding } = require('../services/embeddingService');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    
    const loans = await Loan.find();
    const totalLoans = loans.length;
    const approvedLoans = loans.filter(l => l.status === 'Approved').length;
    const pendingLoans = loans.filter(l => l.status === 'Pending').length;
    const rejectedLoans = loans.filter(l => l.status === 'Rejected').length;

    const totalAccounts = await Account.countDocuments();
    
    // Calculate total deposits
    const accounts = await Account.find();
    const totalDeposits = accounts.reduce((acc, curr) => acc + curr.balance, 0);

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
      new: true,
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

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
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
        const data = await pdfParse(req.file.buffer);
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

    // 4. Generate embeddings and store chunks
    const indexedChunksCount = chunks.length;
    for (let i = 0; i < chunks.length; i++) {
      const chunkTextContent = chunks[i];
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

    // First try to find a chunk by ID to get the source filename
    let sourceFilename = '';
    const chunk = await KnowledgeBase.findById(documentId);
    
    if (chunk) {
      sourceFilename = chunk.source;
    } else {
      // If not found by ID, check if the ID parameter is actually the source filename
      const match = await KnowledgeBase.findOne({ source: documentId });
      if (match) {
        sourceFilename = match.source;
      }
    }

    if (!sourceFilename) {
      return res.status(404).json({ success: false, error: 'Document not found' });
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

module.exports = {
  getStats,
  getAllLoans,
  updateLoanStatus,
  getMessages,
  uploadDocument,
  getDocuments,
  deleteDocument
};
