const express = require('express');
const router = express.Router();
const { createVoucher, getVouchers, getVoucherById, deleteVoucher, downloadVoucherPDF } = require('../controllers/voucherController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createVoucher)
  .get(protect, getVouchers);

router.route('/:id')
  .get(protect, getVoucherById)
  .delete(protect, requireRole('admin', 'ceo'), deleteVoucher);

router.get('/:id/pdf', protect, downloadVoucherPDF);

module.exports = router;
