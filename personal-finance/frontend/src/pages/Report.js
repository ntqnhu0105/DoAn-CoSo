import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const Report = () => {
  const [reports, setReports] = useState([]);
  const [filterYear, setFilterYear] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false); // Thêm trạng thái generating
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
          label: 'Tổng thu nhập (VNĐ)',
          data: incomeData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Tổng chi tiêu (VNĐ)',
          data: expenseData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Số tiền tiết kiệm (VNĐ)',
          data: savingsData,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          tension: 0.4,
          fill: false,
        },
      ],
    };
  };

  const uniqueYears = [...new Set(reports.map((rep) => rep.nam))].sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-6">
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
      />
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Báo cáo Tài chính</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white p-4 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Tổng thu nhập</h3>
            <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()} VNĐ</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Tổng chi tiêu</h3>
            <p className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()} VNĐ</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Tổng tiết kiệm</h3>
            <p className="text-2xl font-bold text-blue-600">{totalSavings.toLocaleString()} VNĐ</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">Lọc theo năm</h3>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tất cả">Tất cả</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {filteredReports.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Báo cáo tài chính theo tháng</h3>
            <div className="h-64">
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
                  },
                }}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <div className="flex justify-between items-center p-4">
            <h3 className="text-xl font-semibold text-gray-800">Danh sách Báo cáo</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {generating ? 'Đang tạo...' : 'Tạo Báo cáo Tháng Trước'}
              </button>
              <FunnelIcon className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          {loading ? (
            <p className="p-4 text-center text-gray-500">Đang tải báo cáo...</p>
          ) : filteredReports.length === 0 ? (
            <p className="p-4 text-center text-gray-500">
              Chưa có báo cáo nào. Vui lòng thử tạo báo cáo thủ công hoặc{' '}
              <a href="/transactions" className="text-blue-500 underline">
                thêm giao dịch
              </a>{' '}
              để tạo báo cáo tự động vào đầu tháng sau.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng thu nhập (VNĐ)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng chi tiêu (VNĐ)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền tiết kiệm (VNĐ)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{rep.thang}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{rep.nam}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-green-600">{rep.tongThuNhap.toLocaleString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-red-600">{rep.tongChiTieu.toLocaleString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-blue-600">{(rep.soTienTietKiem || 0).toLocaleString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{rep.ghiChu || '-'}</td>
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