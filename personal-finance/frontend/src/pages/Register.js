"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import zxcvbn from "zxcvbn"
import { motion, AnimatePresence } from "framer-motion"
import {
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  PhotoIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline"

const Register = () => {
  const [tenDangNhap, setTenDangNhap] = useState("")
  const [matKhau, setMatKhau] = useState("")
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("")
  const [email, setEmail] = useState("")
  const [hoTen, setHoTen] = useState("")
  const [ngaySinh, setNgaySinh] = useState("")
  const [gioiTinh, setGioiTinh] = useState("")
  const [anhDaiDien, setAnhDaiDien] = useState(null)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [hoTenError, setHoTenError] = useState("")
  const [ngaySinhError, setNgaySinhError] = useState("")
  const [gioiTinhError, setGioiTinhError] = useState("")
  const [anhDaiDienError, setAnhDaiDienError] = useState("")
  const navigate = useNavigate()

  // Password
  const passwordStrength = zxcvbn(matKhau)
  const strengthLabels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"]
  const strengthColor = ["#ef4444", "#f59e42", "#fbbf24", "#10b981", "#059669"]

  // Real-time validation
  const validateUsername = (value) => {
    if (!value.trim()) return "Tên đăng nhập không được để trống"
    if (/[^a-zA-Z0-9_]/.test(value)) return "Chỉ cho phép chữ, số, dấu gạch dưới"
    if (value.length < 4) return "Tên đăng nhập tối thiểu 4 ký tự"
    return ""
  }
  const validateEmail = (value) => {
    if (!value.trim()) return "Email không được để trống"
    // eslint-disable-next-line
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i
    if (!emailRegex.test(value)) return "Email không hợp lệ"
    return ""
  }
  const validatePassword = (value) => {
    if (!value) return "Mật khẩu không được để trống"
    if (value.length < 6) return "Mật khẩu tối thiểu 6 ký tự"
    return ""
  }
  const validateConfirmPassword = (value) => {
    if (!value) return "Vui lòng xác nhận mật khẩu"
    if (value !== matKhau) return "Mật khẩu xác nhận không khớp"
    return ""
  }
  const validateHoTen = (value) => {
    if (!value.trim()) return "Họ tên không được để trống"
    return ""
  }
  // ... (có thể thêm validate cho ngày sinh, giới tính, ảnh đại diện nếu muốn)

  const handleUsernameChange = (e) => {
    setTenDangNhap(e.target.value)
    setUsernameError(validateUsername(e.target.value))
  }
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setEmailError(validateEmail(e.target.value))
  }
  const handlePasswordChange = (e) => {
    setMatKhau(e.target.value)
    setPasswordError(validatePassword(e.target.value))
    setConfirmPasswordError(validateConfirmPassword(xacNhanMatKhau))
  }
  const handleConfirmPasswordChange = (e) => {
    setXacNhanMatKhau(e.target.value)
    setConfirmPasswordError(validateConfirmPassword(e.target.value))
  }
  const handleHoTenChange = (e) => {
    setHoTen(e.target.value)
    setHoTenError(validateHoTen(e.target.value))
  }

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
      toast.success("Ảnh đã được chọn thành công!", {
        icon: "📸",
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Kiểm tra lỗi trước khi submit
    const usernameErr = validateUsername(tenDangNhap)
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(matKhau)
    const confirmPasswordErr = validateConfirmPassword(xacNhanMatKhau)
    const hoTenErr = validateHoTen(hoTen)
    setUsernameError(usernameErr)
    setEmailError(emailErr)
    setPasswordError(passwordErr)
    setConfirmPasswordError(confirmPasswordErr)
    setHoTenError(hoTenErr)
    if (usernameErr || emailErr || passwordErr || confirmPasswordErr || hoTenErr) {
      // Focus vào trường đầu tiên có lỗi
      if (usernameErr) {
        document.getElementById("register-username")?.focus()
      } else if (emailErr) {
        document.getElementById("register-email")?.focus()
      } else if (passwordErr) {
        document.getElementById("register-password")?.focus()
      } else if (confirmPasswordErr) {
        document.getElementById("register-confirm-password")?.focus()
      } else if (hoTenErr) {
        document.getElementById("register-hoten")?.focus()
      }
      toast.error("Vui lòng kiểm tra lại thông tin đăng ký!", {
        icon: "⚠️",
        style: {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "white",
        },
      })
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      if (!process.env.REACT_APP_API_URL) {
        throw new Error("REACT_APP_API_URL is not defined")
      }
      const formData = new FormData()
      formData.append("tenDangNhap", tenDangNhap)
      formData.append("matKhau", matKhau)
      formData.append("email", email)
      formData.append("hoTen", hoTen)
      if (ngaySinh) formData.append("ngaySinh", ngaySinh)
      if (gioiTinh) formData.append("gioiTinh", gioiTinh)
      if (anhDaiDien) formData.append("anhDaiDien", anhDaiDien)

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      localStorage.setItem("anhDaiDien", res.data.user.anhDaiDien || "")
      setError("")
      toast.success(res.data.message, {
        icon: "🎉",
        style: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        },
      })
      setTimeout(() => navigate("/"), 2000)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Đăng ký thất bại"
      setError(errorMessage)
      toast.error(errorMessage, {
        icon: "❌",
        style: {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "white",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
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

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
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
            <UserCircleIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Tạo tài khoản mới
          </h2>
          <p className="text-gray-600 mt-2 font-medium">Tham gia cùng chúng tôi để quản lý tài chính thông minh</p>

          {/* Progress indicator */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                currentStep >= 1 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > 1 ? <CheckCircleIcon className="w-5 h-5" /> : "1"}
            </div>
            <div
              className={`w-16 h-1 rounded-full transition-all duration-300 ${
                currentStep >= 2 ? "bg-emerald-500" : "bg-gray-200"
              }`}
            />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                currentStep >= 2 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
          </div>
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
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Đăng Nhập</label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={tenDangNhap}
                        onChange={handleUsernameChange}
                        onFocus={() => setFocusedField("username")}
                        onBlur={() => setFocusedField("")}
                        className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 ${
                          focusedField === "username"
                            ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                            : "hover:bg-white/70 hover:shadow-md"
                        }`}
                        placeholder="Nhập tên đăng nhập"
                        required
                      />
                      <UserCircleIcon
                        className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                          focusedField === "username" ? "text-emerald-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    {usernameError && (
                      <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                    )}
                  </div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mật Khẩu</label>
                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={matKhau}
                        onChange={handlePasswordChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField("")}
                        className={`w-full p-4 pl-12 pr-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 ${
                          focusedField === "password"
                            ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                            : "hover:bg-white/70 hover:shadow-md"
                        }`}
                        placeholder="Nhập mật khẩu"
                        required
                        id="register-password"
                        autoComplete="new-password"
                      />
                      <EyeIcon
                        className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                          focusedField === "password" ? "text-emerald-600" : "text-gray-400"
                        }`}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    {/* Password strength bar */}
                    {matKhau && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-2 rounded-full" style={{ background: "#e5e7eb" }}>
                            <div
                              style={{
                                width: `${(passwordStrength.score + 1) * 20}%`,
                                background: strengthColor[passwordStrength.score],
                                height: "100%",
                                borderRadius: 8,
                                transition: "width 0.3s, background 0.3s"
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-semibold"
                            style={{ color: strengthColor[passwordStrength.score], minWidth: 60 }}
                          >
                            {strengthLabels[passwordStrength.score]}
                          </span>
                        </div>
                        {/* Gợi ý cải thiện nếu yếu */}
                        {passwordStrength.feedback.suggestions.length > 0 && (
                          <ul className="text-xs text-yellow-600 mt-1 ml-1 list-disc list-inside">
                            {passwordStrength.feedback.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {passwordError && (
                      <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                    )}
                  </motion.div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <div className="relative group">
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
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
                    {emailError && (
                      <p className="text-red-500 text-sm mt-1">{emailError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ Tên</label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={hoTen}
                        onChange={handleHoTenChange}
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
                      <svg
                        className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                          focusedField === "fullname" ? "text-emerald-600" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    {hoTenError && (
                      <p className="text-red-500 text-sm mt-1">{hoTenError}</p>
                    )}
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg hover:from-emerald-600 hover:to-blue-700"
                >
                  <span>Tiếp theo</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày Sinh</label>
                    <div className="relative group">
                      <input
                        type="date"
                        value={ngaySinh}
                        onChange={(e) => setNgaySinh(e.target.value)}
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
                    {ngaySinhError && (
                      <p className="text-red-500 text-sm mt-1">{ngaySinhError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Giới Tính</label>
                    <div className="relative group">
                      <select
                        value={gioiTinh}
                        onChange={(e) => setGioiTinh(e.target.value)}
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
                      <svg
                        className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                          focusedField === "gender" ? "text-emerald-600" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    {gioiTinhError && (
                      <p className="text-red-500 text-sm mt-1">{gioiTinhError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh Đại Diện</label>
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
                              <CheckCircleIcon className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {anhDaiDienError && (
                      <p className="text-red-500 text-sm mt-1">{anhDaiDienError}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg hover:bg-gray-300"
                  >
                    <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Quay lại</span>
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
                        <span>Đang đăng ký...</span>
                      </>
                    ) : (
                      <>
                        <span>Đăng Ký</span>
                        <CheckCircleIcon className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <motion.div variants={itemVariants} className="mt-8 text-center">
          <p className="text-gray-600 font-medium">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-all duration-200 relative group"
            >
              Đăng Nhập ngay
              <motion.span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300" />
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Register
