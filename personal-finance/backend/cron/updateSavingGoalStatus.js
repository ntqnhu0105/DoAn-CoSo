const mongoose = require('mongoose');
const cron = require('node-cron');
const { SavingGoal, Transaction } = require('../models');

// Hàm cập nhật trạng thái mục tiêu tiết kiệm
const updateSavingGoalStatus = async (userId, month, year, session) => {
  try {
    const savingGoals = await SavingGoal.find({
      maNguoiDung: userId,
      ngayTao: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    }).session(session);

    for (const goal of savingGoals) {
      const transactions = await Transaction.find({
        maNguoiDung: userId,
        loai: 'Thu nhập',
        ngayGiaoDich: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        },
      }).session(session);

      const totalSaved = transactions.reduce((sum, t) => sum + (t.soTien || 0), 0) * 0.1; // Giả định tiết kiệm 10% thu nhập
      goal.soTienDaTietKiem = totalSaved;
      goal.trangThai = totalSaved >= goal.soTienMucTieu ? 'Hoàn thành' : 'Đang tiến hành';
      await goal.save({ session });

      console.log(`Updated saving goal ${goal._id} for user ${userId}, month ${month}/${year}`);
    }
  } catch (error) {
    console.error(`Error updating saving goal for user ${userId}:`, error);
    throw error;
  }
};

// Cron job chạy vào ngày đầu tiên mỗi tháng
const updateSavingGoalStatusCron = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running saving goal status update cron job at:', new Date().toISOString());
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
      const month = lastMonth.getMonth() + 1;
      const year = lastMonth.getFullYear();

      const users = await mongoose.model('User').find({}).session(session);
      for (const user of users) {
        await updateSavingGoalStatus(user._id, month, year, session);
      }

      await session.commitTransaction();
      console.log('Saving goal status update completed.');
    } catch (error) {
      await session.abortTransaction();
      console.error('Saving goal cron job error:', error);
    } finally {
      session.endSession();
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
};

module.exports = updateSavingGoalStatusCron;