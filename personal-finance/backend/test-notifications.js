const mongoose = require('mongoose');
const { Notification, SavingGoal, Debt, User } = require('./models');
require('dotenv').config();

// Kết nối database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Kết nối thành công tới MongoDB'))
.catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Hàm test tạo thông báo
const testCreateNotification = async () => {
  try {
    // Lấy user đầu tiên
    const user = await User.findOne();
    if (!user) {
      console.log('Không tìm thấy user nào');
      return;
    }

    console.log('Testing với user:', user.tenNguoiDung);

    // Tạo thông báo test
    const notification = new Notification({
      maNguoiDung: user._id,
      noiDung: 'Thông báo test - Kiểm tra chức năng thông báo',
      loai: 'Cảnh báo',
      quanTrong: true,
      daDoc: false
    });

    await notification.save();
    console.log('✅ Đã tạo thông báo test thành công');

    // Kiểm tra thông báo
    const notifications = await Notification.find({ maNguoiDung: user._id }).sort({ ngay: -1 });
    console.log('📋 Danh sách thông báo:', notifications.length);
    notifications.slice(0, 3).forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.noiDung} - ${notif.loai} - ${notif.daDoc ? 'Đã đọc' : 'Chưa đọc'}`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi test thông báo:', error);
  }
};

// Hàm test kiểm tra mục tiêu quá hạn
const testOverdueGoals = async () => {
  try {
    const user = await User.findOne();
    if (!user) {
      console.log('Không tìm thấy user nào');
      return;
    }

    console.log('\n🔍 Kiểm tra mục tiêu quá hạn...');

    // Tạo mục tiêu quá hạn test
    const overdueGoal = new SavingGoal({
      maNguoiDung: user._id,
      tenMucTieu: 'Mục tiêu test quá hạn',
      soTienMucTieu: 1000000,
      soTienHienTai: 500000,
      hanChot: new Date(Date.now() - 24 * 60 * 60 * 1000), // Quá hạn 1 ngày
      trangThai: 'Đang thực hiện'
    });

    await overdueGoal.save();
    console.log('✅ Đã tạo mục tiêu quá hạn test');

    // Kiểm tra mục tiêu quá hạn
    const now = new Date();
    const overdueGoals = await SavingGoal.find({
      hanChot: { $lt: now },
      trangThai: 'Đang thực hiện'
    });

    console.log(`📊 Tìm thấy ${overdueGoals.length} mục tiêu quá hạn`);
    overdueGoals.forEach((goal, index) => {
      console.log(`${index + 1}. ${goal.tenMucTieu} - Hạn chót: ${goal.hanChot.toLocaleDateString()}`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi test mục tiêu quá hạn:', error);
  }
};

// Hàm test kiểm tra khoản nợ quá hạn
const testOverdueDebts = async () => {
  try {
    const user = await User.findOne();
    if (!user) {
      console.log('Không tìm thấy user nào');
      return;
    }

    console.log('\n🔍 Kiểm tra khoản nợ quá hạn...');

    // Tạo khoản nợ quá hạn test
    const overdueDebt = new Debt({
      maNguoiDung: user._id,
      soTien: 500000,
      soTienDaTra: 200000,
      laiSuat: 10,
      kyHan: 12,
      ngayBatDau: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 năm trước
      ngayKetThuc: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Quá hạn 7 ngày
      trangThai: 'Hoạt động'
    });

    await overdueDebt.save();
    console.log('✅ Đã tạo khoản nợ quá hạn test');

    // Kiểm tra khoản nợ quá hạn
    const now = new Date();
    const overdueDebts = await Debt.find({
      ngayKetThuc: { $lt: now },
      trangThai: 'Hoạt động'
    });

    console.log(`📊 Tìm thấy ${overdueDebts.length} khoản nợ quá hạn`);
    overdueDebts.forEach((debt, index) => {
      console.log(`${index + 1}. ${debt.soTien.toLocaleString()} VNĐ - Hạn chót: ${debt.ngayKetThuc.toLocaleDateString()}`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi test khoản nợ quá hạn:', error);
  }
};

// Hàm test chức năng checkOverdueItems
const testCheckOverdueItems = async () => {
  try {
    console.log('\n🔍 Test chức năng checkOverdueItems...');
    
    const { checkOverdueItems } = require('./cron/checkReminders');
    await checkOverdueItems();
    
    console.log('✅ Đã chạy checkOverdueItems');
    
    // Kiểm tra thông báo mới được tạo
    const user = await User.findOne();
    if (user) {
      const recentNotifications = await Notification.find({
        maNguoiDung: user._id,
        ngay: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // 5 phút qua
      }).sort({ ngay: -1 });
      
      console.log(`📋 Thông báo mới trong 5 phút qua: ${recentNotifications.length}`);
      recentNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.noiDung} - ${notif.loai}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi test checkOverdueItems:', error);
  }
};

// Chạy tất cả test
const runAllTests = async () => {
  console.log('🚀 Bắt đầu test chức năng thông báo...\n');
  
  await testCreateNotification();
  await testOverdueGoals();
  await testOverdueDebts();
  await testCheckOverdueItems();
  
  console.log('\n✅ Hoàn tất tất cả test');
  process.exit(0);
};

// Chạy test
runAllTests().catch(console.error); 