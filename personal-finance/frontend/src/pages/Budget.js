import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [maDanhMuc, setMaDanhMuc] = useState('');
  const [soTien, setSoTien] = useState('');
  const [ngayBatDau, setNgayBatDau] = useState('');
  const [ngayKetThuc, setNgayKetThuc] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const userId = localStorage.getItem('userId');

  // Lấy danh sách ngân sách và danh mục
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetRes, categoryRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/budgets/${userId}`),
          axios.get(`${process.env.REACT_APP_API_URL}/categories`),
        ]);
        setBudgets(budgetRes.data);
        setCategories(categoryRes.data);
        if (categoryRes.data.length > 0) {
          setMaDanhMuc(categoryRes.data[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
      }
    };
    if (userId) fetchData();
  }, [userId]);

  // Thêm hoặc cập nhật ngân sách
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Cập nhật ngân sách
        const res = await axios.put(`${process.env.REACT_APP_API_URL}/budgets/${editId}`, {
          userId,
          maDanhMuc,
          soTien: parseFloat(soTien),
          ngayBatDau,
          ngayKetThuc,
          ghiChu,
        });
        setBudgets(budgets.map((bud) => (bud._id === editId ? res.data.budget : bud)));
        setEditId(null);
      } else {
        // Thêm ngân sách mới
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/budgets`, {
          userId,
          maDanhMuc,
          soTien: parseFloat(soTien),
          ngayBatDau,
          ngayKetThuc,
          ghiChu,
        });
        setBudgets([...budgets, res.data.budget]);
      }
      setMaDanhMuc(categories[0]?._id || '');
      setSoTien('');
      setNgayBatDau('');
      setNgayKetThuc('');
      setGhiChu('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu ngân sách');
    }
  };

  // Xóa ngân sách
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/budgets/${id}`);
      setBudgets(budgets.filter((bud) => bud._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa ngân sách');
    }
  };

  // Chọn ngân sách để sửa
  const handleEdit = (budget) => {
    setEditId(budget._id);
    setMaDanhMuc(budget.maDanhMuc._id);
    setSoTien(budget.soTien.toString());
    setNgayBatDau(budget.ngayBatDau.split('T')[0]);
    setNgayKetThuc(budget.ngayKetThuc.split('T')[0]);
    setGhiChu(budget.ghiChu || '');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Quản lý ngân sách</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Form thêm/sửa ngân sách */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-gray-700">Danh mục</label>
            <select
              value={maDanhMuc}
              onChange={(e) => setMaDanhMuc(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.tenDanhMuc} ({cat.loai})
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Số tiền</label>
            <input
              type="number"
              value={soTien}
              onChange={(e) => setSoTien(e.target.value)}
              className="w-full p-2 border rounded"
              required
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Ngày bắt đầu</label>
            <input
              type="date"
              value={ngayBatDau}
              onChange={(e) => setNgayBatDau(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Ngày kết thúc</label>
            <input
              type="date"
              value={ngayKetThuc}
              onChange={(e) => setNgayKetThuc(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Ghi chú</label>
            <textarea
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {editId ? 'Cập nhật ngân sách' : 'Thêm ngân sách'}
          </button>
        </form>

        {/* Danh sách ngân sách */}
        <div className="bg-white rounded shadow-md">
          {budgets.length === 0 ? (
            <p className="p-4 text-center">Chưa có ngân sách nào</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Danh mục</th>
                  <th className="p-2 text-left">Số tiền</th>
                  <th className="p-2 text-left">Ngày bắt đầu</th>
                  <th className="p-2 text-left">Ngày kết thúc</th>
                  <th className="p-2 text-left">Ghi chú</th>
                  <th className="p-2 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => (
                  <tr key={budget._id} className="border-t">
                    <td className="p-2">{budget.maDanhMuc?.tenDanhMuc || '-'}</td>
                    <td className="p-2">{budget.soTien.toLocaleString()} VNĐ</td>
                    <td className="p-2">{new Date(budget.ngayBatDau).toLocaleDateString()}</td>
                    <td className="p-2">{new Date(budget.ngayKetThuc).toLocaleDateString()}</td>
                    <td className="p-2">{budget.ghiChu || '-'}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="text-blue-500 mr-2"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(budget._id)}
                        className="text-red-500"
                      >
                        Xóa
                      </button>
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

export default Budget;