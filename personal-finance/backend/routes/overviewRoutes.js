const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User, Account, Transaction, SavingGoal, Debt, Budget, Notification, Investment, Category } = require('../models');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { range = 'month' } = req.query; // Lấy tham số range từ query, mặc định là 'month'

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let startDate, endDate;
    switch (range.toLowerCase()) {
      case 'week':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDate.getDay()); // Bắt đầu từ thứ 2 tuần hiện tại
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'month':
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 1);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(currentMonth / 3);
        startDate = new Date(currentYear, currentQuarter * 3, 1);
        endDate = new Date(currentYear, (currentQuarter + 1) * 3, 1);
        break;
      case 'year':
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear + 1, 0, 1);
        break;
      default:
        return res.status(400).json({ message: 'Khoảng thời gian không hợp lệ' });
    }

    // Tài khoản
    const accounts = await Account.find({ maNguoiDung: userId, trangThai: true });
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.soDu || 0), 0);

    // Thu nhập và chi tiêu tháng hiện tại
    const transactions = await Transaction.find({
      maNguoiDung: userId,
      ngayGiaoDich: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    const totalIncome = transactions
      .filter(t => t.loai === 'Thu nhập')
      .reduce((sum, t) => sum + (t.soTien || 0), 0);
    const totalExpense = transactions
      .filter(t => t.loai === 'Chi tiêu')
      .reduce((sum, t) => sum + (t.soTien || 0), 0);

    // Mục tiêu tiết kiệm
    const savingGoals = await SavingGoal.find({ maNguoiDung: userId });
    const totalSavings = savingGoals.reduce((sum, sg) => sum + (sg.soTienHienTai || 0), 0);

    // Nợ
    const debts = await Debt.find({ maNguoiDung: userId });
    const totalDebt = debts.reduce((sum, debt) => sum + ((debt.soTien || 0) - (debt.soTienDaTra || 0)), 0);

    // Ngân sách
    const budgets = await Budget.find({
      maNguoiDung: userId,
      ngayBatDau: { $lte: endDate },
      ngayKetThuc: { $gte: startDate },
    }).populate('maDanhMuc');
    const budgetSummary = await Promise.all(budgets.map(async (budget) => {
      const spent = await Transaction.aggregate([
        {
          $match: {
            maNguoiDung: new mongoose.Types.ObjectId(userId),
            maDanhMuc: budget.maDanhMuc._id,
            loai: 'Chi tiêu',
            ngayGiaoDich: {
              $gte: budget.ngayBatDau,
              $lte: budget.ngayKetThuc,
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$soTien' } } },
      ]);
      return {
        tenDanhMuc: budget.maDanhMuc.tenDanhMuc,
        soTien: budget.soTien,
        spent: spent[0]?.total || 0,
        progress: budget.soTien > 0 ? ((spent[0]?.total || 0) / budget.soTien) * 100 : 0,
      };
    }));

    const notifications = await Notification.find({ maNguoiDung: userId, daDoc: false })
      .sort({ ngay: -1 })
      .limit(5);

    const investments = await Investment.find({ maNguoiDung: userId });
    const totalInvestment = investments.reduce((sum, inv) => sum + (inv.giaTri || 0), 0);
    const totalProfit = investments.reduce((sum, inv) => sum + (inv.loiNhuan || 0), 0);

    res.json({
      accounts: { list: accounts, totalBalance },
      transactions: { totalIncome, totalExpense },
      savingGoals: { list: savingGoals, totalSavings },
      debts: { list: debts, totalDebt },
      budgets: budgetSummary,
      notifications,
      investments: { list: investments, totalInvestment, totalProfit },
    });
  } catch (error) {
    console.error(`Get overview error for userId ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu tổng quan', error: error.message });
  }
});

module.exports = router;