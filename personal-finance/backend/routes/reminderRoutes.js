const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Reminder, User, SavingGoal, Debt, Investment, Notification } = require('../models');

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

// Lấy danh sách nhắc nhở của người dùng
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('GET /reminders/:userId:', userId);
    
    // Kiểm tra quyền truy cập
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập nhắc nhở của người dùng khác' });
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    const reminders = await Reminder.find({ userId })
      .populate('goalId', 'tenMucTieu soTienMucTieu soTienHienTai')
      .populate('debtId', 'soTien soTienDaTra')
      .populate('investmentId', 'loai giaTri')
      .sort({ ngayNhacNho: 1 });

    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách nhắc nhở', error: error.message });
  }
});

// Tạo nhắc nhở mới
router.post('/', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, goalId, debtId, investmentId, date, note } = req.body;
    
    // Kiểm tra quyền truy cập
    if (userId !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Không có quyền tạo nhắc nhở cho người dùng khác' });
    }
    
    // Validate required fields
    if (!userId || !date) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin bắt buộc' });
    }
    
    // Validate that only one object type is provided
    const objectCount = [goalId, debtId, investmentId].filter(Boolean).length;
    if (objectCount !== 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Vui lòng chọn đúng một đối tượng (Mục tiêu tiết kiệm, Khoản nợ, hoặc Đầu tư)' });
    }
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    
    if (goalId && !mongoose.Types.ObjectId.isValid(goalId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'ID mục tiêu tiết kiệm không hợp lệ' });
    }
    
    if (debtId && !mongoose.Types.ObjectId.isValid(debtId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'ID khoản nợ không hợp lệ' });
    }
    
    if (investmentId && !mongoose.Types.ObjectId.isValid(investmentId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'ID đầu tư không hợp lệ' });
    }
    
    // Validate date
    const reminderDate = new Date(date);
    if (isNaN(reminderDate.getTime())) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ngày nhắc nhở không hợp lệ' });
    }
    
    if (reminderDate <= new Date()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ngày nhắc nhở phải lớn hơn thời gian hiện tại' });
    }
    
    // Kiểm tra đối tượng tồn tại và thuộc về user
    if (goalId) {
      const goal = await SavingGoal.findById(goalId).session(session);
      if (!goal) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Mục tiêu tiết kiệm không tồn tại' });
      }
      if (goal.userId.toString() !== userId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ message: 'Không có quyền tạo nhắc nhở cho mục tiêu tiết kiệm này' });
      }
    }
    
    if (debtId) {
      const debt = await Debt.findById(debtId).session(session);
      if (!debt) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Khoản nợ không tồn tại' });
      }
      if (debt.userId.toString() !== userId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ message: 'Không có quyền tạo nhắc nhở cho khoản nợ này' });
      }
    }
    
    if (investmentId) {
      const investment = await Investment.findById(investmentId).session(session);
      if (!investment) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Đầu tư không tồn tại' });
      }
      if (investment.userId.toString() !== userId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ message: 'Không có quyền tạo nhắc nhở cho đầu tư này' });
      }
    }
    
    // Tạo nhắc nhở mới
    const reminder = new Reminder({
      userId,
      goalId,
      debtId,
      investmentId,
      ngayNhacNho: reminderDate,
      noiDung: note || 'Nhắc nhở',
      trangThai: 'Chưa gửi'
    });
    
    await reminder.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    // Nếu ngày nhắc nhở <= hiện tại, tạo notification ngay
    try {
      if (reminderDate <= new Date()) {
        let notificationContent = reminder.noiDung;
        if (goalId) {
          notificationContent = reminder.noiDung || 'Nhắc nhở mục tiêu tiết kiệm';
        } else if (debtId) {
          notificationContent = reminder.noiDung || 'Nhắc nhở khoản nợ';
        } else if (investmentId) {
          notificationContent = reminder.noiDung || 'Nhắc nhở đầu tư';
        }
        await Notification.create({
          maNguoiDung: userId,
          noiDung: notificationContent,
          loai: 'Nhắc nhở',
          quanTrong: true,
          daDoc: false
        });
      }
    } catch (notifyErr) {
      console.error('Lỗi khi tạo notification nhắc nhở ngay:', notifyErr);
    }
    
    // Populate thông tin đối tượng trước khi trả về
    await reminder.populate('goalId', 'tenMucTieu soTienMucTieu soTienHienTai');
    await reminder.populate('debtId', 'soTien soTienDaTra');
    await reminder.populate('investmentId', 'loai giaTri');
    
    res.status(201).json(reminder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create reminder error:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo nhắc nhở', error: error.message });
  }
});

// Cập nhật nhắc nhở
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, date, note } = req.body;
    
    // Kiểm tra quyền truy cập
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền cập nhật nhắc nhở của người dùng khác' });
    }
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: 'Nhắc nhở không tồn tại' });
    }
    
    // Kiểm tra quyền sở hữu
    if (reminder.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Không có quyền cập nhật nhắc nhở này' });
    }
    
    // Validate date
    if (date) {
      const reminderDate = new Date(date);
      if (isNaN(reminderDate.getTime())) {
        return res.status(400).json({ message: 'Ngày nhắc nhở không hợp lệ' });
      }
      
      if (reminderDate <= new Date()) {
        return res.status(400).json({ message: 'Ngày nhắc nhở phải lớn hơn thời gian hiện tại' });
      }
      
      reminder.ngayNhacNho = reminderDate;
    }
    
    if (note !== undefined) {
      reminder.noiDung = note;
    }
    
    await reminder.save();
    
    // Populate thông tin đối tượng trước khi trả về
    await reminder.populate('goalId', 'tenMucTieu soTienMucTieu soTienHienTai');
    await reminder.populate('debtId', 'soTien soTienDaTra');
    await reminder.populate('investmentId', 'loai giaTri');
    
    res.json(reminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật nhắc nhở', error: error.message });
  }
});

// Xóa nhắc nhở
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Kiểm tra quyền truy cập
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền xóa nhắc nhở của người dùng khác' });
    }
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: 'Nhắc nhở không tồn tại' });
    }
    
    // Kiểm tra quyền sở hữu
    if (reminder.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Không có quyền xóa nhắc nhở này' });
    }
    
    await reminder.deleteOne();
    res.json({ message: 'Xóa nhắc nhở thành công' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa nhắc nhở', error: error.message });
  }
});

// Hủy nhắc nhở
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: 'Nhắc nhở không tồn tại' });
    }
    
    if (reminder.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền hủy nhắc nhở này' });
    }
    
    reminder.trangThai = 'Đã hủy';
    await reminder.save();
    
    res.json({ message: 'Hủy nhắc nhở thành công', reminder });
  } catch (error) {
    console.error('Cancel reminder error:', error);
    res.status(500).json({ message: 'Lỗi server khi hủy nhắc nhở', error: error.message });
  }
});

module.exports = router; 