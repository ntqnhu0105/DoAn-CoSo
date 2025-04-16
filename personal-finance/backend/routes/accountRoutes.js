const express = require('express');
const router = express.Router();
const { Account, User } = require('../models');

// Lấy danh sách tài khoản của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const accounts = await Account.find({ maNguoiDung: userId });
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Thêm tài khoản mới
router.post('/', async (req, res) => {
  try {
    const { maNguoiDung, tenTaiKhoan, soDu, loaiTaiKhoan } = req.body;
    if (!maNguoiDung || !tenTaiKhoan || !loaiTaiKhoan) {
      return res.status(400).json({ message: 'Vui lòng cung cấp maNguoiDung, tenTaiKhoan, và loaiTaiKhoan' });
    }
    const user = await User.findById(maNguoiDung);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    if (!['Tiền mặt', 'Thẻ tín dụng', 'Tài khoản ngân hàng', 'Ví điện tử'].includes(loaiTaiKhoan)) {
      return res.status(400).json({ message: 'Loại tài khoản không hợp lệ' });
    }
    const account = new Account({
      maNguoiDung,
      tenTaiKhoan,
      soDu: soDu || 0,
      loaiTaiKhoan,
    });
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;