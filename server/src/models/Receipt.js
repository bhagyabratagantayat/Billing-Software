const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNo: { type: String, unique: true },
  refNo: { type: String, unique: true },
  date: { type: Date, required: true },
  clientName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  amount: { type: Number, required: true },
  paymentMode: { 
    type: String, 
    enum: ['Cash', 'UPI', 'NEFT', 'RTGS', 'Cheque', 'Bank Transfer', 'Online'], 
    required: true 
  },
  utrNo: { type: String },
  bankName: { type: String },
  branch: { type: String },
  purpose: { type: String, required: true },
  remarks: { type: String },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pdfUrl: { type: String },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date }
}, { timestamps: true });

const Receipt = mongoose.model('Receipt', receiptSchema);
module.exports = Receipt;
