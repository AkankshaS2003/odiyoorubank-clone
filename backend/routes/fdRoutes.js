const express = require('express');
const {
  getMyFDs,
  transferToSavings,
  renewFD,
  renewPrincipal
} = require('../controllers/fdController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my', getMyFDs);
router.post('/:id/transfer', transferToSavings);
router.post('/:id/renew', renewFD);
router.post('/:id/renew-principal', renewPrincipal);

module.exports = router;
