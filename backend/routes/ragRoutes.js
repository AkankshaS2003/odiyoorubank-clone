const express = require('express');
const { handleChat, getChatHistory } = require('../controllers/ragController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Local in-memory rate limiting to satisfy safety requirements
const chatLimitStore = {};
const chatRateLimiter = (maxRequests = 30, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const key = req.user ? req.user._id.toString() : (req.ip || 'global');
    const now = Date.now();
    
    if (!chatLimitStore[key]) {
      chatLimitStore[key] = [];
    }
    
    // Retain only requests within the active duration window
    chatLimitStore[key] = chatLimitStore[key].filter(timestamp => now - timestamp < windowMs);
    
    if (chatLimitStore[key].length >= maxRequests) {
      return res.status(429).json({ 
        success: false, 
        error: 'Too many banking assistant queries. Please wait a moment and try again.' 
      });
    }
    
    chatLimitStore[key].push(now);
    next();
  };
};

// Chat endpoint (rate limited)
router.post('/', chatRateLimiter(20, 60 * 1000), handleChat);

// Chat history retrieval
router.get('/history', protect, getChatHistory);

module.exports = router;
