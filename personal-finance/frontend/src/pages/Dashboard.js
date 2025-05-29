"use client"

import { useState, useEffect, useMemo } from "react"
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
} from "@heroicons/react/24/outline"
import { debounce } from "lodash"

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
  <div className="group relative bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100/50 backdrop-blur-sm overflow-hidden mb-8">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-4 rounded-2xl shadow-lg">
            {editingTransaction ? (
              <PencilIcon className="h-6 w-6 text-white" />
            ) : (
              <PlusIcon className="h-6 w-6 text-white" />
            )}
          </div>
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
          <div className="bg-blue-100 px-4 py-2 rounded-full">
            <span className="text-xs font-semibold text-blue-700">Đang chỉnh sửa</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100/50 text-red-700 rounded-2xl shadow-sm border border-red-200/50 backdrop-blur-sm">
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
        </div>
      )}

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
              <button
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
              </button>
              <button
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
              </button>
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
                <button
                  key={method}
                  type="button"
                  onClick={() => setPhuongThucThanhToan(method)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                    phuongThucThanhToan === method
                      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-500 shadow-lg"
                      : "bg-white/70 text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                  }`}
                >
                  {method}
                </button>
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
              <input
                type="text"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Nhập ghi chú (tùy chọn)"
                className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-gray-500/20 focus:shadow-lg transition-all duration-300"
              />
              <DocumentTextIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>

          {/* Buttons */}
          <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 font-semibold"
              disabled={!maTaiKhoan || !maDanhMuc || !soTien || Number.parseFloat(soTien) <= 0}
            >
              {editingTransaction ? (
                <>
                  <PencilIcon className="h-5 w-5" />
                  <span>Cập Nhật Giao Dịch</span>
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  <span>Thêm Giao Dịch</span>
                </>
              )}
            </button>

            {editingTransaction && (
              <button
                type="button"
                className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg transform hover:-translate-y-1 font-semibold"
                onClick={onCancel}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Hủy</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  </div>
)

// Sub-component: TransactionList
const TransactionList = ({ transactions, loading, onEdit, onDelete }) => (
  <div className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/30 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100/50 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
          <BanknotesIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Lịch Sử Giao Dịch
          </h3>
          <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi các giao dịch của bạn</p>
        </div>
      </div>

      <div className="bg-blue-100 px-4 py-2 rounded-full">
        <span className="text-xs font-semibold text-blue-700">{transactions.length} giao dịch</span>
      </div>
    </div>

    {loading ? (
      <div className="grid grid-cols-1 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 p-6 rounded-2xl h-32"></div>
        ))}
      </div>
    ) : transactions.length === 0 ? (
      <div className="text-center py-16">
        <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <BanknotesIcon className="h-10 w-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg mb-6 font-medium">Chưa có giao dịch nào</p>
        <p className="text-gray-400 text-sm mb-8">Hãy thêm giao dịch đầu tiên của bạn để bắt đầu theo dõi chi tiêu</p>
        <Link
          to="/transactions/new"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 space-x-3 shadow-lg transform hover:-translate-y-1 font-semibold"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Thêm giao dịch đầu tiên</span>
        </Link>
      </div>
    ) : (
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="group p-6 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 hover:shadow-lg transition-all duration-300 border border-white/50"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-2xl ${
                      transaction.loai === "Thu nhập"
                        ? "bg-gradient-to-br from-emerald-100 to-emerald-200"
                        : "bg-gradient-to-br from-red-100 to-red-200"
                    }`}
                  >
                    {transaction.loai === "Thu nhập" ? (
                      <ArrowUpCircleIcon className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <ArrowDownCircleIcon className="h-6 w-6 text-red-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span
                        className={`font-bold text-lg ${
                          transaction.loai === "Thu nhập" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(transaction.soTien)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.loai === "Thu nhập"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.loai}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">{transaction.ghiChu || "Không có ghi chú"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <WalletIcon className="h-4 w-4 text-indigo-500" />
                    <div>
                      <p className="text-gray-500 text-xs">Tài khoản</p>
                      <p className="font-semibold text-gray-700">
                        {transaction.maTaiKhoan?.tenTaiKhoan || "Không xác định"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <TagIcon className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-gray-500 text-xs">Danh mục</p>
                      <p className="font-semibold text-gray-700">
                        {transaction.maDanhMuc?.tenDanhMuc || "Không xác định"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-4 w-4 text-pink-500" />
                    <div>
                      <p className="text-gray-500 text-xs">Phương thức</p>
                      <p className="font-semibold text-gray-700">{transaction.phuongThucThanhToan || "Không có"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-gray-500 text-xs">Ngày</p>
                      <p className="font-semibold text-gray-700">
                        {new Date(transaction.ngayGiaoDich).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 lg:mt-0 flex space-x-3">
                <button
                  onClick={() => onEdit(transaction)}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 rounded-xl hover:from-yellow-200 hover:to-yellow-300 transition-all duration-300 flex items-center space-x-2 shadow-sm transform hover:-translate-y-1 font-semibold border border-yellow-200"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => onDelete(transaction._id)}
                  className="px-6 py-3 bg-gradient-to-r from-red-100 to-red-200 text-red-700 rounded-xl hover:from-red-200 hover:to-red-300 transition-all duration-300 flex items-center space-x-2 shadow-sm transform hover:-translate-y-1 font-semibold border border-red-200"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

// Main Dashboard Component
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
  const navigate = useNavigate()

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-100 py-8 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        closeButton={true}
        toastStyle={{
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">
          <div className="flex items-center space-x-6 mb-6 lg:mb-0">
            <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-4 rounded-3xl shadow-xl">
              <HomeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Quản lý giao dịch
              </h1>
              <p className="text-gray-500 text-lg mt-2">
                {new Date().toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-white/50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">{loading ? "Đang tải..." : "Đã cập nhật"}</span>
              </div>
            </div>
          </div>
        </div>

        <TransactionForm
          accounts={accounts}
          categories={categories}
          editingTransaction={editingTransaction}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
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

        <TransactionList transactions={transactions} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  )
}

export default Dashboard
