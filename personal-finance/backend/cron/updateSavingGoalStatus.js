const mongoose = require('mongoose');
const cron = require('node-cron');
const { SavingGoal, Notification } = require('../models');

// Chạy mỗi ngày lúc 00:00
const updateSavingGoalStatus = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running saving goal status update cron job at:', new Date().toISOString());
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const currentDate = new Date();
      const savingGoals = await SavingGoal.find({ trangThai: 'Đang thực hiện' })
        .session(session);
      let updatedCount = 0;

      for (let goal of savingGoals) {
        if (new Date(goal.hanChot) < currentDate) {
          goal.trangThai = goal.soTienHienTai >= goal.soTienMucTieu ? 'Hoàn thành' : 'Thất bại';
          await goal.save({ session });

          const notification = new Notification({
            maNguoiDung: goal.maNguoiDung,
            noiDung: `Mục tiêu tiết kiệm "${goal.tenMucTieu}" đã ${goal.trangThai === 'Hoàn thành' ? 'hoàn thành' : 'thất bại'} vào ${new Date(goal.hanChot).toLocaleDateString()}`,
            loai: goal.trangThai === 'Hoàn thành' ? 'Thành công' : 'Cảnh báo',
            daDoc: false,
          });
          await notification.save({ session });

          console.log(`SavingGoal ${goal._id} marked as ${goal.trangThai} (hanChot: ${goal.hanChot})`);
          console.log(`Notification created for user ${goal.maNguoiDung}`);
          updatedCount++;
        }
      }

      await session.commitTransaction();
      session.endSession();
      console.log(`Saving goal status update completed. Updated ${updatedCount} goals.`);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Cron job error:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });
};

module.exports = updateSavingGoalStatus;