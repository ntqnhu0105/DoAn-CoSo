const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const { User, Category, Account } = require('./models');
const passport = require('./passport');
const jwt = require('jsonwebtoken');

dotenv.config();

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/api/uploads', express.static(path.join(__dirname, 'Uploads')));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Kết nối thành công tới MongoDB'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

const updateBudgetStatus = require('./cron/updateBudgetStatus');
const updateSavingGoalStatus = require('./cron/updateSavingGoalStatus');
const updateDebtStatus = require('./cron/updateDebtStatus');
const { updateReport } = require('./cron/updateReport');
const { startReminderCheck } = require('./cron/checkReminders');

updateBudgetStatus();
updateSavingGoalStatus();
updateDebtStatus();
updateReport();
startReminderCheck();

app.use(passport.initialize());

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/saving-goals', require('./routes/savingGoalRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/debts', require('./routes/debtRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/overview', require('./routes/overviewRoutes'));

// Route bắt đầu xác thực Google
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route callback Google
app.get('/api/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login?error=google' }), (req, res) => {
  const user = req.user;
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  // Redirect về frontend kèm token
  res.redirect(`http://localhost:3000/login?token=${token}`);
});

io.on('connection', (socket) => {
  console.log('Người dùng kết nối:', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`Người dùng ${userId} đã tham gia phòng`);
  });

  socket.on('chatMessage', async (data) => {
    const { userId, token, message } = data;
    console.log('Dữ liệu chatbot nhận được:', {
      userId,
      token: token ? token.slice(0, 10) + '...' : '[Không có token]',
      message,
    });

    let response = '';
    if (!userId || !token) {
      response = 'Vui lòng đăng nhập lại để sử dụng chatbot.';
      socket.emit('chatResponse', { message: response });
      return;
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        response = 'Người dùng không tồn tại. Vui lòng đăng nhập lại.';
        socket.emit('chatResponse', { message: response });
        return;
      }

      // Chuẩn hóa chuỗi
      const command = message.toLowerCase().replace(/\s+/g, ' ').trim();
      console.log('Chuỗi command sau chuẩn hóa:', command);

      const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
      const headers = { Authorization: `Bearer ${token}` };

      if (command.startsWith('kiểm tra số dư')) {
        console.log('Gửi yêu cầu GET /api/accounts/', userId);
        const res = await axios.get(`${baseUrl}/api/accounts/${userId}`, { headers });
        const accounts = res.data;
        if (!accounts || accounts.length === 0) {
          response = 'Không tìm thấy tài khoản nào. Vui lòng thêm tài khoản trong trang Quản lý tài khoản.';
        } else {
          response = 'Số dư tài khoản của bạn:\n' + accounts.map(acc =>
            `${acc.tenTaiKhoan} (${acc.loaiTaiKhoan}): ${formatCurrency(acc.soDu)}`
          ).join('\n');
        }
      } else if (command.startsWith('thêm giao dịch')) {
        const parts = command.replace('thêm giao dịch', '').trim().split(' ');
        console.log('Parts:', parts);
        if (parts.length < 4) {
          response = 'Lệnh không hợp lệ. Ví dụ: thêm giao dịch chi 100000 ăn uống Vietcombank';
          socket.emit('chatResponse', { message: response });
          return;
        }

        const [loai, soTienStr, ...rest] = parts;
        console.log('soTienStr:', soTienStr);

        // Làm sạch số tiền
        const cleanedSoTienStr = soTienStr.replace(/[,]/g, '').replace(/[^0-9]/g, '');
        console.log('cleanedSoTienStr:', cleanedSoTienStr);
        const soTien = parseInt(cleanedSoTienStr, 10);
        if (isNaN(soTien) || soTien <= 0) {
          response = `Số tiền không hợp lệ: "${soTienStr}". Vui lòng nhập số tiền lớn hơn 0 (ví dụ: 100000 hoặc 100,000).`;
          socket.emit('chatResponse', { message: response });
          return;
        }

        const loaiGiaoDich = loai === 'chi' ? 'Chi tiêu' : loai === 'thu' ? 'Thu nhập' : null;
        if (!loaiGiaoDich) {
          response = 'Loại giao dịch không hợp lệ. Sử dụng "chi" hoặc "thu".';
          socket.emit('chatResponse', { message: response });
          return;
        }

        let tenTaiKhoan = '';
        let tenDanhMuc = '';

        // Lấy danh sách danh mục và tài khoản
        let categories = [];
        try {
          console.log('Gửi yêu cầu GET /api/categories');
          const danhMucRes = await axios.get(`${baseUrl}/api/categories`, { headers });
          categories = danhMucRes.data;
          console.log('Danh mục:', categories.map(cat => `${cat.tenDanhMuc} (${cat.loai})`));
        } catch (error) {
          console.error('Lỗi GET /api/categories:', error.response?.data || error.message);
          response = 'Lỗi khi lấy danh sách danh mục. Vui lòng thử lại.';
          socket.emit('chatResponse', { message: response });
          return;
        }

        let accounts = [];
        try {
          console.log('Gửi yêu cầu GET /api/accounts/', userId);
          const accountRes = await axios.get(`${baseUrl}/api/accounts/${userId}`, { headers });
          accounts = accountRes.data;
          console.log('Tài khoản:', accounts.map(acc => acc.tenTaiKhoan));
        } catch (error) {
          console.error('Lỗi GET /api/accounts:', error.response?.data || error.message);
          response = 'Lỗi khi lấy danh sách tài khoản. Vui lòng thử lại.';
          socket.emit('chatResponse', { message: response });
          return;
        }

        // Chuẩn hóa rest
        const normalizedRest = rest.join(' ').replace(/\s+/g, ' ').trim().split(' ');
        console.log('normalizedRest:', normalizedRest);

        // Tìm danh mục trước
        for (let i = 1; i <= normalizedRest.length - 1; i++) {
          const possibleCategory = normalizedRest.slice(0, i).join(' ').toLowerCase();
          console.log('Thử possibleCategory:', possibleCategory);
          const matchedCategory = categories.find(cat =>
            cat.tenDanhMuc.toLowerCase() === possibleCategory && cat.loai === loaiGiaoDich
          );
          if (matchedCategory) {
            tenDanhMuc = matchedCategory.tenDanhMuc;
            tenTaiKhoan = normalizedRest.slice(i).join(' ').trim();
            break;
          }
        }

        console.log('tenDanhMuc:', tenDanhMuc);
        console.log('tenTaiKhoan:', tenTaiKhoan);

        if (!categories.length) {
          response = 'Chưa có danh mục nào trong hệ thống. Vui lòng thêm danh mục (ví dụ: thêm danh mục ăn uống chi).';
          socket.emit('chatResponse', { message: response });
          return;
        }

        if (!accounts.length) {
          response = 'Chưa có tài khoản nào trong hệ thống. Vui lòng thêm tài khoản trong trang Quản lý tài khoản.';
          socket.emit('chatResponse', { message: response });
          return;
        }

        if (!tenDanhMuc) {
          response = `Không tìm thấy danh mục phù hợp trong lệnh. Danh mục khả dụng cho ${loaiGiaoDich}: ${categories
            .filter(cat => cat.loai === loaiGiaoDich)
            .map(cat => cat.tenDanhMuc)
            .join(', ') || 'Không có danh mục nào.'}`;
          socket.emit('chatResponse', { message: response });
          return;
        }

        if (!tenTaiKhoan) {
          response = 'Không xác định được tài khoản. Ví dụ: thêm giao dịch chi 100000 ăn uống Vietcombank';
          socket.emit('chatResponse', { message: response });
          return;
        }

        // Tìm danh mục
        const danhMuc = categories.find(cat =>
          cat.tenDanhMuc.toLowerCase() === tenDanhMuc.toLowerCase() && cat.loai === loaiGiaoDich
        );
        if (!danhMuc) {
          response = `Không tìm thấy danh mục "${tenDanhMuc}" cho ${loaiGiaoDich}. Vui lòng thêm danh mục trong trang Quản lý danh mục.`;
          socket.emit('chatResponse', { message: response });
          return;
        }

        // Tìm tài khoản với tìm kiếm linh hoạt
        const account = accounts.find(acc =>
          acc.tenTaiKhoan.toLowerCase().includes(tenTaiKhoan.toLowerCase())
        );
        if (!account) {
          const similarAccounts = accounts.filter(acc =>
            acc.tenTaiKhoan.toLowerCase().includes(tenTaiKhoan.toLowerCase().slice(0, 3))
          );
          response = similarAccounts.length
            ? `Không tìm thấy tài khoản "${tenTaiKhoan}". Ý bạn là: ${similarAccounts.map(acc => acc.tenTaiKhoan).join(', ')}?`
            : `Không tìm thấy tài khoản "${tenTaiKhoan}". Vui lòng kiểm tra tên tài khoản hoặc thêm tài khoản mới.`;
          socket.emit('chatResponse', { message: response });
          return;
        }

        // Kiểm tra số dư
        if (loaiGiaoDich === 'Chi tiêu' && account.soDu < soTien) {
          response = `Số dư tài khoản "${account.tenTaiKhoan}" không đủ (${formatCurrency(account.soDu)}) để thực hiện chi tiêu ${formatCurrency(soTien)}.`;
          socket.emit('chatResponse', { message: response });
          return;
        }

        // Ánh xạ loaiTaiKhoan sang phuongThucThanhToan
        const paymentMethodMap = {
          'Tiền mặt': 'Tiền mặt',
          'Ngân hàng': 'Chuyển khoản',
          'Thẻ tín dụng': 'Thẻ tín dụng',
          'VNPay': 'Chuyển khoản', // Map VNPay to Chuyển khoản
        };
        const phuongThucThanhToan = paymentMethodMap[account.loaiTaiKhoan] || 'Chuyển khoản'; // Mặc định là Chuyển khoản

        // Tạo giao dịch
        const payload = {
          maNguoiDung: userId,
          maTaiKhoan: account._id,
          maDanhMuc: danhMuc._id,
          soTien,
          loai: loaiGiaoDich,
          phuongThucThanhToan,
          ngayGiaoDich: new Date().toISOString(),
        };
        console.log('Gửi yêu cầu POST /api/transactions:', payload);

        try {
          await axios.post(`${baseUrl}/api/transactions`, payload, { headers });
          response = `Đã thêm giao dịch ${loaiGiaoDich} ${formatCurrency(soTien)} cho danh mục "${tenDanhMuc}" bằng tài khoản "${account.tenTaiKhoan}".`;

          // Lấy số dư mới
          const updatedAccountRes = await axios.get(`${baseUrl}/api/accounts/${userId}`, { headers });
          const updatedAccount = updatedAccountRes.data.find(acc => acc._id === account._id);
          response += `\nSố dư mới của "${updatedAccount.tenTaiKhoan}": ${formatCurrency(updatedAccount.soDu)}.`;

          await createNotification(io, userId, `Giao dịch mới: ${loaiGiaoDich} ${formatCurrency(soTien)}`, 'Giao dịch');
        } catch (error) {
          console.error('Lỗi tạo giao dịch:', error.response?.data || error.message);
          if (error.response?.status === 400 && error.response.data.message.includes('Số dư tài khoản không đủ')) {
            response = `Số dư tài khoản "${account.tenTaiKhoan}" không đủ để thực hiện giao dịch này.`;
          } else if (error.response?.data?.error?.includes('phuongThucThanhToan')) {
            response = `Phương thức thanh toán không hợp lệ. Vui lòng kiểm tra loại tài khoản "${account.tenTaiKhoan}".`;
          } else {
            response = error.response?.data?.message || 'Lỗi khi tạo giao dịch. Vui lòng thử lại.';
          }
        }
      } else if (command.startsWith('thêm danh mục')) {
        const parts = command.replace('thêm danh mục', '').trim().split(' ');
        console.log('Parts:', parts);
        if (parts.length < 2) {
          response = 'Lệnh không hợp lệ. Ví dụ: thêm danh mục ăn uống chi';
          socket.emit('chatResponse', { message: response });
          return;
        }

        const loai = parts.pop();
        const tenDanhMuc = parts.join(' ');
        if (!tenDanhMuc.trim()) {
          response = 'Tên danh mục không được để trống. Ví dụ: thêm danh mục ăn uống chi';
          socket.emit('chatResponse', { message: response });
          return;
        }

        const loaiDanhMuc = loai === 'chi' ? 'Chi tiêu' : loai === 'thu' ? 'Thu nhập' : null;
        if (!loaiDanhMuc) {
          response = 'Loại danh mục không hợp lệ. Sử dụng "chi" hoặc "thu". Ví dụ: thêm danh mục ăn uống chi';
          socket.emit('chatResponse', { message: response });
          return;
        }

        const payload = { tenDanhMuc, loai: loaiDanhMuc, maNguoiDung: userId };
        console.log('Gửi yêu cầu POST /api/categories:', payload);
        try {
          const res = await axios.post(`${baseUrl}/api/categories`, payload, { headers });
          console.log('Phản hồi POST /api/categories:', res.data);
          response = `Đã thêm danh mục "${tenDanhMuc}" (${loaiDanhMuc}).`;
        } catch (error) {
          console.error('POST /api/categories error:', error.response?.data || error.message);
          if (error.response?.status === 400 && error.response.data.message.includes('Danh mục đã tồn tại')) {
            response = `Danh mục "${tenDanhMuc}" (${loaiDanhMuc}) đã tồn tại. Vui lòng chọn tên khác.`;
          } else if (error.response?.status === 500 && error.response.data.error.includes('maNguoiDung: Người dùng là bắt buộc')) {
            response = 'Lỗi: Không thể xác định người dùng. Vui lòng đăng nhập lại.';
          } else {
            response = error.response?.data?.message || 'Lỗi khi thêm danh mục. Vui lòng thử lại.';
          }
        }
      } else if (command === 'giúp đỡ') {
        response = `Các lệnh hỗ trợ:
- Kiểm tra số dư
- Thêm giao dịch <chi/thu> <số tiền> <danh mục> <tài khoản>
  Ví dụ: thêm giao dịch chi 100000 ăn uống Vietcombank
- Thêm danh mục <tên> <chi/thu>
  Ví dụ: thêm danh mục ăn uống chi
- Giúp đỡ`;
      } else {
        response = 'Lệnh không hợp lệ. Nhập "giúp đỡ" để xem danh sách lệnh.';
      }
    } catch (error) {
      console.error('Chat error:', error.response?.data || error.message);
      response = error.response?.data?.message || 'Lỗi khi xử lý lệnh. Vui lòng thử lại.';
      if (error.response?.status === 401) {
        response = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      }
    }

    console.log('Phản hồi chatbot:', response);
    socket.emit('chatResponse', { message: response });
  });

  socket.on('disconnect', () => {
    console.log('Người dùng ngắt kết nối:', socket.id);
  });
});

const createNotification = async (io, userId, message, type) => {
  try {
    const notification = {
      maNguoiDung: userId,
      noiDung: message,
      loai: type,
      trangThai: 'Chưa đọc',
      ngayTao: new Date(),
    };
    const res = await axios.post(`http://localhost:${process.env.PORT || 5000}/api/notifications`, notification);
    io.to(userId).emit('notification', res.data);
  } catch (error) {
    console.error('Lỗi tạo thông báo:', error);
  }
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));