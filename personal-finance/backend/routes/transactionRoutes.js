const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Transaction, User, Account, Category } = require('../models');

// Thêm giao dịch mới và cập nhật số dư tài khoản
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log('Received transaction payload:', req.body);
    const { maNguoiDung, maTaiKhoan, maDanhMuc, soTien, loai, ghiChu, phuongThucThanhToan } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!maNguoiDung || !maTaiKhoan || !maDanhMuc || !soTien || !loai) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ maNguoiDung, maTaiKhoan, maDanhMuc, soTien, loai' });
    }

    // Kiểm tra người dùng
    const user = await User.findById(maNguoiDung).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra tài khoản
    const account = await Account.findById(maTaiKhoan).session(session);
    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    // Kiểm tra danh mục
    const category = await Category.findById(maDanhMuc).session(session);
    if (!category) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    // Cập nhật số dư tài khoản
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

    // Lưu tài khoản
    await account.save({ session });

    // Tạo giao dịch
    const transaction = new Transaction({
      maNguoiDung,
      maTaiKhoan,
      maDanhMuc,
      soTien,
      loai,
      ghiChu,
      phuongThucThanhToan,
    });

    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log('Transaction created:', transaction);
    console.log('Updated account balance:', account.soDu);
    res.status(201).json(transaction);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Sửa giao dịch và cập nhật số dư tài khoản
router.put('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { maTaiKhoan, maDanhMuc, soTien, loai, ghiChu, phuongThucThanhToan } = req.body;

    // Kiểm tra giao dịch hiện tại
    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Giao dịch không tồn tại' });
    }

    // Kiểm tra tài khoản mới (nếu thay đổi)
    const newAccount = maTaiKhoan ? await Account.findById(maTaiKhoan).session(session) : null;
    if (maTaiKhoan && !newAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    // Kiểm tra danh mục mới (nếu thay đổi)
    const newCategory = maDanhMuc ? await Category.findById(maDanhMuc).session(session) : null;
    if (maDanhMuc && !newCategory) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    // Hoàn tác số dư tài khoản cũ
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

    // Cập nhật số dư tài khoản mới
    const targetAccount = newAccount || oldAccount;
    const newLoai = loai || transaction.loai;
    const newSoTien = soTien || transaction.soTien;
    if (newLoai === 'Chi tiêu') {
      if (targetAccount.soDu < newSoTien) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Số dư tài khoản không đủ' });
      }
      targetAccount.soDu -= newSoTien;
    } else if (newLoai === 'Thu nhập') {
      targetAccount.soDu += newSoTien;
    }
    await targetAccount.save({ session });

    // Cập nhật giao dịch
    transaction.maTaiKhoan = maTaiKhoan || transaction.maTaiKhoan;
    transaction.maDanhMuc = maDanhMuc || transaction.maDanhMuc;
    transaction.soTien = newSoTien;
    transaction.loai = newLoai;
    transaction.ghiChu = ghiChu !== undefined ? ghiChu : transaction.ghiChu;
    transaction.phuongThucThanhToan = phuongThucThanhToan !== undefined ? phuongThucThanhToan : transaction.phuongThucThanhToan;

    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log('Transaction updated:', transaction);
    console.log('Updated account balance:', targetAccount.soDu);
    res.json(transaction);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Xóa giao dịch và hoàn tác số dư tài khoản
router.delete('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    // Kiểm tra giao dịch
    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Giao dịch không tồn tại' });
    }

    // Hoàn tác số dư tài khoản
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

    // Xóa giao dịch
    await transaction.deleteOne({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log('Transaction deleted:', id);
    console.log('Updated account balance:', account.soDu);
    res.json({ message: 'Giao dịch đã được xóa' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;