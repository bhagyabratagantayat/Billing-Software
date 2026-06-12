const express = require('express');
const router = express.Router();
const { createReceipt, getReceipts, getReceiptById, deleteReceipt, downloadReceiptPDF } = require('../controllers/receiptController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createReceipt)
  .get(protect, getReceipts);

router.route('/:id')
  .get(protect, getReceiptById)
  .delete(protect, requireRole('admin', 'ceo'), deleteReceipt);

router.get('/:id/pdf', protect, downloadReceiptPDF);

module.exports = router;
