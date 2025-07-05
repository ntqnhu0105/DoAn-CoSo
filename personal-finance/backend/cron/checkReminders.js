const { Reminder, Notification, SavingGoal, Debt, Investment } = require('../models');

const checkReminders = async () => {
  try {
    const now = new Date();
    
    // Tìm tất cả nhắc nhở chưa gửi và đã đến thời gian
    const reminders = await Reminder.find({
      ngayNhacNho: { $lte: now },
      trangThai: 'Chưa gửi'
    }).populate('goalId', 'tenMucTieu soTienMucTieu soTienHienTai hanChot')
      .populate('debtId', 'soTien soTienDaTra ngayBatDau trangThai ngayKetThuc')
      .populate('investmentId', 'loai giaTri loiNhuan trangThai');
    
    console.log(`Tìm thấy ${reminders.length} nhắc nhở cần xử lý`);
    
    for (const reminder of reminders) {
      try {
        let notificationContent = reminder.noiDung;
        
        // Tạo nội dung thông báo dựa trên loại đối tượng
        if (reminder.goalId) {
          notificationContent = reminder.noiDung || `Nhắc nhở: ${reminder.goalId.tenMucTieu} - ${getSavingGoalMessage(reminder.goalId)}`;
        } else if (reminder.debtId) {
          notificationContent = reminder.noiDung || `Nhắc nhở: Khoản nợ - ${getDebtMessage(reminder.debtId)}`;
        } else if (reminder.investmentId) {
          notificationContent = reminder.noiDung || `Nhắc nhở: Đầu tư - ${getInvestmentMessage(reminder.investmentId)}`;
        }
        
        // Tạo thông báo
        const notification = new Notification({
          maNguoiDung: reminder.userId,
          noiDung: notificationContent,
          loai: 'Nhắc nhở',
          quanTrong: true,
          daDoc: false
        });
        
        await notification.save();
        
        // Cập nhật trạng thái nhắc nhở
        reminder.trangThai = 'Đã gửi';
        await reminder.save();
        
        console.log(`Đã tạo thông báo cho nhắc nhở: ${reminder._id}`);
      } catch (error) {
        console.error(`Lỗi khi xử lý nhắc nhở ${reminder._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra nhắc nhở:', error);
  }
};

// Hàm kiểm tra và tạo thông báo cho các đối tượng quá hạn
const checkOverdueItems = async () => {
  try {
    const now = new Date();
    console.log('Kiểm tra các đối tượng quá hạn...');
    
    // Kiểm tra mục tiêu tiết kiệm quá hạn
    const overdueGoals = await SavingGoal.find({
      hanChot: { $lt: now },
      trangThai: 'Đang thực hiện'
    });
    
    for (const goal of overdueGoals) {
      try {
        // Kiểm tra xem đã có thông báo quá hạn chưa
        const existingNotification = await Notification.findOne({
          maNguoiDung: goal.maNguoiDung,
          noiDung: { $regex: `Mục tiêu ${goal.tenMucTieu}.*quá hạn`, $options: 'i' },
          ngay: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } // Trong 24h qua
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
      } catch (error) {
        console.error(`Lỗi khi xử lý mục tiêu quá hạn ${goal._id}:`, error);
      }
    }
    
    // Kiểm tra khoản nợ quá hạn
    const overdueDebts = await Debt.find({
      ngayKetThuc: { $lt: now },
      trangThai: 'Hoạt động'
    });
    
    for (const debt of overdueDebts) {
      try {
        // Kiểm tra xem đã có thông báo quá hạn chưa
        const existingNotification = await Notification.findOne({
          maNguoiDung: debt.maNguoiDung,
          noiDung: { $regex: `Khoản nợ.*quá hạn`, $options: 'i' },
          ngay: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } // Trong 24h qua
        });
        
        if (!existingNotification) {
          const notification = new Notification({
            maNguoiDung: debt.maNguoiDung,
            noiDung: `Khoản nợ ${debt.soTien.toLocaleString()} VNĐ đã quá hạn vào ${new Date(debt.ngayKetThuc).toLocaleDateString()}`,
            loai: 'Cảnh báo',
            quanTrong: true,
            daDoc: false
          });
          await notification.save();
          console.log(`Đã tạo thông báo quá hạn cho khoản nợ: ${debt._id}`);
        }
      } catch (error) {
        console.error(`Lỗi khi xử lý khoản nợ quá hạn ${debt._id}:`, error);
      }
    }
    
    console.log(`Kiểm tra hoàn tất: ${overdueGoals.length} mục tiêu quá hạn, ${overdueDebts.length} khoản nợ quá hạn`);
  } catch (error) {
    console.error('Lỗi khi kiểm tra đối tượng quá hạn:', error);
  }
};

// Hàm tạo nội dung thông báo dựa trên mục tiêu tiết kiệm
const getSavingGoalMessage = (savingGoal) => {
  const now = new Date();
  const deadline = new Date(savingGoal.hanChot);
  const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  const progress = (savingGoal.soTienHienTai / savingGoal.soTienMucTieu) * 100;
  
  if (daysRemaining <= 0) {
    return `Mục tiêu đã quá hạn! Cần hoàn thành ngay.`;
  } else if (daysRemaining <= 7) {
    return `Còn ${daysRemaining} ngày nữa! Tiến độ hiện tại: ${progress.toFixed(1)}%`;
  } else if (progress < 50) {
    return `Tiến độ chậm (${progress.toFixed(1)}%). Cần tăng cường tiết kiệm!`;
  } else {
    return `Tiến độ tốt (${progress.toFixed(1)}%). Tiếp tục phấn đấu!`;
  }
};

// Hàm tạo nội dung thông báo dựa trên khoản nợ
const getDebtMessage = (debt) => {
  const totalAmount = debt.soTien + (debt.soTien * (debt.laiSuat || 0) * debt.kyHan) / 100;
  const remainingAmount = totalAmount - (debt.soTienDaTra || 0);
  const progress = totalAmount ? ((debt.soTienDaTra || 0) / totalAmount) * 100 : 0;
  
  if (debt.trangThai === 'Quá hạn') {
    return `Khoản nợ đã quá hạn! Còn lại: ${remainingAmount.toLocaleString()} VNĐ`;
  } else if (debt.trangThai === 'Đã thanh toán') {
    return `Khoản nợ đã được thanh toán hoàn toàn!`;
  } else {
    return `Tiến độ trả nợ: ${progress.toFixed(1)}%. Còn lại: ${remainingAmount.toLocaleString()} VNĐ`;
  }
};

// Hàm tạo nội dung thông báo dựa trên đầu tư
const getInvestmentMessage = (investment) => {
  const profitRate = investment.giaTri ? (investment.loiNhuan / investment.giaTri) * 100 : 0;
  
  if (investment.trangThai === 'Đã bán') {
    return `Đầu tư đã bán. Lợi nhuận: ${investment.loiNhuan.toLocaleString()} VNĐ (${profitRate.toFixed(2)}%)`;
  } else if (investment.trangThai === 'Đang chờ') {
    return `Đầu tư đang chờ xử lý. Giá trị: ${investment.giaTri.toLocaleString()} VNĐ`;
  } else {
    return `Đầu tư đang hoạt động. Lợi nhuận hiện tại: ${investment.loiNhuan.toLocaleString()} VNĐ (${profitRate.toFixed(2)}%)`;
  }
};

// Chạy kiểm tra mỗi 5 phút
const startReminderCheck = () => {
  console.log('Bắt đầu cron job kiểm tra nhắc nhở...');
  
  // Chạy ngay lập tức
  checkReminders();
  checkOverdueItems();
  
  // Chạy định kỳ mỗi 5 phút
  setInterval(() => {
    checkReminders();
    checkOverdueItems();
  }, 5 * 60 * 1000);
};

module.exports = { checkReminders, checkOverdueItems, startReminderCheck }; 