import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user || isInitialCheckDone) {
      return; // Bỏ qua nếu user đã được đặt hoặc kiểm tra ban đầu hoàn tất
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      console.log('Xác thực với userId:', userId, 'và token:', token.slice(0, 10) + '...');
      axios
        .get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log('Phản hồi GET /api/users/me:', res.data);
          if (res.data.user._id !== userId) {
            console.error('User ID không khớp:', res.data.user._id, userId);
            localStorage.clear();
            setUser(null);
            navigate('/');
            toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            return;
          }
          setUser({
            _id: userId,
            hoTen: res.data.user.hoTen,
            email: res.data.user.email,
            ngaySinh: res.data.user.ngaySinh,
            gioiTinh: res.data.user.gioiTinh,
            anhDaiDien: res.data.user.anhDaiDien,
          });
          localStorage.setItem('userName', res.data.user.hoTen);
          localStorage.setItem('email', res.data.user.email);
          localStorage.setItem('ngaySinh', res.data.user.ngaySinh || '');
          localStorage.setItem('gioiTinh', res.data.user.gioiTinh || '');
          localStorage.setItem('anhDaiDien', res.data.user.anhDaiDien || '');
          setIsInitialCheckDone(true);
        })
        .catch((err) => {
          console.error('Lỗi xác thực:', {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message,
            headers: err.config?.headers,
          });
          localStorage.clear();
          setUser(null);
          navigate('/');
          toast.error(
            err.response?.data?.message || 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
          );
          setIsInitialCheckDone(true);
        });
    } else {
      // console.warn('Không tìm thấy token hoặc userId trong localStorage:', { token, userId });
      setUser(null);
      navigate('/');
      setIsInitialCheckDone(true);
    }
  }, [navigate, user]);

  const login = async (tenDangNhap, matKhau) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/login`,
        { tenDangNhap, matKhau }
      );
      console.log('Phản hồi đăng nhập:', JSON.stringify(res.data, null, 2));
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('userName', res.data.user.hoTen);
      localStorage.setItem('email', res.data.user.email);
      localStorage.setItem('ngaySinh', res.data.user.ngaySinh || '');
      localStorage.setItem('gioiTinh', res.data.user.gioiTinh || '');
      localStorage.setItem('anhDaiDien', res.data.user.anhDaiDien || '');
      // console.log('localStorage sau khi đăng nhập:', {
      //   token: localStorage.getItem('token').slice(0, 10) + '...',
      //   userId: localStorage.getItem('userId'),
      // });
      setUser({
        _id: res.data.userId,
        hoTen: res.data.user.hoTen,
        email: res.data.user.email,
        ngaySinh: res.data.user.ngaySinh,
        gioiTinh: res.data.user.gioiTinh,
        anhDaiDien: res.data.user.anhDaiDien,
      });
      setIsInitialCheckDone(true);
      navigate('/overview', { replace: true });
      return res.data;
    } catch (err) {
      console.error('Lỗi đăng nhập:', err.response?.data || err.message);
      throw new Error(
        err.response?.data?.message || 'Lỗi đăng nhập. Vui lòng kiểm tra tên đăng nhập và mật khẩu.'
      );
    }
  };

  const logout = () => {
    console.log('Đăng xuất người dùng:', user?._id);
    localStorage.clear();
    setUser(null);
    navigate('/');
    toast.info('Đã đăng xuất thành công.');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isInitialCheckDone }}>
      {children}
    </AuthContext.Provider>
  );
};