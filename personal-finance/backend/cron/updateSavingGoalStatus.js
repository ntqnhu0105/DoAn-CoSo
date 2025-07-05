const mongoose = require('mongoose');
const cron = require('node-cron');
const { SavingGoal, Transaction, Notification } = require('../models');

// Hàm cập nhật trạng thái mục tiêu tiết kiệm
const updateSavingGoalStatus = async (userId, month, year, session) => {
  try {
    const currentDate = new Date();
    const savingGoals = await SavingGoal.find({ 
      maNguoiDung: userId,
      trangThai: 'Đang thực hiện'
    }).session(session);

    for (let goal of savingGoals) {
      let statusChanged = false;
      let notificationCreated = false;

      // Kiểm tra quá hạn
      if (goal.hanChot && new Date(goal.hanChot) < currentDate && goal.trangThai === 'Đang thực hiện') {
        goal.trangThai = 'Thất bại';
        await goal.save({ session });
        
        // Tạo thông báo quá hạn
        const notification = new Notification({
          maNguoiDung: userId,
          noiDung: `Mục tiêu "${goal.tenMucTieu}" đã quá hạn và được đánh dấu là thất bại`,
          loai: 'Cảnh báo',
          quanTrong: true,
          daDoc: false
        });
        await notification.save({ session });
        
        console.log(`Saving goal ${goal._id} marked as Thất bại (quá hạn)`);
        console.log(`Notification created for user ${userId}`);
        statusChanged = true;
        notificationCreated = true;
      }

      // Kiểm tra hoàn thành
      if (goal.soTienHienTai >= goal.soTienMucTieu && goal.trangThai === 'Đang thực hiện') {
        goal.trangThai = 'Hoàn thành';
        await goal.save({ session });
        
        // Tạo thông báo hoàn thành
        const notification = new Notification({
          maNguoiDung: userId,
          noiDung: `Chúc mừng! Mục tiêu "${goal.tenMucTieu}" đã được hoàn thành`,
          loai: 'Cập nhật',
          quanTrong: true,
          daDoc: false
        });
        await notification.save({ session });
        
        console.log(`Saving goal ${goal._id} marked as Hoàn thành`);
        console.log(`Notification created for user ${userId}`);
        statusChanged = true;
        notificationCreated = true;
      }

      if (notificationCreated) {
        console.log(`Saving goal status update completed for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Error updating saving goal status:', error);
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

// Hàm kiểm tra và tạo thông báo cho mục tiêu quá hạn ngay lập tức
const checkOverdueSavingGoals = async () => {
  try {
    const currentDate = new Date();
    const overdueGoals = await SavingGoal.find({
      hanChot: { $lt: currentDate },
      trangThai: 'Đang thực hiện'
    });

    for (const goal of overdueGoals) {
      // Kiểm tra xem đã có thông báo quá hạn chưa
      const existingNotification = await Notification.findOne({
        maNguoiDung: goal.maNguoiDung,
        noiDung: { $regex: `Mục tiêu ${goal.tenMucTieu}.*quá hạn`, $options: 'i' },
        ngay: { $gte: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) } // Trong 24h qua
      });

      if (!existingNotification) {
        const notification = new Notification({
          maNguoiDung: goal.maNguoiDung,
          noiDung: `Mục tiêu "${goal.tenMucTieu}" đã quá hạn! Cần hoàn thành ngay.`,
          loai: 'Cảnh báo',
          quanTrong: true,
          daDoc: false
        });
        await notification.save();
        console.log(`Đã tạo thông báo quá hạn cho mục tiêu: ${goal._id}`);
      }
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra mục tiêu quá hạn:', error);
  }
};

module.exports = { updateSavingGoalStatus, updateSavingGoalStatusCron, checkOverdueSavingGoals };