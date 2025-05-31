"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import {
  HomeIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  TagIcon,
  CalculatorIcon,
  FlagIcon,
  DocumentChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline"

const Navbar = () => {
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showFinanceDropdown, setShowFinanceDropdown] = useState(false)
  const [showGoalsDropdown, setShowGoalsDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const userId = localStorage.getItem("userId")
  const userName = localStorage.getItem("userName")
  const anhDaiDien = localStorage.getItem("anhDaiDien")
    ? `${process.env.REACT_APP_API_URL}${localStorage.getItem("anhDaiDien")}`
    : ""
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/register") return
    if (!userId) navigate("/")
  }, [userId, navigate, location.pathname])

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return
      setLoading(true)
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/${userId}`)
        setNotifications(res.data)
      } catch (err) {
        toast.error(err.response?.data?.message || "Lỗi khi tải thông báo")
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [userId])

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/notifications/${id}/read`, { userId })
      setNotifications(notifications.map((notif) => (notif._id === id ? { ...notif, daDoc: true } : notif)))
      toast.success("Đánh dấu thông báo đã đọc!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi đánh dấu thông báo")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("email")
    localStorage.removeItem("ngaySinh")
    localStorage.removeItem("gioiTinh")
    localStorage.removeItem("anhDaiDien")
    localStorage.removeItem("token")
    navigate("/")
    toast.success("Đăng xuất thành công!")
  }

  const unreadCount = notifications.filter((notif) => !notif.daDoc).length

  const financeMenuItems = [
    { to: "/dashboard", label: "Giao dịch", icon: CreditCardIcon, description: "Quản lý thu chi" },
    { to: "/accounts", label: "Tài khoản", icon: BanknotesIcon, description: "Tài khoản ngân hàng" },
    { to: "/categories", label: "Danh mục", icon: TagIcon, description: "Phân loại chi tiêu" },
    { to: "/budgets", label: "Ngân sách", icon: CalculatorIcon, description: "Lập kế hoạch chi tiêu" },
  ]

  const goalsMenuItems = [
    { to: "/saving-goals", label: "Tiết kiệm", icon: FlagIcon, description: "Mục tiêu tiết kiệm" },
    { to: "/debts", label: "Khoản nợ", icon: DocumentChartBarIcon, description: "Quản lý nợ vay" },
  ]

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100/50 sticky top-0 z-50">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="light"
          toastStyle={{
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/overview"
                className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-emerald-500 to-blue-600 p-2 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                >
                  <HomeIcon className="h-6 w-6 text-white" />
                </motion.div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    ViSmart
                  </span>
                  <p className="text-xs text-gray-500 font-medium">Quản lý tài chính thông minh</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {userId ? (
                <>
                  {/* Overview */}
                  <Link
                    to="/overview"
                    className={`group flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      location.pathname === "/overview"
                        ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                    }`}
                  >
                    <HomeIcon className="h-5 w-5" />
                    <span className="font-medium">Tổng quan</span>
                  </Link>

                  {/* Finance Dropdown */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowFinanceDropdown(!showFinanceDropdown)}
                      whileHover={{ scale: 1.02 }}
                      className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 transition-all duration-300"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      <span className="font-medium">Tài chính</span>
                      <motion.div animate={{ rotate: showFinanceDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDownIcon className="h-4 w-4" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {showFinanceDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 mt-2 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 z-50"
                        >
                          <div className="p-2">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <h3 className="text-sm font-semibold text-gray-900">Quản lý tài chính</h3>
                              <p className="text-xs text-gray-500 mt-1">Theo dõi và quản lý chi tiêu của bạn</p>
                            </div>
                            <div className="py-2">
                              {financeMenuItems.map((item) => (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    location.pathname === item.to
                                      ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                                      : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                                  }`}
                                  onClick={() => setShowFinanceDropdown(false)}
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`p-2 rounded-lg ${
                                      location.pathname === item.to
                                        ? "bg-white/20"
                                        : "bg-gray-100 group-hover:bg-emerald-100"
                                    }`}
                                  >
                                    <item.icon className="h-5 w-5" />
                                  </motion.div>
                                  <div>
                                    <p className="font-medium">{item.label}</p>
                                    <p
                                      className={`text-xs ${
                                        location.pathname === item.to ? "text-white/80" : "text-gray-500"
                                      }`}
                                    >
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Goals Dropdown */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowGoalsDropdown(!showGoalsDropdown)}
                      whileHover={{ scale: 1.02 }}
                      className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 transition-all duration-300"
                    >
                      <FlagIcon className="h-5 w-5" />
                      <span className="font-medium">Mục tiêu</span>
                      <motion.div animate={{ rotate: showGoalsDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDownIcon className="h-4 w-4" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {showGoalsDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 mt-2 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 z-50"
                        >
                          <div className="p-2">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <h3 className="text-sm font-semibold text-gray-900">Mục tiêu tài chính</h3>
                              <p className="text-xs text-gray-500 mt-1">Đặt và theo dõi mục tiêu của bạn</p>
                            </div>
                            <div className="py-2">
                              {goalsMenuItems.map((item) => (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    location.pathname === item.to
                                      ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                                      : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                                  }`}
                                  onClick={() => setShowGoalsDropdown(false)}
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`p-2 rounded-lg ${
                                      location.pathname === item.to
                                        ? "bg-white/20"
                                        : "bg-gray-100 group-hover:bg-emerald-100"
                                    }`}
                                  >
                                    <item.icon className="h-5 w-5" />
                                  </motion.div>
                                  <div>
                                    <p className="font-medium">{item.label}</p>
                                    <p
                                      className={`text-xs ${
                                        location.pathname === item.to ? "text-white/80" : "text-gray-500"
                                      }`}
                                    >
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Investments */}
                  <Link
                    to="/investments"
                    className={`group flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      location.pathname === "/investments"
                        ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                    }`}
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    <span className="font-medium">Đầu tư</span>
                  </Link>

                  {/* Reports */}
                  <Link
                    to="/reports"
                    className={`group flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      location.pathname === "/reports"
                        ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                    }`}
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    <span className="font-medium">Báo cáo</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/"
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 shadow-lg font-medium"
                >
                  Đăng Nhập
                </Link>
              )}
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-2">
              {userId && (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowNotifications(!showNotifications)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative p-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 rounded-xl transition-all duration-300"
                    >
                      <BellIcon className="h-6 w-6" />
                      {unreadCount > 0 && (
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                          className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </motion.span>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 z-50 max-h-96 overflow-hidden"
                        >
                          <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
                              {unreadCount > 0 && (
                                <span className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-xs rounded-full">
                                  {unreadCount} mới
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {loading ? (
                              <div className="flex justify-center py-8">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                  className="rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"
                                />
                              </div>
                            ) : notifications.length === 0 ? (
                              <div className="text-center py-8">
                                <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Chưa có thông báo nào</p>
                              </div>
                            ) : (
                              notifications.map((notif) => (
                                <motion.div
                                  key={notif._id}
                                  whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}
                                  className={`p-4 border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                                    notif.daDoc ? "opacity-60" : ""
                                  }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      className={`p-2 rounded-lg ${
                                        notif.daDoc ? "bg-gray-100" : "bg-gradient-to-r from-emerald-500 to-blue-600"
                                      }`}
                                    >
                                      <BellIcon className={`h-4 w-4 ${notif.daDoc ? "text-gray-400" : "text-white"}`} />
                                    </motion.div>
                                    <div className="flex-1">
                                      <p
                                        className={`text-sm ${
                                          notif.daDoc ? "text-gray-600" : "text-gray-900 font-medium"
                                        }`}
                                      >
                                        {notif.noiDung}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notif.ngay).toLocaleString()} • {notif.loai}
                                      </p>
                                      {!notif.daDoc && (
                                        <motion.button
                                          onClick={() => handleMarkAsRead(notif._id)}
                                          whileHover={{ scale: 1.05 }}
                                          className="text-emerald-600 text-xs hover:underline mt-2 font-medium"
                                        >
                                          Đánh dấu đã đọc
                                        </motion.button>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Dropdown */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-300"
                    >
                      {anhDaiDien ? (
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          src={anhDaiDien || "/placeholder.svg"}
                          alt="Ảnh đại diện"
                          className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => (e.target.src = "https://placehold.co/32x32")}
                        />
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm"
                        >
                          {userName?.charAt(0)?.toUpperCase() || "U"}
                        </motion.div>
                      )}
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-medium text-gray-900">{userName || "Người Dùng"}</p>
                        <p className="text-xs text-gray-500">Tài khoản cá nhân</p>
                      </div>
                      <motion.div animate={{ rotate: showUserDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 z-50"
                        >
                          <div className="p-2">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <p className="text-sm font-semibold text-gray-900">{userName || "Người Dùng"}</p>
                              <p className="text-xs text-gray-500">Quản lý tài khoản của bạn</p>
                            </div>
                            <div className="py-2">
                              <Link
                                to="/settings"
                                className="group flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 transition-all duration-200"
                                onClick={() => setShowUserDropdown(false)}
                              >
                                <Cog6ToothIcon className="h-5 w-5" />
                                <span className="font-medium">Cài Đặt</span>
                              </Link>
                              <motion.button
                                onClick={() => {
                                  handleLogout()
                                  setShowUserDropdown(false)
                                }}
                                whileHover={{ scale: 1.02 }}
                                className="group flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 w-full"
                              >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                <span className="font-medium">Đăng Xuất</span>
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden p-2 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 rounded-xl transition-all duration-300"
              >
                <motion.div animate={{ rotate: showMenu ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  {showMenu ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100"
            >
              <div className="px-4 py-4 space-y-2">
                {userId ? (
                  <>
                    <Link
                      to="/overview"
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        location.pathname === "/overview"
                          ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                      }`}
                      onClick={() => setShowMenu(false)}
                    >
                      <HomeIcon className="h-5 w-5" />
                      <span className="font-medium">Tổng quan</span>
                    </Link>

                    {/* Mobile Finance Section */}
                    <div>
                      <motion.button
                        onClick={() => setShowFinanceDropdown(!showFinanceDropdown)}
                        whileHover={{ scale: 1.02 }}
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 rounded-xl transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          <ChartBarIcon className="h-5 w-5" />
                          <span className="font-medium">Tài chính</span>
                        </div>
                        <motion.div animate={{ rotate: showFinanceDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDownIcon className="h-4 w-4" />
                        </motion.div>
                      </motion.button>
                      <AnimatePresence>
                        {showFinanceDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 space-y-1 mt-2"
                          >
                            {financeMenuItems.map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                  location.pathname === item.to
                                    ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                                }`}
                                onClick={() => setShowMenu(false)}
                              >
                                <item.icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Mobile Goals Section */}
                    <div>
                      <motion.button
                        onClick={() => setShowGoalsDropdown(!showGoalsDropdown)}
                        whileHover={{ scale: 1.02 }}
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 rounded-xl transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          <FlagIcon className="h-5 w-5" />
                          <span className="font-medium">Mục tiêu</span>
                        </div>
                        <motion.div animate={{ rotate: showGoalsDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDownIcon className="h-4 w-4" />
                        </motion.div>
                      </motion.button>
                      <AnimatePresence>
                        {showGoalsDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 space-y-1 mt-2"
                          >
                            {goalsMenuItems.map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                  location.pathname === item.to
                                    ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                                }`}
                                onClick={() => setShowMenu(false)}
                              >
                                <item.icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Link
                      to="/investments"
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        location.pathname === "/investments"
                          ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                      }`}
                      onClick={() => setShowMenu(false)}
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      <span className="font-medium">Đầu tư</span>
                    </Link>

                    <Link
                      to="/reports"
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        location.pathname === "/reports"
                          ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                      }`}
                      onClick={() => setShowMenu(false)}
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      <span className="font-medium">Báo cáo</span>
                    </Link>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 rounded-xl transition-all duration-300"
                        onClick={() => setShowMenu(false)}
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                        <span className="font-medium">Cài Đặt</span>
                      </Link>
                      <motion.button
                        onClick={() => {
                          handleLogout()
                          setShowMenu(false)
                        }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 rounded-xl transition-all duration-300 w-full"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span className="font-medium">Đăng Xuất</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/"
                    className="block px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 text-center font-medium"
                    onClick={() => setShowMenu(false)}
                  >
                    Đăng Nhập
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}

export default Navbar
