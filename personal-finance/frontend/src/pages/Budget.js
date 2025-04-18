import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [maDanhMuc, setMaDanhMuc] = useState('');
  const [soTien, setSoTien] = useState('');
  const [ngayBatDau, setNgayBatDau] = useState('');
  const [ngayKetThuc, setNgayKetThuc] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [trangThai, setTrangThai] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate('/');
    }
  }, [userId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [budgetRes, categoryRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/budgets/${userId}`),
          axios.get(`${process.env.REACT_APP_API_URL}/categories`),
        ]);
        const newBudgets = budgetRes.data;
        setBudgets(newBudgets);
        setCategories(categoryRes.data);
        if (categoryRes.data.length > 0) {
          setMaDanhMuc(categoryRes.data[0]._id);
        } else {
          setError('Vui lòng tạo danh mục tại <a href="/categories" class="text-blue-500 underline">Quản lý danh mục</a>.');
          toast.error('Chưa có danh mục, vui lòng tạo danh mục trước.');
        }
        const recentlyEnded = newBudgets.filter(
          (bud) => !bud.trangThai && new Date(bud.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        recentlyEnded.forEach((bud) => {
          if (bud.maDanhMuc?.tenDanhMuc) {
            toast.info(`Ngân sách "${bud.maDanhMuc.tenDanhMuc}" đã kết thúc vào ${new Date(bud.ngayKetThuc).toLocaleDateString()}`, {
              toastId: `budget-${bud._id}`,
            });
          }
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Lỗi khi tải dữ liệu';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maDanhMuc || !soTien || !ngayBatDau || !ngayKetThuc) {
      setError('Vui lòng nhập đầy đủ danh mục, số tiền, ngày bắt đầu và ngày kết thúc');
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    const soTienNum = parseFloat(soTien);
    if (isNaN(soTienNum) || soTienNum <= 0) {
      setError('Số tiền phải là số dương hợp lệ');
      toast.error('Số tiền phải là số dương hợp lệ');
      return;
    }
    const startDate = new Date(ngayBatDau);
    const endDate = new Date(ngayKetThuc);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError('Ngày bắt đầu và ngày kết thúc phải hợp lệ');
      toast.error('Ngày bắt đầu và ngày kết thúc phải hợp lệ');
      return;
    }
    if (endDate < startDate) {
      setError('Ngày kết thúc phải sau ngày bắt đầu');
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      const payload = {
        userId,
        maDanhMuc,
        soTien: soTienNum,
        ngayBatDau,
        ngayKetThuc,
        ghiChu,
        trangThai,
      };
      let res;
      if (editId) {
        res = await axios.put(`${process.env.REACT_APP_API_URL}/budgets/${editId}`, payload);
        setBudgets(budgets.map((bud) => (bud._id === editId ? res.data.budget : bud)));
        toast.success('Cập nhật ngân sách thành công!');
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/budgets`, payload);
        setBudgets([...budgets, res.data.budget]);
        toast.success('Thêm ngân sách thành công!');
      }
      setMaDanhMuc(categories[0]?._id || '');
      setSoTien('');
      setNgayBatDau('');
      setNgayKetThuc('');
      setGhiChu('');
      setTrangThai(true);
      setEditId(null);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu ngân sách';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa ngân sách này?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/budgets/${id}?userId=${userId}`);
      setBudgets(budgets.filter((bud) => bud._id !== id));
      toast.success('Xóa ngân sách thành công!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa ngân sách';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (budget) => {
    setEditId(budget._id);
    setMaDanhMuc(budget.maDanhMuc?._id || '');
    setSoTien(budget.soTien.toString());
    setNgayBatDau(new Date(budget.ngayBatDau).toISOString().split('T')[0]);
    setNgayKetThuc(new Date(budget.ngayKetThuc).toISOString().split('T')[0]);
    setGhiChu(budget.ghiChu || '');
    setTrangThai(budget.trangThai);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setMaDanhMuc(categories[0]?._id || '');
    setSoTien('');
    setNgayBatDau('');
    setNgayKetThuc('');
    setGhiChu('');
    setTrangThai(true);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
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
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Quản lý ngân sách</h2>
        {error && <p className="text-red-500 mb-4" dangerouslySetInnerHTML={{ __html: error }} />}
        {loading && <p className="text-gray-500 mb-4 text-center">Đang tải dữ liệu...</p>}

        {!loading && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editId ? 'Sửa ngân sách' : 'Thêm ngân sách'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Danh mục</label>
                <select
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
                <label className="block text-gray-700">Số tiền</label>
                <input
                  type="number"
                  value={soTien}
                  onChange={(e) => setSoTien(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="Số tiền"
                />
              </div>
              <div>
                <label className="block text-gray-700">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={ngayBatDau}
                  onChange={(e) => setNgayBatDau(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Ngày kết thúc</label>
                <input
                  type="date"
                  value={ngayKetThuc}
                  onChange={(e) => setNgayKetThuc(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700">Ghi chú</label>
                <textarea
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Ghi chú"
                  rows="4"
                />
              </div>
              <div>
                <label className="block text-gray-700">Trạng thái</label>
                <select
                  value={trangThai}
                  onChange={(e) => setTrangThai(e.target.value === 'true')}
                  className="w-full p-2 border rounded"
                >
                  <option value={true}>Hoạt động</option>
                  <option value={false}>Kết thúc</option>
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={!maDanhMuc || !soTien || !ngayBatDau || !ngayKetThuc || parseFloat(soTien) <= 0}
                >
                  {editId ? 'Cập nhật ngân sách' : 'Thêm ngân sách'}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    onClick={handleCancelEdit}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        <div className="bg-white rounded shadow-md">
          <h3 className="text-xl font-semibold p-4">Danh sách ngân sách</h3>
          {loading ? (
            <p className="p-4 text-center">Đang tải ngân sách...</p>
          ) : budgets.length === 0 ? (
            <p className="p-4 text-center">Chưa có ngân sách nào</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {budgets.map((budget) => (
                <div key={budget._id} className="p-4 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{budget.maDanhMuc?.tenDanhMuc || 'Không xác định'}</span>
                    <br />
                    <span className="text-gray-600">
                      Số tiền: {budget.soTien.toLocaleString()} VNĐ<br />
                      Ngày bắt đầu: {new Date(budget.ngayBatDau).toLocaleDateString()}<br />
                      Ngày kết thúc: {new Date(budget.ngayKetThuc).toLocaleDateString()}<br />
                      Ghi chú: {budget.ghiChu || 'Không có ghi chú'}<br />
                      Trạng thái: {budget.trangThai ? 'Hoạt động' : 'Kết thúc'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(budget._id)}
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

export default Budget;