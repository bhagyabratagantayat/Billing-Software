const Voucher = require('../models/Voucher');
const { generateNextSequence, generateRefNo } = require('../utils/autoNumber');
const { generatePDFBuffer, getVoucherDocDefinition } = require('../utils/pdfGenerator');
const { uploadPDFBuffer } = require('../utils/cloudinary');
const sendEmail = require('../utils/emailSender');
const logAudit = require('../utils/auditLogger');

const createVoucher = async (req, res) => {
  try {
    const { payeeName, gender, mobile, amount, paymentMode, utrNo, bankName, purpose, expenseCategory, passedBy, approvedBy, remarks } = req.body;

    // Prevent duplicate entries
    const existingVoucher = await Voucher.findOne({ payeeName, amount, purpose, utrNo: utrNo || null });
    if (existingVoucher && utrNo) {
      return res.status(400).json({ message: 'A voucher with this UTR number already exists.' });
    }

    const voucherNo = await generateNextSequence('voucher', 'PV');
    const refNo = generateRefNo();

    const voucher = new Voucher({
      voucherNo,
      refNo,
      date: new Date(),
      payeeName,
      gender,
      mobile,
      amount,
      paymentMode,
      utrNo,
      bankName,
      purpose,
      expenseCategory,
      preparedBy: req.user._id,
      createdBy: req.user._id,
      passedBy,
      approvedBy,
      remarks,
    });

    const createdVoucher = await voucher.save();
    
    // Generate PDF
    const populatedVoucher = await Voucher.findById(createdVoucher._id).populate('preparedBy', 'name');
    const docDefinition = getVoucherDocDefinition({
      ...populatedVoucher.toObject(),
      preparedByName: populatedVoucher.preparedBy.name
    });
    
    const pdfBuffer = await generatePDFBuffer(docDefinition);
    
    // Upload to Cloudinary
    const pdfUrl = await uploadPDFBuffer(pdfBuffer, `vouchers/${voucherNo}.pdf`);
    
    // Update DB with PDF URL
    createdVoucher.pdfUrl = pdfUrl;
    await createdVoucher.save();

    // Send Email if provided
    if (email) {
      try {
        await sendEmail({
          email: email,
          subject: `Payment Voucher - ${refNo} | AYUSH Technology`,
          message: `Dear ${payeeName},\n\nPlease find attached the payment voucher for the amount of Rs. ${amount}.\n\nThank you,\nAYUSH Technologies`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #1a3c6e;">AYUSH Technologies</h2>
              <p>Dear <strong>${payeeName}</strong>,</p>
              <p>Please find attached the official payment voucher for the amount of <strong>₹ ${amount}</strong>.</p>
              <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Voucher No:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${refNo}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleDateString()}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">₹ ${amount}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Purpose:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${purpose}</td></tr>
              </table>
              <p style="margin-top: 30px;">Best Regards,<br/><strong>AYUSH Technologies</strong><br/>Ph: 8249441129<br/>Corporate Office: BDA Market complex, Block-A, Baramunda, Bhubaneswar, Odisha 751003</p>
            </div>
          `,
          attachments: [
            {
              filename: `Voucher_${refNo}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });
        createdVoucher.emailSent = true;
        createdVoucher.emailSentAt = new Date();
        await createdVoucher.save();
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    }

    await logAudit(req, `Created Voucher ${refNo}`, 'voucher', createdVoucher._id.toString(), { amount });

    res.status(201).json(createdVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVouchers = async (req, res) => {
  try {
    const query = { isDeleted: { $ne: true } };
    
    if (req.user.role === 'staff') {
      query.$or = [
        { createdBy: req.user._id },
        { preparedBy: req.user._id }
      ];
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Voucher.countDocuments(query);
    const vouchers = await Voucher.find(query)
      .populate('preparedBy createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    res.json({ vouchers, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate('preparedBy', 'name email');
    if (voucher) {
      res.json(voucher);
    } else {
      res.status(404).json({ message: 'Voucher not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (voucher) {
      if (req.user.role === 'staff') {
        return res.status(403).json({ message: 'Not authorized to delete' });
      }
      voucher.isDeleted = true;
      voucher.deletedAt = new Date();
      voucher.deletedBy = req.user._id;
      await voucher.save();
      
      await logAudit(req, `Deleted Voucher ${voucher.refNo}`, 'voucher', voucher._id.toString());
      res.json({ message: 'Voucher moved to trash' });
    } else {
      res.status(404).json({ message: 'Voucher not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadVoucherPDF = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate('preparedBy', 'name');
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }
    
    const docDefinition = getVoucherDocDefinition({
      ...voucher.toObject(),
      preparedByName: voucher.preparedBy.name
    });
    
    const pdfBuffer = await generatePDFBuffer(docDefinition);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${voucher.voucherNo}.pdf`);
    res.end(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVoucher,
  getVouchers,
  getVoucherById,
  deleteVoucher,
  downloadVoucherPDF
};
