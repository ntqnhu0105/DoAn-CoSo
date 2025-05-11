import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  BanknotesIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

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

// Sub-component: TransactionForm
const TransactionForm = ({
  accounts,
  categories,
  editingTransaction,
  onSubmit,
  onCancel,
  soTien,
  setSoTien,
  loai,
  setLoai,
  maDanhMuc,
  setMaDanhMuc,
  maTaiKhoan,
  setMaTaiKhoan,
  ghiChu,
  setGhiChu,
  phuongThucThanhToan,
  setPhuongThucThanhToan,
  ngayGiaoDich,
  setNgayGiaoDich,
  error,
}) => (
  <div className="bg-white p-8 rounded-3xl shadow-xl transform transition-all duration-500 hover:shadow-2xl border border-gray-100 mb-8">
    <div className="flex items-center space-x-4 mb-8">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-full shadow-md">
        <BanknotesIcon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
        {editingTransaction ? 'Sửa Giao Dịch' : 'Thêm Giao Dịch'}
      </h3>
    </div>
    {error && (
      <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl shadow-sm border border-red-100">
        <p className="text-sm" dangerouslySetInnerHTML={{ __html: error }} />
      </div>
    )}
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Số Tiền</label>
          <input
            type="number"
            value={soTien}
            onChange={(e) => setSoTien(e.target.value)}
            placeholder="Nhập số tiền"
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-300"
            required
            step="0.01"
            min="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Ngày Giao Dịch</label>
          <input
            type="date"
            value={ngayGiaoDich}
            onChange={(e) => setNgayGiaoDich(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-gray-50 text-gray-800 transition-all duration-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Loại</label>
          <select
            value={loai}
            onChange={(e) => setLoai(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-gray-50 text-gray-800 transition-all duration-300"
          >
            <option value="Thu nhập">Thu nhập</option>
            <option value="Chi tiêu">Chi tiêu</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Tài Khoản</label>
          <select
            value={maTaiKhoan}
            onChange={(e) => setMaTaiKhoan(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-gray-50 text-gray-800 transition-all duration-300"
            required
          >
            {accounts.length === 0 ? (
              <option value="">Chưa có tài khoản</option>
            ) : (
              accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.tenTaiKhoan} ({acc.loaiTaiKhoan}) - {formatCurrency(acc.soDu)}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Danh Mục</label>
          <select
            value={maDanhMuc}
            onChange={(e) => setMaDanhMuc(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-gray-50 text-gray-800 transition-all duration-300"
            required
          >
            {categories.length === 0 ? (
              <option value="">Chưa có danh mục</option>
            ) : (
              categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.tenDanhMuc} ({cat.loai})
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Phương Thức Thanh Toán</label>
          <select
            value={phuongThucThanhToan}
            onChange={(e) => setPhuongThucThanhToan(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-gray-50 text-gray-800 transition-all duration-300"
          >
            <option value="">Chọn phương thức</option>
            <option value="Tiền mặt">Tiền mặt</option>
            <option value="Thẻ tín dụng">Thẻ tín dụng</option>
            <option value="Chuyển khoản">Chuyển khoản</option>
            <option value="Ví điện tử">Ví điện tử</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Ghi Chú</label>
          <input
            type="text"
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="Nhập ghi chú"
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-300"
          />
        </div>
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1"
            disabled={!maTaiKhoan || !maDanhMuc || !soTien || parseFloat(soTien) <= 0}
          >
            <BanknotesIcon className="h-5 w-5" />
            <span>{editingTransaction ? 'Lưu Thay Đổi' : 'Thêm Giao Dịch'}</span>
          </button>
          {editingTransaction && (
            <button
              type="button"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg transform hover:-translate-y-1"
              onClick={onCancel}
            >
              <BanknotesIcon className="h-5 w-5" />
              <span>Hủy</span>
            </button>
          )}
        </div>
      </div>
    </form>
  </div>
);

// Sub-component: TransactionList
const TransactionList = ({ transactions, loading, onEdit, onDelete }) => (
  <div className="bg-white p-8 rounded-3xl shadow-xl transform transition-all duration-500 hover:shadow-2xl border border-gray-100">
    <div className="flex items-center space-x-4 mb-8">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-full shadow-md">
        <BanknotesIcon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Danh Sách Giao Dịch</h3>
    </div>
    {loading ? (
      <div className="grid grid-cols-1 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 p-6 rounded-xl h-28"></div>
        ))}
      </div>
    ) : transactions.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-6">Chưa có giao dịch nào.</p>
        <Link
          to="/transactions/new"
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 inline-flex items-center space-x-2 shadow-lg transform hover:-translate-y-1"
        >
          <BanknotesIcon className="h-5 w-5" />
          <span>Thêm giao dịch đầu tiên</span>
        </Link>
      </div>
    ) : (
      <div className="space-y-6">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm border border-gray-100"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <BanknotesIcon
                  className={`h-6 w-6 ${transaction.loai === 'Thu nhập' ? 'text-emerald-600' : 'text-red-600'}`}
                />
                <span
                  className={`font-semibold ${transaction.loai === 'Thu nhập' ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {transaction.loai}
                </span>
                <span className="text-gray-900 font-bold text-xl">{formatCurrency(transaction.soTien)}</span>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <span className="font-semibold">Tài khoản:</span>{' '}
                  {transaction.maTaiKhoan?.tenTaiKhoan || 'Không xác định'} (
                  {formatCurrency(transaction.maTaiKhoan?.soDu || 0)})
                </p>
                <p>
                  <span className="font-semibold">Danh mục:</span>{' '}
                  {transaction.maDanhMuc?.tenDanhMuc || 'Không xác định'}
                </p>
                <p>
                  <span className="font-semibold">Phương thức:</span>{' '}
                  {transaction.phuongThucThanhToan || 'Không có'}
                </p>
                <p>
                  <span className="font-semibold">Ghi chú:</span>{' '}
                  {transaction.ghiChu || 'Không có ghi chú'}
                </p>
                <p>
                  <span className="font-semibold">Ngày:</span>{' '}
                  {new Date(transaction.ngayGiaoDich).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-4">
              <button
                onClick={() => onEdit(transaction)}
                className="px-6 py-2 bg-yellow-100 text-yellow-600 rounded-xl hover:bg-yellow-200 transition-all duration-300 flex items-center space-x-2 shadow-sm transform hover:-translate-y-1"
              >
                <PencilIcon className="h-5 w-5" />
                <span>Sửa</span>
              </button>
              <button
                onClick={() => onDelete(transaction._id)}
                className="px-6 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300 flex items-center space-x-2 shadow-sm transform hover:-translate-y-1"
              >
                <TrashIcon className="h-5 w-5" />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [soTien, setSoTien] = useState('');
  const [loai, setLoai] = useState('Chi tiêu');
  const [maDanhMuc, setMaDanhMuc] = useState('');
  const [maTaiKhoan, setMaTaiKhoan] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState('');
  const [ngayGiaoDich, setNgayGiaoDich] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const navigate = useNavigate();

  // Sanitize userId
  const userId = localStorage.getItem('userId')?.replace(/[^\w-]/g, '');

  useEffect(() => {
    if (!userId) {
      navigate('/');
      toast.error('Vui lòng đăng nhập để quản lý chi tiêu', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  }, [userId, navigate]);

  // Debounced fetch data
  const fetchData = useMemo(
    () =>
      debounce(async () => {
        if (!userId) return;
        setLoading(true);
        try {
          const [transactionRes, categoryRes, accountRes] = await Promise.all([
            axios.get(`${API_URL}/transactions/${userId}`),
            axios.get(`${API_URL}/categories`),
            axios.get(`${API_URL}/accounts/${userId}`),
          ]);
          setTransactions(transactionRes.data);
          setCategories(categoryRes.data);
          setAccounts(accountRes.data);

          if (categoryRes.data.length > 0) {
            const validCategory = categoryRes.data.find((cat) => cat._id);
            setMaDanhMuc(validCategory ? validCategory._id : '');
          } else {
            setMaDanhMuc('');
            setError(
              'Vui lòng tạo danh mục tại <Link to="/categories" className="text-emerald-600 underline">Quản lý danh mục</Link>.'
            );
            toast.info('Vui lòng tạo danh mục trước khi thêm giao dịch.');
          }

          if (accountRes.data.length > 0) {
            setMaTaiKhoan(accountRes.data[0]._id);
          } else {
            setMaTaiKhoan('');
            setError(
              'Vui lòng tạo tài khoản tại <Link to="/accounts" className="text-emerald-600 underline">Quản lý tài khoản</Link>.'
            );
            toast.info('Vui lòng tạo tài khoản trước khi thêm giao dịch.');
          }
        } catch (err) {
          let errorMessage = 'Lỗi khi tải dữ liệu.';
          if (err.response) {
            switch (err.response.status) {
              case 401:
                errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
                navigate('/');
                break;
              case 404:
                errorMessage = 'Không tìm thấy dữ liệu giao dịch, danh mục hoặc tài khoản.';
                break;
              default:
                errorMessage = err.response.data.message || 'Lỗi server.';
            }
          }
          console.error('Fetch data error:', err.response || err);
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      }, 300),
    [userId, navigate]
  );

  useEffect(() => {
    fetchData();
    return () => fetchData.cancel();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maTaiKhoan || !maDanhMuc || !soTien) {
      setError('Vui lòng nhập số tiền và chọn tài khoản, danh mục.');
      toast.error('Vui lòng nhập số tiền và chọn tài khoản, danh mục.');
      return;
    }
    if (parseFloat(soTien) <= 0) {
      setError('Số tiền phải lớn hơn 0.');
      toast.error('Số tiền phải lớn hơn 0.');
      return;
    }
    try {
      const payload = {
        maNguoiDung: userId,
        maTaiKhoan,
        maDanhMuc,
        soTien: parseFloat(soTien),
        loai,
        ghiChu,
        phuongThucThanhToan: phuongThucThanhToan || undefined,
        ngayGiaoDich: ngayGiaoDich ? new Date(ngayGiaoDich).toISOString() : undefined,
      };
      let res;
      if (editingTransaction) {
        res = await axios.put(`${API_URL}/transactions/${editingTransaction._id}`, payload);
        setTransactions(
          transactions.map((t) => (t._id === editingTransaction._id ? res.data : t))
        );
        toast.success('Sửa giao dịch thành công!');
      } else {
        res = await axios.post(`${API_URL}/transactions`, payload);
        setTransactions([...transactions, res.data]);
        toast.success('Thêm giao dịch thành công!');
      }

      await fetchData();
      setSoTien('');
      setLoai('Chi tiêu');
      setGhiChu('');
      setPhuongThucThanhToan('');
      setNgayGiaoDich('');
      setError('');
      setEditingTransaction(null);
    } catch (err) {
      let errorMessage = 'Lỗi khi xử lý giao dịch.';
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
            navigate('/');
            break;
          case 400:
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
            break;
          default:
            errorMessage = err.response.data.message || 'Lỗi server.';
        }
      }
      console.error('Request error:', err.response || err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setSoTien(transaction.soTien.toString());
    setLoai(transaction.loai);
    setMaTaiKhoan(transaction.maTaiKhoan?._id || '');
    setMaDanhMuc(transaction.maDanhMuc?._id || '');
    setGhiChu(transaction.ghiChu || '');
    setPhuongThucThanhToan(transaction.phuongThucThanhToan || '');
    setNgayGiaoDich(
      transaction.ngayGiaoDich ? new Date(transaction.ngayGiaoDich).toISOString().split('T')[0] : ''
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      setTransactions(transactions.filter((t) => t._id !== id));
      await fetchData();
      setError('');
      toast.success('Xóa giao dịch thành công!');
    } catch (err) {
      let errorMessage = 'Lỗi khi xóa giao dịch.';
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
            navigate('/');
            break;
          case 404:
            errorMessage = 'Giao dịch không tồn tại.';
            break;
          default:
            errorMessage = err.response.data.message || 'Lỗi server.';
        }
      }
      console.error('Delete error:', err.response || err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setSoTien('');
    setLoai('Chi tiêu');
    setGhiChu('');
    setPhuongThucThanhToan('');
    setNgayGiaoDich('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="flex items-center space-x-4 mb-6 md:mb-0">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-full shadow-lg">
              <HomeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Quản lý Giao dịch</h1>
              <p className="text-gray-500 text-base mt-2">
                {new Date().toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <TransactionForm
          accounts={accounts}
          categories={categories}
          editingTransaction={editingTransaction}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          soTien={soTien}
          setSoTien={setSoTien}
          loai={loai}
          setLoai={setLoai}
          maDanhMuc={maDanhMuc}
          setMaDanhMuc={setMaDanhMuc}
          maTaiKhoan={maTaiKhoan}
          setMaTaiKhoan={setMaTaiKhoan}
          ghiChu={ghiChu}
          setGhiChu={setGhiChu}
          phuongThucThanhToan={phuongThucThanhToan}
          setPhuongThucThanhToan={setPhuongThucThanhToan}
          ngayGiaoDich={ngayGiaoDich}
          setNgayGiaoDich={setNgayGiaoDich}
          error={error}
        />

        <TransactionList
          transactions={transactions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Dashboard;