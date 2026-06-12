const Receipt = require('../models/Receipt');
const Voucher = require('../models/Voucher');

// @desc    Get all trash items
// @route   GET /api/trash
// @access  Private/Admin
const getTrashItems = async (req, res) => {
  try {
    const receipts = await Receipt.find({ isDeleted: true }).populate('receivedBy', 'name email').sort({ deletedAt: -1 }).lean();
    const vouchers = await Voucher.find({ isDeleted: true }).populate('preparedBy', 'name email').sort({ deletedAt: -1 }).lean();

    const trashReceipts = receipts.map(r => ({ ...r, type: 'Receipt' }));
    const trashVouchers = vouchers.map(v => ({ ...v, type: 'Voucher' }));

    const trashItems = [...trashReceipts, ...trashVouchers].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    
    res.json(trashItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restore a trash item
// @route   PUT /api/trash/:type/:id/restore
// @access  Private/Admin
const restoreTrashItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    let item;
    
    if (type === 'Receipt') {
      item = await Receipt.findById(id);
    } else if (type === 'Voucher') {
      item = await Voucher.findById(id);
    } else {
      return res.status(400).json({ message: 'Invalid item type' });
    }

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.isDeleted = false;
    item.deletedAt = undefined;
    await item.save();

    res.json({ message: `${type} restored successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Permanently delete a trash item
// @route   DELETE /api/trash/:type/:id
// @access  Private/Admin
const deleteTrashItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    let item;
    
    if (type === 'Receipt') {
      item = await Receipt.findById(id);
      if (item) await Receipt.deleteOne({ _id: id });
    } else if (type === 'Voucher') {
      item = await Voucher.findById(id);
      if (item) await Voucher.deleteOne({ _id: id });
    } else {
      return res.status(400).json({ message: 'Invalid item type' });
    }

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Optionally handle Cloudinary deletion here if needed
    // const { deleteCloudinaryFile } = require('../utils/cloudinary');
    // if (item.pdfUrl) await deleteCloudinaryFile(item.pdfUrl);

    res.json({ message: `${type} permanently deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Empty all trash items
// @route   DELETE /api/trash/empty
// @access  Private/Admin
const emptyTrash = async (req, res) => {
  try {
    await Receipt.deleteMany({ isDeleted: true });
    await Voucher.deleteMany({ isDeleted: true });
    res.json({ message: 'Trash emptied successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTrashItems,
  restoreTrashItem,
  deleteTrashItem,
  emptyTrash
};
