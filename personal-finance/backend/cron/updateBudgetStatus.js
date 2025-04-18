const mongoose = require('mongoose');
const cron = require('node-cron');
const { Budget, Notification } = require('../models');

// Chạy mỗi ngày lúc 00:00
const updateBudgetStatus = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running budget status update cron job at:', new Date().toISOString());
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const currentDate = new Date();
      const budgets = await Budget.find({ trangThai: true })
        .populate('maDanhMuc', 'tenDanhMuc')
        .session(session);
      let updatedCount = 0;

      for (let budget of budgets) {
        if (new Date(budget.ngayKetThuc) < currentDate) {
          budget.trangThai = false;
          await budget.save({ session });

          // Tạo thông báo
          const notification = new Notification({
            maNguoiDung: budget.maNguoiDung,
            noiDung: `Ngân sách "${budget.maDanhMuc.tenDanhMuc}" đã kết thúc vào ${new Date(budget.ngayKetThuc).toLocaleDateString()}`,
            loai: 'Cảnh báo',
            daDoc: false,
          });
          await notification.save({ session });

          console.log(`Budget ${budget._id} marked as ended (ngayKetThuc: ${budget.ngayKetThuc})`);
          console.log(`Notification created for user ${budget.maNguoiDung}`);
          updatedCount++;
        }
      }

      await session.commitTransaction();
      session.endSession();
      console.log(`Budget status update completed. Updated ${updatedCount} budgets.`);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Cron job error:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
};

module.exports = updateBudgetStatus;