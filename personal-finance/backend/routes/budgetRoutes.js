const express = require('express');
const router = express.Router();
const { Budget, User, Category } = require('../models');

// Middleware để kiểm tra userId và categoryId hợp lệ
const verifyUserAndCategory = async (req, res, next) => {
  const { userId, maDanhMuc } = req.body;
  if (!userId || !maDanhMuc) {
    return res.status(400).json({ message: 'Vui lòng cung cấp userId và maDanhMuc' });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Người dùng không tồn tại' });
  }
  const category = await Category.findById(maDanhMuc);
  if (!category) {
    return res.status(404).json({ message: 'Danh mục không tồn tại' });
  }
  next();
};

// Tạo ngân sách mới
router.post('/', verifyUserAndCategory, async (req, res) => {
  try {
    const { userId, maDanhMuc, soTien, ngayBatDau, ngayKetThuc, ghiChu } = req.body;

    if (!soTien || !ngayBatDau || !ngayKetThuc) {
      return res.status(400).json({ message: 'Vui lòng cung cấp soTien, ngayBatDau và ngayKetThuc' });
    }

    const budget = new Budget({
      maNguoiDung: userId,
      maDanhMuc,
      soTien,
      ngayBatDau,
      ngayKetThuc,
      ghiChu,
    });

    await budget.save();
    res.status(201).json({ message: 'Tạo ngân sách thành công', budget });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Lấy danh sách ngân sách của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const budgets = await Budget.find({ maNguoiDung: userId }).populate('maDanhMuc');
    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Cập nhật ngân sách
router.put('/:id', verifyUserAndCategory, async (req, res) => {
  try {
    const { id } = req.params;
    const { soTien, ngayBatDau, ngayKetThuc, ghiChu, trangThai } = req.body;

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ message: 'Ngân sách không tồn tại' });
    }

    if (soTien !== undefined) budget.soTien = soTien;
    if (ngayBatDau) budget.ngayBatDau = ngayBatDau;
    if (ngayKetThuc) budget.ngayKetThuc = ngayKetThuc;
    if (ghiChu !== undefined) budget.ghiChu = ghiChu;
    if (trangThai !== undefined) budget.trangThai = trangThai;

    await budget.save();
    res.json({ message: 'Cập nhật ngân sách thành công', budget });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Xóa ngân sách
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findByIdAndDelete(id);
    if (!budget) {
      return res.status(404).json({ message: 'Ngân sách không tồn tại' });
    }
    res.json({ message: 'Xóa ngân sách thành công' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;