const mongoose = require('mongoose');
const cron = require('node-cron');
const { Budget } = require('../models');

// Chạy mỗi ngày lúc 00:00
const updateBudgetStatus = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running budget status update cron job at:', new Date().toISOString());
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const currentDate = new Date();
      const budgets = await Budget.find({ trangThai: true }).session(session);
      let updatedCount = 0;

      for (let budget of budgets) {
        if (new Date(budget.ngayKetThuc) < currentDate) {
          budget.trangThai = false;
          await budget.save({ session });
          console.log(`Budget ${budget._id} marked as ended (ngayKetThuc: ${budget.ngayKetThuc})`);
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
    timezone: 'Asia/Ho_Chi_Minh' // Đặt múi giờ Việt Nam
  });
};

module.exports = updateBudgetStatus;