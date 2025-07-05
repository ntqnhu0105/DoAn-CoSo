const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { SavingGoal, User, Notification } = require('../models');

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
    
    // Fix: Validate required fields
    if (!userId || !tenMucTieu || !soTienMucTieu || !hanChot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin bắt buộc' });
    }
    
    // Fix: Validate field lengths
    if (tenMucTieu.length > 100) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Tên mục tiêu không được vượt quá 100 ký tự' });
    }
    
    if (ghiChu && ghiChu.length > 200) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ghi chú không được vượt quá 200 ký tự' });
    }
    
    // Fix: Validate numeric values
    if (isNaN(soTienMucTieu) || soTienMucTieu <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền mục tiêu phải là số dương hợp lệ' });
    }
    
    if (soTienHienTai && (isNaN(soTienHienTai) || soTienHienTai < 0)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền hiện tại không được âm' });
    }
    
    // Fix: Validate date
    const hanChotDate = new Date(hanChot);
    if (isNaN(hanChotDate.getTime())) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Hạn chót phải là ngày hợp lệ' });
    }
    
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
    
    // Fix: Validate input data
    if (tenMucTieu && tenMucTieu.length > 100) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Tên mục tiêu không được vượt quá 100 ký tự' });
    }
    
    if (ghiChu && ghiChu.length > 200) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ghi chú không được vượt quá 200 ký tự' });
    }
    
    if (soTienMucTieu !== undefined && (isNaN(soTienMucTieu) || soTienMucTieu < 0)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền mục tiêu phải là số dương hợp lệ' });
    }
    
    if (soTienHienTai !== undefined && (isNaN(soTienHienTai) || soTienHienTai < 0)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền hiện tại không được âm' });
    }
    
    if (hanChot) {
      const hanChotDate = new Date(hanChot);
      if (isNaN(hanChotDate.getTime())) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Hạn chót phải là ngày hợp lệ' });
      }
    }
    
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
    
    // Fix: Properly handle falsy values
    if (tenMucTieu !== undefined) savingGoal.tenMucTieu = tenMucTieu;
    if (soTienMucTieu !== undefined) savingGoal.soTienMucTieu = soTienMucTieu;
    if (soTienHienTai !== undefined) savingGoal.soTienHienTai = soTienHienTai;
    if (hanChot !== undefined) savingGoal.hanChot = hanChot;
    if (ghiChu !== undefined) savingGoal.ghiChu = ghiChu;
    if (trangThai !== undefined) savingGoal.trangThai = trangThai;
    
    await savingGoal.save({ session });
    await session.commitTransaction();
    session.endSession();
    // Tạo notification theo trạng thái mới
    try {
      const now = new Date();
      if (savingGoal.trangThai === 'Hoàn thành') {
        await Notification.create({
          maNguoiDung: savingGoal.maNguoiDung,
          noiDung: `Chúc mừng! Mục tiêu "${savingGoal.tenMucTieu}" đã được hoàn thành!`,
          loai: 'Cập nhật',
          quanTrong: true,
          daDoc: false
        });
      } else if (savingGoal.trangThai === 'Thất bại' || (savingGoal.hanChot && new Date(savingGoal.hanChot) <= now)) {
        await Notification.create({
          maNguoiDung: savingGoal.maNguoiDung,
          noiDung: `Cảnh báo: Mục tiêu "${savingGoal.tenMucTieu}" đã quá hạn hoặc thất bại!`,
          loai: 'Cảnh báo',
          quanTrong: true,
          daDoc: false
        });
      } else if (savingGoal.trangThai === 'Đang thực hiện' && savingGoal.hanChot && new Date(savingGoal.hanChot) > now) {
        await Notification.create({
          maNguoiDung: savingGoal.maNguoiDung,
          noiDung: `Mục tiêu "${savingGoal.tenMucTieu}" đã được cập nhật. Hạn chót: ${new Date(savingGoal.hanChot).toLocaleDateString()}`,
          loai: 'Cập nhật',
          quanTrong: false,
          daDoc: false
        });
      }
    } catch (notifyErr) {
      console.error('Lỗi khi tạo notification cho mục tiêu:', notifyErr);
    }
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