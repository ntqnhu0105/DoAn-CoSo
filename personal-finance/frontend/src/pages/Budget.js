"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalculatorIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowDownCircleIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline"

const Budget = () => {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [maDanhMuc, setMaDanhMuc] = useState("")
  const [soTien, setSoTien] = useState("")
  const [ngayBatDau, setNgayBatDau] = useState("")
  const [ngayKetThuc, setNgayKetThuc] = useState("")
  const [ghiChu, setGhiChu] = useState("")
  const [trangThai, setTrangThai] = useState(true)
  const [error, setError] = useState("")
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId || !token) {
      setError("Vui lòng đăng nhập để quản lý ngân sách")
      toast.error("Vui lòng đăng nhập để tiếp tục")
      navigate("/")
    }
  }, [userId, token, navigate])

  useEffect(() => {
    if (!userId || !token) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const headers = { Authorization: `Bearer ${token}` }
        console.log("Fetching budgets with userId:", userId, "token:", token.slice(0, 10) + "...")
        const [budgetRes, categoryRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/budgets/${userId}`, { headers }),
          axios.get(`${process.env.REACT_APP_API_URL}/categories`, { headers }),
        ])
        const newBudgets = budgetRes.data
        setBudgets(newBudgets)
        setCategories(categoryRes.data)
        if (categoryRes.data.length > 0) {
          setMaDanhMuc(categoryRes.data[0]._id)
        } else {
          setError(
            'Vui lòng tạo danh mục tại <a href="/categories" class="text-blue-500 underline">Quản lý danh mục</a>.',
          )
          toast.error("Chưa có danh mục, vui lòng tạo danh mục trước.")
        }
        const recentlyEnded = newBudgets.filter(
          (bud) => !bud.trangThai && new Date(bud.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000),
        )
        recentlyEnded.forEach((bud) => {
          if (bud.maDanhMuc?.tenDanhMuc) {
            toast.info(
              `Ngân sách "${bud.maDanhMuc.tenDanhMuc}" đã kết thúc vào ${new Date(bud.ngayKetThuc).toLocaleDateString()}`,
              {
                toastId: `budget-${bud._id}`,
              },
            )
          }
        })
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        })
        const errorMessage = err.response?.data?.message || "Lỗi khi tải dữ liệu"
        setError(errorMessage)
        toast.error(errorMessage)
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
    fetchData()
  }, [userId, token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId || !token) {
      setError("Vui lòng đăng nhập để thực hiện thao tác này")
      toast.error("Vui lòng đăng nhập để tiếp tục")
      return
    }
    if (!maDanhMuc || !soTien || !ngayBatDau || !ngayKetThuc) {
      setError("Vui lòng nhập đầy đủ danh mục, số tiền, ngày bắt đầu và ngày kết thúc")
      toast.error("Vui lòng nhập đầy đủ thông tin")
      return
    }
    const soTienNum = Number.parseFloat(soTien)
    if (isNaN(soTienNum) || soTienNum <= 0) {
      setError("Số tiền phải là số dương hợp lệ")
      toast.error("Số tiền phải là số dương hợp lệ")
      return
    }
    const startDate = new Date(ngayBatDau)
    const endDate = new Date(ngayKetThuc)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError("Ngày bắt đầu và ngày kết thúc phải hợp lệ")
      toast.error("Ngày bắt đầu và ngày kết thúc phải hợp lệ")
      return
    }
    if (endDate < startDate) {
      setError("Ngày kết thúc phải sau ngày bắt đầu")
      toast.error("Ngày kết thúc phải sau ngày bắt đầu")
      return
    }

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const payload = {
        userId,
        maDanhMuc,
        soTien: soTienNum,
        ngayBatDau,
        ngayKetThuc,
        ghiChu,
        trangThai,
      }
      console.log("Payload gửi đi:", payload)
      let res
      if (editId) {
        res = await axios.put(`${process.env.REACT_APP_API_URL}/budgets/${editId}`, payload, { headers })
        setBudgets(budgets.map((bud) => (bud._id === editId ? res.data.budget : bud)))
        toast.success("Cập nhật ngân sách thành công!")
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/budgets`, payload, { headers })
        setBudgets([...budgets, res.data.budget])
        toast.success("Thêm ngân sách thành công!")
      }
      closeModal()
    } catch (err) {
      console.error("Lỗi lưu ngân sách:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      })
      const errorMessage = err.response?.data?.message || "Lỗi khi lưu ngân sách"
      setError(errorMessage)
      toast.error(errorMessage)
      if (err.response?.status === 401) {
        console.error("Phiên đăng nhập hết hạn, xóa localStorage")
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        navigate("/")
      }
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa ngân sách này?")) return
    try {
      const headers = { Authorization: `Bearer ${token}` }
      await axios.delete(`${process.env.REACT_APP_API_URL}/budgets/${id}?userId=${userId}`, { headers })
      setBudgets(budgets.filter((bud) => bud._id !== id))
      toast.success("Xóa ngân sách thành công!")
    } catch (err) {
      console.error("Lỗi xóa ngân sách:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      })
      const errorMessage = err.response?.data?.message || "Lỗi khi xóa ngân sách"
      setError(errorMessage)
      toast.error(errorMessage)
      if (err.response?.status === 401) {
        console.error("Phiên đăng nhập hết hạn, xóa localStorage")
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        navigate("/")
      }
    }
  }

  const handleEdit = (budget) => {
    setEditId(budget._id)
    setMaDanhMuc(budget.maDanhMuc?._id || "")
    setSoTien(budget.soTien.toString())
    setNgayBatDau(new Date(budget.ngayBatDau).toISOString().split("T")[0])
    setNgayKetThuc(new Date(budget.ngayKetThuc).toISOString().split("T")[0])
    setGhiChu(budget.ghiChu || "")
    setTrangThai(budget.trangThai)
    setError("")
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditId(null)
    setMaDanhMuc(categories[0]?._id || "")
    setSoTien("")
    setNgayBatDau("")
    setNgayKetThuc("")
    setGhiChu("")
    setTrangThai(true)
    setError("")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditId(null)
    setMaDanhMuc(categories[0]?._id || "")
    setSoTien("")
    setNgayBatDau("")
    setNgayKetThuc("")
    setGhiChu("")
    setTrangThai(true)
    setError("")
    setFocusedField("")
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-8 px-4 relative overflow-hidden">
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
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <CalculatorIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Ngân Sách
          </h2>
          <p className="text-gray-600 font-medium">Lập kế hoạch và theo dõi chi tiêu thông minh</p>
        </motion.div>

        {/* Error Message */}
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
              <span className="font-medium" dangerouslySetInnerHTML={{ __html: error }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Budget Button */}
        <motion.div variants={itemVariants} className="flex justify-end mb-6">
          <motion.button
            onClick={openAddModal}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 font-semibold"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm Ngân sách</span>
          </motion.button>
        </motion.div>

        {/* Budget List */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100/50">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-3">
              <ClipboardDocumentListIcon className="w-6 h-6 text-emerald-600" />
              <span>Danh sách Ngân sách</span>
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-8 h-8 border-t-2 border-b-2 border-emerald-600 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-500">Đang tải ngân sách...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="p-8 text-center">
              <CalculatorIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có ngân sách nào</p>
              <p className="text-gray-400 mt-2">Hãy tạo ngân sách đầu tiên của bạn!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/50">
              <AnimatePresence>
                {budgets.map((budget, index) => (
                  <motion.div
                    key={budget._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg">
                            <CalculatorIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {budget.maDanhMuc?.tenDanhMuc || "Không xác định"}
                            </h4>
                            <p className="text-sm text-gray-500">{budget.maDanhMuc?.loai || "Không xác định"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50">
                            <p className="text-xs text-gray-500 mb-1">Số tiền</p>
                            <p className="font-semibold text-emerald-600">{budget.soTien.toLocaleString()} VNĐ</p>
                          </div>
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50">
                            <p className="text-xs text-gray-500 mb-1">Ngày bắt đầu</p>
                            <p className="font-medium text-gray-700">
                              {new Date(budget.ngayBatDau).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50">
                            <p className="text-xs text-gray-500 mb-1">Ngày kết thúc</p>
                            <p className="font-medium text-gray-700">
                              {new Date(budget.ngayKetThuc).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50">
                            <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                budget.trangThai ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {budget.trangThai ? "Hoạt động" : "Kết thúc"}
                            </span>
                          </div>
                        </div>

                        {budget.ghiChu && (
                          <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-3 border border-blue-100/50">
                            <p className="text-xs text-blue-600 mb-1">Ghi chú</p>
                            <p className="text-sm text-blue-800">{budget.ghiChu}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <motion.button
                          onClick={() => handleEdit(budget)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors duration-200 shadow-lg"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(budget._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 shadow-lg"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl">
                      <CalculatorIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editId ? "Sửa Ngân sách" : "Thêm Ngân sách"}
                    </h3>
                  </div>
                  <motion.button
                    onClick={closeModal}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-2xl border border-red-200/50 flex items-center space-x-3"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
                    <div className="relative group">
                      <select
                        value={maDanhMuc}
                        onChange={(e) => setMaDanhMuc(e.target.value)}
                        onFocus={() => setFocusedField("category")}
                        onBlur={() => setFocusedField("")}
                        className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 shadow-sm transition-all duration-300 appearance-none ${
                          focusedField === "category"
                            ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                            : "hover:bg-white/70 hover:shadow-md"
                        }`}
                        required
                      >
                        {categories.length === 0 ? (
                          <option value="">Chưa có danh mục</option>
                        ) : (
                          categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.tenDanhMuc} ({cat.loai})
                            </option>
                          ))
                        )}
                      </select>
                      <ArrowDownCircleIcon
                        className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                          focusedField === "category" ? "text-emerald-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số tiền</label>
                    <div className="relative group">
                      <input
                        type="number"
                        value={soTien}
                        onChange={(e) => setSoTien(e.target.value)}
                        onFocus={() => setFocusedField("amount")}
                        onBlur={() => setFocusedField("")}
                        className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 ${
                          focusedField === "amount"
                            ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                            : "hover:bg-white/70 hover:shadow-md"
                        }`}
                        required
                        step="0.01"
                        min="0.01"
                        placeholder="Nhập số tiền"
                      />
                      <BanknotesIcon
                        className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                          focusedField === "amount" ? "text-emerald-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày bắt đầu</label>
                    <div className="relative group">
                      <input
                        type="date"
                        value={ngayBatDau}
                        onChange={(e) => setNgayBatDau(e.target.value)}
                        onFocus={() => setFocusedField("startDate")}
                        onBlur={() => setFocusedField("")}
                        className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 shadow-sm transition-all duration-300 ${
                          focusedField === "startDate"
                            ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                            : "hover:bg-white/70 hover:shadow-md"
                        }`}
                        required
                      />
                      <CalendarIcon
                        className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                          focusedField === "startDate" ? "text-emerald-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày kết thúc</label>
                    <div className="relative group">
                      <input
                        type="date"
                        value={ngayKetThuc}
                        onChange={(e) => setNgayKetThuc(e.target.value)}
                        onFocus={() => setFocusedField("endDate")}
                        onBlur={() => setFocusedField("")}
                        className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 shadow-sm transition-all duration-300 ${
                          focusedField === "endDate"
                            ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                            : "hover:bg-white/70 hover:shadow-md"
                        }`}
                        required
                      />
                      <CalendarIcon
                        className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                          focusedField === "endDate" ? "text-emerald-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    onFocus={() => setFocusedField("note")}
                    onBlur={() => setFocusedField("")}
                    className={`w-full p-4 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 resize-none ${
                      focusedField === "note"
                        ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                        : "hover:bg-white/70 hover:shadow-md"
                    }`}
                    placeholder="Nhập ghi chú (tùy chọn)"
                    rows="4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                  <div className="relative group">
                    <select
                      value={trangThai}
                      onChange={(e) => setTrangThai(e.target.value === "true")}
                      onFocus={() => setFocusedField("status")}
                      onBlur={() => setFocusedField("")}
                      className={`w-full p-4 pl-12 border-0 rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 shadow-sm transition-all duration-300 appearance-none ${
                        focusedField === "status"
                          ? "ring-4 ring-emerald-500/20 shadow-lg bg-white/80 transform scale-[1.02]"
                          : "hover:bg-white/70 hover:shadow-md"
                      }`}
                    >
                      <option value={true}>Hoạt động</option>
                      <option value={false}>Kết thúc</option>
                    </select>
                    <CheckCircleIcon
                      className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                        focusedField === "status" ? "text-emerald-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={closeModal}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-gray-200/80 backdrop-blur-sm text-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg hover:bg-gray-300/80"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    <span>Hủy</span>
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg hover:from-emerald-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!maDanhMuc || !soTien || !ngayBatDau || !ngayKetThuc || Number.parseFloat(soTien) <= 0}
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>{editId ? "Cập nhật" : "Thêm"} Ngân sách</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Budget
