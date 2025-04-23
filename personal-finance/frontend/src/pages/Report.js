import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FunnelIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const Report = () => {
  const [reports, setReports] = useState([]);
  const [filterYear, setFilterYear] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate('/');
      toast.error('Vui lòng đăng nhập để xem báo cáo');
    } else {
      console.log('API URL:', process.env.REACT_APP_API_URL);
      console.log('User ID:', userId);
    }
  }, [userId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Đang lấy báo cáo cho userId:', userId);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/reports/${userId}`);
        console.log('Báo cáo đã lấy:', res.data);
        setReports(res.data);
        if (res.data.length === 0) {
          setError('Chưa có báo cáo. Vui lòng thêm giao dịch hoặc tạo báo cáo thủ công.');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || `Lỗi khi tải dữ liệu báo cáo: ${err.message}`;
        console.error('Lỗi khi lấy báo cáo:', err.response || err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/reports/generate/${userId}`, {
        month: lastMonth.getMonth() + 1,
        year: lastMonth.getFullYear(),
      });
      toast.success('Báo cáo đã được tạo. Đang tải lại...');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/reports/${userId}`);
      setReports(res.data);
      setError('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo báo cáo');
    } finally {
      setGenerating(false);
    }
  };

  const filteredReports = filterYear === 'Tất cả' ? reports : reports.filter((rep) => rep.nam === parseInt(filterYear));

  const totalIncome = filteredReports.reduce((sum, rep) => sum + (rep.tongThuNhap || 0), 0);
  const totalExpense = filteredReports.reduce((sum, rep) => sum + (rep.tongChiTieu || 0), 0);
  const totalSavings = filteredReports.reduce((sum, rep) => sum + (rep.soTienTietKiem || 0), 0);

  const chartData = () => {
    const selectedYear = filterYear === 'Tất cả' ? new Date().getFullYear() : parseInt(filterYear);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const incomeData = months.map((month) => {
      const report = reports.find((rep) => rep.thang === month && rep.nam === selectedYear);
      return report ? report.tongThuNhap : 0;
    });
    const expenseData = months.map((month) => {
      const report = reports.find((rep) => rep.thang === month && rep.nam === selectedYear);
      return report ? report.tongChiTieu : 0;
    });
    const savingsData = months.map((month) => {
      const report = reports.find((rep) => rep.thang === month && rep.nam === selectedYear);
      return report ? report.soTienTietKiem : 0;
    });

    return {
      labels: months.map((m) => `Tháng ${m}`),
      datasets: [
        {
          label: 'Thu nhập (VNĐ)',
          data: incomeData,
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Chi tiêu (VNĐ)',
          data: expenseData,
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Tiết kiệm (VNĐ)',
          data: savingsData,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          tension: 0.4,
          fill: false,
        },
      ],
    };
  };

  const uniqueYears = [...new Set(reports.map((rep) => rep.nam))].sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-emerald-100 p-4 sm:p-6">
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
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <FunnelIcon className="h-8 w-8 text-emerald-600" />
          <h2 className="text-3xl font-bold text-gray-800">Báo cáo Tài chính</h2>
        </div>

        {error && (
          <div className="bg-red-100 p-4 rounded-lg mb-6 flex items-center space-x-2">
            <span className="text-red-600">{error}</span>
          </div>
        )}

        {/* Tổng quan thu nhập, chi tiêu, tiết kiệm */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-transparent hover:border-emerald-400">
            <div className="flex items-center space-x-3 mb-4">
              <ArrowUpCircleIcon className="h-6 w-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-700">Tổng thu nhập</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{totalIncome.toLocaleString()} VNĐ</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-transparent hover:border-emerald-400">
            <div className="flex items-center space-x-3 mb-4">
              <ArrowDownCircleIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-700">Tổng chi tiêu</h3>
            </div>
            <p className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()} VNĐ</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-transparent hover:border-emerald-400">
            <div className="flex items-center space-x-3 mb-4">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-700">Tổng tiết kiệm</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalSavings.toLocaleString()} VNĐ</p>
          </div>
        </div>

        {/* Lọc theo năm */}
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FunnelIcon className="h-6 w-6 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-700">Lọc theo năm</h3>
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
          >
            <option value="Tất cả">Tất cả</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Biểu đồ */}
        {filteredReports.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <FunnelIcon className="h-6 w-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-700">Báo cáo tài chính theo tháng</h3>
            </div>
            <div className="h-80">
              <Line
                data={chartData()}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: 'Giá trị (VNĐ)' },
                      grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    },
                    x: {
                      title: { display: true, text: 'Tháng' },
                      grid: { display: false },
                    },
                  },
                  plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      cornerRadius: 8,
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Danh sách báo cáo */}
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <div className="flex justify-between items-center p-6">
            <div className="flex items-center space-x-3">
              <FunnelIcon className="h-6 w-6 text-emerald-600" />
              <h3 className="text-xl font-semibold text-gray-800">Danh sách Báo cáo</h3>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-all duration-300 ${
                  generating ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
                <span>{generating ? 'Đang tạo...' : 'Tạo Báo cáo Tháng Trước'}</span>
              </button>
            </div>
          </div>
          {loading ? (
            <p className="p-6 text-center text-gray-500 animate-pulse">Đang tải báo cáo...</p>
          ) : filteredReports.length === 0 ? (
            <p className="p-6 text-center text-gray-500">
              Chưa có báo cáo nào. Vui lòng thử{' '}
              <button
                onClick={handleGenerateReport}
                className="text-emerald-500 underline hover:text-emerald-600"
              >
                tạo báo cáo thủ công
              </button>{' '}
              hoặc{' '}
              <a href="/transactions" className="text-emerald-500 underline hover:text-emerald-600">
                thêm giao dịch
              </a>{' '}
              để tạo báo cáo tự động vào đầu tháng sau.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thu nhập (VNĐ)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiêu (VNĐ)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiết kiệm (VNĐ)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{rep.thang}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rep.nam}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-emerald-600">{rep.tongThuNhap.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600">{rep.tongChiTieu.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-600">{(rep.soTienTietKiem || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rep.ghiChu || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;