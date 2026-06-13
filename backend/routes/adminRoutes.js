const express = require('express');
const { 
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
  replyToMessage
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

// Public settings retrieval
router.get('/settings', getSettings);

// All routes here require auth and admin privileges
router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.get('/loans', getAllLoans);
router.put('/loan/:id', updateLoanStatus);
router.get('/messages', getMessages);
router.post('/messages/:id/reply', replyToMessage);

// System Settings (Write access)
router.put('/settings', updateSettings);

// User & Employee Management
router.get('/users', getUsers);
router.post('/users', createEmployee);
router.put('/user/:id/role', updateUserRole);
router.put('/user/:id/status', updateUserStatus);
router.delete('/user/:id', deleteUser);

// RAG Document Management Endpoints
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/documents', getDocuments);
router.delete('/document/:id', deleteDocument);

module.exports = router;
