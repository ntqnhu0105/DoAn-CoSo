const mongoose = require('mongoose');
const cron = require('node-cron');
const { Debt, Notification } = require('../models');

// Chạy mỗi ngày lúc 00:00
const updateDebtStatus = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running debt status update cron job at:', new Date().toISOString());
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const currentDate = new Date();
      const debts = await Debt.find({ $or: [{ trangThai: 'Hoạt động' }, { ngayTraTiepTheo: { $ne: null } }] })
        .session(session);
      let updatedCount = 0;

      for (let debt of debts) {
        let notificationCreated = false;
        const totalInterest = debt.laiSuat ? (debt.soTien * debt.laiSuat * debt.kyHan) / 100 : 0;

        // Kiểm tra đã thanh toán
        if (debt.soTienDaTra >= debt.soTien + totalInterest && debt.trangThai !== 'Đã thanh toán') {
          debt.trangThai = 'Đã thanh toán';
          await debt.save({ session });

          const notification = new Notification({
            maNguoiDung: debt.maNguoiDung,
            noiDung: `Khoản nợ ${debt.soTien.toLocaleString()} VNĐ đã được thanh toán hoàn toàn`,
            loai: 'Thông báo',
            daDoc: false,
          });
          await notification.save({ session });

          console.log(`Debt ${debt._id} marked as Đã thanh toán`);
          console.log(`Notification created for user ${debt.maNguoiDung}`);
          notificationCreated = true;
          updatedCount++;
        }

        // Kiểm tra quá hạn
        if (debt.ngayKetThuc && new Date(debt.ngayKetThuc) < currentDate && debt.trangThai === 'Hoạt động') {
          debt.trangThai = 'Quá hạn';
          await debt.save({ session });

          const notification = new Notification({
            maNguoiDung: debt.maNguoiDung,
            noiDung: `Khoản nợ ${debt.soTien.toLocaleString()} VNĐ đã quá hạn vào ${new Date(debt.ngayKetThuc).toLocaleDateString()}`,
            loai: 'Cảnh báo',
            daDoc: false,
          });
          await notification.save({ session });

          console.log(`Debt ${debt._id} marked as Quá hạn (ngayKetThuc: ${debt.ngayKetThuc})`);
          console.log(`Notification created for user ${debt.maNguoiDung}`);
          notificationCreated = true;
          updatedCount++;
        }

        // Kiểm tra nhắc nhở trả nợ
        if (debt.ngayTraTiepTheo && debt.trangThai === 'Hoạt động') {
          const nextPaymentDate = new Date(debt.ngayTraTiepTheo);
          if (
            nextPaymentDate.getFullYear() === currentDate.getFullYear() &&
            nextPaymentDate.getMonth() === currentDate.getMonth() &&
            nextPaymentDate.getDate() === currentDate.getDate()
          ) {
            const notification = new Notification({
              maNguoiDung: debt.maNguoiDung,
              noiDung: `Hôm nay là ngày trả nợ cho khoản nợ ${debt.soTien.toLocaleString()} VNĐ`,
              loai: 'Nhắc nhở',
              daDoc: false,
            });
            await notification.save({ session });

            console.log(`Reminder notification created for debt ${debt._id} (ngayTraTiepTheo: ${debt.ngayTraTiepTheo})`);
            console.log(`Notification created for user ${debt.maNguoiDung}`);
            notificationCreated = true;
          }
        }

        if (notificationCreated) updatedCount++;
      }

      await session.commitTransaction();
      session.endSession();
      console.log(`Debt status update completed. Updated ${updatedCount} debts.`);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Cron job error:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
};

module.exports = updateDebtStatus;