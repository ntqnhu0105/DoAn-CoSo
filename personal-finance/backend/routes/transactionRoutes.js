const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Transaction, User, Account, Category } = require('../models');
const { generateReport } = require('../cron/updateReport'); // Import hàm generateReport

// Thêm giao dịch mới và cập nhật số dư tài khoản
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { maNguoiDung, maTaiKhoan, maDanhMuc, soTien, loai, ghiChu, phuongThucThanhToan, ngayGiaoDich } = req.body;

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

    // Cập nhật báo cáo sau khi giao dịch thành công
    const transactionDate = new Date(transaction.ngayGiaoDich);
    try {
      await generateReport(maNguoiDung, transactionDate.getMonth() + 1, transactionDate.getFullYear());
      console.log(`Đã cập nhật báo cáo cho tháng ${transactionDate.getMonth() + 1}/${transactionDate.getFullYear()}`);
    } catch (reportError) {
      console.error('Lỗi khi cập nhật báo cáo:', reportError);
      // Không trả về lỗi để tránh làm thất bại giao dịch chính
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
router.put('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { maNguoiDung, maTaiKhoan, maDanhMuc, soTien, loai, ghiChu, phuongThucThanhToan, ngayGiaoDich } = req.body;

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

    // Cập nhật báo cáo sau khi sửa giao dịch
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
      // Không trả về lỗi để tránh làm thất bại giao dịch chính
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
router.delete('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Giao dịch không tồn tại' });
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

    // Cập nhật báo cáo sau khi xóa giao dịch
    try {
      await generateReport(userId, transactionDate.getMonth() + 1, transactionDate.getFullYear());
      console.log(`Đã cập nhật báo cáo cho tháng ${transactionDate.getMonth() + 1}/${transactionDate.getFullYear()}`);
    } catch (reportError) {
      console.error('Lỗi khi cập nhật báo cáo:', reportError);
      // Không trả về lỗi để tránh làm thất bại giao dịch chính
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
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
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