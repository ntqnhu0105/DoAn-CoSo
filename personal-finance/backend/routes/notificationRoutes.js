const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Notification, User } = require('../models');

// Lấy danh sách thông báo của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const notifications = await Notification.find({ maNguoiDung: userId })
      .sort({ ngay: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách thông báo', error: error.message });
  }
});

// Đánh dấu thông báo đã đọc
router.put('/:id/read', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const notification = await Notification.findById(id).session(session);
    if (!notification) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Thông báo không tồn tại' });
    }

    if (notification.maNguoiDung.toString() !== userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa thông báo này' });
    }

    notification.daDoc = true;
    await notification.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Đánh dấu thông báo đã đọc thành công', notification });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update notification error:', error);
    res.status(500).json({ message: 'Lỗi server khi đánh dấu thông báo', error: error.message });
  }
});

module.exports = router;