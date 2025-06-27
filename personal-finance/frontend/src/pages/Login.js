"use client"

import React, { useState, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import zxcvbn from "zxcvbn";
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, ArrowRightIcon } from "@heroicons/react/24/outline"
import { AuthContext } from "../context/AuthContext"

const Login = () => {
  const [tenDangNhap, setTenDangNhap] = useState("")
  const [matKhau, setMatKhau] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  // Password strength
  const passwordStrength = zxcvbn(matKhau)
  const strengthLabels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
  const strengthColor = ["#ef4444", "#f59e42", "#fbbf24", "#10b981", "#059669"];

  // Real-time validation
  const validateUsername = (value) => {
    if (!value.trim()) return "Tên đăng nhập không được để trống";
    if (/[^a-zA-Z0-9_]/.test(value)) return "Chỉ cho phép chữ, số, dấu gạch dưới";
    return "";
  };
  const validatePassword = (value) => {
    if (!value) return "Mật khẩu không được để trống";
    if (value.length < 6) return "Mật khẩu tối thiểu 6 ký tự";
    return "";
  };

  const handleUsernameChange = (e) => {
    setTenDangNhap(e.target.value);
    setUsernameError(validateUsername(e.target.value));
  };
  const handlePasswordChange = (e) => {
    setMatKhau(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validate trước khi submit
    const userErr = validateUsername(tenDangNhap);
    const passErr = validatePassword(matKhau);
    setUsernameError(userErr);
    setPasswordError(passErr);
    if (userErr || passErr) return;
    setIsLoading(true)
    try {
      await login(tenDangNhap, matKhau)
      setError("")
      toast.success("Đăng nhập thành công!", {
        icon: "🎉",
        style: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        },
      })
      navigate("/dashboard")
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Đăng nhập thất bại"
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20"
      >
        {isLoadingSkeleton ? (
          <div>
            <Skeleton height={40} style={{ marginBottom: 24 }} />
            <Skeleton height={40} style={{ marginBottom: 24 }} />
            <Skeleton height={50} width={200} style={{ marginBottom: 24 }} />
          </div>
        ) : (
          <>
            <motion.div variants={itemVariants} className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
              >
                <UserIcon className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Chào mừng trở lại
              </h2>
              <p className="text-gray-600 mt-2 font-medium">Đăng nhập để tiếp tục quản lý tài chính của bạn</p>
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
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Đăng Nhập</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={tenDangNhap}
                    onChange={handleUsernameChange}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField("")}
                    className={`w-full p-4 pl-12 pr-4 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 ${
                      focusedField === "username"
                        ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                        : "hover:bg-white/70 hover:shadow-md"
                    }`}
                    placeholder="Nhập tên đăng nhập"
                    required
                  />
                  <UserIcon
                    className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                      focusedField === "username" ? "text-emerald-600" : "text-gray-400"
                    }`}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 pointer-events-none"
                    animate={{
                      opacity: focusedField === "username" ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                {usernameError && (
                  <div className="text-red-500 text-xs mt-1 ml-1">{usernameError}</div>
                )}
              </motion.div>

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
                    id="login-password"
                    autoComplete="current-password"
                  />
                  <LockClosedIcon
                    className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                      focusedField === "password" ? "text-emerald-600" : "text-gray-400"
                    }`}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-white/50"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </motion.button>
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 pointer-events-none"
                    animate={{
                      opacity: focusedField === "password" ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
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
                  <div className="text-red-500 text-xs mt-1 ml-1">{passwordError}</div>
                )}
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg relative overflow-hidden ${
                  isLoading ? "opacity-75 cursor-not-allowed" : "hover:from-emerald-600 hover:to-blue-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6 text-white mr-2"
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
                    </svg>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng Nhập</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-gray-600 font-medium">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-all duration-200 relative group"
                >
                  Đăng Ký ngay
                  <motion.span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300" />
                </Link>
              </p>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default Login
