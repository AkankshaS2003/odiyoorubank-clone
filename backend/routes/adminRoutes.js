const express = require('express');
const { 
  getStats, 
  getAllLoans, 
  updateLoanStatus, 
  getMessages, 
  uploadDocument, 
  getDocuments, 
  deleteDocument 
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const multer = require('multer');

// Configure Multer memory storage (size limit: 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = express.Router();

// All routes here require auth and admin privileges
router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.get('/loans', getAllLoans);
router.put('/loan/:id', updateLoanStatus);
router.get('/messages', getMessages);

// RAG Document Management Endpoints
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/documents', getDocuments);
router.delete('/document/:id', deleteDocument);

module.exports = router;
