const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { SavingGoal, User } = require('../models');

// Lấy danh sách mục tiêu tiết kiệm của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const savingGoals = await SavingGoal.find({ maNguoiDung: userId })
      .sort({ ngayTao: -1 });
    res.json(savingGoals);
  } catch (error) {
    console.error('Get saving goals error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách mục tiêu tiết kiệm', error: error.message });
  }
});

// Thêm mục tiêu tiết kiệm
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, tenMucTieu, soTienMucTieu, soTienHienTai, hanChot, ghiChu, trangThai } = req.body;
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const savingGoal = new SavingGoal({
      maNguoiDung: userId,
      tenMucTieu,
      soTienMucTieu,
      soTienHienTai: soTienHienTai || 0,
      hanChot,
      ghiChu,
      trangThai: trangThai || 'Đang thực hiện',
    });
    await savingGoal.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(savingGoal);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create saving goal error:', error);
    res.status(400).json({ message: error.message || 'Lỗi khi thêm mục tiêu tiết kiệm' });
  }
});

// Cập nhật mục tiêu tiết kiệm
router.put('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { userId, tenMucTieu, soTienMucTieu, soTienHienTai, hanChot, ghiChu, trangThai } = req.body;
    const savingGoal = await SavingGoal.findById(id).session(session);
    if (!savingGoal) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Mục tiêu tiết kiệm không tồn tại' });
    }
    if (savingGoal.maNguoiDung.toString() !== userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa mục tiêu này' });
    }
    savingGoal.tenMucTieu = tenMucTieu || savingGoal.tenMucTieu;
    savingGoal.soTienMucTieu = soTienMucTieu || savingGoal.soTienMucTieu;
    savingGoal.soTienHienTai = soTienHienTai !== undefined ? soTienHienTai : savingGoal.soTienHienTai;
    savingGoal.hanChot = hanChot || savingGoal.hanChot;
    savingGoal.ghiChu = ghiChu !== undefined ? ghiChu : savingGoal.ghiChu;
    savingGoal.trangThai = trangThai || savingGoal.trangThai;
    await savingGoal.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.json(savingGoal);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update saving goal error:', error);
    res.status(400).json({ message: error.message || 'Lỗi khi cập nhật mục tiêu tiết kiệm' });
  }
});

// Xóa mục tiêu tiết kiệm
router.delete('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const savingGoal = await SavingGoal.findById(id).session(session);
    if (!savingGoal) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Mục tiêu tiết kiệm không tồn tại' });
    }
    if (savingGoal.maNguoiDung.toString() !== userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền xóa mục tiêu này' });
    }
    await savingGoal.deleteOne({ session });
    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Xóa mục tiêu tiết kiệm thành công' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Delete saving goal error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa mục tiêu tiết kiệm', error: error.message });
  }
});

module.exports = router;