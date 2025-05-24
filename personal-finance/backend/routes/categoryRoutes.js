const express = require('express');
const router = express.Router();
const { Category, User } = require('../models');
const jwt = require('jsonwebtoken');

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

// Tạo danh mục mới
router.post('/', authenticate, async (req, res) => {
  try {
    const { tenDanhMuc, loai, moTa } = req.body;
    console.log('POST /categories input:', { tenDanhMuc, loai, moTa });

    if (!tenDanhMuc || !loai) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tenDanhMuc và loai' });
    }

    // Kiểm tra danh mục tồn tại
    const existingCategory = await Category.findOne({
      tenDanhMuc: { $regex: `^${tenDanhMuc}$`, $options: 'i' },
      loai,
      maNguoiDung: req.user._id,
    });
    if (existingCategory) {
      return res.status(400).json({ message: 'Danh mục đã tồn tại' });
    }

    // Tạo danh mục mới
    const category = new Category({
      tenDanhMuc: tenDanhMuc.trim(),
      loai,
      moTa,
      maNguoiDung: req.user._id,
    });

    await category.save();
    console.log('POST /categories saved:', {
      tenDanhMuc: category.tenDanhMuc,
      loai: category.loai,
      maNguoiDung: category.maNguoiDung,
    });
    res.status(201).json({ message: 'Tạo danh mục thành công', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Lấy danh sách danh mục của người dùng
router.get('/', authenticate, async (req, res) => {
  try {
    const categories = await Category.find({ maNguoiDung: req.user._id });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Lấy danh mục theo userId
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    const categories = await Category.find({ maNguoiDung: userId });
    res.json(categories);
  } catch (error) {
    console.error('Get categories by user error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Cập nhật danh mục
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenDanhMuc, loai, moTa, trangThai } = req.body;

    const category = await Category.findOne({ _id: id, maNguoiDung: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại hoặc bạn không có quyền' });
    }

    if (tenDanhMuc) {
      const existingCategory = await Category.findOne({
        tenDanhMuc: { $regex: `^${tenDanhMuc}$`, $options: 'i' },
        loai: loai || category.loai,
        maNguoiDung: req.user._id,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Danh mục đã tồn tại' });
      }
      category.tenDanhMuc = tenDanhMuc;
    }
    if (loai) category.loai = loai;
    if (moTa !== undefined) category.moTa = moTa;
    if (trangThai !== undefined) category.trangThai = trangThai;

    await category.save();
    res.json({ message: 'Cập nhật danh mục thành công', category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Xóa danh mục
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({ _id: id, maNguoiDung: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại hoặc bạn không có quyền' });
    }
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;