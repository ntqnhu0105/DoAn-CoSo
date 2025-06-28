"use client"

import React, { useState, useContext, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import zxcvbn from "zxcvbn";
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, ArrowRightIcon, ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline"
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
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaRef = useRef(null);
  const [refreshSpin, setRefreshSpin] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOTP, setForgotOTP] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");

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

  // Hàm sinh captcha random
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let str = "";
    for (let i = 0; i < 5; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
    return str;
  };

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    captchaRef.current?.focus();
    setRefreshSpin(true);
    setTimeout(() => setRefreshSpin(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validate trước khi submit
    const userErr = validateUsername(tenDangNhap);
    const passErr = validatePassword(matKhau);
    setUsernameError(userErr);
    setPasswordError(passErr);
    if (userErr || passErr) return;
    if (captchaInput.trim().toUpperCase() !== captcha) {
      toast.error("Mã xác thực không đúng!", {
        icon: "❌",
        style: {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "white",
        },
      });
      refreshCaptcha();
      return;
    }
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
      if (rememberMe) {
        localStorage.setItem('token', localStorage.getItem('token'));
      } else {
        sessionStorage.setItem('token', localStorage.getItem('token'));
        localStorage.removeItem('token');
      }
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    if (token) {
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      toast.success('Đăng nhập Google thành công!', {
        icon: '🎉',
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
        },
      });
      navigate('/dashboard');
    } else if (error) {
      toast.error('Đăng nhập Google thất bại!', {
        icon: '❌',
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  }, [navigate, rememberMe]);

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

            <button
              type="button"
              onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white border border-gray-200 shadow hover:bg-gray-50 transition-all font-semibold text-gray-700 mb-6"
              style={{ boxShadow: '0 2px 8px 0 rgba(66,133,244,0.08)' }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" className="w-6 h-6" />
              Đăng nhập với Google
            </button>
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="mx-4 text-gray-400 font-semibold">hoặc</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

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

              <div className="mb-2">
                <div className="flex items-center mb-1 gap-2">
                  <label className="block text-sm font-medium text-gray-700">Mã xác thực</label>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-1 rounded hover:bg-gray-200 transition"
                    title="Làm mới mã"
                    tabIndex={-1}
                  >
                    <ArrowPathIcon className={`w-5 h-5 text-emerald-600 transition-transform duration-500 ${refreshSpin ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <span className="font-mono text-base tracking-widest bg-gray-100 px-4 py-1 rounded border border-gray-200 select-none min-w-[90px] text-center">
                    {captcha}
                  </span>
                  <div className="h-5 w-px bg-gray-300 mx-1" />
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)}
                    ref={captchaRef}
                    placeholder="Nhập mã"
                    className="flex-1 p-3 border rounded bg-white/60 placeholder-gray-500 min-w-0"
                    maxLength={5}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Nhớ mật khẩu + Quên mật khẩu */}
              <div className="flex items-center justify-between mt-2 mb-6">
                <label className="flex items-center text-gray-600 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="mr-2 accent-emerald-600"
                  />
                  Nhớ mật khẩu
                </label>
                <button
                  type="button"
                  className="text-emerald-600 font-semibold hover:underline bg-transparent border-0 p-0 text-sm"
                  onClick={() => setShowForgot(true)}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Reminder text when "Remember me" is not checked */}
              {!rememberMe && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-amber-50/80 backdrop-blur-sm text-amber-700 rounded-xl border border-amber-200/50 flex items-center space-x-2 shadow-sm"
                >
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">   Chọn "Nhớ mật khẩu" để lưu thông tin</span>
                </motion.div>
              )}

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

            {/* Đăng ký ngay */}
            <div className="mt-8 text-center text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </>
        )}
      </motion.div>

      {/* Popup Quên mật khẩu */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative animate-fadeIn">
            <button className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100" onClick={() => { setShowForgot(false); setForgotStep(1); setForgotEmail(""); setForgotOTP(""); setForgotNewPass(""); setForgotConfirmPass(""); }}>
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
            <h3 className="text-xl font-bold text-center mb-4">Quên mật khẩu</h3>
            {forgotStep === 1 && (
              <>
                <label className="block text-sm font-medium mb-2">Nhập email đã đăng ký</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-gray-50 mb-4"
                  placeholder="Email của bạn"
                  autoFocus
                />
                <button className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition" onClick={() => setForgotStep(2)}>
                  Gửi mã xác thực
                </button>
              </>
            )}
            {forgotStep === 2 && (
              <>
                <label className="block text-sm font-medium mb-2">Nhập mã xác thực đã gửi về email</label>
                <input
                  type="text"
                  value={forgotOTP}
                  onChange={e => setForgotOTP(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-gray-50 mb-4"
                  placeholder="Mã xác thực"
                  autoFocus
                />
                <button className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition mb-2" onClick={() => setForgotStep(3)}>
                  Xác nhận mã
                </button>
                <button className="w-full py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-sm" onClick={() => setForgotStep(1)}>
                  Quay lại
                </button>
              </>
            )}
            {forgotStep === 3 && (
              <>
                <label className="block text-sm font-medium mb-2">Nhập mật khẩu mới</label>
                <input
                  type="password"
                  value={forgotNewPass}
                  onChange={e => setForgotNewPass(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-gray-50 mb-3"
                  placeholder="Mật khẩu mới"
                  autoFocus
                />
                <input
                  type="password"
                  value={forgotConfirmPass}
                  onChange={e => setForgotConfirmPass(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-gray-50 mb-4"
                  placeholder="Xác nhận mật khẩu mới"
                />
                <button className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition mb-2">
                  Đặt lại mật khẩu
                </button>
                <button className="w-full py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-sm" onClick={() => setForgotStep(2)}>
                  Quay lại
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
