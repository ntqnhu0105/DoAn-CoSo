"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  ChartBarIcon,
  CalendarIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"
import { Line } from "react-chartjs-2"

const Report = () => {
  const [reports, setReports] = useState([])
  const [filterYear, setFilterYear] = useState("Tất cả")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [generating, setGenerating] = useState(false)
  const userId = localStorage.getItem("userId")
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) {
      navigate("/")
      toast.error("Vui lòng đăng nhập để xem báo cáo")
    } else {
      console.log("API URL:", process.env.REACT_APP_API_URL)
      console.log("User ID:", userId)
    }
  }, [userId, navigate])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log("Đang lấy báo cáo cho userId:", userId)
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/reports/${userId}`)
        console.log("Báo cáo đã lấy:", res.data)
        setReports(res.data)
        if (res.data.length === 0) {
          setError("Chưa có báo cáo. Vui lòng thêm giao dịch hoặc tạo báo cáo thủ công.")
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || `Lỗi khi tải dữ liệu báo cáo: ${err.message}`
        console.error("Lỗi khi lấy báo cáo:", err.response || err)
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    if (userId) fetchData()
  }, [userId])

  const handleGenerateReport = async () => {
    setGenerating(true)
    const currentDate = new Date()
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/reports/generate/${userId}`, {
        month: lastMonth.getMonth() + 1,
        year: lastMonth.getFullYear(),
      })
      toast.success("Báo cáo đã được tạo. Đang tải lại...", {
        icon: "🎉",
        style: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        },
      })
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/reports/${userId}`)
      setReports(res.data)
      setError("")
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo báo cáo", {
        icon: "❌",
        style: {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "white",
        },
      })
    } finally {
      setGenerating(false)
    }
  }

  const filteredReports =
    filterYear === "Tất cả" ? reports : reports.filter((rep) => rep.nam === Number.parseInt(filterYear))

  const totalIncome = filteredReports.reduce((sum, rep) => sum + (rep.tongThuNhap || 0), 0)
  const totalExpense = filteredReports.reduce((sum, rep) => sum + (rep.tongChiTieu || 0), 0)
  const totalSavings = filteredReports.reduce((sum, rep) => sum + (rep.soTienTietKiem || 0), 0)

  const chartData = () => {
    const selectedYear = filterYear === "Tất cả" ? new Date().getFullYear() : Number.parseInt(filterYear)
    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    const incomeData = months.map((month) => {
      const report = reports.find((rep) => rep.thang === month && rep.nam === selectedYear)
      return report ? report.tongThuNhap : 0
    })
    const expenseData = months.map((month) => {
      const report = reports.find((rep) => rep.thang === month && rep.nam === selectedYear)
      return report ? report.tongChiTieu : 0
    })
    const savingsData = months.map((month) => {
      const report = reports.find((rep) => rep.thang === month && rep.nam === selectedYear)
      return report ? report.soTienTietKiem : 0
    })

    return {
      labels: months.map((m) => `Tháng ${m}`),
      datasets: [
        {
          label: "Thu nhập (VNĐ)",
          data: incomeData,
          borderColor: "rgba(16, 185, 129, 1)",
          backgroundColor: "rgba(16, 185, 129, 0.6)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Chi tiêu (VNĐ)",
          data: expenseData,
          borderColor: "rgba(239, 68, 68, 1)",
          backgroundColor: "rgba(239, 68, 68, 0.6)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Tiết kiệm (VNĐ)",
          data: savingsData,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          tension: 0.4,
          fill: false,
        },
      ],
    }
  }

  const uniqueYears = [...new Set(reports.map((rep) => rep.nam))].sort((a, b) => b - a)

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
            <DocumentChartBarIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Báo cáo Tài chính
          </h2>
          <p className="text-gray-600 mt-2 font-medium">Phân tích và theo dõi tình hình tài chính của bạn</p>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-2xl border border-red-200/50 flex items-center space-x-3 shadow-sm max-w-4xl mx-auto"
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
              <span className="font-medium" dangerouslySetInnerHTML={{ __html: error }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                <ArrowUpCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Tổng thu nhập</h3>
                <p className="text-2xl font-bold text-emerald-600">{totalIncome.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <ArrowDownCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Tổng chi tiêu</h3>
                <p className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Tổng tiết kiệm</h3>
                <p className="text-2xl font-bold text-blue-600">{totalSavings.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filter and Generate Report */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Lọc theo năm</h3>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl bg-white/60 backdrop-blur-sm text-gray-800 shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                >
                  <option value="Tất cả">Tất cả các năm</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      Năm {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <PlusIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Tạo báo cáo mới</h3>
                <motion.button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-4 py-3 rounded-xl text-white flex items-center justify-center space-x-2 transition-all duration-300 ${
                    generating
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg"
                  }`}
                >
                  {generating ? (
                    <>
                      <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="h-5 w-5 text-white"
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
                      <span>Đang tạo báo cáo...</span>
                    </>
                  ) : (
                    <>
                      <ChartBarIcon className="h-5 w-5" />
                      <span>Tạo báo cáo tháng trước</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Chart */}
        {filteredReports.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 mb-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Biểu đồ tài chính theo tháng</h3>
                <p className="text-gray-600 text-sm">
                  {filterYear === "Tất cả" ? "Tất cả các năm" : `Năm ${filterYear}`}
                </p>
              </div>
            </div>
            <div className="h-80 p-4 bg-white/50 backdrop-blur-sm rounded-2xl">
              <Line
                data={chartData()}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Giá trị (VNĐ)" },
                      grid: { color: "rgba(0, 0, 0, 0.05)" },
                    },
                    x: {
                      title: { display: true, text: "Tháng" },
                      grid: { display: false },
                    },
                  },
                  plugins: {
                    legend: { display: true, position: "top" },
                    tooltip: {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      titleColor: "#1f2937",
                      bodyColor: "#1f2937",
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      borderWidth: 1,
                      cornerRadius: 10,
                      padding: 12,
                      boxPadding: 6,
                      usePointStyle: true,
                    },
                  },
                  interaction: {
                    intersect: false,
                    mode: "index",
                  },
                  responsive: true,
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Reports Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <DocumentChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Danh sách báo cáo</h3>
                <p className="text-gray-600 text-sm">Chi tiết báo cáo tài chính theo tháng</p>
              </div>
            </div>
          </div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
              />
              <span className="ml-4 text-gray-600 font-medium">Đang tải báo cáo...</span>
            </motion.div>
          ) : filteredReports.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <DocumentChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có báo cáo nào</p>
              <p className="text-gray-400 mt-2 max-w-md mx-auto">
                Vui lòng thử{" "}
                <button
                  onClick={handleGenerateReport}
                  className="text-emerald-500 underline hover:text-emerald-600 font-medium"
                >
                  tạo báo cáo thủ công
                </button>{" "}
                hoặc{" "}
                <a href="/transactions" className="text-emerald-500 underline hover:text-emerald-600 font-medium">
                  thêm giao dịch
                </a>{" "}
                để tạo báo cáo tự động vào đầu tháng sau.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100/50">
                <thead className="bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tháng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Năm
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thu nhập (VNĐ)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chi tiêu (VNĐ)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiết kiệm (VNĐ)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 backdrop-blur-sm divide-y divide-gray-100/50">
                  <AnimatePresence>
                    {filteredReports.map((rep, index) => (
                      <motion.tr
                        key={rep._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}
                        className="hover:bg-emerald-50/50 transition-all duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                              {rep.thang}
                            </div>
                            <span className="font-medium text-gray-900">Tháng {rep.thang}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-800">{rep.nam}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-emerald-600 font-semibold">{rep.tongThuNhap.toLocaleString()} VNĐ</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-red-600 font-semibold">{rep.tongChiTieu.toLocaleString()} VNĐ</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-blue-600 font-semibold">
                            {(rep.soTienTietKiem || 0).toLocaleString()} VNĐ
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{rep.ghiChu || "-"}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Report
