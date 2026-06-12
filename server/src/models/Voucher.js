const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  voucherNo: { type: String, unique: true },
  refNo: { type: String, unique: true },
  date: { type: Date, required: true },
  payeeName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Company'] },
  mobile: { type: String },
  email: { type: String },
  amount: { type: Number, required: true },
  paymentMode: { 
    type: String, 
    enum: ['Cash', 'UPI', 'NEFT', 'RTGS', 'Cheque', 'Bank Transfer', 'Online'], 
    required: true 
  },
  utrNo: { type: String },
  bankName: { type: String },
  purpose: { type: String, required: true },
  expenseCategory: { type: String },
  preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  passedBy: { type: String },
  approvedBy: { type: String },
  remarks: { type: String },
  pdfUrl: { type: String },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date }
}, { timestamps: true });

const Voucher = mongoose.model('Voucher', voucherSchema);
module.exports = Voucher;
