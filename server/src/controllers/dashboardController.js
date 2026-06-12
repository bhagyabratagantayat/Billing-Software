const Receipt = require('../models/Receipt');
const Voucher = require('../models/Voucher');

const getDashboardSummary = async (req, res) => {
  try {
    const receipts = await Receipt.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const vouchers = await Voucher.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const totalReceived = receipts.length > 0 ? receipts[0].total : 0;
    const totalSpent = vouchers.length > 0 ? vouchers[0].total : 0;
    const netBalance = totalReceived - totalSpent;
    const totalTransactions = (receipts.length > 0 ? receipts[0].count : 0) + (vouchers.length > 0 ? vouchers[0].count : 0);

    res.json({
      totalReceived,
      totalSpent,
      netBalance,
      totalTransactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary
};
