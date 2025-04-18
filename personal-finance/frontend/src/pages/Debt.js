import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PencilIcon, TrashIcon, BanknotesIcon, FunnelIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Debt = () => {
  const [debts, setDebts] = useState([]);
  const [soTien, setSoTien] = useState('');
  const [soTienDaTra, setSoTienDaTra] = useState('');
  const [laiSuat, setLaiSuat] = useState('');
  const [kyHan, setKyHan] = useState('');
  const [ngayBatDau, setNgayBatDau] = useState('');
  const [ngayKetThuc, setNgayKetThuc] = useState('');
  const [ngayTraTiepTheo, setNgayTraTiepTheo] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [trangThai, setTrangThai] = useState('Hoạt động');
  const [soTienTra, setSoTienTra] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [payDebtId, setPayDebtId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'pay'
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Kiểm tra userId
  useEffect(() => {
    if (!userId) {
      navigate('/');
      toast.error('Vui lòng đăng nhập để xem khoản nợ');
    }
  }, [userId, navigate]);

  // Lấy danh sách khoản nợ
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching debts for userId:', userId);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/debts/${userId}`);
        const newDebts = res.data;
        console.log('Debts received:', newDebts);
        setDebts(newDebts);
        // Thông báo khoản nợ quá hạn, thanh toán, hoặc nhắc nhở
        const recentlyUpdated = newDebts.filter(
          (debt) =>
            debt.updatedAt &&
            (debt.trangThai === 'Quá hạn' || debt.trangThai === 'Đã thanh toán' || debt.ngayTraTiepTheo) &&
            new Date(debt.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        recentlyUpdated.forEach((debt) => {
          if (debt.trangThai === 'Quá hạn') {
            toast.error(`Khoản nợ ${debt.soTien.toLocaleString()} VNĐ đã quá hạn!`, {
              toastId: `debt-overdue-${debt._id}`,
            });
          } else if (debt.trangThai === 'Đã thanh toán') {
            toast.success(`Khoản nợ ${debt.soTien.toLocaleString()} VNĐ đã được thanh toán hoàn toàn!`, {
              toastId: `debt-paid-${debt._id}`,
            });
          } else if (debt.ngayTraTiepTheo) {
            const nextPaymentDate = new Date(debt.ngayTraTiepTheo);
            if (
              nextPaymentDate.getFullYear() === new Date().getFullYear() &&
              nextPaymentDate.getMonth() === new Date().getMonth() &&
              nextPaymentDate.getDate() === new Date().getDate()
            ) {
              toast.info(`Hôm nay là ngày trả nợ cho khoản nợ ${debt.soTien.toLocaleString()} VNĐ`, {
                toastId: `debt-reminder-${debt._id}`,
              });
            }
          }
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Lỗi khi tải dữ liệu khoản nợ';
        console.error('Fetch debts error:', err.response || err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  // Thêm hoặc cập nhật khoản nợ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!soTien || !ngayBatDau || !kyHan) {
      setError('Vui lòng nhập số tiền, kì hạn và ngày bắt đầu');
      toast.error('Vui lòng nhập số tiền, kì hạn và ngày bắt đầu');
      return;
    }
    if (ghiChu && ghiChu.length > 200) {
      setError('Ghi chú không được vượt quá 200 ký tự');
      toast.error('Ghi chú không được vượt quá 200 ký tự');
      return;
    }
    const soTienNum = parseFloat(soTien);
    const soTienDaTraNum = parseFloat(soTienDaTra) || 0;
    const laiSuatNum = parseFloat(laiSuat) || 0;
    const kyHanNum = parseInt(kyHan);
    if (isNaN(soTienNum) || soTienNum <= 0) {
      setError('Số tiền phải là số dương hợp lệ');
      toast.error('Số tiền phải là số dương hợp lệ');
      return;
    }
    if (isNaN(soTienDaTraNum) || soTienDaTraNum < 0) {
      setError('Số tiền đã trả không được âm');
      toast.error('Số tiền đã trả không được âm');
      return;
    }
    if (laiSuat && (isNaN(laiSuatNum) || laiSuatNum < 0)) {
      setError('Lãi suất phải là số không âm');
      toast.error('Lãi suất phải là số không âm');
      return;
    }
    if (isNaN(kyHanNum) || kyHanNum < 1) {
      setError('Kì hạn phải là số nguyên dương');
      toast.error('Kì hạn phải là số nguyên dương');
      return;
    }
    const totalInterest = laiSuatNum ? (soTienNum * laiSuatNum * kyHanNum) / 100 : 0;
    if (soTienDaTraNum > soTienNum + totalInterest) {
      setError('Số tiền đã trả không được vượt quá tổng tiền gốc và lãi');
      toast.error('Số tiền đã trả không được vượt quá tổng tiền gốc và lãi');
      return;
    }
    const startDate = new Date(ngayBatDau);
    const endDate = ngayKetThuc ? new Date(ngayKetThuc) : null;
    const nextPaymentDate = ngayTraTiepTheo ? new Date(ngayTraTiepTheo) : null;
    if (isNaN(startDate.getTime())) {
      setError('Ngày bắt đầu phải là ngày hợp lệ');
      toast.error('Ngày bắt đầu phải là ngày hợp lệ');
      return;
    }
    if (endDate && isNaN(endDate.getTime())) {
      setError('Ngày kết thúc phải là ngày hợp lệ');
      toast.error('Ngày kết thúc phải là ngày hợp lệ');
      return;
    }
    if (nextPaymentDate && isNaN(nextPaymentDate.getTime())) {
      setError('Ngày trả tiếp theo phải là ngày hợp lệ');
      toast.error('Ngày trả tiếp theo phải là ngày hợp lệ');
      return;
    }
    if (endDate && endDate < startDate) {
      setError('Ngày kết thúc phải sau ngày bắt đầu');
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }
    if (nextPaymentDate && nextPaymentDate < startDate) {
      setError('Ngày trả tiếp theo phải sau ngày bắt đầu');
      toast.error('Ngày trả tiếp theo phải sau ngày bắt đầu');
      return;
    }

    try {
      const payload = {
        userId,
        soTien: soTienNum,
        soTienDaTra: soTienDaTraNum,
        laiSuat: laiSuatNum || undefined,
        kyHan: kyHanNum,
        ngayBatDau,
        ngayKetThuc: ngayKetThuc || undefined,
        ngayTraTiepTheo: ngayTraTiepTheo || undefined,
        ghiChu,
        trangThai,
      };
      console.log('Submitting debt:', payload);
      let res;
      if (editId) {
        res = await axios.put(`${process.env.REACT_APP_API_URL}/debts/${editId}`, payload);
        console.log('Update response:', res.data);
        setDebts(debts.map((debt) => (debt._id === editId ? res.data.debt : debt)));
        toast.success('Cập nhật khoản nợ thành công!');
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/debts`, payload);
        console.log('Create response:', res.data);
        setDebts([...debts, res.data.debt]);
        toast.success('Thêm khoản nợ thành công!');
      }
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu khoản nợ';
      console.error('Submit error:', err.response || err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Thêm lần trả nợ
  const handlePayDebt = async () => {
    if (!userId) {
      setError('Không tìm thấy userId. Vui lòng đăng nhập lại.');
      toast.error('Không tìm thấy userId. Vui lòng đăng nhập lại.');
      return;
    }
    if (!soTienTra || parseFloat(soTienTra) <= 0) {
      setError('Vui lòng nhập số tiền trả hợp lệ');
      toast.error('Vui lòng nhập số tiền trả hợp lệ');
      return;
    }
    try {
      const payload = { userId, soTienTra: parseFloat(soTienTra) };
      console.log('Paying debt:', { debtId: payDebtId, payload });
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/debts/${payDebtId}/pay`, payload);
      console.log('Pay response:', res.data);
      if (res.data.debt && res.data.debt.soTienDaTra !== undefined) {
        setDebts(debts.map((debt) => (debt._id === payDebtId ? res.data.debt : debt)));
        toast.success('Thêm lần trả nợ thành công!');
      } else {
        throw new Error(res.data.message || 'Dữ liệu trả nợ không hợp lệ');
      }
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi thêm lần trả nợ';
      console.error('Pay error:', err.response || err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Xóa khoản nợ
  const handleDelete = async (id) => {
    if (!userId) {
      toast.error('Không tìm thấy userId. Vui lòng đăng nhập lại.');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa khoản nợ này?')) return;
    try {
      console.log('Deleting debt:', { id, userId });
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/debts/${id}?userId=${userId}`);
      console.log('Delete response:', res.data);
      setDebts(debts.filter((debt) => debt._id !== id));
      toast.success('Xóa khoản nợ thành công!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa khoản nợ';
      console.error('Delete error:', err.response || err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Mở modal thêm khoản nợ
  const openAddModal = () => {
    setModalType('add');
    setEditId(null);
    setSoTien('');
    setSoTienDaTra('');
    setLaiSuat('');
    setKyHan('');
    setNgayBatDau('');
    setNgayKetThuc('');
    setNgayTraTiepTheo('');
    setGhiChu('');
    setTrangThai('Hoạt động');
    setError('');
    setShowModal(true);
  };

  // Mở modal sửa khoản nợ
  const openEditModal = (debt) => {
    setModalType('edit');
    setEditId(debt._id);
    setSoTien(debt.soTien?.toString() || '');
    setSoTienDaTra(debt.soTienDaTra?.toString() || '0');
    setLaiSuat(debt.laiSuat?.toString() || '');
    setKyHan(debt.kyHan?.toString() || '1');
    setNgayBatDau(debt.ngayBatDau ? new Date(debt.ngayBatDau).toISOString().split('T')[0] : '');
    setNgayKetThuc(debt.ngayKetThuc ? new Date(debt.ngayKetThuc).toISOString().split('T')[0] : '');
    setNgayTraTiepTheo(debt.ngayTraTiepTheo ? new Date(debt.ngayTraTiepTheo).toISOString().split('T')[0] : '');
    setGhiChu(debt.ghiChu || '');
    setTrangThai(debt.trangThai || 'Hoạt động');
    setError('');
    setShowModal(true);
  };

  // Mở modal trả nợ
  const openPayDebtModal = (debtId) => {
    setModalType('pay');
    setPayDebtId(debtId);
    setSoTienTra('');
    setError('');
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditId(null);
    setPayDebtId(null);
    setSoTien('');
    setSoTienDaTra('');
    setLaiSuat('');
    setKyHan('');
    setNgayBatDau('');
    setNgayKetThuc('');
    setNgayTraTiepTheo('');
    setGhiChu('');
    setTrangThai('Hoạt động');
    setSoTienTra('');
    setError('');
  };

  // Lọc khoản nợ theo trạng thái
  const filteredDebts = filterStatus === 'Tất cả' ? debts : debts.filter((debt) => debt.trangThai === filterStatus);

  // Tính tổng nợ còn lại
  const totalRemainingDebt = filteredDebts.reduce((sum, debt) => {
    const soTien = debt.soTien || 0;
    const laiSuat = debt.laiSuat || 0;
    const kyHan = debt.kyHan || 1;
    const soTienDaTra = debt.soTienDaTra || 0;
    const totalInterest = laiSuat ? (soTien * laiSuat * kyHan) / 100 : 0;
    const totalAmount = soTien + totalInterest;
    return sum + (totalAmount - soTienDaTra);
  }, 0);

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
          <h2 className="text-3xl font-bold text-gray-800">Quản lý khoản nợ</h2>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
          >
            <BanknotesIcon className="h-5 w-5" />
            <span>Thêm khoản nợ</span>
          </button>
        </div>

        {/* Tổng quan */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Tổng nợ còn lại</h3>
            <p className="text-2xl font-bold text-blue-600">
              {isNaN(totalRemainingDebt) ? '0' : totalRemainingDebt.toLocaleString()} VNĐ
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
              <option value="Đã thanh toán">Đã thanh toán</option>
              <option value="Quá hạn">Quá hạn</option>
            </select>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-xl font-semibold mb-4">
                {modalType === 'add' ? 'Thêm khoản nợ' : modalType === 'edit' ? 'Sửa khoản nợ' : 'Trả nợ'}
              </h3>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {modalType !== 'pay' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <label className="block text-gray-700 font-medium">
                      Số tiền gốc (VNĐ)
                      <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Số tiền vay ban đầu" />
                    </label>
                    <input
                      type="number"
                      value={soTien}
                      onChange={(e) => setSoTien(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      step="0.01"
                      min="0.01"
                      placeholder="Số tiền nợ"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-gray-700 font-medium">
                      Số tiền đã trả (VNĐ)
                      <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Tổng số tiền đã trả cho khoản nợ" />
                    </label>
                    <input
                      type="number"
                      value={soTienDaTra}
                      onChange={(e) => setSoTienDaTra(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                      placeholder="Số tiền đã trả"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-gray-700 font-medium">
                      Lãi suất (%/tháng)
                      <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Lãi suất tính theo tháng" />
                    </label>
                    <input
                      type="number"
                      value={laiSuat}
                      onChange={(e) => setLaiSuat(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                      placeholder="Lãi suất (nếu có)"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-gray-700 font-medium">
                      Kì hạn (tháng)
                      <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Số tháng phải trả nợ" />
                    </label>
                    <input
                      type="number"
                      value={kyHan}
                      onChange={(e) => setKyHan(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                      placeholder="Số tháng"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={ngayBatDau}
                      onChange={(e) => setNgayBatDau(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={ngayKetThuc}
                      onChange={(e) => setNgayKetThuc(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium">Ngày trả tiếp theo</label>
                    <input
                      type="date"
                      value={ngayTraTiepTheo}
                      onChange={(e) => setNgayTraTiepTheo(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <option value="Đã thanh toán">Đã thanh toán</option>
                      <option value="Quá hạn">Quá hạn</option>
                    </select>
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
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
                      disabled={!soTien || !ngayBatDau || !kyHan || parseFloat(soTien) <= 0 || parseInt(kyHan) < 1}
                    >
                      {modalType === 'add' ? 'Thêm khoản nợ' : 'Cập nhật khoản nợ'}
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
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium">Số tiền trả (VNĐ)</label>
                    <input
                      type="number"
                      value={soTienTra}
                      onChange={(e) => setSoTienTra(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Số tiền trả"
                      step="0.01"
                      min="0.01"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handlePayDebt}
                      className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition duration-200"
                    >
                      Xác nhận trả nợ
                    </button>
                    <button
                      onClick={closeModal}
                      className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition duration-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bảng danh sách khoản nợ */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <div className="flex justify-between items-center p-4">
            <h3 className="text-xl font-semibold text-gray-800">Danh sách khoản nợ</h3>
            <FunnelIcon className="h-6 w-6 text-gray-500" />
          </div>
          {loading ? (
            <p className="p-4 text-center text-gray-500">Đang tải khoản nợ...</p>
          ) : filteredDebts.length === 0 ? (
            <p className="p-4 text-center text-gray-500">Chưa có khoản nợ nào</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền gốc (VNĐ)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền (gốc + lãi)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiền trả/tháng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Còn lại (VNĐ)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã trả (VNĐ)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lãi suất (%/tháng)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kì hạn (tháng)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiến độ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDebts.map((debt) => {
                  const soTien = debt.soTien || 0;
                  const laiSuat = debt.laiSuat || 0;
                  const kyHan = debt.kyHan || 1;
                  const soTienDaTra = debt.soTienDaTra || 0;
                  const totalInterest = laiSuat ? (soTien * laiSuat * kyHan) / 100 : 0;
                  const totalAmount = soTien + totalInterest;
                  const monthlyPayment = kyHan ? totalAmount / kyHan : 0;
                  const remainingAmount = totalAmount - soTienDaTra;
                  const progress = totalAmount ? (soTienDaTra / totalAmount) * 100 : 0;

                  return (
                    <tr key={debt._id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{soTien.toLocaleString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{monthlyPayment.toLocaleString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-red-600 font-medium">{remainingAmount.toLocaleString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{soTienDaTra.toLocaleString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{laiSuat || 'Không có'}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{kyHan}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            debt.trangThai === 'Hoạt động'
                              ? 'bg-green-100 text-green-800'
                              : debt.trangThai === 'Đã thanh toán'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {debt.trangThai}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{isNaN(progress) ? '0' : progress.toFixed(1)}% hoàn thành</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(debt)}
                            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition duration-200"
                            title="Sửa khoản nợ"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openPayDebtModal(debt._id)}
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-200 disabled:bg-gray-400"
                            disabled={debt.trangThai === 'Đã thanh toán'}
                            title="Thêm lần trả nợ"
                          >
                            <BanknotesIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(debt._id)}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200"
                            title="Xóa khoản nợ"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Debt;