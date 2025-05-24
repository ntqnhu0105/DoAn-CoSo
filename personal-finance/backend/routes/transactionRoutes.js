const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Transaction, User, Account, Category } = require('../models');
const jwt = require('jsonwebtoken');
const { generateReport } = require('../cron/updateReport');
const { createNotification } = require('./notificationRoutes');

// Middleware xác thực JWT
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('Không có token trong header Authorization');
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  }
  try {
    console.log('Verifying token:', token.slice(0, 10) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('Decoded JWT:', decoded);
    const user = await User.findById(decoded.userId).select('-matKhau');
    if (!user) {
      console.error('Người dùng không tồn tại:', decoded.userId);
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }
    console.log('User found:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT error:', error.message);
    return res.status(401).json({ message: 'Token không hợp lệ', error: error.message });
  }
};

// Thêm giao dịch mới và cập nhật số dư tài khoản
router.post('/', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { maNguoiDung, maTaiKhoan, maDanhMuc, soTien, loai, ghiChu, phuongThucThanhToan, ngayGiaoDich } = req.body;
    console.log('POST /transactions:', { maNguoiDung, maTaiKhoan, maDanhMuc, soTien, loai });

    if (maNguoiDung !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    if (!maNguoiDung || !maTaiKhoan || !maDanhMuc || !soTien || !loai) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ maNguoiDung, maTaiKhoan, maDanhMuc, soTien, loai' });
    }

    if (soTien <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' });
    }

    const user = await User.findById(maNguoiDung).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const account = await Account.findById(maTaiKhoan).session(session);
    if (!account || account.maNguoiDung.toString() !== maNguoiDung) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Tài khoản không tồn tại hoặc không thuộc về bạn' });
    }

    const category = await Category.findById(maDanhMuc).session(session);
    if (!category) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    if (loai === 'Chi tiêu') {
      if (account.soDu < soTien) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Số dư tài khoản không đủ' });
      }
      account.soDu -= soTien;
    } else if (loai === 'Thu nhập') {
      account.soDu += soTien;
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Loại giao dịch không hợp lệ' });
    }

    await account.save({ session });

    const transaction = new Transaction({
      maNguoiDung,
      maTaiKhoan,
      maDanhMuc,
      soTien,
      loai,
      ghiChu,
      phuongThucThanhToan,
      ngayGiaoDich: ngayGiaoDich ? new Date(ngayGiaoDich) : Date.now(),
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Gửi thông báo
    try {
      const io = req.app.get('io');
      await createNotification(io, maNguoiDung, `Giao dịch mới: ${loai} ${soTien} VND`, 'Giao dịch');
    } catch (notificationError) {
      console.error('Lỗi khi gửi thông báo:', notificationError);
    }

    // Cập nhật báo cáo
    const transactionDate = new Date(transaction.ngayGiaoDich);
    try {
      await generateReport(maNguoiDung, transactionDate.getMonth() + 1, transactionDate.getFullYear());
      console.log(`Đã cập nhật báo cáo cho tháng ${transactionDate.getMonth() + 1}/${transactionDate.getFullYear()}`);
    } catch (reportError) {
      console.error('Lỗi khi cập nhật báo cáo:', reportError);
    }

    res.status(201).json(transaction);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo giao dịch', error: error.message });
  }
});

// Sửa giao dịch và cập nhật số dư tài khoản
router.put('/:id', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { maNguoiDung, maTaiKhoan, maDanhMuc, soTien, loai, ghiChu, phuongThucThanhToan, ngayGiaoDich } = req.body;
    console.log('PUT /transactions/:id:', { id, maNguoiDung, maTaiKhoan, maDanhMuc, soTien, loai });

    if (maNguoiDung !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Giao dịch không tồn tại' });
    }

    if (transaction.maNguoiDung.toString() !== maNguoiDung) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền sửa giao dịch này' });
    }

    const user = await User.findById(maNguoiDung).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const newSoTien = soTien || transaction.soTien;
    if (newSoTien <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' });
    }

    const newAccount = maTaiKhoan ? await Account.findById(maTaiKhoan).session(session) : null;
    if (maTaiKhoan && (!newAccount || newAccount.maNguoiDung.toString() !== maNguoiDung)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Tài khoản không tồn tại hoặc không thuộc về bạn' });
    }

    const newCategory = maDanhMuc ? await Category.findById(maDanhMuc).session(session) : null;
    if (maDanhMuc && !newCategory) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    const oldAccount = await Account.findById(transaction.maTaiKhoan).session(session);
    if (!oldAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Tài khoản cũ không tồn tại' });
    }
    if (transaction.loai === 'Chi tiêu') {
      oldAccount.soDu += transaction.soTien;
    } else if (transaction.loai === 'Thu nhập') {
      oldAccount.soDu -= transaction.soTien;
    }
    await oldAccount.save({ session });

    const targetAccount = newAccount || oldAccount;
    const newLoai = loai || transaction.loai;
    if (newLoai === 'Chi tiêu') {
      if (targetAccount.soDu < newSoTien) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Số dư tài khoản không đủ để thực hiện chi tiêu' });
      }
      targetAccount.soDu -= newSoTien;
    } else if (newLoai === 'Thu nhập') {
      targetAccount.soDu += newSoTien;
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Loại giao dịch không hợp lệ' });
    }
    await targetAccount.save({ session });

    const oldDate = new Date(transaction.ngayGiaoDich);
    transaction.maTaiKhoan = maTaiKhoan || transaction.maTaiKhoan;
    transaction.maDanhMuc = maDanhMuc || transaction.maDanhMuc;
    transaction.soTien = newSoTien;
    transaction.loai = newLoai;
    transaction.ghiChu = ghiChu !== undefined ? ghiChu : transaction.ghiChu;
    transaction.phuongThucThanhToan = phuongThucThanhToan !== undefined ? phuongThucThanhToan : transaction.phuongThucThanhToan;
    transaction.ngayGiaoDich = ngayGiaoDich ? new Date(ngayGiaoDich) : transaction.ngayGiaoDich;

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Gửi thông báo
    try {
      const io = req.app.get('io');
      await createNotification(io, maNguoiDung, `Giao dịch đã sửa: ${newLoai} ${newSoTien} VND`, 'Giao dịch');
    } catch (notificationError) {
      console.error('Lỗi khi gửi thông báo:', notificationError);
    }

    // Cập nhật báo cáo
    const newDate = new Date(transaction.ngayGiaoDich);
    try {
      await generateReport(maNguoiDung, oldDate.getMonth() + 1, oldDate.getFullYear());
      if (oldDate.getMonth() !== newDate.getMonth() || oldDate.getFullYear() !== newDate.getFullYear()) {
        await generateReport(maNguoiDung, newDate.getMonth() + 1, newDate.getFullYear());
      }
      console.log(`Đã cập nhật báo cáo cho tháng ${oldDate.getMonth() + 1}/${oldDate.getFullYear()}` +
                  (oldDate.getMonth() !== newDate.getMonth() || oldDate.getFullYear() !== newDate.getFullYear()
                    ? ` và ${newDate.getMonth() + 1}/${newDate.getFullYear()}`
                    : ''));
    } catch (reportError) {
      console.error('Lỗi khi cập nhật báo cáo:', reportError);
    }

    res.json(transaction);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật giao dịch', error: error.message });
  }
});

// Xóa giao dịch và hoàn tác số dư tài khoản
router.delete('/:id', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    console.log('DELETE /transactions/:id:', id);
    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Giao dịch không tồn tại' });
    }

    if (transaction.maNguoiDung.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const account = await Account.findById(transaction.maTaiKhoan).session(session);
    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }
    if (transaction.loai === 'Chi tiêu') {
      account.soDu += transaction.soTien;
    } else if (transaction.loai === 'Thu nhập') {
      account.soDu -= transaction.soTien;
    }
    await account.save({ session });

    const transactionDate = new Date(transaction.ngayGiaoDich);
    const userId = transaction.maNguoiDung;

    await transaction.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    // Gửi thông báo
    try {
      const io = req.app.get('io');
      await createNotification(io, userId.toString(), `Giao dịch đã xóa: ${transaction.loai} ${transaction.soTien} VND`, 'Giao dịch');
    } catch (notificationError) {
      console.error('Lỗi khi gửi thông báo:', notificationError);
    }

    // Cập nhật báo cáo
    try {
      await generateReport(userId, transactionDate.getMonth() + 1, transactionDate.getFullYear());
      console.log(`Đã cập nhật báo cáo cho tháng ${transactionDate.getMonth() + 1}/${transactionDate.getFullYear()}`);
    } catch (reportError) {
      console.error('Lỗi khi cập nhật báo cáo:', reportError);
    }

    console.log('Transaction deleted:', id);
    console.log('Updated account balance:', account.soDu);
    res.json({ message: 'Giao dịch đã được xóa' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa giao dịch', error: error.message });
  }
});

// Lấy danh sách giao dịch
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('GET /transactions/:userId:', userId);
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const transactions = await Transaction.find({ maNguoiDung: userId })
      .populate('maTaiKhoan', 'tenTaiKhoan loaiTaiKhoan soDu')
      .populate('maDanhMuc', 'tenDanhMuc loai');
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách giao dịch', error: error.message });
  }
});

module.exports = router;