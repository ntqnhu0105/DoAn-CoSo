const express = require('express');
const router = express.Router();
const { Transaction } = require('../models');

// Thêm giao dịch
router.post('/', async (req, res) => {
  try {
    const { maNguoiDung, soTien, loai, ghiChu } = req.body;
    const transaction = new Transaction({ maNguoiDung, soTien, loai, ghiChu });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

// Lấy danh sách giao dịch
router.get('/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ maNguoiDung: req.params.userId });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

module.exports = router;