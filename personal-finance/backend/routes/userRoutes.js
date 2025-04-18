const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Đăng ký người dùng
router.post('/register', async (req, res) => {
  try {
    const { tenDangNhap, matKhau, email, hoTen } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!tenDangNhap || !matKhau || !email || !hoTen) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ các trường: tenDangNhap, matKhau, email, hoTen' });
    }

    // Kiểm tra trùng lặp
    const userExists = await User.findOne({ $or: [{ tenDangNhap }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    // Tạo người dùng mới
    const user = new User({ tenDangNhap, matKhau: hashedPassword, email, hoTen });
    await user.save();

    res.status(201).json({ message: 'Đăng ký thành công', user: { tenDangNhap, email, hoTen } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { tenDangNhap, matKhau } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!tenDangNhap || !matKhau) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tenDangNhap và matKhau' });
    }

    // Tìm người dùng
    const user = await User.findOne({ tenDangNhap });
    if (!user) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(matKhau, user.matKhau);
    if (!isMatch) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    res.json({ message: 'Đăng nhập thành công', userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;