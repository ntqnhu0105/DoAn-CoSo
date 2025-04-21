import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [email, setEmail] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [ngaySinh, setNgaySinh] = useState('');
  const [gioiTinh, setGioiTinh] = useState('');
  const [anhDaiDien, setAnhDaiDien] = useState(null); // Lưu file ảnh
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!process.env.REACT_APP_API_URL) {
        throw new Error('REACT_APP_API_URL is not defined');
      }
      const formData = new FormData();
      formData.append('tenDangNhap', tenDangNhap);
      formData.append('matKhau', matKhau);
      formData.append('email', email);
      formData.append('hoTen', hoTen);
      if (ngaySinh) formData.append('ngaySinh', ngaySinh);
      if (gioiTinh) formData.append('gioiTinh', gioiTinh);
      if (anhDaiDien) formData.append('anhDaiDien', anhDaiDien);
  
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      localStorage.setItem('anhDaiDien', res.data.user.anhDaiDien || '');
      setError('');
      toast.success(res.data.message);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đăng ký thất bại';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Đăng Ký</h2>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Đăng Nhập</label>
            <input
              type="text"
              value={tenDangNhap}
              onChange={(e) => setTenDangNhap(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật Khẩu</label>
            <input
              type="password"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ Tên</label>
            <input
              type="text"
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Sinh</label>
            <input
              type="date"
              value={ngaySinh}
              onChange={(e) => setNgaySinh(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới Tính</label>
            <select
              value={gioiTinh}
              onChange={(e) => setGioiTinh(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh Đại Diện</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={(e) => setAnhDaiDien(e.target.files[0])}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {anhDaiDien && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(anhDaiDien)}
                  alt="Ảnh đại diện xem trước"
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
          >
            Đăng Ký
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Đã có tài khoản?{' '}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-emerald-500 hover:underline"
          >
            Đăng Nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;