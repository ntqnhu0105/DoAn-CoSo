const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Budget, User, Category } = require('../models');
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
    console.error('JWT error:', error);
    return res.status(401).json({ message: 'Token không hợp lệ', error: error.message });
  }
};

// Middleware kiểm tra userId và maDanhMuc hợp lệ
const verifyUserAndCategory = async (req, res, next) => {
  const { userId, maDanhMuc } = req.body;
  if (!userId || !maDanhMuc) {
    return res.status(400).json({ message: 'Vui lòng cung cấp userId và maDanhMuc' });
  }
  if (userId !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const category = await Category.findById(maDanhMuc);
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    req.user = user;
    req.category = category;
    next();
  } catch (error) {
    console.error('Verify user and category error:', error);
    res.status(500).json({ message: 'Lỗi server khi kiểm tra người dùng hoặc danh mục', error: error.message });
  }
};

// Tạo ngân sách mới
router.post('/', authenticate, verifyUserAndCategory, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, maDanhMuc, soTien, ngayBatDau, ngayKetThuc, ghiChu } = req.body;

    if (!soTien || !ngayBatDau || !ngayKetThuc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Vui lòng cung cấp soTien, ngayBatDau và ngayKetThuc' });
    }
    if (soTien <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' });
    }
    const startDate = new Date(ngayBatDau);
    const endDate = new Date(ngayKetThuc);
    if (endDate < startDate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    }

    const budget = new Budget({
      maNguoiDung: userId,
      maDanhMuc,
      soTien,
      ngayBatDau,
      ngayKetThuc,
      ghiChu,
    });

    await budget.save({ session });
    await session.commitTransaction();
    session.endSession();

    const populatedBudget = await Budget.findById(budget._id).populate('maDanhMuc');
    res.status(201).json({ message: 'Tạo ngân sách thành công', budget: populatedBudget });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo ngân sách', error: error.message });
  }
});

// Lấy danh sách ngân sách của người dùng
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const budgets = await Budget.find({ maNguoiDung: userId }).populate('maDanhMuc', 'tenDanhMuc loai');
    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách ngân sách', error: error.message });
  }
});

// Cập nhật ngân sách
router.put('/:id', authenticate, verifyUserAndCategory, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { userId, maDanhMuc, soTien, ngayBatDau, ngayKetThuc, ghiChu, trangThai } = req.body;

    const budget = await Budget.findById(id).session(session);
    if (!budget) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Ngân sách không tồn tại' });
    }

    if (budget.maNguoiDung.toString() !== userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền sửa ngân sách này' });
    }

    if (soTien !== undefined && soTien <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' });
    }
    if (ngayBatDau && ngayKetThuc) {
      const startDate = new Date(ngayBatDau);
      const endDate = new Date(ngayKetThuc);
      if (endDate < startDate) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
      }
    }

    if (maDanhMuc) budget.maDanhMuc = maDanhMuc;
    if (soTien !== undefined) budget.soTien = soTien;
    if (ngayBatDau) budget.ngayBatDau = ngayBatDau;
    if (ngayKetThuc) budget.ngayKetThuc = ngayKetThuc;
    if (ghiChu !== undefined) budget.ghiChu = ghiChu;
    if (trangThai !== undefined) budget.trangThai = trangThai;

    await budget.save({ session });
    await session.commitTransaction();
    session.endSession();

    const populatedBudget = await Budget.findById(id).populate('maDanhMuc', 'tenDanhMuc loai');
    res.json({ message: 'Cập nhật ngân sách thành công', budget: populatedBudget });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật ngân sách', error: error.message });
  }
});

// Xóa ngân sách
router.delete('/:id', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Vui lòng cung cấp userId' });
    }

    if (userId !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const budget = await Budget.findById(id).session(session);
    if (!budget) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Ngân sách không tồn tại' });
    }

    if (budget.maNguoiDung.toString() !== userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền xóa ngân sách này' });
    }

    await budget.deleteOne({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Xóa ngân sách thành công' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa ngân sách', error: error.message });
  }
});

module.exports = router;