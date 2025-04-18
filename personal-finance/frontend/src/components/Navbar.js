import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BellIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate('/');
    }
  }, [userId, navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/${userId}`);
        setNotifications(res.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Lỗi khi tải thông báo';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/notifications/${id}/read`, { userId });
      setNotifications(notifications.map((notif) =>
        notif._id === id ? { ...notif, daDoc: true } : notif
      ));
      toast.success('Đánh dấu thông báo đã đọc!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi đánh dấu thông báo';
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
    toast.success('Đăng xuất thành công!');
  };

  const unreadCount = notifications.filter((notif) => !notif.daDoc).length;

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
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
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          Quản lý tài chính cá nhân
        </div>
        <div className="flex items-center space-x-4">
          {userId ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-gray-200">Trang chủ</Link>
              <Link to="/accounts" className="text-white hover:text-gray-200">Tài khoản</Link>
              <Link to="/categories" className="text-white hover:text-gray-200">Danh mục</Link>
              <Link to="/budgets" className="text-white hover:text-gray-200">Ngân sách</Link>
              <Link to="/saving-goals" className="text-white hover:text-gray-200">Mục tiêu tiết kiệm</Link>
              <Link to="/debts" className="text-white hover:text-gray-200">Khoản nợ</Link>
              <Link to="/investments" className="text-white hover:text-gray-200">Đầu tư</Link>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-white hover:text-gray-200 focus:outline-none relative"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">Thông báo</h3>
                      {loading ? (
                        <p className="text-gray-500">Đang tải...</p>
                      ) : notifications.length === 0 ? (
                        <p className="text-gray-500">Chưa có thông báo nào</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`p-2 border-b ${notif.daDoc ? 'text-gray-600' : 'text-black font-medium'}`}
                          >
                            <p>{notif.noiDung}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(notif.ngay).toLocaleString()} | {notif.loai}
                            </p>
                            {!notif.daDoc && (
                              <button
                                onClick={() => handleMarkAsRead(notif._id)}
                                className="text-blue-500 text-sm hover:underline"
                              >
                                Đánh dấu đã đọc
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-200"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/" className="text-white hover:text-gray-200">Đăng nhập</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;