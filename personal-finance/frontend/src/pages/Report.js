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
  ChartPieIcon,
  ClipboardDocumentListIcon,
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-100 to-yellow-100 py-10 px-2 md:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <motion.div
          animate={{ x: [0, 120, 0], y: [0, -120, 0] }}
          transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-indigo-200/40 to-pink-200/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -120, 0], y: [0, 120, 0] }}
          transition={{ duration: 28, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-yellow-200/40 to-pink-200/40 rounded-full blur-3xl"
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
          borderRadius: "18px",
          backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(255,255,255,0.25)",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-2xl border-4 border-white/40"
          >
            <ChartPieIcon className="w-12 h-12 text-white drop-shadow-lg" />
          </motion.div>
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-md">
            Báo Cáo
          </h2>
          <p className="text-gray-600 mt-3 font-medium text-lg">Phân tích & theo dõi tài chính cá nhân của bạn</p>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 p-4 bg-red-100/80 backdrop-blur-md text-red-700 rounded-2xl border border-red-200/60 flex items-center space-x-3 shadow-lg max-w-4xl mx-auto"
            >
              <div className="w-7 h-7 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
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
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <motion.div
            whileHover={{ scale: 1.04, y: -6 }}
            className="bg-white/60 backdrop-blur-lg p-7 rounded-3xl shadow-2xl border border-white/30 transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(31,41,55,0.18)]"
          >
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-green-400 rounded-2xl flex items-center justify-center shadow-lg">
                <ArrowUpCircleIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Tổng thu nhập</h3>
                <p className="text-3xl font-extrabold text-emerald-500">{totalIncome.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, y: -6 }}
            className="bg-white/60 backdrop-blur-lg p-7 rounded-3xl shadow-2xl border border-white/30 transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(239,68,68,0.18)]"
          >
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg">
                <ArrowDownCircleIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Tổng chi tiêu</h3>
                <p className="text-3xl font-extrabold text-pink-500">{totalExpense.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, y: -6 }}
            className="bg-white/60 backdrop-blur-lg p-7 rounded-3xl shadow-2xl border border-white/30 transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.18)]"
          >
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg">
                <CurrencyDollarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Tổng tiết kiệm</h3>
                <p className="text-3xl font-extrabold text-blue-500">{totalSavings.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Chart */}
        {filteredReports.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30 mb-10"
          >
            <div className="flex items-center space-x-4 mb-7">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Biểu đồ tài chính theo tháng</h3>
                <p className="text-gray-600 text-base">
                  {filterYear === "Tất cả" ? "Tất cả các năm" : `Năm ${filterYear}`}
                </p>
              </div>
            </div>
            <div className="h-96 p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-inner">
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
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      titleColor: "#1f2937",
                      bodyColor: "#1f2937",
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      borderWidth: 1,
                      cornerRadius: 12,
                      padding: 14,
                      boxPadding: 8,
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
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
        >
          <div className="p-7 border-b border-gray-100/60 bg-gradient-to-r from-indigo-100/60 to-pink-100/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <DocumentChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Danh sách báo cáo</h3>
                  <p className="text-gray-600 text-base">Chi tiết báo cáo tài chính theo tháng</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-md p-2 rounded-xl border border-white/30">
                  <CalendarIcon className="w-5 h-5 text-gray-500" />
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="bg-transparent text-gray-700 font-medium focus:outline-none"
                  >
                    <option value="Tất cả">Tất cả các năm</option>
                    {uniqueYears.map((year) => (
                      <option key={year} value={year}>
                        Năm {year}
                      </option>
                    ))}
                  </select>
                </div>
                <motion.button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  whileHover={{ scale: generating ? 1 : 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-xl text-white flex items-center space-x-2 transition-all duration-300 ${
                    generating
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-yellow-400 to-orange-400 hover:shadow-lg"
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
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" />
                      <span>Tạo báo cáo</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-14 h-14 border-4 border-indigo-400 border-t-transparent rounded-full"
              />
              <span className="ml-5 text-gray-600 font-medium text-lg">Đang tải báo cáo...</span>
            </motion.div>
          ) : filteredReports.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <DocumentChartBarIcon className="w-20 h-20 text-gray-300 mx-auto mb-5" />
              <p className="text-gray-500 text-xl">Chưa có báo cáo nào</p>
              <p className="text-gray-400 mt-3 max-w-md mx-auto">
                Vui lòng thử{" "}
                <button
                  onClick={handleGenerateReport}
                  className="text-indigo-500 underline hover:text-pink-500 font-medium"
                >
                  tạo báo cáo thủ công
                </button>{" "}
                hoặc{" "}
                <a href="/transactions" className="text-indigo-500 underline hover:text-pink-500 font-medium">
                  thêm giao dịch
                </a>{" "}
                để tạo báo cáo tự động vào đầu tháng sau.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100/60">
                <thead className="bg-gradient-to-r from-indigo-100/60 to-pink-100/60 backdrop-blur-md sticky top-0 z-10">
                  <tr>
                    <th className="px-7 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Tháng
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Năm
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Thu nhập (VNĐ)
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Chi tiêu (VNĐ)
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Tiết kiệm (VNĐ)
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/40 backdrop-blur-md divide-y divide-gray-100/60">
                  <AnimatePresence>
                    {filteredReports.map((rep, index) => (
                      <motion.tr
                        key={rep._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.04 }}
                        whileHover={{ backgroundColor: "rgba(99,102,241,0.07)" }}
                        className="hover:bg-indigo-50/60 transition-all duration-200"
                      >
                        <td className="px-7 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                              {rep.thang}
                            </div>
                            <span className="font-semibold text-gray-900">Tháng {rep.thang}</span>
                          </div>
                        </td>
                        <td className="px-7 py-5 whitespace-nowrap text-gray-800 font-semibold">{rep.nam}</td>
                        <td className="px-7 py-5 whitespace-nowrap">
                          <span className="text-emerald-500 font-bold">{rep.tongThuNhap.toLocaleString()} VNĐ</span>
                        </td>
                        <td className="px-7 py-5 whitespace-nowrap">
                          <span className="text-pink-500 font-bold">{rep.tongChiTieu.toLocaleString()} VNĐ</span>
                        </td>
                        <td className="px-7 py-5 whitespace-nowrap">
                          <span className="text-indigo-500 font-bold">
                            {(rep.soTienTietKiem || 0).toLocaleString()} VNĐ
                          </span>
                        </td>
                        <td className="px-7 py-5 whitespace-nowrap text-gray-600">{rep.ghiChu || "-"}</td>
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
