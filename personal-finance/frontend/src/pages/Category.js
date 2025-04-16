import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [tenDanhMuc, setTenDanhMuc] = useState('');
  const [loai, setLoai] = useState('Chi tiêu');
  const [moTa, setMoTa] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);

  // Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/categories`);
        setCategories(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải danh mục');
      }
    };
    fetchCategories();
  }, []);

  // Thêm hoặc cập nhật danh mục
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Cập nhật danh mục
        const res = await axios.put(`${process.env.REACT_APP_API_URL}/categories/${editId}`, {
          tenDanhMuc,
          loai,
          moTa,
        });
        setCategories(categories.map((cat) => (cat._id === editId ? res.data.category : cat)));
        setEditId(null);
      } else {
        // Thêm danh mục mới
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/categories`, {
          tenDanhMuc,
          loai,
          moTa,
        });
        setCategories([...categories, res.data.category]);
      }
      setTenDanhMuc('');
      setLoai('Chi tiêu');
      setMoTa('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu danh mục');
    }
  };

  // Xóa danh mục
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/categories/${id}`);
      setCategories(categories.filter((cat) => cat._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa danh mục');
    }
  };

  // Chọn danh mục để sửa
  const handleEdit = (category) => {
    setEditId(category._id);
    setTenDanhMuc(category.tenDanhMuc);
    setLoai(category.loai);
    setMoTa(category.moTa || '');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Quản lý danh mục</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Form thêm/sửa danh mục */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-gray-700">Tên danh mục</label>
            <input
              type="text"
              value={tenDanhMuc}
              onChange={(e) => setTenDanhMuc(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Loại</label>
            <select
              value={loai}
              onChange={(e) => setLoai(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Chi tiêu">Chi tiêu</option>
              <option value="Thu nhập">Thu nhập</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mô tả</label>
            <textarea
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {editId ? 'Cập nhật danh mục' : 'Thêm danh mục'}
          </button>
        </form>

        {/* Danh sách danh mục */}
        <div className="bg-white rounded shadow-md">
          {categories.length === 0 ? (
            <p className="p-4 text-center">Chưa có danh mục nào</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Tên danh mục</th>
                  <th className="p-2 text-left">Loại</th>
                  <th className="p-2 text-left">Mô tả</th>
                  <th className="p-2 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id} className="border-t">
                    <td className="p-2">{category.tenDanhMuc}</td>
                    <td className="p-2">{category.loai}</td>
                    <td className="p-2">{category.moTa || '-'}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-500 mr-2"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
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

export default Category;