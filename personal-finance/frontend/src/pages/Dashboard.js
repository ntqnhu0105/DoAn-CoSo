"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  BanknotesIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  PlusIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  TagIcon,
  DocumentTextIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  WalletIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import { debounce } from "lodash"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Menu, Transition, Dialog } from '@headlessui/react'
import { Fragment } from 'react'

// API URL với fallback
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

// Sub-component: TransactionForm
const TransactionForm = ({
  accounts,
  categories,
  editingTransaction,
  onSubmit,
  onCancel,
  soTien,
  setSoTien,
  loai,
  setLoai,
  maDanhMuc,
  setMaDanhMuc,
  maTaiKhoan,
  setMaTaiKhoan,
  ghiChu,
  setGhiChu,
  phuongThucThanhToan,
  setPhuongThucThanhToan,
  ngayGiaoDich,
  setNgayGiaoDich,
  error,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="group relative bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100/50 backdrop-blur-sm overflow-hidden mb-8"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-emerald-500 to-blue-600 p-4 rounded-2xl shadow-lg"
          >
            {editingTransaction ? (
              <PencilIcon className="h-6 w-6 text-white" />
            ) : (
              <PlusIcon className="h-6 w-6 text-white" />
            )}
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {editingTransaction ? "Sửa Giao Dịch" : "Thêm Giao Dịch Mới"}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {editingTransaction ? "Cập nhật thông tin giao dịch" : "Nhập thông tin giao dịch của bạn"}
            </p>
          </div>
        </div>

        {editingTransaction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-100 px-4 py-2 rounded-full"
          >
            <span className="text-xs font-semibold text-blue-700">Đang chỉnh sửa</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100/50 text-red-700 rounded-2xl shadow-sm border border-red-200/50 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2">
              <div className="bg-red-200 p-1 rounded-full">
                <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: error }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Số tiền */}
          <div className="lg:col-span-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <BanknotesIcon className="h-4 w-4 text-emerald-600" />
              <span>Số Tiền</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={soTien}
                onChange={(e) => setSoTien(e.target.value)}
                placeholder="Nhập số tiền"
                className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:shadow-lg transition-all duration-300 text-lg font-semibold"
                required
                step="0.01"
                min="0.01"
              />
              <BanknotesIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
            </div>
          </div>

          {/* Loại giao dịch */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <TagIcon className="h-4 w-4 text-blue-600" />
              <span>Loại Giao Dịch</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setLoai("Thu nhập")}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                  loai === "Thu nhập"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg"
                    : "bg-white/70 text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="font-semibold">Thu nhập</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setLoai("Chi tiêu")}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                  loai === "Chi tiêu"
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-lg"
                    : "bg-white/70 text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50"
                }`}
              >
                <ArrowDownCircleIcon className="h-5 w-5" />
                <span className="font-semibold">Chi tiêu</span>
              </motion.button>
            </div>
          </div>

          {/* Ngày giao dịch */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <CalendarDaysIcon className="h-4 w-4 text-purple-600" />
              <span>Ngày Giao Dịch</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={ngayGiaoDich}
                onChange={(e) => setNgayGiaoDich(e.target.value)}
                className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg transition-all duration-300"
                required
              />
              <CalendarDaysIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
            </div>
          </div>

          {/* Tài khoản */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <WalletIcon className="h-4 w-4 text-indigo-600" />
              <span>Tài Khoản</span>
            </label>
            <div className="relative">
              <select
                value={maTaiKhoan}
                onChange={(e) => setMaTaiKhoan(e.target.value)}
                className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:shadow-lg transition-all duration-300 appearance-none"
                required
              >
                <option value="">Chọn tài khoản</option>
                {accounts.length === 0 ? (
                  <option value="" disabled>
                    Chưa có tài khoản
                  </option>
                ) : (
                  accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.tenTaiKhoan} ({acc.loaiTaiKhoan}) - {formatCurrency(acc.soDu)}
                    </option>
                  ))
                )}
              </select>
              <WalletIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500" />
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <TagIcon className="h-4 w-4 text-orange-600" />
              <span>Danh Mục</span>
            </label>
            <div className="relative">
              <select
                value={maDanhMuc}
                onChange={(e) => setMaDanhMuc(e.target.value)}
                className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-orange-500/20 focus:shadow-lg transition-all duration-300 appearance-none"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.length === 0 ? (
                  <option value="" disabled>
                    Chưa có danh mục
                  </option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.tenDanhMuc} ({cat.loai})
                    </option>
                  ))
                )}
              </select>
              <TagIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-500" />
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="lg:col-span-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <CreditCardIcon className="h-4 w-4 text-pink-600" />
              <span>Phương Thức Thanh Toán</span>
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {["Tiền mặt", "Thẻ tín dụng", "Chuyển khoản", "Ví điện tử"].map((method) => (
                <motion.button
                  key={method}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setPhuongThucThanhToan(method)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                    phuongThucThanhToan === method
                      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-500 shadow-lg"
                      : "bg-white/70 text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                  }`}
                >
                  <CreditCardIcon className="h-5 w-5" />
                  <span className="font-semibold">{method}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Ghi chú */}
          <div className="lg:col-span-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <DocumentTextIcon className="h-4 w-4 text-gray-600" />
              <span>Ghi Chú</span>
            </label>
            <div className="relative">
              <textarea
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Nhập ghi chú (không bắt buộc)"
                className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-gray-500/20 focus:shadow-lg transition-all duration-300 min-h-[100px] resize-none"
              />
              <DocumentTextIcon className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          {editingTransaction && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Hủy
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {editingTransaction ? "Cập Nhật" : "Thêm Giao Dịch"}
          </motion.button>
        </div>
      </form>
    </div>
  </motion.div>
)

// Sub-component: TransactionList
const TransactionList = ({ transactions, setTransactions, loading, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTransactions, setSelectedTransactions] = useState(new Set())
  const [viewMode, setViewMode] = useState("list")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [selectedType, setSelectedType] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Lấy danh sách categories từ transactions
  useEffect(() => {
    const uniqueCategories = transactions.reduce((acc, transaction) => {
      if (transaction.maDanhMuc && !acc.some(cat => cat._id === transaction.maDanhMuc._id)) {
        acc.push(transaction.maDanhMuc);
      }
      return acc;
    }, []);
    setCategories(uniqueCategories);
  }, [transactions]);

  // Hàm refresh danh sách giao dịch
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token");
      
      const userId = localStorage.getItem("userId")?.replace(/[^\w-]/g, "");
      if (!userId) throw new Error("Không tìm thấy userId");

      const response = await axios.get(`${API_URL}/transactions/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Cập nhật danh sách giao dịch
      setTransactions(response.data);
      toast.success("Đã cập nhật danh sách giao dịch!");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Lỗi khi cập nhật danh sách giao dịch");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        // Basic search
        const matchesSearch = transaction.ghiChu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.maDanhMuc?.tenDanhMuc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.maTaiKhoan?.tenTaiKhoan?.toLowerCase().includes(searchQuery.toLowerCase())

        // Date range
        const transactionDate = new Date(transaction.ngayGiaoDich)
        const matchesDateRange = (!dateRange.start || transactionDate >= new Date(dateRange.start)) &&
          (!dateRange.end || transactionDate <= new Date(dateRange.end))

        // Type filter
        const matchesType = !selectedType || transaction.loai === selectedType

        // Category filter
        const matchesCategory = !selectedCategory || transaction.maDanhMuc?._id === selectedCategory

        return matchesSearch && matchesDateRange && matchesType && matchesCategory
      })
      .sort((a, b) => new Date(b.ngayGiaoDich) - new Date(a.ngayGiaoDich))
  }, [transactions, searchQuery, dateRange, selectedType, selectedCategory])

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedType("")
    setSelectedCategory("")
    setDateRange({ start: "", end: "" })
  }

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredTransactions.map(t => ({
      'Ngày': new Date(t.ngayGiaoDich).toLocaleDateString(),
      'Loại': t.loai,
      'Danh mục': t.maDanhMuc?.tenDanhMuc,
      'Tài khoản': t.maTaiKhoan?.tenTaiKhoan,
      'Số tiền': t.soTien,
      'Phương thức': t.phuongThucThanhToan,
      'Ghi chú': t.ghiChu
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Giao dịch")
    XLSX.writeFile(wb, "giao_dich.xlsx")
  }

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add logo or title with styling
    doc.setFontSize(20)
    doc.setTextColor(16, 185, 129) // Emerald color
    doc.text("ViSmart Finance", 14, 20)
    
    // Add subtitle
    doc.setFontSize(12)
    doc.setTextColor(75, 85, 99) // Gray-600
    doc.text("Báo cáo giao dịch tài chính", 14, 30)
    
    // Add date range with better formatting
    doc.setFontSize(10)
    const startDate = dateRange.start ? new Date(dateRange.start).toLocaleDateString('vi-VN') : 'Tất cả'
    const endDate = dateRange.end ? new Date(dateRange.end).toLocaleDateString('vi-VN') : 'Tất cả'
    doc.text(`Thời gian: ${startDate} - ${endDate}`, 14, 40)
    
    // Add summary statistics
    const totalIncome = filteredTransactions
      .filter(t => t.loai === "Thu nhập")
      .reduce((sum, t) => sum + t.soTien, 0)
    const totalExpense = filteredTransactions
      .filter(t => t.loai === "Chi tiêu")
      .reduce((sum, t) => sum + t.soTien, 0)
    const balance = totalIncome - totalExpense

    doc.setFontSize(10)
    doc.text(`Tổng thu: ${formatCurrency(totalIncome)}`, 14, 50)
    doc.text(`Tổng chi: ${formatCurrency(totalExpense)}`, 14, 55)
    doc.text(`Số dư: ${formatCurrency(balance)}`, 14, 60)
    
    // Add table with improved styling
    const tableData = filteredTransactions.map(t => [
      new Date(t.ngayGiaoDich).toLocaleDateString('vi-VN'),
      t.loai,
      t.maDanhMuc?.tenDanhMuc || 'Không có',
      t.maTaiKhoan?.tenTaiKhoan || 'Không có',
      formatCurrency(t.soTien),
      t.phuongThucThanhToan || 'Không có',
      t.ghiChu || 'Không có'
    ])

    autoTable(doc, {
      head: [['Ngày', 'Loại', 'Danh mục', 'Tài khoản', 'Số tiền', 'Phương thức', 'Ghi chú']],
      body: tableData,
      startY: 70,
      theme: 'grid',
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        lineColor: [229, 231, 235], // Gray-200
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [16, 185, 129], // Emerald-500
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // Gray-50
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Ngày
        1: { cellWidth: 20 }, // Loại
        2: { cellWidth: 30 }, // Danh mục
        3: { cellWidth: 30 }, // Tài khoản
        4: { cellWidth: 25, halign: 'right' }, // Số tiền
        5: { cellWidth: 25 }, // Phương thức
        6: { cellWidth: 'auto' } // Ghi chú
      },
      didDrawPage: function(data) {
        // Add footer
        doc.setFontSize(8)
        doc.setTextColor(156, 163, 175) // Gray-400
        doc.text(
          `Trang ${data.pageCount} của ${data.pageNumber}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        )
        doc.text(
          `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`,
          doc.internal.pageSize.width - data.settings.margin.right - 40,
          doc.internal.pageSize.height - 10
        )
      }
    })

    // Add watermark
    doc.setTextColor(229, 231, 235) // Gray-200
    doc.setFontSize(60)
    doc.text('ViSmart', 40, 140, { angle: 45 })

    // Save with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    doc.save(`giao_dich_${timestamp}.pdf`)
  }

  const handleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t._id)))
    }
  }

  const handleSelectTransaction = (id) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTransactions(newSelected)
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedTransactions.size} giao dịch đã chọn?`)) return
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Không tìm thấy token")
      
      await Promise.all(
        Array.from(selectedTransactions).map(id =>
          axios.delete(`${API_URL}/transactions/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      )
      
      setSelectedTransactions(new Set())
      toast.success(`Đã xóa ${selectedTransactions.size} giao dịch thành công!`)
    } catch (error) {
      toast.error("Lỗi khi xóa giao dịch")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100/50 p-6"
    >
      <div className="flex flex-col space-y-4 mb-6">
        {/* Header with Search and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <FilterPanel
              searchTerm={searchQuery}
              setSearchTerm={setSearchQuery}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              dateRange={dateRange}
              setDateRange={setDateRange}
              categories={categories}
              onReset={handleResetFilters}
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* Refresh Button */}
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.div>
            </motion.button>

            {/* Export Menu */}
            <Menu as="div" className="relative">
              <Menu.Button
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Xuất</span>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 overflow-hidden">
                  <div className="p-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Xuất dữ liệu
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={exportToExcel}
                          className={`${
                            active ? "bg-emerald-50 text-emerald-600" : "text-gray-700"
                          } group flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-colors duration-200`}
                        >
                          <div className="mr-3 h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-colors duration-200">
                            <DocumentArrowDownIcon className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Xuất Excel</span>
                            <span className="text-xs text-gray-500">Định dạng .xlsx</span>
                          </div>
                        </motion.button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={exportToPDF}
                          className={`${
                            active ? "bg-emerald-50 text-emerald-600" : "text-gray-700"
                          } group flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-colors duration-200`}
                        >
                          <div className="mr-3 h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-colors duration-200">
                            <DocumentArrowDownIcon className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Xuất PDF</span>
                            <span className="text-xs text-gray-500">Định dạng .pdf</span>
                          </div>
                        </motion.button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
            >
              {viewMode === "list" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTransactions.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedTransactions.size === filteredTransactions.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-emerald-700">
                Đã chọn {selectedTransactions.size} giao dịch
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                Xóa đã chọn
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Transactions List/Grid */}
      <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
        {loading ? (
          <div className="flex justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"
            />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4"
            >
              <DocumentTextIcon className="h-8 w-8 text-gray-300" />
            </motion.div>
            <p className="text-gray-500 mb-2">Không tìm thấy giao dịch nào</p>
            <p className="text-sm text-gray-400">Thử thay đổi từ khóa tìm kiếm hoặc khoảng thời gian</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <motion.div
              key={transaction._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 ${
                viewMode === "grid" ? "flex flex-col" : ""
              }`}
            >
              <div className={`flex items-center ${viewMode === "grid" ? "flex-col text-center" : "justify-between"}`}>
                <div className={`flex items-center ${viewMode === "grid" ? "flex-col space-y-2" : "space-x-4"}`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.has(transaction._id)}
                      onChange={() => handleSelectTransaction(transaction._id)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                    className={`p-3 rounded-xl ${
                      transaction.loai === "Thu nhập"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {transaction.loai === "Thu nhập" ? (
                      <ArrowUpCircleIcon className="h-6 w-6" />
                    ) : (
                      <ArrowDownCircleIcon className="h-6 w-6" />
                    )}
                    </motion.div>
                  </div>
                  <div className={viewMode === "grid" ? "space-y-2" : ""}>
                    <h4 className="font-medium text-gray-900">{transaction.maDanhMuc?.tenDanhMuc}</h4>
                    <p className="text-sm text-gray-500">{transaction.ghiChu}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(transaction.ngayGiaoDich).toLocaleDateString()}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{transaction.maTaiKhoan?.tenTaiKhoan}</span>
                  </div>
                </div>
                </div>
                <div className={`flex items-center ${viewMode === "grid" ? "mt-4" : "space-x-4"}`}>
                  <span
                    className={`text-lg font-semibold ${
                        transaction.loai === "Thu nhập" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {transaction.loai === "Thu nhập" ? "+" : "-"}
                      {formatCurrency(transaction.soTien)}
                  </span>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(transaction)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(transaction._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
    )}
  </div>
    </motion.div>
)
}

// Sub-component: Statistics
const Statistics = ({ transactions }) => {
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.loai === "Thu nhập")
      .reduce((sum, t) => sum + t.soTien, 0)
    const totalExpense = transactions
      .filter((t) => t.loai === "Chi tiêu")
      .reduce((sum, t) => sum + t.soTien, 0)
    const balance = totalIncome - totalExpense

    return {
      totalIncome,
      totalExpense,
      balance,
    }
  }, [transactions])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-100/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng Thu</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(stats.totalIncome)}</p>
          </div>
          <div className="p-3 bg-emerald-100 rounded-xl">
            <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-100/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng Chi</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{formatCurrency(stats.totalExpense)}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-xl">
            <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-100/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Số Dư</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{formatCurrency(stats.balance)}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-xl">
            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Component FilterPanel mới với animation mượt mà
const FilterPanel = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedType, 
  setSelectedType, 
  selectedCategory, 
  setSelectedCategory, 
  dateRange, 
  setDateRange,
  categories,
  onReset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Xử lý click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Variants cho animation
  const panelVariants = {
    hidden: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      filter: "blur(10px)"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      filter: "blur(10px)",
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      filter: "blur(5px)"
    },
    visible: { 
      opacity: 1, 
      x: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Nút mở bộ lọc */}
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-emerald-500 transition-all duration-300"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          <FunnelIcon className="h-5 w-5 text-emerald-600" />
        </motion.div>
        <span className="text-sm font-medium text-gray-700">Bộ lọc</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </motion.div>
      </motion.button>

      {/* Panel bộ lọc với animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-4 z-50"
          >
            <div className="space-y-4">
              {/* Tìm kiếm */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm giao dịch..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </motion.div>

              {/* Loại giao dịch */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại giao dịch
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(selectedType === "Thu nhập" ? "" : "Thu nhập")}
                    className={`p-2 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                      selectedType === "Thu nhập"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    <ArrowUpCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Thu nhập</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(selectedType === "Chi tiêu" ? "" : "Chi tiêu")}
                    className={`p-2 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                      selectedType === "Chi tiêu"
                        ? "bg-red-50 border-red-500 text-red-700"
                        : "border-gray-200 text-gray-600 hover:border-red-300"
                    }`}
                  >
                    <ArrowDownCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Chi tiêu</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Danh mục */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 appearance-none"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.tenDanhMuc}
                      </option>
                    ))}
                  </select>
                  <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                </div>
              </motion.div>

              {/* Khoảng thời gian */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng thời gian
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
              </motion.div>

              {/* Nút reset */}
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(107, 114, 128, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onReset}
                  className="w-full p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </motion.div>
                  <span className="text-sm font-medium">Đặt lại bộ lọc</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main component: Dashboard
const Dashboard = () => {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [soTien, setSoTien] = useState("")
  const [loai, setLoai] = useState("Chi tiêu")
  const [maDanhMuc, setMaDanhMuc] = useState("")
  const [maTaiKhoan, setMaTaiKhoan] = useState("")
  const [ghiChu, setGhiChu] = useState("")
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState("")
  const [ngayGiaoDich, setNgayGiaoDich] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const navigate = useNavigate()

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  // Sanitize userId
  const userId = localStorage.getItem("userId")?.replace(/[^\w-]/g, "")

  useEffect(() => {
    if (!userId) {
      navigate("/")
      toast.error("Vui lòng đăng nhập để quản lý chi tiêu", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }
  }, [userId, navigate])

  // Debounced fetch data
  const fetchData = useMemo(
    () =>
      debounce(async () => {
        if (!userId) return
        setLoading(true)
        try {
          const token = localStorage.getItem("token")
          if (!token) {
            throw new Error("Không tìm thấy token, vui lòng đăng nhập lại")
          }
          console.log("Fetching data with userId:", userId, "token:", token.slice(0, 10) + "...")
          const headers = { Authorization: `Bearer ${token}` }
          console.log("Request headers:", headers)
          const [transactionRes, categoryRes, accountRes] = await Promise.all([
            axios.get(`${API_URL}/transactions/${userId}`, { headers }),
            axios.get(`${API_URL}/categories`, { headers }),
            axios.get(`${API_URL}/accounts/${userId}`, { headers }),
          ])
          console.log("API responses:", {
            transactions: transactionRes.data,
            categories: categoryRes.data,
            accounts: accountRes.data,
          })
          setTransactions(transactionRes.data)
          setCategories(categoryRes.data)
          setAccounts(accountRes.data)

          if (categoryRes.data.length > 0) {
            const validCategory = categoryRes.data.find((cat) => cat._id)
            setMaDanhMuc(validCategory ? validCategory._id : "")
          } else {
            setMaDanhMuc("")
            setError(
              'Vui lòng tạo danh mục tại <Link to="/categories" className="text-emerald-600 underline">Quản lý danh mục</Link>.',
            )
            toast.info("Vui lòng tạo danh mục trước khi thêm giao dịch.")
          }

          if (accountRes.data.length > 0) {
            setMaTaiKhoan(accountRes.data[0]._id)
          } else {
            setMaTaiKhoan("")
            setError(
              'Vui lòng tạo tài khoản tại <Link to="/accounts" className="text-emerald-600 underline">Quản lý tài khoản</Link>.',
            )
            toast.info("Vui lòng tạo tài khoản trước khi thêm giao dịch.")
          }
        } catch (err) {
          let errorMessage = "Lỗi khi tải dữ liệu."
          if (err.response) {
            console.error("API error response:", {
              status: err.response.status,
              data: err.response.data,
              headers: err.response.headers,
            })
            switch (err.response.status) {
              case 401:
              case 403:
                errorMessage = "Phiên đăng nhập hết hạn hoặc không có quyền truy cập. Vui lòng đăng nhập lại."
                localStorage.clear()
                navigate("/")
                break
              case 404:
                errorMessage = "Không tìm thấy dữ liệu giao dịch, danh mục hoặc tài khoản."
                break
              default:
                errorMessage = err.response.data.message || "Lỗi server."
            }
          } else {
            errorMessage = err.message || "Lỗi kết nối server."
          }
          console.error("Fetch data error:", err)
          setError(errorMessage)
          toast.error(errorMessage)
        } finally {
          setLoading(false)
        }
      }, 300),
    [userId, navigate],
  )

  useEffect(() => {
    fetchData()
    return () => fetchData.cancel()
  }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!maTaiKhoan || !maDanhMuc || !soTien) {
      setError("Vui lòng nhập số tiền và chọn tài khoản, danh mục.")
      toast.error("Vui lòng nhập số tiền và chọn tài khoản, danh mục.")
      return
    }
    if (Number.parseFloat(soTien) <= 0) {
      setError("Số tiền phải lớn hơn 0.")
      toast.error("Số tiền phải lớn hơn 0.")
      return
    }
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Không tìm thấy token, vui lòng đăng nhập lại")
      }
      console.log("Submitting transaction with payload:", {
        maNguoiDung: userId,
        maTaiKhoan,
        maDanhMuc,
        soTien,
        loai,
        ghiChu,
        phuongThucThanhToan,
        ngayGiaoDich,
      })
      const headers = { Authorization: `Bearer ${token}` }
      const payload = {
        maNguoiDung: userId,
        maTaiKhoan,
        maDanhMuc,
        soTien: Number.parseFloat(soTien),
        loai,
        ghiChu,
        phuongThucThanhToan: phuongThucThanhToan || undefined,
        ngayGiaoDich: ngayGiaoDich ? new Date(ngayGiaoDich).toISOString() : undefined,
      }
      let res
      if (editingTransaction) {
        res = await axios.put(`${API_URL}/transactions/${editingTransaction._id}`, payload, { headers })
        setTransactions(transactions.map((t) => (t._id === editingTransaction._id ? res.data : t)))
        toast.success("Sửa giao dịch thành công!")
      } else {
        res = await axios.post(`${API_URL}/transactions`, payload, { headers })
        setTransactions([...transactions, res.data])
        toast.success("Thêm giao dịch thành công!")
      }

      await fetchData()
      setSoTien("")
      setLoai("Chi tiêu")
      setGhiChu("")
      setPhuongThucThanhToan("")
      setNgayGiaoDich("")
      setError("")
      setEditingTransaction(null)
    } catch (err) {
      let errorMessage = "Lỗi khi xử lý giao dịch."
      if (err.response) {
        console.error("Transaction error response:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        })
        switch (err.response.status) {
          case 401:
          case 403:
            errorMessage = "Phiên đăng nhập hết hạn hoặc không có quyền truy cập. Vui lòng đăng nhập lại."
            localStorage.clear()
            navigate("/")
            break
          case 400:
            errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
            break
          default:
            errorMessage = err.response.data.message || "Lỗi server."
        }
      } else {
        errorMessage = err.message || "Lỗi kết nối server."
      }
      console.error("Request error:", err)
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setSoTien(transaction.soTien.toString())
    setLoai(transaction.loai)
    setMaTaiKhoan(transaction.maTaiKhoan?._id || "")
    setMaDanhMuc(transaction.maDanhMuc?._id || "")
    setGhiChu(transaction.ghiChu || "")
    setPhuongThucThanhToan(transaction.phuongThucThanhToan || "")
    setNgayGiaoDich(transaction.ngayGiaoDich ? new Date(transaction.ngayGiaoDich).toISOString().split("T")[0] : "")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa giao dịch này?")) return
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Không tìm thấy token, vui lòng đăng nhập lại")
      }
      console.log("Deleting transaction:", id)
      const headers = { Authorization: `Bearer ${token}` }
      await axios.delete(`${API_URL}/transactions/${id}`, { headers })
      setTransactions(transactions.filter((t) => t._id !== id))
      await fetchData()
      setError("")
      toast.success("Xóa giao dịch thành công!")
    } catch (err) {
      let errorMessage = "Lỗi khi xóa giao dịch."
      if (err.response) {
        console.error("Delete error response:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        })
        switch (err.response.status) {
          case 401:
          case 403:
            errorMessage = "Phiên đăng nhập hết hạn hoặc không có quyền truy cập. Vui lòng đăng nhập lại."
            localStorage.clear()
            navigate("/")
            break
          case 404:
            errorMessage = "Giao dịch không tồn tại."
            break
          default:
            errorMessage = err.response.data.message || "Lỗi server."
        }
      } else {
        errorMessage = err.message || "Lỗi kết nối server."
      }
      console.error("Delete error:", err)
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleCancelEdit = () => {
    setEditingTransaction(null)
    setSoTien("")
    setLoai("Chi tiêu")
    setGhiChu("")
    setPhuongThucThanhToan("")
    setNgayGiaoDich("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 py-8 px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        toastStyle={{
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <DocumentTextIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Giao Dịch
          </h2>
          <p className="text-gray-600 font-medium">Quản lý tài chính của bạn một cách thông minh</p>
        </motion.div>

        {/* Add Transaction Button */}
        <motion.div variants={itemVariants} className="flex justify-end mb-6">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFormOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 font-semibold"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm Giao Dịch</span>
          </motion.button>
        </motion.div>

        {/* Statistics Cards */}
        <Statistics transactions={transactions} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Transaction List - Takes full width */}
          <div className="lg:col-span-12">
            <TransactionList
              transactions={transactions}
              setTransactions={setTransactions}
              loading={loading}
              onEdit={(transaction) => {
                setEditingTransaction(transaction)
                setIsFormOpen(true)
              }}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>

      {/* Transaction Form Modal */}
      <Transition appear show={isFormOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setIsFormOpen(false)
            handleCancelEdit()
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => {
                        setIsFormOpen(false)
                        handleCancelEdit()
                      }}
                    >
                      <span className="sr-only">Đóng</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 mb-6"
                  >
                    {editingTransaction ? "Sửa Giao Dịch" : ""}
                  </Dialog.Title>

            <TransactionForm
              accounts={accounts}
              categories={categories}
              editingTransaction={editingTransaction}
                    onSubmit={(e) => {
                      handleSubmit(e)
                      setIsFormOpen(false)
                    }}
                    onCancel={() => {
                      setIsFormOpen(false)
                      handleCancelEdit()
                    }}
              soTien={soTien}
              setSoTien={setSoTien}
              loai={loai}
              setLoai={setLoai}
              maDanhMuc={maDanhMuc}
              setMaDanhMuc={setMaDanhMuc}
              maTaiKhoan={maTaiKhoan}
              setMaTaiKhoan={setMaTaiKhoan}
              ghiChu={ghiChu}
              setGhiChu={setGhiChu}
              phuongThucThanhToan={phuongThucThanhToan}
              setPhuongThucThanhToan={setPhuongThucThanhToan}
              ngayGiaoDich={ngayGiaoDich}
              setNgayGiaoDich={setNgayGiaoDich}
              error={error}
            />
                </Dialog.Panel>
              </Transition.Child>
          </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default Dashboard
