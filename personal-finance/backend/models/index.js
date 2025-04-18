const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema cho Người Dùng (NguoiDung)
const userSchema = new mongoose.Schema({
  tenDangNhap: {
    type: String,
    required: [true, 'Tên đăng nhập là bắt buộc'],
    unique: true,
    trim: true,
    maxlength: [50, 'Tên đăng nhập không được vượt quá 50 ký tự'],
  },
  matKhau: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Vui lòng nhập email hợp lệ'],
    maxlength: [100, 'Email không được vượt quá 100 ký tự'],
  },
  hoTen: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    maxlength: [100, 'Họ tên không được vượt quá 100 ký tự'],
  },
  soDienThoai: {
    type: String,
    trim: true,
    maxlength: [15, 'Số điện thoại không được vượt quá 15 ký tự'],
  },
  ngaySinh: {
    type: Date,
  },
  gioiTinh: {
    type: String,
    enum: ['Nam', 'Nữ', 'Khác'],
  },
  diaChi: {
    type: String,
    trim: true,
    maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự'],
  },
  anhDaiDien: {
    type: String,
    trim: true,
    maxlength: [200, 'Đường dẫn ảnh đại diện không được vượt quá 200 ký tự'],
  },
  ngayTao: {
    type: Date,
    default: Date.now,
  },
  trangThai: {
    type: Boolean,
    default: true, // true: Hoạt động, false: Không hoạt động
  },
});

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('matKhau')) return next();
  const salt = await bcrypt.genSalt(10);
  this.matKhau = await bcrypt.hash(this.matKhau, salt);
  next();
});

// Schema cho Tài Khoản (TaiKhoan)
const accountSchema = new mongoose.Schema({
  maNguoiDung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc'],
  },
  tenTaiKhoan: {
    type: String,
    required: [true, 'Tên tài khoản là bắt buộc'],
    trim: true,
    maxlength: [50, 'Tên tài khoản không được vượt quá 50 ký tự'],
  },
  soDu: {
    type: Number,
    default: 0,
    min: [0, 'Số dư không được âm'],
  },
  loaiTaiKhoan: {
    type: String,
    enum: ['Tiền mặt', 'Ngân hàng', 'Thẻ tín dụng', 'Ví điện tử'],
    required: [true, 'Loại tài khoản là bắt buộc'],
  },
  ngayTao: {
    type: Date,
    default: Date.now,
  },
  trangThai: {
    type: Boolean,
    default: true,
  },
});

// Schema cho Danh Mục (DanhMuc)
const categorySchema = new mongoose.Schema({
  tenDanhMuc: {
    type: String,
    required: [true, 'Tên danh mục là bắt buộc'],
    trim: true,
    maxlength: [50, 'Tên danh mục không được vượt quá 50 ký tự'],
  },
  loai: {
    type: String,
    enum: ['Thu nhập', 'Chi tiêu'],
    required: [true, 'Loại danh mục là bắt buộc'],
  },
  moTa: {
    type: String,
    trim: true,
    maxlength: [200, 'Mô tả không được vượt quá 200 ký tự'],
  },
  ngayTao: {
    type: Date,
    default: Date.now,
  },
  trangThai: {
    type: Boolean,
    default: true,
  },
});

// Schema cho Giao Dịch (GiaoDich)
const transactionSchema = new mongoose.Schema({
  maNguoiDung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc'],
  },
  maTaiKhoan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Tài khoản là bắt buộc'],
  },
  maDanhMuc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Danh mục là bắt buộc'],
  },
  loai: {
    type: String,
    enum: ['Thu nhập', 'Chi tiêu'],
    required: [true, 'Loại giao dịch là bắt buộc'],
  },
  soTien: {
    type: Number,
    required: [true, 'Số tiền là bắt buộc'],
    min: [0, 'Số tiền không được âm'],
  },
  ngayGiaoDich: {
    type: Date,
    default: Date.now,
  },
  ghiChu: {
    type: String,
    trim: true,
    maxlength: [200, 'Ghi chú không được vượt quá 200 ký tự'],
  },
  phuongThucThanhToan: {
    type: String,
    enum: ['Tiền mặt', 'Thẻ tín dụng', 'Chuyển khoản', 'Ví điện tử'],
  },
});

// Schema cho Ngân Sách (NganSach)
const budgetSchema = new mongoose.Schema({
  maNguoiDung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc'],
  },
  maDanhMuc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Danh mục là bắt buộc'],
  },
  soTien: {
    type: Number,
    required: [true, 'Số tiền là bắt buộc'],
    min: [0, 'Số tiền không được âm'],
  },
  ngayBatDau: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc'],
  },
  ngayKetThuc: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc'],
  },
  ghiChu: {
    type: String,
    trim: true,
    maxlength: [200, 'Ghi chú không được vượt quá 200 ký tự'],
  },
  trangThai: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

budgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
// Schema cho Báo Cáo (BaoCao)
const reportSchema = new mongoose.Schema({
  maNguoiDung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc'],
  },
  thang: {
    type: Number,
    required: [true, 'Tháng là bắt buộc'],
    min: [1, 'Tháng phải từ 1 đến 12'],
    max: [12, 'Tháng phải từ 1 đến 12'],
  },
  nam: {
    type: Number,
    required: [true, 'Năm là bắt buộc'],
  },
  tongThuNhap: {
    type: Number,
    default: 0,
    min: [0, 'Tổng thu nhập không được âm'],
  },
  tongChiTieu: {
    type: Number,
    default: 0,
    min: [0, 'Tổng chi tiêu không được âm'],
  },
  soTienTietKiem: {
    type: Number,
    default: 0,
  },
  ghiChu: {
    type: String,
    trim: true,
    maxlength: [200, 'Ghi chú không được vượt quá 200 ký tự'],
  },
  ngayTao: {
    type: Date,
    default: Date.now,
  },
});

// Schema cho Mục Tiêu Tiết Kiệm (MucTieuTietKiem)
const savingGoalSchema = new mongoose.Schema({
  maNguoiDung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc'],
  },
  tenMucTieu: {
    type: String,
    required: [true, 'Tên mục tiêu là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên mục tiêu không được vượt quá 100 ký tự'],
  },
  soTienMucTieu: {
    type: Number,
    required: [true, 'Số tiền mục tiêu là bắt buộc'],
    min: [0, 'Số tiền mục tiêu không được âm'],
  },
  soTienHienTai: {
    type: Number,
    default: 0,
    min: [0, 'Số tiền hiện tại không được âm'],
  },
  hanChot: {
    type: Date,
    required: [true, 'Hạn chót là bắt buộc PTT1'],
  },
  trangThai: {
    type: String,
    enum: ['Đang thực hiện', 'Hoàn thành', 'Thất bại'],
    default: 'Đang thực hiện',
  },
  ghiChu: {
    type: String,
    trim: true,
    maxlength: [200, 'Ghi chú không được vượt quá 200 ký tự'],
  },
  ngayTao: {
    type: Date,
    default: Date.now,
  },
});

// Schema cho Nợ/Khoản Vay (NoKhoanVay)
const debtSchema = new mongoose.Schema({
  maNguoiDung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc'],
  },
  soTien: {
    type: Number,
    required: [true, 'Số tiền là bắt buộc'],
    min: [0, 'Số tiền không được âm'],
  },
  soTienDaTra: {
    type: Number,
    default: 0,
    min: [0, 'Số tiền đã trả không được âm'],
  },
  laiSuat: {
    type: Number,
    min: [0, 'Lãi suất không được âm'],
  },
  kyHan: {
    type: Number,
    required: [true, 'Kì hạn là bắt buộc'],
    min: [1, 'Kì hạn phải lớn hơn 0'],
  },
  ngayBatDau: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc'],
  },
  ngayKetThuc: {
    type: Date,
  },
  trangThai: {
    type: String,
    enum: ['Hoạt động', 'Đã thanh toán', 'Quá hạn'],
    default: 'Hoạt động',
  },
  ghiChu: {
    type: String,
    trim: true,
    maxlength: [200, 'Ghi chú không được vượt quá 200 ký tự'],
  },
  ngayTraTiepTheo: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
debtSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});
// Schema cho Thông Báo (ThongBao)
const notificationSchema = new mongoose.Schema({
  maNguoiDung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc'],
  },
  noiDung: {
    type: String,
    required: [true, 'Nội dung thông báo là bắt buộc'],
    trim: true,
    maxlength: [200, 'Nội dung không được vượt quá 200 ký tự'],
  },
  ngay: {
    type: Date,
    default: Date.now,
  },
  daDoc: {
    type: Boolean,
    default: false,
  },
  loai: {
    type: String,
    enum: ['Nhắc nhở', 'Cảnh báo', 'Cập nhật'],
    required: [true, 'Loại thông báo là bắt buộc'],
  },
});

// Schema cho Đầu Tư (DauTu)
const investmentSchema = new mongoose.Schema({
  maNguoiDung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc'],
  },
  loai: {
    type: String,
    required: [true, 'Loại đầu tư là bắt buộc'],
    trim: true,
    maxlength: [50, 'Loại đầu tư không được vượt quá 50 ký tự'],
  },
  giaTri: {
    type: Number,
    required: [true, 'Giá trị đầu tư là bắt buộc'],
    min: [0, 'Giá trị đầu tư không được âm'],
  },
  loiNhuan: {
    type: Number,
    default: 0, 
  },
  ngay: {
    type: Date,
    default: Date.now,
  },
  ghiChu: {
    type: String,
    trim: true,
    maxlength: [200, 'Ghi chú không được vượt quá 200 ký tự'],
  },
  trangThai: {
    type: String,
    enum: ['Hoạt động', 'Đã bán', 'Đang chờ'],
    default: 'Hoạt động',
  },
},
  { timestamps: true }
);

// Tạo các chỉ số (Index)
transactionSchema.index({ maNguoiDung: 1, ngayGiaoDich: 1 });
accountSchema.index({ maNguoiDung: 1 });
budgetSchema.index({ maNguoiDung: 1, maDanhMuc: 1 });
reportSchema.index({ maNguoiDung: 1 });

// Tạo các model
const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);
const Category = mongoose.model('Category', categorySchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Budget = mongoose.model('Budget', budgetSchema);
const Report = mongoose.model('Report', reportSchema);
const SavingGoal = mongoose.model('SavingGoal', savingGoalSchema);
const Debt = mongoose.model('Debt', debtSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Investment = mongoose.model('Investment', investmentSchema);

module.exports = {
  User,
  Account,
  Category,
  Transaction,
  Budget,
  Report,
  SavingGoal,
  Debt,
  Notification,
  Investment,
};