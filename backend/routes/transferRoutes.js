const express = require('express');
const router = require('express').Router();
const { ownAccountTransfer, internalTransfer, externalTransfer, getTransferHistory } = require('../controllers/transferController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/own-account', ownAccountTransfer);
router.post('/internal', internalTransfer);
router.post('/external', externalTransfer);
router.get('/history', getTransferHistory);

module.exports = router;
