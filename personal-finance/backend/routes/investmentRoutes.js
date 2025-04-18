const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Investment, User } = require('../models');

// Middleware kiểm tra userId hợp lệ
const verifyUser = async (req, res, next) => {
  const body = req.body || {};
  const query = req.query || {};
  const userId = body.userId || query.userId;

  console.log('verifyUser - Request:', {
    body: JSON.stringify(body),
    query: JSON.stringify(query),
    userId,
    method: req.method,
    url: req.originalUrl,
  });

  if (!userId) {
    return res.status(400).json({ message: 'Vui lòng cung cấp userId' });
  }

  try {
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'userId không hợp lệ' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Verify user error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Lỗi server khi kiểm tra người dùng', error: error.message });
  }
};

// Tạo đầu tư mới
router.post('/', verifyUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, loai, giaTri, loiNhuan, ngay, ghiChu, trangThai } = req.body;

    console.log('Create investment - Request:', { userId, loai, giaTri, loiNhuan, ngay, trangThai });

    if (!loai || !giaTri) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Vui lòng cung cấp loai và giaTri' });
    }
    if (giaTri <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Giá trị đầu tư phải lớn hơn 0' });
    }
    if (loai.length > 50) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Loại đầu tư không được vượt quá 50 ký tự' });
    }
    if (ghiChu && ghiChu.length > 200) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ghi chú không được vượt quá 200 ký tự' });
    }

    const investment = new Investment({
      maNguoiDung: userId,
      loai,
      giaTri,
      loiNhuan: loiNhuan !== undefined ? loiNhuan : 0,
      ngay: ngay || Date.now(),
      ghiChu: ghiChu || '',
      trangThai: trangThai || 'Hoạt động',
    });

    await investment.save({ session });
    await session.commitTransaction();
    session.endSession();

    console.log('Created investment:', investment);
    res.status(201).json({ message: 'Tạo đầu tư thành công', investment });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create investment error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(400).json({ message: error.message || 'Lỗi khi tạo đầu tư' });
  }
});

// Lấy danh sách đầu tư của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching investments for userId:', userId);
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'userId không hợp lệ' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const investments = await Investment.find({ maNguoiDung: userId }).sort({ ngay: -1 });
    console.log('Investments fetched:', investments);
    res.json(investments);
  } catch (error) {
    console.error('Get investments error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách đầu tư', error: error.message });
  }
});

// Cập nhật đầu tư
router.put('/:id', verifyUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { userId, loai, giaTri, loiNhuan, ngay, ghiChu, trangThai } = req.body;

    console.log('Update investment - Request:', { id, userId, loai, giaTri, loiNhuan, ngay, trangThai });

    if (!mongoose.isValidObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'ID đầu tư không hợp lệ' });
    }

    const investment = await Investment.findById(id).session(session);
    if (!investment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Đầu tư không tồn tại' });
    }

    if (investment.maNguoiDung.toString() !== userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền sửa đầu tư này' });
    }

    if (loai && loai.length > 50) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Loại đầu tư không được vượt quá 50 ký tự' });
    }
    if (giaTri && giaTri <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Giá trị đầu tư phải lớn hơn 0' });
    }
    if (ghiChu && ghiChu.length > 200) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ghi chú không được vượt quá 200 ký tự' });
    }

    if (loai) investment.loai = loai;
    if (giaTri) investment.giaTri = giaTri;
    if (loiNhuan !== undefined) investment.loiNhuan = loiNhuan;
    if (ngay) investment.ngay = ngay;
    if (ghiChu !== undefined) investment.ghiChu = ghiChu;
    if (trangThai) investment.trangThai = trangThai;
    investment.updatedAt = new Date();

    await investment.save({ session });
    await session.commitTransaction();
    session.endSession();

    console.log('Updated investment:', investment);
    res.json({ message: 'Cập nhật đầu tư thành công', investment });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update investment error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(400).json({ message: error.message || 'Lỗi khi cập nhật đầu tư' });
  }
});

// Xóa đầu tư
router.delete('/:id', verifyUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const userId = req.query.userId;

    console.log('Delete investment - Request:', { id, userId });

    if (!mongoose.isValidObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'ID đầu tư không hợp lệ' });
    }

    const investment = await Investment.findById(id).session(session);
    if (!investment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Đầu tư không tồn tại' });
    }

    if (investment.maNguoiDung.toString() !== userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền xóa đầu tư này' });
    }

    await investment.deleteOne({ session });
    await session.commitTransaction();
    session.endSession();

    console.log('Deleted investment:', id);
    res.json({ message: 'Xóa đầu tư thành công' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Delete investment error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Lỗi server khi xóa đầu tư', error: error.message });
  }
});

module.exports = router;