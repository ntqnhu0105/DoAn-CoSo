const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Debt, User } = require('../models');

// Middleware kiểm tra userId hợp lệ
const verifyUser = async (req, res, next) => {
  const body = req.body || {};
  const query = req.query || {};
  const userId = body.userId || query.userId;

  console.log('verifyUser - Request:', {
    body: JSON.stringify(body),
    query: JSON.stringify(query),
    userId,
    method: req.method,
    url: req.originalUrl,
  });

  if (!userId) {
    return res.status(400).json({ message: 'Vui lòng cung cấp userId' });
  }

  try {
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'userId không hợp lệ' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Verify user error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Lỗi server khi kiểm tra người dùng', error: error.message });
  }
};

// Tạo khoản nợ mới
router.post('/', verifyUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, soTien, soTienDaTra, laiSuat, kyHan, ngayBatDau, ngayKetThuc, ghiChu, ngayTraTiepTheo } = req.body;

    console.log('Create debt - Request:', { userId, soTien, soTienDaTra, laiSuat, kyHan });

    if (!soTien || !ngayBatDau || !kyHan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Vui lòng cung cấp soTien, kyHan và ngayBatDau' });
    }
    if (soTien <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' });
    }
    if (soTienDaTra && soTienDaTra < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền đã trả không được âm' });
    }
    if (laiSuat && laiSuat < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Lãi suất không được âm' });
    }
    if (kyHan < 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Kì hạn phải lớn hơn 0' });
    }
    if (ngayKetThuc && new Date(ngayKetThuc) < new Date(ngayBatDau)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    }
    if (ngayTraTiepTheo && new Date(ngayTraTiepTheo) < new Date(ngayBatDau)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ngày trả tiếp theo phải sau ngày bắt đầu' });
    }
    const totalInterest = laiSuat ? (soTien * laiSuat * kyHan) / 100 : 0;
    if (soTienDaTra && soTienDaTra > soTien + totalInterest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền đã trả không được vượt quá tổng tiền gốc và lãi' });
    }

    const debt = new Debt({
      maNguoiDung: userId,
      soTien,
      soTienDaTra: soTienDaTra || 0,
      laiSuat: laiSuat || 0,
      kyHan,
      ngayBatDau,
      ngayKetThuc,
      ghiChu,
      ngayTraTiepTheo,
      trangThai: soTienDaTra && soTienDaTra >= soTien + totalInterest ? 'Đã thanh toán' : 'Hoạt động',
    });

    await debt.save({ session });
    await session.commitTransaction();
    session.endSession();

    console.log('Created debt:', debt);
    res.status(201).json({ message: 'Tạo khoản nợ thành công', debt });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create debt error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(400).json({ message: error.message || 'Lỗi khi tạo khoản nợ' });
  }
});

// Lấy danh sách khoản nợ của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching debts for userId:', userId);
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'userId không hợp lệ' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    const debts = await Debt.find({ maNguoiDung: userId }).sort({ ngayBatDau: -1 });
    console.log('Debts fetched:', debts);
    res.json(debts);
  } catch (error) {
    console.error('Get debts error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách khoản nợ', error: error.message });
  }
});

// Cập nhật khoản nợ
router.put('/:id', verifyUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { userId, soTien, soTienDaTra, laiSuat, kyHan, ngayBatDau, ngayKetThuc, ghiChu, ngayTraTiepTheo, trangThai } = req.body;

    console.log('Update debt - Request:', { id, userId, soTien, soTienDaTra });

    if (!mongoose.isValidObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'ID khoản nợ không hợp lệ' });
    }

    const debt = await Debt.findById(id).session(session);
    if (!debt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Khoản nợ không tồn tại' });
    }

    if (debt.maNguoiDung.toString() !== userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền sửa khoản nợ này' });
    }

    if (soTien && soTien <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' });
    }
    if (soTienDaTra && soTienDaTra < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền đã trả không được âm' });
    }
    if (laiSuat && laiSuat < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Lãi suất không được âm' });
    }
    if (kyHan && kyHan < 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Kì hạn phải lớn hơn 0' });
    }
    if (ngayKetThuc && ngayBatDau && new Date(ngayKetThuc) < new Date(ngayBatDau)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    }
    if (ngayTraTiepTheo && ngayBatDau && new Date(ngayTraTiepTheo) < new Date(ngayBatDau)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Ngày trả tiếp theo phải sau ngày bắt đầu' });
    }
    const newSoTien = soTien || debt.soTien;
    const newLaiSuat = laiSuat !== undefined ? laiSuat : debt.laiSuat;
    const newKyHan = kyHan || debt.kyHan;
    const totalInterest = newLaiSuat ? (newSoTien * newLaiSuat * newKyHan) / 100 : 0;
    if (soTienDaTra && soTienDaTra > newSoTien + totalInterest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền đã trả không được vượt quá tổng tiền gốc và lãi' });
    }

    if (soTien) debt.soTien = soTien;
    if (soTienDaTra !== undefined) debt.soTienDaTra = soTienDaTra;
    if (laiSuat !== undefined) debt.laiSuat = laiSuat;
    if (kyHan) debt.kyHan = kyHan;
    if (ngayBatDau) debt.ngayBatDau = ngayBatDau;
    if (ngayKetThuc) debt.ngayKetThuc = ngayKetThuc;
    if (ghiChu !== undefined) debt.ghiChu = ghiChu;
    if (ngayTraTiepTheo) debt.ngayTraTiepTheo = ngayTraTiepTheo;
    if (trangThai) {
      debt.trangThai = trangThai;
    } else {
      debt.trangThai = soTienDaTra !== undefined && soTienDaTra >= newSoTien + totalInterest ? 'Đã thanh toán' : debt.trangThai;
    }
    debt.updatedAt = new Date();

    await debt.save({ session });
    await session.commitTransaction();
    session.endSession();

    console.log('Updated debt:', debt);
    res.json({ message: 'Cập nhật khoản nợ thành công', debt });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update debt error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(400).json({ message: error.message || 'Lỗi khi cập nhật khoản nợ' });
  }
});

// Thêm lần trả nợ
router.post('/:id/pay', verifyUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { userId, soTienTra } = req.body;

    console.log('Pay debt - Request:', { id, userId, soTienTra });

    if (!mongoose.isValidObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'ID khoản nợ không hợp lệ' });
    }

    if (!soTienTra || soTienTra <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền trả phải lớn hơn 0' });
    }

    console.log('Pay debt - Fetching debt:', { debtId: id });
    const debt = await Debt.findById(id).session(session);
    if (!debt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Khoản nợ không tồn tại' });
    }

    console.log('Pay debt - Debt found:', {
      debtId: id,
      maNguoiDung: debt.maNguoiDung.toString(),
      userId,
      soTien: debt.soTien,
      soTienDaTra: debt.soTienDaTra,
      laiSuat: debt.laiSuat,
      kyHan: debt.kyHan,
    });

    if (debt.maNguoiDung.toString() !== userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật khoản nợ này' });
    }

    // Kiểm tra schema soTienDaTra
    if (debt.soTienDaTra === undefined) {
      console.warn('Pay debt - soTienDaTra is undefined, initializing to 0');
      debt.soTienDaTra = 0;
    }

    const totalInterest = debt.laiSuat ? (debt.soTien * debt.laiSuat * debt.kyHan) / 100 : 0;
    const totalAmount = debt.soTien + totalInterest;
    const newSoTienDaTra = debt.soTienDaTra + soTienTra;

    console.log('Pay debt - Calculation:', {
      totalInterest,
      totalAmount,
      currentSoTienDaTra: debt.soTienDaTra,
      soTienTra,
      newSoTienDaTra,
    });

    if (newSoTienDaTra > totalAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Số tiền đã trả không được vượt quá tổng tiền gốc và lãi' });
    }

    debt.soTienDaTra = newSoTienDaTra;
    debt.trangThai = newSoTienDaTra >= totalAmount ? 'Đã thanh toán' : debt.trangThai;
    debt.updatedAt = new Date();

    console.log('Pay debt - Before saving:', { soTienDaTra: debt.soTienDaTra });
    await debt.save({ session });

    console.log('Pay debt - After saving:', { soTienDaTra: debt.soTienDaTra });
    await session.commitTransaction();
    session.endSession();

    // Lấy lại debt từ database để xác nhận
    const updatedDebt = await Debt.findById(id);
    console.log('Paid debt:', updatedDebt);

    res.json({ message: 'Thêm lần trả nợ thành công', debt: updatedDebt });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Pay debt error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: error.message || 'Lỗi server khi thêm lần trả nợ' });
  }
});

// Xóa khoản nợ
router.delete('/:id', verifyUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const userId = req.query.userId;

    console.log('Delete debt - Request:', { id, userId });

    if (!mongoose.isValidObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'ID khoản nợ không hợp lệ' });
    }

    const debt = await Debt.findById(id).session(session);
    if (!debt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Khoản nợ không tồn tại' });
    }

    if (debt.maNguoiDung.toString() !== userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Bạn không có quyền xóa khoản nợ này' });
    }

    await debt.deleteOne({ session });
    await session.commitTransaction();
    session.endSession();

    console.log('Deleted debt:', id);
    res.json({ message: 'Xóa khoản nợ thành công' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Delete debt error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Lỗi server khi xóa khoản nợ', error: error.message });
  }
});

module.exports = router;