import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [ngayGiaoDich, setNgayGiaoDich] = useState('');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Kiểm tra userId
  useEffect(() => {
    if (!userId) {
      navigate('/');
    }
  }, [userId, navigate]);

  // Hàm lấy dữ liệu chung
  const fetchData = async () => {
    setLoading(true);
    try {
      const [transactionRes, categoryRes, accountRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/transactions/${userId}`),
        axios.get(`${process.env.REACT_APP_API_URL}/categories`),
        axios.get(`${process.env.REACT_APP_API_URL}/accounts/${userId}`),
      ]);
      setTransactions(transactionRes.data);
      setCategories(categoryRes.data);
      setAccounts(accountRes.data);
      if (categoryRes.data.length > 0) {
        setMaDanhMuc(categoryRes.data[0]._id);
      } else {
        setMaDanhMuc('');
        setError('Vui lòng tạo danh mục tại <Link to="/categories" className="text-blue-600 underline">Quản lý danh mục</Link>.');
      }
      if (accountRes.data.length > 0) {
        setMaTaiKhoan(accountRes.data[0]._id);
      } else {
        setMaTaiKhoan('');
        setError('Vui lòng tạo tài khoản tại <Link to="/accounts" className="text-blue-600 underline">Quản lý tài khoản</Link>.');
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
      toast.error(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  // Thêm hoặc sửa giao dịch
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maTaiKhoan || !maDanhMuc || !soTien) {
      setError('Vui lòng nhập số tiền và chọn tài khoản, danh mục');
      toast.error('Vui lòng nhập số tiền và chọn tài khoản, danh mục');
      return;
    }
    if (parseFloat(soTien) <= 0) {
      setError('Số tiền phải lớn hơn 0');
      toast.error('Số tiền phải lớn hơn 0');
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
        res = await axios.put(`${process.env.REACT_APP_API_URL}/transactions/${editingTransaction._id}`, payload);
        setTransactions(
          transactions.map((t) => (t._id === editingTransaction._id ? res.data : t))
        );
        toast.success('Sửa giao dịch thành công!');
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/transactions`, payload);
        setTransactions([...transactions, res.data]);
        toast.success('Thêm giao dịch thành công!');
      }

      // Cập nhật lại tài khoản và danh mục
      await fetchData();

      // Reset form
      setSoTien('');
      setLoai('Chi tiêu');
      setGhiChu('');
      setPhuongThucThanhToan('');
      setNgayGiaoDich('');
      setError('');
      setEditingTransaction(null);
    } catch (err) {
      console.error('Request error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Lỗi khi xử lý giao dịch';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Mở form sửa giao dịch
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setSoTien(transaction.soTien.toString());
    setLoai(transaction.loai);
    setMaTaiKhoan(transaction.maTaiKhoan?._id || '');
    setMaDanhMuc(transaction.maDanhMuc?._id || '');
    setGhiChu(transaction.ghiChu || '');
    setPhuongThucThanhToan(transaction.phuongThucThanhToan || '');
    setNgayGiaoDich(transaction.ngayGiaoDich ? new Date(transaction.ngayGiaoDich).toISOString().split('T')[0] : '');
  };

  // Xóa giao dịch
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/transactions/${id}`);
      setTransactions(transactions.filter((t) => t._id !== id));
      await fetchData();
      setError('');
      toast.success('Xóa giao dịch thành công!');
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa giao dịch';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center sm:text-4xl">
          Quản Lý Chi Tiêu
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm">
            <p dangerouslySetInnerHTML={{ __html: error }} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Navigation Links */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          {[
            { to: '/accounts', label: 'Quản lý tài khoản' },
            { to: '/categories', label: 'Quản lý danh mục' },
            { to: '/budgets', label: 'Quản lý ngân sách' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Form Thêm/Sửa Giao Dịch */}
        {!loading && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingTransaction ? 'Sửa Giao Dịch' : 'Thêm Giao Dịch'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số Tiền
                </label>
                <input
                  type="number"
                  name="soTien"
                  value={soTien}
                  onChange={(e) => setSoTien(e.target.value)}
                  placeholder="Nhập số tiền"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  step="0.01"
                  min="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày Giao Dịch
                </label>
                <input
                  type="date"
                  value={ngayGiaoDich}
                  onChange={(e) => setNgayGiaoDich(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại
                </label>
                <select
                  value={loai}
                  onChange={(e) => setLoai(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="Thu nhập">Thu nhập</option>
                  <option value="Chi tiêu">Chi tiêu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tài Khoản
                </label>
                <select
                  name="maTaiKhoan"
                  value={maTaiKhoan}
                  onChange={(e) => setMaTaiKhoan(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  {accounts.length === 0 ? (
                    <option value="">Chưa có tài khoản</option>
                  ) : (
                    accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.tenTaiKhoan} ({acc.loaiTaiKhoan}) - {acc.soDu.toLocaleString()} VNĐ
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh Mục
                </label>
                <select
                  name="maDanhMuc"
                  value={maDanhMuc}
                  onChange={(e) => setMaDanhMuc(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  {categories.length === 0 ? (
                    <option value="">Chưa có danh mục</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.tenDucedmuc} ({cat.loai})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương Thức Thanh Toán
                </label>
                <select
                  value={phuongThucThanhToan}
                  onChange={(e) => setPhuongThucThanhToan(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Chọn phương thức</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Ví điện tử">Ví điện tử</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi Chú
                </label>
                <input
                  type="text"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  placeholder="Nhập ghi chú"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!maTaiKhoan || !maDanhMuc || !soTien || parseFloat(soTien) <= 0}
                >
                  {editingTransaction ? 'Lưu Thay Đổi' : 'Thêm Giao Dịch'}
                </button>
                {editingTransaction && (
                  <button
                    type="button"
                    className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => {
                      setEditingTransaction(null);
                      setSoTien('');
                      setLoai('Chi tiêu');
                      setGhiChu('');
                      setPhuongThucThanhToan('');
                      setNgayGiaoDich('');
                      setError('');
                    }}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Danh Sách Giao Dịch */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 p-6">Danh Sách Giao Dịch</h3>
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Đang tải giao dịch...</p>
            </div>
          ) : transactions.length === 0 ? (
            <p className="p-6 text-center text-gray-500">Chưa có giao dịch nào</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          transaction.loai === 'Thu nhập' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.loai}
                      </span>
                      <span className="text-gray-900">
                        {transaction.soTien.toLocaleString()} VNĐ
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Tài khoản:</span>{' '}
                        {transaction.maTaiKhoan?.tenTaiKhoan || 'Không xác định'} (
                        {transaction.maTaiKhoan?.soDu?.toLocaleString() || '0'} VNĐ)
                      </p>
                      <p>
                        <span className="font-medium">Danh mục:</span>{' '}
                        {transaction.maDanhMuc?.tenDanhMuc || 'Không xác định'}
                      </p>
                      <p>
                        <span className="font-medium">Phương thức:</span>{' '}
                        {transaction.phuongThucThanhToan || 'Không có'}
                      </p>
                      <p>
                        <span className="font-medium">Ghi chú:</span>{' '}
                        {transaction.ghiChu || 'Không có ghi chú'}
                      </p>
                      <p>
                        <span className="font-medium">Ngày:</span>{' '}
                        {new Date(transaction.ngayGiaoDich).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;