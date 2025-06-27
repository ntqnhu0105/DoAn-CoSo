"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  BanknotesIcon,
  CreditCardIcon,
  WalletIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline"

const Account = () => {
  const [accounts, setAccounts] = useState([])
  const [tenTaiKhoan, setTenTaiKhoan] = useState("")
  const [soDu, setSoDu] = useState("")
  const [loaiTaiKhoan, setLoaiTaiKhoan] = useState("Tiền mặt")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingAccount, setEditingAccount] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [layout, setLayout] = useState("grid") // "grid" or "list"
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

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(account => 
    account.tenTaiKhoan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.loaiTaiKhoan.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Refresh accounts list
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/accounts/${userId}`, { headers })
      setAccounts(res.data)
      toast.success("Đã cập nhật danh sách tài khoản")
    } catch (err) {
      console.error("Lỗi khi tải lại danh sách:", err)
      toast.error("Lỗi khi tải lại danh sách tài khoản")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Edit account
  const handleEdit = async (account) => {
    setEditingAccount(account)
    setTenTaiKhoan(account.tenTaiKhoan)
    setSoDu(account.soDu.toString())
    setLoaiTaiKhoan(account.loaiTaiKhoan)
  }

  // Delete account
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return
    
    try {
      const headers = { Authorization: `Bearer ${token}` }
      await axios.delete(`${process.env.REACT_APP_API_URL}/accounts/${id}`, { headers })
      setAccounts(accounts.filter(acc => acc._id !== id))
      toast.success("Xóa tài khoản thành công")
    } catch (err) {
      console.error("Lỗi khi xóa tài khoản:", err)
      toast.error("Lỗi khi xóa tài khoản")
    }
  }

  // Update handleSubmit to handle both create and edit
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
      const payload = {
        maNguoiDung: userId,
        tenTaiKhoan,
        soDu: Number.parseFloat(soDu) || 0,
        loaiTaiKhoan,
      }

      let res
      if (editingAccount) {
        res = await axios.put(`${process.env.REACT_APP_API_URL}/accounts/${editingAccount._id}`, payload, { headers })
        setAccounts(accounts.map(acc => acc._id === editingAccount._id ? res.data : acc))
        toast.success("Cập nhật tài khoản thành công!")
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/accounts`, payload, { headers })
        setAccounts([...accounts, res.data])
        toast.success("Thêm tài khoản thành công!")
      }

      // Reset form
      setTenTaiKhoan("")
      setSoDu("")
      setLoaiTaiKhoan("Tiền mặt")
      setEditingAccount(null)
      setError("")
    } catch (err) {
      console.error("Lỗi xử lý tài khoản:", err)
      const errorMessage = err.response?.data?.message || "Lỗi khi xử lý tài khoản"
      setError(errorMessage)
      toast.error(errorMessage)
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <WalletIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Tài Khoản
          </h2>
          <p className="text-gray-600 font-medium">Quản lý tài khoản và theo dõi số dư của bạn</p>
          
          {/* Total Balance Display */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
              }
            }}
            whileHover={{ 
              scale: 1.05,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
            className="mt-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-xl rounded-full transform -translate-y-1/2"></div>
            <div className="relative bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tổng số dư</p>
                    <p className="text-3xl font-bold mt-1 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                      {totalBalance.toLocaleString()} VNĐ
                    </p>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-lg"
                  >
                    <BanknotesIcon className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
                
                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="bg-emerald-50/50 rounded-xl p-3">
                    <p className="text-xs text-gray-600 font-medium">Số tài khoản</p>
                    <p className="text-lg font-semibold text-green-700">{accounts.length}</p>
                  </div>
                  <div className="bg-blue-50/50 rounded-xl p-3">
                    <p className="text-xs text-gray-600 font-medium">Trung bình mỗi tài khoản</p>
                    <p className="text-lg font-semibold text-purple-700">
                      {accounts.length > 0 
                        ? (totalBalance / accounts.length).toLocaleString() 
                        : "0"} VNĐ
                    </p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-xs text-gray-400 text-right">
                  Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

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

        {/* Form thêm/sửa tài khoản */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8 border border-white/20"
        >
          <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center justify-between">
            <div className="flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-emerald-500" />
              {editingAccount ? "Sửa tài khoản" : "Thêm tài khoản mới"}
            </div>
            {editingAccount && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingAccount(null)
                  setTenTaiKhoan("")
                  setSoDu("")
                  setLoaiTaiKhoan("Tiền mặt")
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </motion.button>
            )}
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
                      {editingAccount ? (
                        <>
                          <PencilIcon className="h-5 w-5" />
                          <span>Sửa tài khoản</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-5 w-5" />
                          <span>Thêm tài khoản</span>
                        </>
                      )}
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
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-emerald-500" />
              Danh sách tài khoản
            </h3>
            
            {/* Search, Layout Switch and Refresh */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm tài khoản..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Layout Switch Buttons */}
              <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLayout("grid")}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    layout === "grid" 
                      ? "bg-white text-emerald-600 shadow-sm" 
                      : "text-gray-600 hover:text-emerald-600"
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLayout("list")}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    layout === "list" 
                      ? "bg-white text-emerald-600 shadow-sm" 
                      : "text-gray-600 hover:text-emerald-600"
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200 ${
                  isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <motion.div
                  animate={{ rotate: isRefreshing ? 360 : 0 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </motion.div>
              </motion.button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 rounded-2xl p-6 inline-block"
              >
                <BanknotesIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {searchQuery ? "Không tìm thấy tài khoản phù hợp" : "Chưa có tài khoản nào"}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Thêm tài khoản để bắt đầu quản lý tài chính"}
                </p>
              </motion.div>
            </div>
          ) : (
            <div className={layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4 p-6" : "divide-y divide-gray-100"}>
              {filteredAccounts.map((account) => (
                <motion.div
                  key={account._id}
                  variants={itemVariants}
                  className={`bg-white ${
                    layout === "grid" 
                      ? "rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100" 
                      : "p-4 hover:bg-gray-50 transition-colors duration-200"
                  } group`}
                >
                  <div className="flex items-center justify-between">
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
                    <div className="flex items-center space-x-2">
                      <p className="text-lg font-bold text-emerald-600">{account.soDu.toLocaleString()} VNĐ</p>
                      <div className="flex space-x-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(account)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(account._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
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
