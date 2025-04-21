import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Settings = () => {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [hoTen, setHoTen] = useState(localStorage.getItem('userName') || '');
  const [ngaySinh, setNgaySinh] = useState(
    localStorage.getItem('ngaySinh') ? new Date(localStorage.getItem('ngaySinh')).toISOString().split('T')[0] : ''
  );
  const [gioiTinh, setGioiTinh] = useState(localStorage.getItem('gioiTinh') || '');
  const [anhDaiDien, setAnhDaiDien] = useState(null);
  const [currentAnhDaiDien, setCurrentAnhDaiDien] = useState(localStorage.getItem('anhDaiDien') || '');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate('/');
    } else {
      const fetchUserData = async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/${userId}`);
          setTenDangNhap(res.data.user.tenDangNhap);
          setCurrentAnhDaiDien(res.data.user.anhDaiDien || '');
          localStorage.setItem('anhDaiDien', res.data.user.anhDaiDien || '');
        } catch (err) {
          toast.error('Lỗi khi tải thông tin người dùng');
        }
      };
      fetchUserData();
    }
  }, [userId, navigate]);

  useEffect(() => {
    console.log('currentAnhDaiDien:', currentAnhDaiDien);
    console.log('API URL:', process.env.REACT_APP_API_URL);
    console.log('Full image URL:', currentAnhDaiDien ? `${process.env.REACT_APP_API_URL}${currentAnhDaiDien}` : 'No image');
  }, [currentAnhDaiDien]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setAnhDaiDien(file);
      console.log('Selected file:', file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!process.env.REACT_APP_API_URL) {
        throw new Error('REACT_APP_API_URL is not defined');
      }
      const formData = new FormData();
      formData.append('email', email);
      formData.append('hoTen', hoTen);
      if (ngaySinh) formData.append('ngaySinh', ngaySinh);
      if (gioiTinh) formData.append('gioiTinh', gioiTinh);
      if (matKhau) formData.append('matKhau', matKhau);
      if (anhDaiDien) formData.append('anhDaiDien', anhDaiDien);

      const res = await axios.put(`${process.env.REACT_APP_API_URL}/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      localStorage.setItem('email', res.data.user.email);
      localStorage.setItem('userName', res.data.user.hoTen);
      localStorage.setItem('ngaySinh', res.data.user.ngaySinh || '');
      localStorage.setItem('gioiTinh', res.data.user.gioiTinh || '');
      localStorage.setItem('anhDaiDien', res.data.user.anhDaiDien || '');

      setCurrentAnhDaiDien(res.data.user.anhDaiDien || '');
      setAnhDaiDien(null);
      setMatKhau('');
      setError('');
      toast.success(res.data.message);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Cập nhật thông tin thất bại';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-gray-100 py-12 px-4">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-bold text-emerald-800 mb-8 text-center tracking-wide">Cài Đặt Tài Khoản</h2>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-center">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Tên Đăng Nhập</label>
            <input
              type="text"
              value={tenDangNhap}
              disabled
              className="w-full p-4 bg-gray-100 text-gray-500 rounded-lg border border-gray-200 cursor-not-allowed focus:outline-none focus:ring-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Họ Tên</label>
            <input
              type="text"
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Ngày Sinh</label>
            <input
              type="date"
              value={ngaySinh}
              onChange={(e) => setNgaySinh(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Giới Tính</label>
            <select
              value={gioiTinh}
              onChange={(e) => setGioiTinh(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-300"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Ảnh Đại Diện</label>
            {currentAnhDaiDien && (
              <div className="mb-4 flex justify-center">
                <div className="relative group">
                  <img
                    src={`${process.env.REACT_APP_API_URL}${currentAnhDaiDien}`}
                    alt="Ảnh đại diện hiện tại"
                    className="h-24 w-24 rounded-full object-cover border-4 border-emerald-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => (e.target.src = 'https://placehold.co/96x96')}
                  />
                  <div className="absolute inset-0 rounded-full bg-emerald-800 bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">Ảnh hiện tại</span>
                  </div>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleImageChange}
              className="w-full p-4 border border-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all duration-200"
            />
            {anhDaiDien && (
              <div className="mt-4 flex justify-center">
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(anhDaiDien)}
                    alt="Ảnh đại diện xem trước"
                    className="h-24 w-24 rounded-full object-cover border-4 border-emerald-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-emerald-800 bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">Ảnh mới</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Mật Khẩu (yêu cầu khi thay đổi email)</label>
            <input
              type="password"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-300"
              placeholder="Nhập mật khẩu để xác nhận"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all duration-300"
          >
            Cập Nhật
          </button>
        </form>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-4 w-full py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300"
        >
          Quay Lại
        </button>
      </div>
    </div>
  );
};

export default Settings;