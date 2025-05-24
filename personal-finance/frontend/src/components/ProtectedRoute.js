import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isInitialCheckDone } = useContext(AuthContext);

  if (!isInitialCheckDone) {
    return <div>Loading...</div>; // Hiển thị loading trong khi kiểm tra
  }

  if (!user) {
    console.warn('Không có người dùng, chuyển hướng đến trang đăng nhập');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;