import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFinanceDropdown, setShowFinanceDropdown] = useState(false);
  const [showGoalsDropdown, setShowGoalsDropdown] = useState(false);

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const anhDaiDien = localStorage.getItem('anhDaiDien')
    ? `${process.env.REACT_APP_API_URL}${localStorage.getItem('anhDaiDien')}`
    : '';
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/register') return;
    if (!userId) navigate('/');
  }, [userId, navigate, location.pathname]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/${userId}`);
        setNotifications(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Lỗi khi tải thông báo');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/notifications/${id}/read`, { userId });
      setNotifications(notifications.map((notif) =>
        notif._id === id ? { ...notif, daDoc: true } : notif
      ));
      toast.success('Đánh dấu thông báo đã đọc!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đánh dấu thông báo');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('email');
    localStorage.removeItem('ngaySinh');
    localStorage.removeItem('gioiTinh');
    localStorage.removeItem('anhDaiDien');
    navigate('/');
    toast.success('Đăng xuất thành công!');
  };

  const unreadCount = notifications.filter((notif) => !notif.daDoc).length;

  return (
    <nav className="bg-white shadow-md">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/overview" className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
              <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0-4c-4.418 0-8 3.582-8 8 8 8 8-3.582 8-8-3.582-8-8-8z" />
              </svg>
              <span className="text-xl font-bold text-gray-900">ViSmart</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {userId ? (
              <>
                {/* Tổng quan */}
                <Link
                  to="/overview"
                  className={`text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-md transition-all duration-300 ${
                    location.pathname === '/overview' ? 'text-emerald-600 bg-emerald-50 font-semibold' : ''
                  }`}
                >
                  Tổng quan
                </Link>

                {/* Dropdown for Tài chính */}
                <div className="relative">
                  <button
                    onClick={() => setShowFinanceDropdown(!showFinanceDropdown)}
                    className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-md transition-all duration-300 flex items-center"
                  >
                    Tài chính
                    <svg className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${showFinanceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showFinanceDropdown && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-100 transform transition-all duration-200 ease-in-out">
                      <div className="py-1">
                        {[
                          { to: '/dashboard', label: 'Giao dịch' },
                          { to: '/accounts', label: 'Tài khoản' },
                          { to: '/categories', label: 'Danh mục' },
                          { to: '/budgets', label: 'Ngân sách' },
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200 ${
                              location.pathname === item.to ? 'text-emerald-600 bg-emerald-50 font-semibold' : ''
                            }`}
                            onClick={() => setShowFinanceDropdown(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dropdown for Mục tiêu */}
                <div className="relative">
                  <button
                    onClick={() => setShowGoalsDropdown(!showGoalsDropdown)}
                    className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-md transition-all duration-300 flex items-center"
                  >
                    Mục tiêu
                    <svg className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${showGoalsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showGoalsDropdown && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-100 transform transition-all duration-200 ease-in-out">
                      <div className="py-1">
                        {[
                          { to: '/saving-goals', label: 'Mục tiêu tiết kiệm' },
                          { to: '/debts', label: 'Khoản nợ' },
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200 ${
                              location.pathname === item.to ? 'text-emerald-600 bg-emerald-50 font-semibold' : ''
                            }`}
                            onClick={() => setShowGoalsDropdown(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Đầu tư (riêng) */}
                <Link
                  to="/investments"
                  className={`text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-md transition-all duration-300 ${
                    location.pathname === '/investments' ? 'text-emerald-600 bg-emerald-50 font-semibold' : ''
                  }`}
                >
                  Đầu tư
                </Link>

                {/* Báo cáo (riêng) */}
                <Link
                  to="/reports"
                  className={`text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-md transition-all duration-300 ${
                    location.pathname === '/reports' ? 'text-emerald-600 bg-emerald-50 font-semibold' : ''
                  }`}
                >
                  Báo cáo
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-300 relative"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto border border-gray-100 transform transition-all duration-200 ease-in-out">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông Báo</h3>
                        {loading ? (
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-600"></div>
                          </div>
                        ) : notifications.length === 0 ? (
                          <p className="text-gray-500 text-sm">Chưa có thông báo nào</p>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-emerald-50 transition-colors duration-150 ${
                                notif.daDoc ? 'text-gray-600' : 'text-gray-900 font-medium'
                              }`}
                            >
                              <p className="text-sm">{notif.noiDung}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notif.ngay).toLocaleString()} | {notif.loai}
                              </p>
                              {!notif.daDoc && (
                                <button
                                  onClick={() => handleMarkAsRead(notif._id)}
                                  className="text-emerald-600 text-xs hover:underline mt-1"
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

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-md transition-all duration-300"
                  >
                    {anhDaiDien ? (
                      <img
                        src={anhDaiDien}
                        alt="Ảnh đại diện"
                        className="h-8 w-8 rounded-full object-cover border border-gray-200"
                        onError={(e) => (e.target.src = 'https://placehold.co/32x32')}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium">
                        {userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="hidden lg:inline text-sm font-medium">
                      {userName || 'Người Dùng'}
                    </span>
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-100 transform transition-all duration-200 ease-in-out">
                      <div className="py-1">
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200"
                        >
                          Cài Đặt
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-200"
                        >
                          Đăng Xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm"
              >
                Đăng Nhập
              </Link>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-700 hover:text-emerald-600 focus:outline-none transition-transform duration-300"
            >
              <svg className={`h-6 w-6 transform ${showMenu ? 'rotate-90' : ''} transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {showMenu && (
        <div className="md:hidden bg-white border-t border-gray-100 transform transition-all duration-300 ease-in-out">
          <div className="px-4 py-3 space-y-2">
            {userId ? (
              <>
                {/* Tổng quan for mobile */}
                <Link
                  to="/overview"
                  className={`block px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-300 ${
                    location.pathname === '/overview' ? 'text-emerald-600 bg-emerald-50 font-semibold' : ''
                  }`}
                  onClick={() => setShowMenu(false)}
                >
                  Tổng quan
                </Link>

                {/* Tài chính group for mobile */}
                <div>
                  <button
                    onClick={() => setShowFinanceDropdown(!showFinanceDropdown)}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-300 flex justify-between items-center"
                  >
                    Tài chính
                    <svg className={`h-4 w-4 transform ${showFinanceDropdown ? 'rotate-180' : ''} transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showFinanceDropdown && (
                    <div className="pl-4 space-y-1 transform transition-all duration-200 ease-in-out">
                      {[
                        { to: '/dashboard', label: 'Giao dịch' },
                        { to: '/accounts', label: 'Tài khoản' },
                        { to: '/categories', label: 'Danh mục' },
                        { to: '/budgets', label: 'Ngân sách' },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`block px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-300 ${
                            location.pathname === item.to ? 'text-emerald-600 bg-emerald-50 font-semibold' : ''
                          }`}
                          onClick={() => setShowMenu(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mục tiêu group for mobile */}
                <div>
                  <button
                    onClick={() => setShowGoalsDropdown(!showGoalsDropdown)}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-300 flex justify-between items-center"
                  >
                    Mục tiêu
                    <svg className={`h-4 w-4 transform ${showGoalsDropdown ? 'rotate-180' : ''} transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showGoalsDropdown && (
                    <div className="pl-4 space-y-1 transform transition-all duration-200 ease-in-out">
                      {[
                        { to: '/saving-goals', label: 'Mục tiêu tiết kiệm' },
                        { to: '/debts', label: 'Khoản nợ' },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`block px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-300 ${
                            location.pathname === item.to ? 'text-emerald-600 bg-emerald-50 font-semibold' : ''
                          }`}
                          onClick={() => setShowMenu(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Đầu tư for mobile */}
                <Link
                  to="/investments"
                  className={`block px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-300 ${
                    location.pathname === '/investments' ? 'text-emerald-600 bg-emerald-50 font-semibold' : ''
                  }`}
                  onClick={() => setShowMenu(false)}
                >
                  Đầu tư
                </Link>

                {/* Báo cáo for mobile */}
                <Link
                  to="/reports"
                  className={`block px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-300 ${
                    location.pathname === '/reports' ? 'text-emerald-600 bg-emerald-50 font-semibold' : ''
                  }`}
                  onClick={() => setShowMenu(false)}
                >
                  Báo cáo
                </Link>

                <Link
                  to="/settings"
                  className="block px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-300"
                  onClick={() => setShowMenu(false)}
                >
                  Cài Đặt
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-300"
                >
                  Đăng Xuất
                </button>
              </>
            ) : (
              <Link
                to="/"
                className="block px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300"
                onClick={() => setShowMenu(false)}
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;