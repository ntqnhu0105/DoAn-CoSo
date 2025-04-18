const express = require('express');
const router = express.Router();
const { Report, User } = require('../models');

// Lấy danh sách báo cáo của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const reports = await Report.find({ maNguoiDung: userId }).sort({ nam: -1, thang: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách báo cáo', error: error.message });
  }
});

module.exports = router;