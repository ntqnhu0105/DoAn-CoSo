const express = require('express');
const router = express.Router();
const { Category } = require('../models');

// Tạo danh mục mới
router.post('/', async (req, res) => {
  try {
    const { tenDanhMuc, loai, moTa } = req.body;

    if (!tenDanhMuc || !loai) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tenDanhMuc và loai' });
    }

    const category = new Category({
      tenDanhMuc,
      loai,
      moTa,
    });

    await category.save();
    res.status(201).json({ message: 'Tạo danh mục thành công', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Lấy danh sách tất cả danh mục
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Cập nhật danh mục
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tenDanhMuc, loai, moTa, trangThai } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    if (tenDanhMuc) category.tenDanhMuc = tenDanhMuc;
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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;