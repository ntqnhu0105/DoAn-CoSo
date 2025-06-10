const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)'));
  },
});

// Middleware xác thực JWT
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

// Đăng ký
router.post('/register', upload.single('anhDaiDien'), async (req, res) => {
  try {
    const { tenDangNhap, matKhau, email, hoTen, ngaySinh, gioiTinh } = req.body;
    console.log('POST /register:', { tenDangNhap, email, hoTen });

    if (!tenDangNhap || !matKhau || !email || !hoTen) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ các trường bắt buộc' });
    }

    if (ngaySinh && isNaN(new Date(ngaySinh).getTime())) {
      return res.status(400).json({ message: 'Ngày sinh không hợp lệ' });
    }

    if (gioiTinh && !['Nam', 'Nữ', 'Khác'].includes(gioiTinh)) {
      return res.status(400).json({ message: 'Giới tính phải là Nam, Nữ hoặc Khác' });
    }

    const userExists = await User.findOne({ $or: [{ tenDangNhap }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(matKhau, 10);

    let anhDaiDien = '';
    if (req.file) {
      anhDaiDien = `/Uploads/${req.file.filename}`;
    }

    const user = new User({
      tenDangNhap,
      matKhau: hashedPassword,
      email,
      hoTen,
      ngaySinh: ngaySinh ? new Date(ngaySinh) : undefined,
      gioiTinh,
      anhDaiDien,
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: { tenDangNhap, email, hoTen, ngaySinh, gioiTinh, anhDaiDien },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { tenDangNhap, matKhau } = req.body;
    console.log('POST /login:', { tenDangNhap });

    if (!tenDangNhap || !matKhau) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tenDangNhap và matKhau' });
    }

    const user = await User.findOne({ tenDangNhap });
    if (!user) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(matKhau, user.matKhau);
    if (!isMatch) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '7d',
    });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      userId: user._id,
      user: {
        tenDangNhap: user.tenDangNhap,
        email: user.email,
        hoTen: user.hoTen,
        ngaySinh: user.ngaySinh,
        gioiTinh: user.gioiTinh,
        anhDaiDien: user.anhDaiDien,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Lấy thông tin người dùng qua ID
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('GET /users/:userId:', userId);
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    const user = await User.findById(userId).select('-matKhau');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Lấy thông tin người dùng hiện tại
router.get('/me', authenticate, async (req, res) => {
  try {
    console.log('GET /users/me:', req.user._id);
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Cập nhật thông tin
router.put('/:userId', authenticate, upload.single('anhDaiDien'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, hoTen, ngaySinh, gioiTinh, matKhau } = req.body;
    console.log('PUT /users/:userId:', { userId, email, hoTen });

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (email !== user.email && !matKhau) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu để xác nhận thay đổi email' });
    }

    if (matKhau) {
      const isMatch = await bcrypt.compare(matKhau, user.matKhau);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu không đúng' });
      }
    }

    if (email !== user.email) {
      const userExists = await User.findOne({ email, _id: { $ne: userId } });
      if (userExists) {
        return res.status(400).json({ message: 'Email đã tồn tại' });
      }
    }

    if (ngaySinh && isNaN(new Date(ngaySinh).getTime())) {
      return res.status(400).json({ message: 'Ngày sinh không hợp lệ' });
    }

    if (gioiTinh && !['Nam', 'Nữ', 'Khác'].includes(gioiTinh)) {
      return res.status(400).json({ message: 'Giới tính phải là Nam, Nữ hoặc Khác' });
    }

    user.email = email || user.email;
    user.hoTen = hoTen || user.hoTen;
    user.ngaySinh = ngaySinh ? new Date(ngaySinh) : user.ngaySinh;
    user.gioiTinh = gioiTinh || user.gioiTinh;

    if (req.file && user.anhDaiDien) {
      const oldImagePath = path.join(__dirname, '..', user.anhDaiDien);
      try {
        await fs.unlink(oldImagePath);
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
    }

    if (req.file) {
      user.anhDaiDien = `/Uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        tenDangNhap: user.tenDangNhap,
        email: user.email,
        hoTen: user.hoTen,
        ngaySinh: user.ngaySinh,
        gioiTinh: user.gioiTinh,
        anhDaiDien: user.anhDaiDien,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;