import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import {
  HomeIcon,
  BanknotesIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ChartPieIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

// Đăng ký ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// API URL với fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Sub-component: AccountCard
const AccountCard = ({ accounts, loading, navigate }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
    <div className="flex items-center space-x-3 mb-4">
      <BanknotesIcon className="h-6 w-6 text-emerald-600" />
      <h3 className="text-lg font-semibold text-gray-800">Tài khoản</h3>
    </div>
    {loading ? (
      <div className="animate-pulse space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    ) : (
      <>
        <p className="text-2xl font-bold text-emerald-600 mb-4">
          {formatCurrency(accounts.totalBalance)}
        </p>
        {accounts.list.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">Chưa có tài khoản nào.</p>
            <button
              onClick={() => navigate('/accounts/new')}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-full"
            >
              Thêm tài khoản
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.list.map((account) => (
              <div
                key={account._id}
                className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">{account.tenTaiKhoan}</p>
                  <p className="text-sm text-gray-500">{account.loaiTaiKhoan}</p>
                </div>
                <p className="text-emerald-600 font-medium">{formatCurrency(account.soDu)}</p>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
);

// Sub-component: SavingGoalCard
const SavingGoalCard = ({ savingGoals, loading, navigate }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
    <div className="flex items-center space-x-3 mb-4">
      <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
      <h3 className="text-lg font-semibold text-gray-800">Mục tiêu tiết kiệm</h3>
    </div>
    {loading ? (
      <div className="animate-pulse space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    ) : (
      <>
        <p className="text-2xl font-bold text-blue-600 mb-4">
          {formatCurrency(savingGoals.totalSavings)}
        </p>
        {savingGoals.list.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">Chưa có mục tiêu tiết kiệm nào.</p>
            <button
              onClick={() => navigate('/saving-goals/new')}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-full"
            >
              Thêm mục tiêu tiết kiệm
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savingGoals.list.map((sg) => (
              <div
                key={sg._id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between">
                  <p className="font-medium text-gray-800">{sg.tenMucTieu}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(sg.hanChot).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min((sg.soTienHienTai / sg.soTienMucTieu) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <p className="text-gray-600">
                    {((sg.soTienHienTai / sg.soTienMucTieu) * 100).toFixed(0)}%
                  </p>
                  <p className="text-gray-600">
                    {formatCurrency(sg.soTienHienTai)} / {formatCurrency(sg.soTienMucTieu)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
);

// Sub-component: InvestmentCard
const InvestmentCard = ({ investments, loading, navigate }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
    <div className="flex items-center space-x-3 mb-4">
      <ChartBarIcon className="h-6 w-6 text-purple-600" />
      <h3 className="text-lg font-semibold text-gray-800">Đầu tư</h3>
    </div>
    {loading ? (
      <div className="animate-pulse space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    ) : (
      <>
        <div className="flex items-end space-x-2 mb-4">
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(investments.totalInvestment)}
          </p>
          <p className="text-sm text-emerald-600 pb-0.5">
            +{formatCurrency(investments.totalProfit)}
          </p>
        </div>
        {investments.list.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">Chưa có khoản đầu tư nào.</p>
            <button
              onClick={() => navigate('/investments/new')}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-full"
            >
              Thêm khoản đầu tư
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {investments.list.map((inv) => (
              <div
                key={inv._id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between">
                  <p className="font-medium text-gray-800">{inv.loai}</p>
                  <p className="font-medium text-purple-600">{formatCurrency(inv.giaTri)}</p>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">Lợi nhuận</p>
                  <p className="text-sm text-emerald-600">+{formatCurrency(inv.loiNhuan)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
);

// Sub-component: IncomeExpenseChart
const IncomeExpenseChart = ({ transactions }) => {
  const chartData = useMemo(() => {
    if (!transactions) return { labels: [], datasets: [] };
    return {
      labels: ['Thu nhập', 'Chi tiêu'],
      datasets: [
        {
          label: 'Số tiền (VNĐ)',
          data: [transactions.totalIncome, transactions.totalExpense],
          backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)'],
          borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
          borderWidth: 1,
        },
      ],
    };
  }, [transactions]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center space-x-3 mb-4">
        <ChartBarIcon className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="flex items-center p-4 bg-emerald-50 rounded-xl">
            <div className="bg-emerald-100 p-3 rounded-full mr-4">
              <ArrowUpCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Thu nhập</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(transactions.totalIncome)}
              </p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-red-50 rounded-xl">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <ArrowDownCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Chi tiêu</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(transactions.totalExpense)}
              </p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-blue-50 rounded-xl">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Chênh lệch</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(transactions.totalIncome - transactions.totalExpense)}
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-2 h-80">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { display: true, color: 'rgba(0, 0, 0, 0.05)' },
                  title: { display: true, text: 'Số tiền (VNĐ)' },
                },
                x: { grid: { display: false }, title: { display: true, text: 'Loại' } },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  cornerRadius: 8,
                  padding: 12,
                  titleFont: { size: 14, weight: 'bold' },
                  bodyFont: { size: 13 },
                  callbacks: {
                    label: (context) => formatCurrency(context.raw),
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Sub-component: DebtCard
const DebtCard = ({ debts, loading, navigate }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
    <div className="flex items-center space-x-3 mb-4">
      <CreditCardIcon className="h-6 w-6 text-red-600" />
      <h3 className="text-lg font-semibold text-gray-800">Nợ/Khoản vay</h3>
    </div>
    {loading ? (
      <div className="animate-pulse space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    ) : (
      <>
        <p className="text-2xl font-bold text-red-600 mb-4">{formatCurrency(debts.totalDebt)}</p>
        {debts.list.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">Chưa có khoản nợ nào.</p>
            <button
              onClick={() => navigate('/debts/new')}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-full"
            >
              Thêm khoản nợ
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {debts.list.map((debt) => (
              <div
                key={debt._id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between">
                  <p className="font-medium text-gray-800">{debt.ghiChu || 'Nợ'}</p>
                  <p className="font-medium text-red-600">
                    {formatCurrency(debt.soTien - debt.soTienDaTra)}
                  </p>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">Đã trả</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(debt.soTienDaTra)} / {formatCurrency(debt.soTien)}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-red-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min((debt.soTienDaTra / debt.soTien) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Hạn: {debt.ngayKetThuc ? new Date(debt.ngayKetThuc).toLocaleDateString('vi-VN') : '-'}
                </p>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
);

// Sub-component: BudgetCard
const BudgetCard = ({ budgets, navigate }) => {
  const chartData = useMemo(() => {
    if (!budgets || !budgets.length) return { labels: [], datasets: [] };
    return {
      labels: budgets.map((b) => b.tenDanhMuc),
      datasets: [
        {
          data: budgets.map((b) => b.spent),
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
  }, [budgets]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center space-x-3 mb-4">
        <ChartPieIcon className="h-6 w-6 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-800">Ngân sách</h3>
      </div>
      {budgets.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500">Chưa có ngân sách nào.</p>
          <button
            onClick={() => navigate('/budgets/new')}
            className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-full"
          >
            Thêm ngân sách
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <Pie
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { font: { size: 11 }, boxWidth: 15, padding: 15 },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    cornerRadius: 8,
                    callbacks: {
                      label: (context) => {
                        const label = context.label || '';
                        const value = context.raw;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {budgets.map((budget, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between">
                  <p className="font-medium text-gray-800">{budget.tenDanhMuc}</p>
                  <p className="font-medium text-orange-600">
                    {((budget.spent / budget.soTien) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full ${
                      budget.progress > 90
                        ? 'bg-red-600'
                        : budget.progress > 70
                        ? 'bg-amber-600'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(budget.progress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.soTien)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Overview Component
const Overview = () => {
  const [data, setData] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingSavingGoals, setLoadingSavingGoals] = useState(true);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [loadingDebts, setLoadingDebts] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const navigate = useNavigate();

  // Sanitize userId
  const userId = localStorage.getItem('userId')?.replace(/[^\w-]/g, '');

  useEffect(() => {
    if (!userId) {
      navigate('/');
      toast.error('Vui lòng đăng nhập để xem tổng quan', {
        position: 'top-right',
        autoClose: 3000,
      });
    } else {
      console.log('API URL:', API_URL);
      console.log('User ID:', userId);
    }
  }, [userId, navigate]);

  // Debounced fetch data
  const fetchData = debounce(async () => {
    if (!userId) return;

    try {
      setLoadingAccounts(true);
      setLoadingSavingGoals(true);
      setLoadingInvestments(true);
      setLoadingDebts(true);

      const res = await axios.get(`${API_URL}/overview/${userId}?range=${timeRange}`);
      console.log('Overview fetched:', res.data);
      setData(res.data);

      if (
        !res.data.accounts.list.length &&
        !res.data.savingGoals.list.length &&
        !res.data.debts.list.length
      ) {
        setError(
          'Chưa có dữ liệu tài chính. Vui lòng thêm tài khoản, mục tiêu tiết kiệm hoặc giao dịch.'
        );
        toast.info('Chưa có dữ liệu tài chính.');
      }
    } catch (err) {
      let errorMessage = 'Lỗi khi tải dữ liệu tổng quan.';
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
            navigate('/');
            break;
          case 404:
            errorMessage = 'Không tìm thấy dữ liệu tài chính.';
            break;
          default:
            errorMessage = err.response.data.message || 'Lỗi server.';
        }
      }
      console.error('Fetch overview error:', err.response || err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingAccounts(false);
      setLoadingSavingGoals(false);
      setLoadingInvestments(false);
      setLoadingDebts(false);
    }
  }, 300);

  useEffect(() => {
    fetchData();
    return () => fetchData.cancel();
  }, [userId, timeRange]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-50 to-emerald-100">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <p className="text-red-600 text-xl">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700"
          >
            Thử lại
          </button>
        </div>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-emerald-600 p-3 rounded-full">
              <HomeIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tổng quan Tài chính</h1>
              <p className="text-gray-500 text-sm mt-1">
                {new Date().toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="p-2 border rounded-lg bg-white text-gray-700"
            >
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng tài sản</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {data ? formatCurrency(data.accounts.totalBalance) : '0 VNĐ'}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <BanknotesIcon className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng thu nhập</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {data ? formatCurrency(data.transactions.totalIncome) : '0 VNĐ'}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ArrowUpCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {data ? formatCurrency(data.transactions.totalExpense) : '0 VNĐ'}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <ArrowDownCircleIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng đầu tư</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {data ? formatCurrency(data.investments.totalInvestment) : '0 VNĐ'}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tài sản */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-indigo-100 p-1.5 rounded-md mr-2">
              <CurrencyDollarIcon className="h-5 w-5 text-indigo-600" />
            </span>
            Tài sản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AccountCard
              accounts={data?.accounts || { totalBalance: 0, list: [] }}
              loading={loadingAccounts}
              navigate={navigate}
            />
            <SavingGoalCard
              savingGoals={data?.savingGoals || { totalSavings: 0, list: [] }}
              loading={loadingSavingGoals}
              navigate={navigate}
            />
            <InvestmentCard
              investments={data?.investments || { totalInvestment: 0, totalProfit: 0, list: [] }}
              loading={loadingInvestments}
              navigate={navigate}
            />
          </div>
        </div>

        {/* Thu nhập & Chi tiêu */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-blue-100 p-1.5 rounded-md mr-2">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </span>
            Thu nhập & Chi tiêu
          </h2>
          <IncomeExpenseChart
            transactions={data?.transactions || { totalIncome: 0, totalExpense: 0 }}
          />
        </div>

        {/* Nợ và Ngân sách */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-orange-100 p-1.5 rounded-md mr-2">
              <ChartPieIcon className="h-5 w-5 text-orange-600" />
            </span>
            Nợ và Ngân sách
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DebtCard
              debts={data?.debts || { totalDebt: 0, list: [] }}
              loading={loadingDebts}
              navigate={navigate}
            />
            <BudgetCard budgets={data?.budgets || []} navigate={navigate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;