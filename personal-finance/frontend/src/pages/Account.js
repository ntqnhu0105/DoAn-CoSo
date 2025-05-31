"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion } from "framer-motion"
import {
  BanknotesIcon,
  CreditCardIcon,
  WalletIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline"

const Account = () => {
  const [accounts, setAccounts] = useState([])
  const [tenTaiKhoan, setTenTaiKhoan] = useState("")
  const [soDu, setSoDu] = useState("")
  const [loaiTaiKhoan, setLoaiTaiKhoan] = useState("Tiền mặt")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const userId = localStorage.getItem("userId")?.replace(/[^\w-]/g, "")
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  // Kiểm tra userId và token
  useEffect(() => {
    if (!userId || !token) {
      setError("Vui lòng đăng nhập để quản lý tài khoản")
      toast.error("Vui lòng đăng nhập để quản lý tài khoản", {
        icon: "🔒",
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#333",
        },
      })
      navigate("/")
    }
  }, [userId, token, navigate])

  // Lấy danh sách tài khoản
  useEffect(() => {
    if (!userId || !token) return

    const fetchAccounts = async () => {
      setLoading(true)
      try {
        console.log("Fetching accounts with userId:", userId, "token:", token.slice(0, 10) + "...")
        const headers = { Authorization: `Bearer ${token}` }
        console.log("Request headers:", headers)
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/accounts/${userId}`, { headers })
        console.log("Accounts response:", res.data)
        setAccounts(res.data)
        setError("")
        toast.success("Tải danh sách tài khoản thành công", {
          icon: "🏦",
          autoClose: 2000,
          hideProgressBar: true,
        })
      } catch (err) {
        console.error("Lỗi tải tài khoản:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        })
        const errorMessage = err.response?.data?.message || "Lỗi khi tải tài khoản"
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
      } finally {
        setLoading(false)
      }
    }
    fetchAccounts()
  }, [userId, token, navigate])

  // Thêm tài khoản mới
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId || !token) {
      setError("Vui lòng đăng nhập để thực hiện thao tác này")
      toast.error("Vui lòng đăng nhập để thực hiện thao tác này")
      return
    }

    if (!tenTaiKhoan.trim()) {
      toast.warning("Vui lòng nhập tên tài khoản", {
        icon: "⚠️",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      console.log("Submitting account:", { maNguoiDung: userId, tenTaiKhoan, soDu, loaiTaiKhoan })
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/accounts`,
        {
          maNguoiDung: userId,
          tenTaiKhoan,
          soDu: Number.parseFloat(soDu) || 0,
          loaiTaiKhoan,
        },
        { headers },
      )
      console.log("Create account response:", res.data)
      setAccounts([...accounts, res.data])
      setTenTaiKhoan("")
      setSoDu("")
      setLoaiTaiKhoan("Tiền mặt")
      setError("")
      toast.success("Thêm tài khoản thành công!", {
        icon: "✅",
      })
    } catch (err) {
      console.error("Lỗi thêm tài khoản:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      })
      const errorMessage = err.response?.data?.message || "Lỗi khi thêm tài khoản"
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
    } finally {
      setIsSubmitting(false)
    }
  }

  // Tính tổng số dư
  const totalBalance = accounts.reduce((sum, account) => sum + account.soDu, 0)

  // Icon cho từng loại tài khoản
  const getAccountIcon = (type) => {
    switch (type) {
      case "Tiền mặt":
        return <BanknotesIcon className="h-6 w-6" />
      case "Thẻ tín dụng":
        return <CreditCardIcon className="h-6 w-6" />
      case "Ngân hàng":
        return <BanknotesIcon className="h-6 w-6" />
      case "Ví điện tử":
        return <WalletIcon className="h-6 w-6" />
      default:
        return <BanknotesIcon className="h-6 w-6" />
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Quản lý tài khoản
          </h2>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
            <p className="text-sm text-gray-600 font-medium">Tổng số dư</p>
            <p className="text-2xl font-bold text-emerald-600">{totalBalance.toLocaleString()} VNĐ</p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50/80 backdrop-blur-sm p-4 rounded-2xl shadow-md mb-6 border border-red-100/50 flex items-center space-x-3"
          >
            <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Form thêm tài khoản */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8 border border-white/20"
        >
          <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2 text-emerald-500" />
            Thêm tài khoản mới
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tên tài khoản</label>
                <input
                  type="text"
                  value={tenTaiKhoan}
                  onChange={(e) => setTenTaiKhoan(e.target.value)}
                  placeholder="Nhập tên tài khoản"
                  className="w-full p-3 border-0 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Số dư ban đầu</label>
                <input
                  type="number"
                  value={soDu}
                  onChange={(e) => setSoDu(e.target.value)}
                  placeholder="Nhập số dư"
                  className="w-full p-3 border-0 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Loại tài khoản</label>
                <select
                  value={loaiTaiKhoan}
                  onChange={(e) => setLoaiTaiKhoan(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                >
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                  <option value="Ngân hàng">Ngân hàng</option>
                  <option value="Ví điện tử">Ví điện tử</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" />
                      <span>Thêm tài khoản</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Danh sách tài khoản */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
        >
          <h3 className="text-xl font-semibold p-6 border-b border-gray-100 text-gray-800 flex items-center">
            <BanknotesIcon className="h-5 w-5 mr-2 text-emerald-500" />
            Danh sách tài khoản
          </h3>

          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 rounded-2xl p-6 inline-block"
              >
                <BanknotesIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Chưa có tài khoản nào</p>
                <p className="text-gray-400 text-sm mt-1">Thêm tài khoản để bắt đầu quản lý tài chính</p>
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {accounts.map((account) => (
                <motion.div
                  key={account._id}
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex justify-between items-center group"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-xl ${
                        account.loaiTaiKhoan === "Tiền mặt"
                          ? "bg-emerald-100 text-emerald-600"
                          : account.loaiTaiKhoan === "Thẻ tín dụng"
                            ? "bg-blue-100 text-blue-600"
                            : account.loaiTaiKhoan === "Ngân hàng"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {getAccountIcon(account.loaiTaiKhoan)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">
                        {account.tenTaiKhoan}
                      </h4>
                      <p className="text-sm text-gray-500">{account.loaiTaiKhoan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{account.soDu.toLocaleString()} VNĐ</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Account
