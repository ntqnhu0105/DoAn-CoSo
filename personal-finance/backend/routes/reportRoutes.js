const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Report, User } = require('../models');
const { generateReport } = require('../cron/updateReport'); // Sửa đường dẫn

// Lấy danh sách báo cáo
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      console.log(`ID người dùng không hợp lệ: ${userId}`);
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    const user = await User.findById(userId);
    if (!user) {
      console.log(`Không tìm thấy người dùng: ${userId}`);
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const reports = await Report.find({ maNguoiDung: userId }).sort({ nam: -1, thang: -1 });
    console.log(`Tìm thấy ${reports.length} báo cáo cho người dùng ${userId}`);
    res.json(reports);
  } catch (error) {
    console.error(`Lỗi khi lấy báo cáo cho người dùng ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách báo cáo', error: error.message });
  }
});

// Tạo báo cáo thủ công
router.post('/generate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    if (!month || !year || month < 1 || month > 12 || year < 2000) {
      return res.status(400).json({ message: 'Tháng hoặc năm không hợp lệ' });
    }

    const report = await generateReport(userId, month, year);
    if (!report) {
      return res.status(400).json({ message: 'Báo cáo đã tồn tại hoặc không có dữ liệu để tạo báo cáo' });
    }

    res.json({ message: 'Báo cáo được tạo thành công', report });
  } catch (error) {
    console.error(`Lỗi khi tạo báo cáo thủ công cho người dùng ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Lỗi server khi tạo báo cáo', error: error.message });
  }
});

module.exports = router;