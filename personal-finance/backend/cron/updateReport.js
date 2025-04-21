const mongoose = require('mongoose');
const cron = require('node-cron');
const fs = require('fs');
const { Transaction, Report, User, SavingGoal } = require('../models');

const logError = (message, error) => {
  fs.appendFileSync('error.log', `${new Date().toISOString()} - ${message}: ${error.message}\n`);
};

const generateReport = async (userId, month, year) => {
  try {
    const existingReport = await Report.findOne({
      maNguoiDung: userId,
      thang: month,
      nam: year,
    });
    if (existingReport) {
      console.log(`Báo cáo đã tồn tại cho người dùng ${userId}, ${month}/${year}`);
      return null;
    }

    const transactions = await Transaction.find({
      maNguoiDung: userId,
      ngayGiaoDich: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    });

    const tongThuNhap = transactions
      .filter(t => t.loai === 'Thu nhập')
      .reduce((sum, t) => sum + (t.soTien || 0), 0);

    const tongChiTieu = transactions
      .filter(t => t.loai === 'Chi tiêu')
      .reduce((sum, t) => sum + (t.soTien || 0), 0);

    const savingGoals = await SavingGoal.find({
      maNguoiDung: userId,
      ngayTao: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    });

    const soTienTietKiem = savingGoals.reduce((sum, sg) => sum + (sg.soTienHienTai || 0), 0) || (tongThuNhap - tongChiTieu);

    if (tongThuNhap === 0 && tongChiTieu === 0 && soTienTietKiem === 0) {
      console.log(`Không có hoạt động cho người dùng ${userId} trong ${month}/${year}, bỏ qua báo cáo`);
      return null;
    }

    const report = new Report({
      maNguoiDung: userId,
      thang: month,
      nam: year,
      tongThuNhap,
      tongChiTieu,
      soTienTietKiem,
      ghiChu: `Báo cáo tự động cho tháng ${month}/${year}`,
    });

    await report.save();
    console.log(`Đã tạo báo cáo cho người dùng ${userId} cho ${month}/${year}`);
    return report;
  } catch (error) {
    console.error(`Lỗi khi tạo báo cáo cho người dùng ${userId}:`, error);
    logError(`Lỗi khi tạo báo cáo cho người dùng ${userId}`, error);
    throw error;
  }
};

const updateReport = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Bắt đầu cron job tạo báo cáo tại:', new Date().toISOString());
    try {
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
      const month = lastMonth.getMonth() + 1;
      const year = lastMonth.getFullYear();

      const users = await User.find();
      console.log(`Tìm thấy ${users.length} người dùng để tạo báo cáo`);
      for (const user of users) {
        await generateReport(user._id, month, year);
      }
      console.log('Hoàn tất tạo báo cáo.');
    } catch (error) {
      console.error('Lỗi cron job tạo báo cáo:', error);
      logError('Lỗi cron job tạo báo cáo', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
};

module.exports = { updateReport, generateReport };