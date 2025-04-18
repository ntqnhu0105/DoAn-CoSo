import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PencilIcon, TrashIcon, BanknotesIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loai, setLoai] = useState('');
  const [giaTri, setGiaTri] = useState('');
  const [loiNhuan, setLoiNhuan] = useState('');
  const [ngay, setNgay] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [trangThai, setTrangThai] = useState('Hoạt động');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit'
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Kiểm tra userId
  useEffect(() => {
    if (!userId) {
      navigate('/');
      toast.error('Vui lòng đăng nhập để xem đầu tư');
    }
  }, [userId, navigate]);

  // Lấy danh sách đầu tư
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching investments for userId:', userId);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/investments/${userId}`);
        const newInvestments = res.data;
        console.log('Investments received:', newInvestments);
        setInvestments(newInvestments);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Lỗi khi tải dữ liệu đầu tư';
        console.error('Fetch investments error:', err.response || err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId, investments.length]);

  // Thêm hoặc cập nhật đầu tư
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loai || !giaTri) {
      setError('Vui lòng nhập loại và giá trị đầu tư');
      toast.error('Vui lòng nhập loại và giá trị đầu tư');
      return;
    }
    if (ghiChu && ghiChu.length > 200) {
      setError('Ghi chú không được vượt quá 200 ký tự');
      toast.error('Ghi chú không được vượt quá 200 ký tự');
      return;
    }
    const giaTriNum = parseFloat(giaTri);
    const loiNhuanNum = loiNhuan ? parseFloat(loiNhuan) : undefined;
    if (isNaN(giaTriNum) || giaTriNum <= 0) {
      setError('Giá trị đầu tư phải là số dương hợp lệ');
      toast.error('Giá trị đầu tư phải là số dương hợp lệ');
      return;
    }
    if (loai.length > 50) {
      setError('Loại đầu tư không được vượt quá 50 ký tự');
      toast.error('Loại đầu tư không được vượt quá 50 ký tự');
      return;
    }
  
    try {
      const payload = {
        userId,
        loai,
        giaTri: giaTriNum,
        loiNhuan: loiNhuanNum,
        ngay: ngay || undefined,
        ghiChu,
        trangThai,
      };
      console.log('Submitting investment:', payload);
      let res;
      if (editId) {
        res = await axios.put(`${process.env.REACT_APP_API_URL}/investments/${editId}`, payload);
        console.log('Update response:', res.data);
        setInvestments(investments.map((inv) => (inv._id === editId ? res.data.investment : inv)));
        toast.success('Cập nhật đầu tư thành công!');
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/investments`, payload);
        console.log('Create response:', res.data);
        setInvestments([...investments, res.data.investment]);
        toast.success('Thêm đầu tư thành công!');
      }
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu đầu tư';
      console.error('Submit error:', err.response || err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Xóa đầu tư
  const handleDelete = async (id) => {
    if (!userId) {
      toast.error('Không tìm thấy userId. Vui lòng đăng nhập lại.');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa đầu tư này?')) return;
    try {
      console.log('Deleting investment:', { id, userId });
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/investments/${id}?userId=${userId}`);
      console.log('Delete response:', res.data);
      setInvestments(investments.filter((inv) => inv._id !== id));
      toast.success('Xóa đầu tư thành công!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa đầu tư';
      console.error('Delete error:', err.response || err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Mở modal thêm đầu tư
  const openAddModal = () => {
    setModalType('add');
    setEditId(null);
    setLoai('');
    setGiaTri('');
    setLoiNhuan('');
    setNgay('');
    setGhiChu('');
    setTrangThai('Hoạt động');
    setError('');
    setShowModal(true);
  };

  // Mở modal sửa đầu tư
  const openEditModal = (investment) => {
    setModalType('edit');
    setEditId(investment._id);
    setLoai(investment.loai || '');
    setGiaTri(investment.giaTri?.toString() || '');
    setLoiNhuan(investment.loiNhuan?.toString() || '');
    setNgay(investment.ngay ? new Date(investment.ngay).toISOString().split('T')[0] : '');
    setGhiChu(investment.ghiChu || '');
    setTrangThai(investment.trangThai || 'Hoạt động');
    setError('');
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditId(null);
    setLoai('');
    setGiaTri('');
    setLoiNhuan('');
    setNgay('');
    setGhiChu('');
    setTrangThai('Hoạt động');
    setError('');
  };

  // Lọc đầu tư theo trạng thái
  const filteredInvestments = filterStatus === 'Tất cả' ? investments : investments.filter((inv) => inv.trangThai === filterStatus);

  // Tính tổng giá trị đầu tư
  const totalInvestmentValue = filteredInvestments.reduce((sum, inv) => sum + (inv.giaTri || 0), 0);

  // Dữ liệu cho biểu đồ
  const chartData = () => {
    const typeTotals = investments.reduce((acc, inv) => {
      acc[inv.loai] = (acc[inv.loai] || 0) + inv.giaTri;
      return acc;
    }, {});
    return {
      labels: Object.keys(typeTotals),
      datasets: [
        {
          label: 'Tổng giá trị (VNĐ)',
          data: Object.values(typeTotals),
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  };

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Quản lý Đầu tư</h2>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
          >
            <BanknotesIcon className="h-5 w-5" />
            <span>Thêm Đầu tư</span>
          </button>
        </div>

        {/* Tổng quan */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Tổng giá trị đầu tư</h3>
            <p className="text-2xl font-bold text-blue-600">
              {isNaN(totalInvestmentValue) ? '0' : totalInvestmentValue.toLocaleString()} VNĐ
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-gray-700 font-medium">Lọc trạng thái:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Đã bán">Đã bán</option>
              <option value="Đang chờ">Đang chờ</option>
            </select>
          </div>
        </div>

        {/* Biểu đồ */}
        {filteredInvestments.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Tổng giá trị đầu tư theo loại</h3>
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
                      title: { display: true, text: 'Loại đầu tư' },
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-xl font-semibold mb-4">
                {modalType === 'add' ? 'Thêm Đầu tư' : 'Sửa Đầu tư'}
              </h3>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium">Loại đầu tư</label>
                  <input
                    type="text"
                    value={loai}
                    onChange={(e) => setLoai(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Ví dụ: Cổ phiếu, Trái phiếu"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Giá trị (VNĐ)</label>
                  <input
                    type="number"
                    value={giaTri}
                    onChange={(e) => setGiaTri(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    step="0.01"
                    min="0.01"
                    placeholder="Giá trị đầu tư"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Lợi nhuận (VNĐ)</label>
                  <input
                    type="number"
                    value={loiNhuan}
                    onChange={(e) => setLoiNhuan(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    placeholder="Lợi nhuận (có thể âm)"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Ngày đầu tư</label>
                  <input
                    type="date"
                    value={ngay}
                    onChange={(e) => setNgay(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Ghi chú</label>
                  <textarea
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ghi chú (tối đa 200 ký tự)"
                    rows="3"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Trạng thái</label>
                  <select
                    value={trangThai}
                    onChange={(e) => setTrangThai(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Đã bán">Đã bán</option>
                    <option value="Đang chờ">Đang chờ</option>
                  </select>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
                    disabled={!loai || !giaTri || parseFloat(giaTri) <= 0}
                  >
                    {modalType === 'add' ? 'Thêm Đầu tư' : 'Cập nhật Đầu tư'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition duration-200"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bảng danh sách đầu tư */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <div className="flex justify-between items-center p-4">
            <h3 className="text-xl font-semibold text-gray-800">Danh sách Đầu tư</h3>
            <FunnelIcon className="h-6 w-6 text-gray-500" />
          </div>
          {loading ? (
            <p className="p-4 text-center text-gray-500">Đang tải đầu tư...</p>
          ) : filteredInvestments.length === 0 ? (
            <p className="p-4 text-center text-gray-500">Chưa có đầu tư nào</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị (VNĐ)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lợi nhuận (VNĐ)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvestments.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{inv.loai}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{inv.giaTri.toLocaleString()}</td>
                    <td className={`px-4 py-4 whitespace-nowrap ${
                    inv.loiNhuan > 0 ? 'text-green-600' : inv.loiNhuan < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {(inv.loiNhuan || 0).toLocaleString()}
                  </td>
                    <td className="px-4 py-4 whitespace-nowrap">{new Date(inv.ngay).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{inv.ghiChu || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          inv.trangThai === 'Hoạt động'
                            ? 'bg-green-100 text-green-800'
                            : inv.trangThai === 'Đã bán'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {inv.trangThai}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(inv)}
                          className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition duration-200"
                          title="Sửa đầu tư"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200"
                          title="Xóa đầu tư"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
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

export default Investments;