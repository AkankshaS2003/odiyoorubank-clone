const ChatHistory = require('../models/ChatHistory');
const { getEmbedding } = require('../services/embeddingService');
const { retrieveDocuments } = require('../services/retrievalService');
const { generateResponse } = require('../services/geminiService');

// @desc    Interact with the AI Banking Assistant
// @route   POST /api/chat
// @access  Private
const handleChat = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a valid question' });
    }

    // 1. Generate embedding vector for the question
    const embedding = await getEmbedding(question);

    // 2. Retrieve top 5 relevant chunks using vector search (with fallback keyword search)
    const retrievedDocs = await retrieveDocuments(embedding, 5, question);

    // 3. Generate finalized answer using Gemini 2.5 Flash
    const answer = await generateResponse(question, retrievedDocs);

    // 4. Save conversation log in MongoDB
    const chatLogData = { question, answer };
    if (req.user) {
      chatLogData.userId = req.user._id;
    }
    await ChatHistory.create(chatLogData);

    // 5. Build source citations array (filter duplicate sources for cleaner citation UX)
    const sources = retrievedDocs.map(doc => ({
      title: doc.title,
      category: doc.category,
      source: doc.source,
      score: doc.score
    }));

    res.status(200).json({
      success: true,
      data: {
        answer,
        sources
      }
    });

  } catch (error) {
    console.error('Error in handleChat controller:', error);
    next(error);
  }
};

// @desc    Retrieve user's conversation logs
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    const history = await ChatHistory.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50); // Limit to past 50 exchanges to optimize performance

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error in getChatHistory controller:', error);
    next(error);
  }
};

module.exports = {
  handleChat,
  getChatHistory
};
