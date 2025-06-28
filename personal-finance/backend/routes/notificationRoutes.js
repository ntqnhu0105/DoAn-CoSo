const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Notification, User } = require('../models');

// Middleware authentication (cần implement)
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    // Implement JWT verification here
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Lấy danh sách thông báo của người dùng
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    
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
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Validate userId in body
    if (!userId) {
      return res.status(400).json({ message: 'userId là bắt buộc' });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Thông báo không tồn tại' });
    }

    if (notification.maNguoiDung.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa thông báo này' });
    }

    notification.daDoc = true;
    await notification.save();

    res.json({ message: 'Đánh dấu thông báo đã đọc thành công', notification });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ message: 'Lỗi server khi đánh dấu thông báo', error: error.message });
  }
});

// Đánh dấu thông báo quan trọng
router.put('/:id/important', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, quanTrong } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Validate userId in body
    if (!userId) {
      return res.status(400).json({ message: 'userId là bắt buộc' });
    }

    // Validate quanTrong
    if (typeof quanTrong !== 'boolean') {
      return res.status(400).json({ message: 'quanTrong phải là boolean' });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Thông báo không tồn tại' });
    }

    if (notification.maNguoiDung.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa thông báo này' });
    }

    notification.quanTrong = quanTrong;
    await notification.save();

    res.json({ message: 'Cập nhật trạng thái quan trọng thành công', notification });
  } catch (error) {
    console.error('Update notification important status error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái quan trọng', error: error.message });
  }
});

// Xóa thông báo
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Validate userId in body
    if (!userId) {
      return res.status(400).json({ message: 'userId là bắt buộc' });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Thông báo không tồn tại' });
    }

    if (notification.maNguoiDung.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa thông báo này' });
    }

    await Notification.findByIdAndDelete(id);
    res.json({ message: 'Xóa thông báo thành công' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa thông báo', error: error.message });
  }
});

module.exports = router;