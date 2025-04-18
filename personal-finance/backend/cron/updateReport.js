const mongoose = require('mongoose');
const cron = require('node-cron');
const { Transaction, Report, User } = require('../models');

// Chạy ngày 1 mỗi tháng lúc 00:00
const updateReport = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running report generation cron job at:', new Date().toISOString());
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
      const month = lastMonth.getMonth() + 1;
      const year = lastMonth.getFullYear();

      // Lấy tất cả người dùng
      const users = await User.find().session(session);
      for (let user of users) {
        // Kiểm tra xem báo cáo đã tồn tại chưa
        const existingReport = await Report.findOne({
          maNguoiDung: user._id,
          thang: month,
          nam: year,
        }).session(session);
        if (existingReport) continue;

        // Tính tổng thu nhập và chi tiêu
        const transactions = await Transaction.find({
          maNguoiDung: user._id,
          ngayGiaoDich: {
            $gte: new Date(year, month - 1, 1),
            $lt: new Date(year, month, 1),
          },
        }).session(session);

        const tongThuNhap = transactions
          .filter((t) => t.loai === 'Thu nhập')
          .reduce((sum, t) => sum + t.soTien, 0);
        const tongChiTieu = transactions
          .filter((t) => t.loai === 'Chi tiêu')
          .reduce((sum, t) => sum + t.soTien, 0);
        const soTienTietKiem = tongThuNhap - tongChiTieu;

        // Tạo báo cáo
        const report = new Report({
          maNguoiDung: user._id,
          thang: month,
          nam: year,
          tongThuNhap,
          tongChiTieu,
          soTienTietKiem,
        });
        await report.save({ session });

        console.log(`Report created for user ${user._id} for ${month}/${year}`);
      }

      await session.commitTransaction();
      session.endSession();
      console.log('Report generation completed.');
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Report cron job error:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
};

module.exports = updateReport;