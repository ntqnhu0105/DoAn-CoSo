"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion, AnimatePresence } from "framer-motion"
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  PhotoIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
} from "@heroicons/react/24/outline"

const Settings = () => {
  const [tenDangNhap, setTenDangNhap] = useState("")
  const [email, setEmail] = useState(localStorage.getItem("email") || "")
  const [hoTen, setHoTen] = useState(localStorage.getItem("userName") || "")
  const [ngaySinh, setNgaySinh] = useState(
    localStorage.getItem("ngaySinh") ? new Date(localStorage.getItem("ngaySinh")).toISOString().split("T")[0] : "",
  )
  const [gioiTinh, setGioiTinh] = useState(localStorage.getItem("gioiTinh") || "")
  const [anhDaiDien, setAnhDaiDien] = useState(null)
  const [currentAnhDaiDien, setCurrentAnhDaiDien] = useState(localStorage.getItem("anhDaiDien") || "")
  const [matKhau, setMatKhau] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId || !token) {
      setError("Vui lòng đăng nhập để truy cập cài đặt")
      toast.error("Vui lòng đăng nhập để tiếp tục", {
        icon: "🔒",
      })
      navigate("/")
      return
    }

    const fetchUserData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        console.log("Fetching user data with userId:", userId, "token:", token.slice(0, 10) + "...")
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/${userId}`, { headers })
        console.log("User data response:", res.data)
        setTenDangNhap(res.data.user.tenDangNhap)
        setEmail(res.data.user.email)
        setHoTen(res.data.user.hoTen)
        setNgaySinh(res.data.user.ngaySinh ? new Date(res.data.user.ngaySinh).toISOString().split("T")[0] : "")
        setGioiTinh(res.data.user.gioiTinh || "")
        setCurrentAnhDaiDien(res.data.user.anhDaiDien || "")
        localStorage.setItem("email", res.data.user.email)
        localStorage.setItem("userName", res.data.user.hoTen)
        localStorage.setItem("ngaySinh", res.data.user.ngaySinh || "")
        localStorage.setItem("gioiTinh", res.data.user.gioiTinh || "")
        localStorage.setItem("anhDaiDien", res.data.user.anhDaiDien || "")
      } catch (err) {
        console.error("Lỗi tải thông tin người dùng:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        })
        const errorMessage = err.response?.data?.message || "Lỗi khi tải thông tin người dùng"
        setError(errorMessage)
        toast.error(errorMessage, {
          icon: "❌",
        })
        if (err.response?.status === 401) {
          console.error("Phiên đăng nhập hết hạn, xóa localStorage")
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          navigate("/")
        }
      }
    }
    fetchUserData()
  }, [userId, token, navigate])

  useEffect(() => {
    console.log("currentAnhDaiDien:", currentAnhDaiDien)
    console.log("API URL:", process.env.REACT_APP_API_URL)
    console.log(
      "Full image URL:",
      currentAnhDaiDien ? `${process.env.REACT_APP_API_URL}${currentAnhDaiDien}` : "No image",
    )
  }, [currentAnhDaiDien])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
      if (!validTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)", {
          icon: "⚠️",
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB", {
          icon: "⚠️",
        })
        return
      }
      setAnhDaiDien(file)
      setHasChanges(true)
      toast.success("Ảnh đã được chọn thành công!", {
        icon: "📸",
      })
      console.log("Selected file:", file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!process.env.REACT_APP_API_URL) {
        throw new Error("REACT_APP_API_URL is not defined")
      }
      const formData = new FormData()
      formData.append("email", email)
      formData.append("hoTen", hoTen)
      if (ngaySinh) formData.append("ngaySinh", ngaySinh)
      if (gioiTinh) formData.append("gioiTinh", gioiTinh)
      if (matKhau) formData.append("matKhau", matKhau)
      if (anhDaiDien) formData.append("anhDaiDien", anhDaiDien)

      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      console.log("Submitting update with payload:", { email, hoTen, ngaySinh, gioiTinh, anhDaiDien: !!anhDaiDien })
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/users/${userId}`, formData, { headers })

      localStorage.setItem("email", res.data.user.email)
      localStorage.setItem("userName", res.data.user.hoTen)
      localStorage.setItem("ngaySinh", res.data.user.ngaySinh || "")
      localStorage.setItem("gioiTinh", res.data.user.gioiTinh || "")
      localStorage.setItem("anhDaiDien", res.data.user.anhDaiDien || "")

      setCurrentAnhDaiDien(res.data.user.anhDaiDien || "")
      setAnhDaiDien(null)
      setMatKhau("")
      setError("")
      setHasChanges(false)
      toast.success(res.data.message, {
        icon: "🎉",
        style: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        },
      })
    } catch (err) {
      console.error("Lỗi cập nhật thông tin:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      })
      const errorMessage = err.response?.data?.message || "Cập nhật thông tin thất bại"
      setError(errorMessage)
      toast.error(errorMessage, {
        icon: "❌",
        style: {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "white",
        },
      })
      if (err.response?.status === 401) {
        console.error("Phiên đăng nhập hết hạn, xóa localStorage")
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        navigate("/")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/20"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <CogIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Cài Đặt Tài Khoản
          </h2>
          <p className="text-gray-600 mt-2 font-medium">Quản lý thông tin cá nhân của bạn</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-2xl border border-red-200/50 flex items-center space-x-3 shadow-sm"
            >
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Đăng Nhập</label>
            <div className="relative group">
              <input
                type="text"
                value={tenDangNhap}
                disabled
                className="w-full p-4 pl-12 border-0 rounded-2xl bg-gray-100/80 backdrop-blur-sm text-gray-500 placeholder-gray-400 shadow-sm cursor-not-allowed"
                placeholder="Tên đăng nhập không thể thay đổi"
              />
              <UserIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <LockClosedIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setHasChanges(true)
                }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 ${
                  focusedField === "email"
                    ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                    : "hover:bg-white/70 hover:shadow-md"
                }`}
                placeholder="Nhập email"
                required
              />
              <EnvelopeIcon
                className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  focusedField === "email" ? "text-emerald-600" : "text-gray-400"
                }`}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Họ Tên</label>
            <div className="relative group">
              <input
                type="text"
                value={hoTen}
                onChange={(e) => {
                  setHoTen(e.target.value)
                  setHasChanges(true)
                }}
                onFocus={() => setFocusedField("fullname")}
                onBlur={() => setFocusedField("")}
                className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 ${
                  focusedField === "fullname"
                    ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                    : "hover:bg-white/70 hover:shadow-md"
                }`}
                placeholder="Nhập họ tên"
                required
              />
              <UserIcon
                className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  focusedField === "fullname" ? "text-emerald-600" : "text-gray-400"
                }`}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày Sinh</label>
            <div className="relative group">
              <input
                type="date"
                value={ngaySinh}
                onChange={(e) => {
                  setNgaySinh(e.target.value)
                  setHasChanges(true)
                }}
                onFocus={() => setFocusedField("birthday")}
                onBlur={() => setFocusedField("")}
                className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 ${
                  focusedField === "birthday"
                    ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                    : "hover:bg-white/70 hover:shadow-md"
                }`}
              />
              <CalendarIcon
                className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  focusedField === "birthday" ? "text-emerald-600" : "text-gray-400"
                }`}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Giới Tính</label>
            <div className="relative group">
              <select
                value={gioiTinh}
                onChange={(e) => {
                  setGioiTinh(e.target.value)
                  setHasChanges(true)
                }}
                onFocus={() => setFocusedField("gender")}
                onBlur={() => setFocusedField("")}
                className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 appearance-none ${
                  focusedField === "gender"
                    ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                    : "hover:bg-white/70 hover:shadow-md"
                }`}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
              <UserIcon
                className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  focusedField === "gender" ? "text-emerald-600" : "text-gray-400"
                }`}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh Đại Diện</label>

            <AnimatePresence>
              {currentAnhDaiDien && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mb-4 flex justify-center"
                >
                  <div className="relative group">
                    <img
                      src={`${process.env.REACT_APP_API_URL}${currentAnhDaiDien}`}
                      alt="Ảnh đại diện hiện tại"
                      className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => (e.target.src = "https://placehold.co/96x96")}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold bg-emerald-600 px-2 py-1 rounded-lg">
                        Ảnh hiện tại
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageChange}
                onFocus={() => setFocusedField("avatar")}
                onBlur={() => setFocusedField("")}
                className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 ${
                  focusedField === "avatar"
                    ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                    : "hover:bg-white/70 hover:shadow-md"
                }`}
              />
              <PhotoIcon
                className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  focusedField === "avatar" ? "text-emerald-600" : "text-gray-400"
                }`}
              />
            </div>

            <AnimatePresence>
              {anhDaiDien && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-4 flex justify-center"
                >
                  <div className="relative group">
                    <img
                      src={URL.createObjectURL(anhDaiDien) || "/placeholder.svg"}
                      alt="Ảnh đại diện xem trước"
                      className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold bg-emerald-600 px-2 py-1 rounded-lg">
                        Ảnh mới
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật Khẩu
              <span className="text-xs text-gray-500 font-normal"> (yêu cầu khi thay đổi email)</span>
            </label>
            <div className="relative group">
              <input
                type="password"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 ${
                  focusedField === "password"
                    ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                    : "hover:bg-white/70 hover:shadow-md"
                }`}
                placeholder="Nhập mật khẩu để xác nhận"
              />
              <LockClosedIcon
                className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  focusedField === "password" ? "text-emerald-600" : "text-gray-400"
                }`}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex space-x-4">
            <motion.button
              type="button"
              onClick={() => navigate("/dashboard")}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-4 bg-gray-200/80 backdrop-blur-sm text-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg hover:bg-gray-300/80"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Quay Lại</span>
            </motion.button>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg relative overflow-hidden ${
                isLoading ? "opacity-75 cursor-not-allowed" : "hover:from-emerald-600 hover:to-blue-700"
              }`}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: isLoading ? "100%" : "-100%" }}
                transition={{ duration: 1, repeat: isLoading ? Number.POSITIVE_INFINITY : 0 }}
              />
              {isLoading ? (
                <>
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </motion.svg>
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Cập Nhật</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-3 bg-amber-50/80 backdrop-blur-sm text-amber-700 rounded-2xl border border-amber-200/50 flex items-center space-x-3 shadow-sm"
            >
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium">Bạn có thay đổi chưa được lưu</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Settings
