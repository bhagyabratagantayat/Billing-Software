const Receipt = require('../models/Receipt');
const { generateNextSequence, generateRefNo } = require('../utils/autoNumber');
const { generatePDFBuffer, getReceiptDocDefinition } = require('../utils/pdfGenerator');
const { uploadPDFBuffer } = require('../utils/cloudinary');
const sendEmail = require('../utils/emailSender');
const logAudit = require('../utils/auditLogger');

const createReceipt = async (req, res) => {
  try {
    const { clientName, gender, mobile, email, amount, paymentMode, utrNo, bankName, branch, purpose, remarks } = req.body;

    // Prevent duplicate entries
    const existingReceipt = await Receipt.findOne({ clientName, amount, purpose, utrNo: utrNo || null });
    if (existingReceipt && utrNo) {
      return res.status(400).json({ message: 'A receipt with this UTR number already exists.' });
    }

    const receiptNo = await generateNextSequence('receipt', 'RCP');
    const refNo = generateRefNo();

    const receipt = new Receipt({
      receiptNo,
      refNo,
      date: new Date(),
      clientName,
      gender,
      mobile,
      email,
      amount,
      paymentMode,
      utrNo,
      bankName,
      branch,
      purpose,
      remarks,
      createdBy: req.user._id,
      receivedBy: req.user._id,
      // pdfUrl will be added later
    });

    const createdReceipt = await receipt.save();
    
    await logAudit(req, `Created Receipt ${receiptNo}`, 'receipt', createdReceipt._id.toString(), { amount });

    // Send response immediately to prevent UI blocking
    res.status(201).json(createdReceipt);

    // Background Processing: Generate PDF, Upload to Cloudinary, and Send Email
    (async () => {
      try {
        const populatedReceipt = await Receipt.findById(createdReceipt._id).populate('receivedBy', 'name');
        const docDefinition = getReceiptDocDefinition({
          ...populatedReceipt.toObject(),
          receivedByName: populatedReceipt.receivedBy.name
        });
        
        const pdfBuffer = await generatePDFBuffer(docDefinition);
        
        // Upload to Cloudinary
        const pdfUrl = await uploadPDFBuffer(pdfBuffer, `receipts/${receiptNo}.pdf`);
        
        // Update DB with PDF URL
        createdReceipt.pdfUrl = pdfUrl;
        await createdReceipt.save();

        // Send Email if provided
        if (email) {
          try {
            await sendEmail({
              email: email,
              subject: `Payment Receipt - ${receiptNo} | AYUSH Technology`,
              message: `Dear ${clientName},\n\nPlease find attached your payment receipt for the amount of Rs. ${amount}.\n\nThank you,\nAYUSH Technologies`,
              html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #1a3c6e;">AYUSH Technologies</h2>
                  <p>Dear <strong>${clientName}</strong>,</p>
                  <p>Please find attached your payment receipt for the amount of <strong>₹ ${amount}</strong>.</p>
                  <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Receipt No:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${receiptNo}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleDateString()}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">₹ ${amount}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Purpose:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${purpose}</td></tr>
                  </table>
                  <p style="margin-top: 30px;">Best Regards,<br/><strong>AYUSH Technologies</strong><br/>Ph: 8249441129<br/>Corporate Office: BDA Market complex, Block-A, Baramunda, Bhubaneswar, Odisha 751003</p>
                </div>
              `,
              attachments: [
                {
                  filename: `Receipt_${receiptNo}.pdf`,
                  content: pdfBuffer,
                  contentType: 'application/pdf'
                }
              ]
            });
            createdReceipt.emailSent = true;
            createdReceipt.emailSentAt = new Date();
            await createdReceipt.save();
          } catch (err) {
            console.error('Failed to send email:', err);
          }
        }
      } catch (bgError) {
        console.error('Background processing failed for receipt:', bgError);
      }
    })();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReceipts = async (req, res) => {
  try {
    const query = { isDeleted: { $ne: true } };
    
    // Staff can only see their own created records
    if (req.user.role === 'staff') {
      query.$or = [
        { createdBy: req.user._id },
        { receivedBy: req.user._id } // Fallback for legacy data
      ];
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = await Receipt.countDocuments(query);
    const receipts = await Receipt.find(query)
      .populate('receivedBy createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    res.json({ receipts, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate('receivedBy', 'name email');
    if (receipt) {
      res.json(receipt);
    } else {
      res.status(404).json({ message: 'Receipt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (receipt) {
      if (req.user.role === 'staff') {
        return res.status(403).json({ message: 'Not authorized to delete' });
      }
      receipt.isDeleted = true;
      receipt.deletedAt = new Date();
      receipt.deletedBy = req.user._id;
      await receipt.save();
      
      await logAudit(req, `Deleted Receipt ${receipt.receiptNo}`, 'receipt', receipt._id.toString());
      res.json({ message: 'Receipt moved to trash' });
    } else {
      res.status(404).json({ message: 'Receipt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadReceiptPDF = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate('receivedBy', 'name');
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    const docDefinition = getReceiptDocDefinition({
      ...receipt.toObject(),
      receivedByName: receipt.receivedBy.name
    });
    
    const pdfBuffer = await generatePDFBuffer(docDefinition);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${receipt.receiptNo}.pdf`);
    res.end(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  deleteReceipt,
  downloadReceiptPDF
};
