import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bar, Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import {
  HomeIcon,
  BanknotesIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ChartPieIcon,
  BellIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate('/');
      toast.error('Vui lòng đăng nhập để xem tổng quan');
    } else {
      console.log('API URL:', process.env.REACT_APP_API_URL);
      console.log('User ID:', userId);
    }
  }, [userId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching overview for userId:', userId);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/overview/${userId}`);
        console.log('Overview fetched:', res.data);
        setData(res.data);
        if (!res.data.accounts.list.length && !res.data.savingGoals.list.length && !res.data.debts.list.length) {
          setError('Chưa có dữ liệu tài chính. Vui lòng thêm tài khoản, mục tiêu tiết kiệm hoặc giao dịch.');
          toast.info('Chưa có dữ liệu tài chính.');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || `Lỗi khi tải dữ liệu tổng quan: ${err.message}`;
        console.error('Fetch overview error:', err.response || err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  const incomeExpenseChart = () => {
    if (!data) return { labels: [], datasets: [] };
    return {
      labels: ['Thu nhập', 'Chi tiêu'],
      datasets: [
        {
          label: 'Số tiền (VNĐ)',
          data: [data.transactions.totalIncome, data.transactions.totalExpense],
          backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)'],
          borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
          borderWidth: 1,
        },
      ],
    };
  };

  const budgetChart = () => {
    if (!data || !data.budgets.length) return { labels: [], datasets: [] };
    return {
      labels: data.budgets.map(b => b.tenDanhMuc),
      datasets: [
        {
          data: data.budgets.map(b => b.spent),
          backgroundColor: [
            'rgba(16, 185, 129, 0.6)',
            'rgba(59, 130, 246, 0.6)',
            'rgba(239, 68, 68, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(139, 92, 246, 0.6)',
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(139, 92, 246, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg h-64">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-50 to-emerald-100">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        closeButton={true}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <HomeIcon className="h-10 w-10 text-emerald-600" />
            <h1 className="text-4xl font-bold text-gray-900">Tổng quan Tài chính</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-md"
          >
            <span>Dashboard Giao dịch</span>
          </button>
        </div>

        {/* Tài sản */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tài sản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tài khoản */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <BanknotesIcon className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-800">Tài khoản</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-600 mb-4">{data.accounts.totalBalance.toLocaleString()} VNĐ</p>
              <div className="space-y-3">
                {data.accounts.list.map((account) => (
                  <div key={account._id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{account.tenTaiKhoan}</p>
                      <p className="text-sm text-gray-500">{account.loaiTaiKhoan}</p>
                    </div>
                    <p className="text-emerald-600 font-medium">{account.soDu.toLocaleString()} VNĐ</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mục tiêu tiết kiệm */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-800">Mục tiêu tiết kiệm</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-600 mb-4">{data.savingGoals.totalSavings.toLocaleString()} VNĐ</p>
              {data.savingGoals.list.length === 0 ? (
                <p className="text-gray-500">Chưa có mục tiêu tiết kiệm nào.</p>
              ) : (
                <div className="space-y-4">
                  {data.savingGoals.list.map((sg) => (
                    <div key={sg._id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-800">{sg.tenMucTieu}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full"
                          style={{ width: `${Math.min((sg.soTienHienTai / sg.soTienMucTieu) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {sg.soTienHienTai.toLocaleString()} / {sg.soTienMucTieu.toLocaleString()} VNĐ
                        ({((sg.soTienHienTai / sg.soTienMucTieu) * 100).toFixed(2)}%)
                      </p>
                      <p className="text-sm text-gray-500">Hạn chót: {new Date(sg.hanChot).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Đầu tư */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <ChartBarIcon className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-800">Đầu tư</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-600 mb-4">
                {data.investments.totalInvestment.toLocaleString()} VNĐ
                <span className="text-sm text-gray-500 ml-2">
                  (Lợi nhuận: {data.investments.totalProfit.toLocaleString()} VNĐ)
                </span>
              </p>
              {data.investments.list.length === 0 ? (
                <p className="text-gray-500">Chưa có khoản đầu tư nào.</p>
              ) : (
                <div className="space-y-3">
                  {data.investments.list.map((inv) => (
                    <div key={inv._id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-800">{inv.loai}</p>
                      <p className="text-sm text-gray-600">{inv.giaTri.toLocaleString()} VNĐ</p>
                      <p className="text-sm text-emerald-600">Lợi nhuận: {inv.loiNhuan.toLocaleString()} VNĐ</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thu nhập & Chi tiêu */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Thu nhập & Chi tiêu</h2>
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <ArrowUpCircleIcon className="h-6 w-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-800">Thu nhập & Chi tiêu</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</p>
            <div className="flex space-x-8 mb-6">
              <div>
                <p className="text-emerald-600 flex items-center text-lg font-medium">
                  <ArrowUpCircleIcon className="h-5 w-5 mr-2" />
                  {data.transactions.totalIncome.toLocaleString()} VNĐ
                </p>
                <p className="text-sm text-gray-500">Thu nhập</p>
              </div>
              <div>
                <p className="text-red-600 flex items-center text-lg font-medium">
                  <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
                  {data.transactions.totalExpense.toLocaleString()} VNĐ
                </p>
                <p className="text-sm text-gray-500">Chi tiêu</p>
              </div>
            </div>
            <div className="h-64">
              <Bar
                data={incomeExpenseChart()}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Số tiền (VNĐ)' } },
                    x: { title: { display: true, text: 'Loại' } },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)', cornerRadius: 8 },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Nợ và Ngân sách */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Nợ và Ngân sách</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nợ */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <CreditCardIcon className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-800">Nợ/Khoản vay</h3>
              </div>
              <p className="text-2xl font-bold text-red-600 mb-4">{data.debts.totalDebt.toLocaleString()} VNĐ</p>
              {data.debts.list.length === 0 ? (
                <p className="text-gray-500">Chưa có khoản nợ nào.</p>
              ) : (
                <div className="space-y-4">
                  {data.debts.list.map((debt) => (
                    <div key={debt._id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-800">{debt.ghiChu || 'Nợ'}</p>
                      <p className="text-sm text-gray-600">{(debt.soTien - debt.soTienDaTra).toLocaleString()} VNĐ</p>
                      <p className="text-sm text-gray-500">
                        Hạn: {debt.ngayKetThuc ? new Date(debt.ngayKetThuc).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ngân sách */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <ChartPieIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Ngân sách</h3>
              </div>
              {data.budgets.length === 0 ? (
                <p className="text-gray-500">Chưa có ngân sách nào.</p>
              ) : (
                <>
                  <div className="h-64 mb-6">
                    <Pie
                      data={budgetChart()}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { font: { size: 12 } } },
                          tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)', cornerRadius: 8 },
                        },
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    {data.budgets.map((budget, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-800">{budget.tenDanhMuc}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${Math.min(budget.progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {budget.spent.toLocaleString()} / {budget.soTien.toLocaleString()} VNĐ
                          ({budget.progress.toFixed(2)}%)
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;