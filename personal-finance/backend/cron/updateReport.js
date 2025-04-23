const mongoose = require('mongoose');
const cron = require('node-cron');
const fs = require('fs');
const { Transaction, Report, User } = require('../models');

const logError = (message, error) => {
  fs.appendFileSync('error.log', `${new Date().toISOString()} - ${message}: ${error.message}\n`);
};

const generateReport = async (userId, month, year) => {
  try {
    // Kiểm tra userId hợp lệ
    if (!mongoose.isValidObjectId(userId)) {
      console.log(`ID người dùng không hợp lệ: ${userId}`);
      return null;
    }

    // Lấy giao dịch trong tháng
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const transactions = await Transaction.find({
      maNguoiDung: userId,
      ngayGiaoDich: { $gte: startDate, $lt: endDate },
    });

    // Tính tổng thu nhập và chi tiêu
    const tongThuNhap = transactions
      .filter(t => t.loai === 'Thu nhập')
      .reduce((sum, t) => sum + (t.soTien || 0), 0);
    const tongChiTieu = transactions
      .filter(t => t.loai === 'Chi tiêu')
      .reduce((sum, t) => sum + (t.soTien || 0), 0);

    // Tính tổng tiết kiệm: tongThuNhap - tongChiTieu
    const soTienTietKiem = tongThuNhap - tongChiTieu;

    // Nếu không có dữ liệu, xóa báo cáo hiện có (nếu tồn tại)
    if (tongThuNhap === 0 && tongChiTieu === 0 && soTienTietKiem === 0) {
      await Report.deleteOne({ maNguoiDung: userId, thang: month, nam: year });
      console.log(`Không có hoạt động cho người dùng ${userId} trong ${month}/${year}, xóa báo cáo nếu tồn tại`);
      return null;
    }

    // Kiểm tra báo cáo đã tồn tại
    let report = await Report.findOne({ maNguoiDung: userId, thang: month, nam: year });
    if (report) {
      // Cập nhật báo cáo hiện có
      report.tongThuNhap = tongThuNhap;
      report.tongChiTieu = tongChiTieu;
      report.soTienTietKiem = soTienTietKiem;
      report.ghiChu = `Báo cáo cập nhật cho tháng ${month}/${year}`;
    } else {
      // Tạo báo cáo mới
      report = new Report({
        maNguoiDung: userId,
        thang: month,
        nam: year,
        tongThuNhap,
        tongChiTieu,
        soTienTietKiem,
        ghiChu: `Báo cáo tự động cho tháng ${month}/${year}`,
      });
    }

    await report.save();
    console.log(`Đã cập nhật/tạo báo cáo cho người dùng ${userId} cho ${month}/${year}`);
    return report;
  } catch (error) {
    console.error(`Lỗi khi tạo/cập nhật báo cáo cho người dùng ${userId}:`, error);
    logError(`Lỗi khi tạo/cập nhật báo cáo cho người dùng ${userId}`, error);
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