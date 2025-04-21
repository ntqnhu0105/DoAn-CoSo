const mongoose = require('mongoose');
const cron = require('node-cron');
const { Budget, Transaction } = require('../models');

// Hàm cập nhật trạng thái ngân sách
const updateBudgetStatus = async (userId, month, year, session) => {
  try {
    const budgets = await Budget.find({
      maNguoiDung: userId,
      thang: month,
      nam: year,
    }).session(session);

    for (const budget of budgets) {
      const transactions = await Transaction.find({
        maNguoiDung: userId,
        maDanhMuc: budget.maDanhMuc,
        loai: 'Chi tiêu',
        ngayGiaoDich: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        },
      }).session(session);

      const totalSpent = transactions.reduce((sum, t) => sum + (t.soTien || 0), 0);
      budget.tongChiTieu = totalSpent;
      budget.trangThai = totalSpent > budget.soTien ? 'Vượt ngân sách' : 'Trong ngân sách';
      await budget.save({ session });

      console.log(`Updated budget ${budget._id} for user ${userId}, month ${month}/${year}`);
    }
  } catch (error) {
    console.error(`Error updating budget for user ${userId}:`, error);
    throw error;
  }
};

// Cron job chạy vào ngày đầu tiên mỗi tháng
const updateBudgetStatusCron = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running budget status update cron job at:', new Date().toISOString());
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
      const month = lastMonth.getMonth() + 1;
      const year = lastMonth.getFullYear();

      const users = await mongoose.model('User').find({}).session(session);
      for (const user of users) {
        await updateBudgetStatus(user._id, month, year, session);
      }

      await session.commitTransaction();
      console.log('Budget status update completed.');
    } catch (error) {
      await session.abortTransaction();
      console.error('Budget cron job error:', error);
    } finally {
      session.endSession();
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
};

module.exports = updateBudgetStatusCron;