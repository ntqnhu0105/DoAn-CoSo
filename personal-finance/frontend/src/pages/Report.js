import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Report = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Kiểm tra userId
  useEffect(() => {
    if (!userId) {
      navigate('/');
    }
  }, [userId, navigate]);

  // Lấy danh sách báo cáo
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/reports/${userId}`);
        setReports(res.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Lỗi khi tải báo cáo';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchReports();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Báo cáo tài chính</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading && <p className="text-gray-500 mb-4 text-center">Đang tải báo cáo...</p>}

        {/* Danh sách báo cáo */}
        <div className="bg-white rounded shadow-md">
          <h3 className="text-xl font-semibold p-4">Danh sách báo cáo</h3>
          {loading ? (
            <p className="p-4 text-center">Đang tải...</p>
          ) : reports.length === 0 ? (
            <p className="p-4 text-center">Chưa có báo cáo nào</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={`${report.thang}-${report.nam}`} className="p-4">
                  <span className="font-medium">Báo cáo tháng {report.thang}/{report.nam}</span>
                  <br />
                  <span className="text-gray-600">
                    Tổng thu nhập: {report.tongThuNhap.toLocaleString()} VNĐ<br />
                    Tổng chi tiêu: {report.tongChiTieu.toLocaleString()} VNĐ<br />
                    Số tiền tiết kiệm: {report.soTienTietKiem.toLocaleString()} VNĐ<br />
                    Ghi chú: {report.ghiChu || 'Không có ghi chú'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;