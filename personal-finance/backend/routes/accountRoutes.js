const express = require('express');
const router = express.Router();
const { Account, User } = require('../models');
const jwt = require('jsonwebtoken');

// Middleware xác thực
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('Không có token trong header Authorization');
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  }
  try {
    console.log('Verifying token:', token.slice(0, 10) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('Decoded JWT:', decoded);
    const user = await User.findById(decoded.userId).select('-matKhau');
    if (!user) {
      console.error('Người dùng không tồn tại:', decoded.userId);
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }
    console.log('User found:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT error:', error.message);
    return res.status(401).json({ message: 'Token không hợp lệ', error: error.message });
  }
};

// Lấy danh sách tài khoản
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('GET /accounts/:userId:', userId);
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập tài khoản này' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const accounts = await Account.find({ maNguoiDung: userId });
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách tài khoản', error: error.message });
  }
});

// Thêm tài khoản mới
router.post('/', authenticate, async (req, res) => {
  try {
    const { maNguoiDung, tenTaiKhoan, loaiTaiKhoan, soDu } = req.body;
    console.log('POST /accounts:', { maNguoiDung, tenTaiKhoan, loaiTaiKhoan, soDu });
    if (maNguoiDung !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền tạo tài khoản cho người dùng này' });
    }
    if (!maNguoiDung || !tenTaiKhoan || !loaiTaiKhoan || soDu === undefined) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }
    const user = await User.findById(maNguoiDung);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const account = new Account({
      maNguoiDung,
      tenTaiKhoan,
      loaiTaiKhoan,
      soDu,
    });
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo tài khoản', error: error.message });
  }
});

module.exports = router;