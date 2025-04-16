import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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
      console.log('Accounts fetched:', accountRes.data);
      console.log('Categories fetched:', categoryRes.data);
      setTransactions(transactionRes.data);
      setCategories(categoryRes.data);
      setAccounts(accountRes.data);
      if (categoryRes.data.length > 0) {
        setMaDanhMuc(categoryRes.data[0]._id);
      } else {
        setMaDanhMuc('');
        setError('Vui lòng tạo danh mục tại <a href="/categories" class="text-blue-500 underline">Quản lý danh mục</a>.');
      }
      if (accountRes.data.length > 0) {
        setMaTaiKhoan(accountRes.data[0]._id);
      } else {
        setMaTaiKhoan('');
        setError('Vui lòng tạo tài khoản tại <a href="/accounts" class="text-blue-500 underline">Quản lý tài khoản</a>.');
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
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
    console.log('Form submitted, button disabled:', !maTaiKhoan || !maDanhMuc || !soTien);
    console.log('Submitting transaction with:', { maTaiKhoan, maDanhMuc, soTien });
    if (!maTaiKhoan || !maDanhMuc || !soTien) {
      setError('Vui lòng nhập số tiền và chọn tài khoản, danh mục');
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
      };
      console.log('Preparing to send request:', payload);
      let res;
      if (editingTransaction) {
        res = await axios.put(`${process.env.REACT_APP_API_URL}/transactions/${editingTransaction._id}`, payload);
        setTransactions(
          transactions.map((t) => (t._id === editingTransaction._id ? res.data : t))
        );
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/transactions`, payload);
        setTransactions([...transactions, res.data]);
      }
      console.log('Response:', res.data);

      // Cập nhật lại tài khoản và danh mục
      await fetchData();

      // Reset form
      setSoTien('');
      setLoai('Chi tiêu');
      setGhiChu('');
      setPhuongThucThanhToan('');
      setError('');
      setEditingTransaction(null);
    } catch (err) {
      console.error('Request error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Lỗi khi xử lý giao dịch');
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
  };

  // Xóa giao dịch
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/transactions/${id}`);
      setTransactions(transactions.filter((t) => t._id !== id));

      // Cập nhật lại tài khoản và danh mục
      await fetchData();

      setError('');
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Lỗi khi xóa giao dịch');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Quản lý chi tiêu</h2>
        {error && <p className="text-red-500 mb-4" dangerouslySetInnerHTML={{ __html: error }} />}
        {loading && <p className="text-gray-500 mb-4 text-center">Đang tải dữ liệu...</p>}

        {/* Điều hướng */}
        <div className="mb-6 flex space-x-4 justify-center">
          <Link to="/accounts" className="text-blue-500 hover:underline">
            Quản lý tài khoản
          </Link>
          <Link to="/categories" className="text-blue-500 hover:underline">
            Quản lý danh mục
          </Link>
          <Link to="/budgets" className="text-blue-500 hover:underline">
            Quản lý ngân sách
          </Link>
        </div>

        {/* Form thêm/sửa giao dịch */}
        {!loading && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingTransaction ? 'Sửa giao dịch' : 'Thêm giao dịch'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Số tiền</label>
                <input
                  type="number"
                  name="soTien"
                  value={soTien}
                  onChange={(e) => setSoTien(e.target.value)}
                  placeholder="Số tiền"
                  className="w-full p-2 border rounded"
                  required
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-700">Loại</label>
                <select
                  value={loai}
                  onChange={(e) => setLoai(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Thu nhập">Thu nhập</option>
                  <option value="Chi tiêu">Chi tiêu</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Tài khoản</label>
                <select
                  name="maTaiKhoan"
                  value={maTaiKhoan}
                  onChange={(e) => setMaTaiKhoan(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  {accounts.length === 0 ? (
                    <option value="">Chưa có tài khoản</option>
                  ) : (
                    accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.tenTaiKhoan} ({acc.loaiTaiKhoan})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Danh mục</label>
                <select
                  name="maDanhMuc"
                  value={maDanhMuc}
                  onChange={(e) => setMaDanhMuc(e.target.value)}
                  className="w-full p-2 border rounded"
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
                <label className="block text-gray-700">Phương thức thanh toán</label>
                <select
                  value={phuongThucThanhToan}
                  onChange={(e) => setPhuongThucThanhToan(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Chọn phương thức</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Ví điện tử">Ví điện tử</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700">Ghi chú</label>
                <input
                  type="text"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  placeholder="Ghi chú"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={!maTaiKhoan || !maDanhMuc || !soTien}
                >
                  {editingTransaction ? 'Lưu thay đổi' : 'Thêm giao dịch'}
                </button>
                {editingTransaction && (
                  <button
                    type="button"
                    className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    onClick={() => {
                      setEditingTransaction(null);
                      setSoTien('');
                      setLoai('Chi tiêu');
                      setGhiChu('');
                      setPhuongThucThanhToan('');
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

        {/* Danh sách giao dịch */}
        <div className="bg-white rounded shadow-md">
          <h3 className="text-xl font-semibold p-4">Danh sách giao dịch</h3>
          {loading ? (
            <p className="p-4 text-center">Đang tải giao dịch...</p>
          ) : transactions.length === 0 ? (
            <p className="p-4 text-center">Chưa có giao dịch nào</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="p-4 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{transaction.loai}</span>: {transaction.soTien.toLocaleString()} VNĐ
                    <br />
                    <span className="text-gray-600">
                      Tài khoản: {transaction.maTaiKhoan?.tenTaiKhoan || 'Không xác định'}<br />
                      Danh mục: {transaction.maDanhMuc?.tenDanhMuc || 'Không xác định'}<br />
                      Phương thức: {transaction.phuongThucThanhToan || 'Không có'}<br />
                      Ghi chú: {transaction.ghiChu || 'Không có ghi chú'}<br />
                      Ngày: {new Date(transaction.ngayGiaoDich).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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