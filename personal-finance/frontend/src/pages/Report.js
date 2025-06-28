"use client"

import { useState, useEffect, useRef } from "react" // Thêm useRef
import axios from "axios"
import { useNavigate } from "react-router-dom"
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
import { toast } from "react-toastify"

const Report = () => {
  const [reports, setReports] = useState([])
  const [filterYear, setFilterYear] = useState("Tất cả")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [generating, setGenerating] = useState(false)
  const userId = localStorage.getItem("userId")
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'list'

  // Tạo một ref để tham chiếu đến div container của Vanta.js
  const vantaRef = useRef(null)
  const vantaEffect = useRef(null) // Ref để lưu trữ instance của Vanta effect

  useEffect(() => {
    if (!userId) {
      navigate("/")
      toast.error("Vui lòng đăng nhập để xem báo cáo")
    } else {
      console.log("API URL:", process.env.REACT_APP_API_URL)
      console.log("User ID:", userId)
    }
  }, [userId, navigate])

  // EFFECT để khởi tạo Vanta.js GLOBE
  useEffect(() => {
    if (vantaRef.current && !vantaEffect.current && window.VANTA && window.VANTA.GLOBE) {
      vantaEffect.current = window.VANTA.GLOBE({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0xdf3181,           // màu lưới
        color2: 0xffffff,          // màu cầu
        backgroundColor: 0x2c2150, // nền tím đậm như demo
        size: 1.00,
      });
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

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
          borderColor: "#00ffb3", // neon emerald
          backgroundColor: "#00ffb3",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Chi tiêu (VNĐ)",
          data: expenseData,
          borderColor: "#ff4d4f", // neon red
          backgroundColor: "#ff4d4f",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Tiết kiệm (VNĐ)",
          data: savingsData,
          borderColor: "#4fc3ff", // neon blue
          backgroundColor: "#4fc3ff",
          tension: 0.4,
          fill: false,
        },
      ],
    }
  }

  // Chart.js plugin for line glow/shadow
  const lineGlow = {
    id: 'lineGlow',
    beforeDatasetsDraw(chart) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        if (meta.type === 'line') {
          ctx.save();
          ctx.shadowColor = dataset.borderColor;
          ctx.shadowBlur = 16;
          ctx.globalAlpha = 0.7;
          meta.dataset.draw(ctx);
          ctx.restore();
        }
      });
    },
  };

  const uniqueYears = [...new Set(reports.map((rep) => rep.nam))].sort((a, b) => b - a)

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden font-sans bg-transparent"
      ref={vantaRef}
    >
      <div className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Premium Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.div
              initial={{ scale: 0, rotateY: 180, rotateX: 180 }}
              animate={{ scale: 1, rotateY: 0, rotateX: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, duration: 1.2 }}
              className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 shadow-lg"
            >
              <ChartPieIcon className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">Báo Cáo Tài Chính</h1>
            <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow mb-2">
              Phân tích & theo dõi tài chính cá nhân thông minh
            </p>
          </motion.div>

          {/* Summary Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                title: "Tổng thu nhập",
                value: totalIncome,
                icon: ArrowUpCircleIcon,
                color: "from-emerald-500 to-emerald-600",
                text: "text-emerald-400",
              },
              {
                title: "Tổng chi tiêu",
                value: totalExpense,
                icon: ArrowDownCircleIcon,
                color: "from-red-500 to-red-600",
                text: "text-red-400",
              },
              {
                title: "Tổng tiết kiệm",
                value: totalSavings,
                icon: CurrencyDollarIcon,
                color: "from-blue-500 to-blue-600",
                text: "text-blue-400",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl transition-all duration-300 flex flex-col items-center p-8"
              >
                <motion.div
                  className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-r ${item.color} mb-4 shadow-md`}
                  whileHover={{ rotate: 360 }}
                  onMouseLeave={e => {
                    // Trigger shake animation on mouse leave
                    const el = e.currentTarget;
                    el.animate([
                      { transform: 'translateX(0px)' },
                      { transform: 'translateX(-5px)' },
                      { transform: 'translateX(5px)' },
                      { transform: 'translateX(-3px)' },
                      { transform: 'translateX(3px)' },
                      { transform: 'translateX(0px)' },
                    ], {
                      duration: 400,
                      easing: 'ease-in-out',
                    });
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-100 mb-1 drop-shadow">{item.title}</h3>
                  <div className={`text-2xl md:text-3xl font-extrabold ${item.text} drop-shadow`}>{item.value.toLocaleString()} VNĐ</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Card with Toggle, Filter, and Content */}
          <motion.div variants={itemVariants} className="rounded-2xl bg-transparent transition-all duration-300 glass-morphism overflow-x-auto">
            {/* Header: Title left, controls right, subtitle below */}
            <div className="p-6 border-b border-gray-200/60 rounded-t-2xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4 md:gap-6">
                {/* Title left */}
                <div className="flex items-center space-x-3 mb-2 md:mb-0">
                  {viewMode === 'list' ? (
                    <ClipboardDocumentListIcon className="w-8 h-8 text-emerald-400 drop-shadow" />
                  ) : (
                    <ChartBarIcon className="w-8 h-8 text-blue-400 drop-shadow" />
                  )}
                  <h3 className="text-xl font-extrabold text-gray-200 drop-shadow">
                    {viewMode === 'list' ? 'Danh sách báo cáo' : 'Biểu đồ tài chính theo tháng'}
                  </h3>
                </div>
                {/* Controls right */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <button
                    onClick={() => setViewMode(viewMode === 'chart' ? 'list' : 'chart')}
                    className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 shadow-sm border border-gray-200 text-gray-800 font-bold text-base transition-all duration-300 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-200"
                  >
                    {viewMode === 'chart' ? (
                      <ClipboardDocumentListIcon className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ChartBarIcon className="w-5 h-5 text-blue-500" />
                    )}
                    {viewMode === 'chart' ? 'Xem danh sách' : 'Xem biểu đồ'}
                  </button>
                  <div className="flex items-center space-x-2 bg-white/60 rounded-xl px-3 py-2 shadow-sm">
                    <CalendarIcon className="w-5 h-5 text-emerald-600" />
                    <select
                      value={filterYear}
                      onChange={e => setFilterYear(e.target.value)}
                      className="bg-transparent text-black font-bold focus:outline-none text-base"
                    >
                      <option value="Tất cả">Tất cả các năm</option>
                      {uniqueYears.map((year) => (
                        <option key={year} value={year}>Năm {year}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateReport}
                    disabled={generating}
                    className={`px-5 py-2 rounded-xl text-white font-bold text-base shadow-md transition-all duration-300 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 ${generating ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {generating ? (
                      <span>Đang tạo...</span>
                    ) : (
                      <span>Tạo báo cáo</span>
                    )}
                  </button>
                </div>
              </div>
              {/* Subtitle below */}
              <div className="mt-2 ml-11 md:ml-11">
                <p className="text-gray-500 text-sm font-medium drop-shadow">
                  {viewMode === 'list' ? 'Chi tiết báo cáo tài chính theo tháng' : (filterYear === 'Tất cả' ? 'Tất cả các năm' : `Năm ${filterYear}`)}
                </p>
              </div>
            </div>
            {/* Content: Chart or List */}
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="ml-6 text-gray-700 font-bold text-xl">Đang tải báo cáo...</span>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-24">
                <DocumentChartBarIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <p className="text-gray-500 text-2xl font-bold mb-4">Chưa có báo cáo nào</p>
                <p className="text-gray-400 text-base max-w-md mx-auto">
                  Vui lòng thử <button onClick={handleGenerateReport} className="text-emerald-600 underline font-bold">tạo báo cáo thủ công</button> hoặc <a href="/transactions" className="text-emerald-600 underline font-bold">thêm giao dịch</a> để tạo báo cáo tự động vào đầu tháng sau.
                </p>
              </div>
            ) : (
              <div className="py-8">
                {viewMode === 'chart' ? (
                  <div className="h-80 md:h-96 rounded-xl p-4 bg-white/40 backdrop-blur-md border border-white/30">
                    <Line
                      data={chartData()}
                      options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                          legend: {
                            labels: {
                              color: '#fff',
                              font: { family: 'Roboto', weight: 'bold', size: 14 },
                            },
                          },
                        },
                        scales: {
                          x: {
                            grid: { color: '#222', drawBorder: true },
                            ticks: { color: '#fff', font: { weight: 'bold' } },
                          },
                          y: {
                            grid: { color: '#222', drawBorder: true },
                            ticks: { color: '#fff', font: { weight: 'bold' } },
                          },
                        },
                      }}
                      plugins={[lineGlow]}
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl bg-gray-800/60 backdrop-blur-md border border-white/30">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-emerald-50 to-blue-50">
                        <tr>
                          {['Tháng', 'Năm', 'Thu nhập (VNĐ)', 'Chi tiêu (VNĐ)', 'Tiết kiệm (VNĐ)', 'Ghi chú'].map(header => (
                            <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredReports.map((rep, idx) => (
                          <tr key={rep._id} className="hover:bg-emerald-50/60 transition">
                            <td className="px-6 py-4 font-bold text-gray-200 drop-shadow">Tháng {rep.thang}</td>
                            <td className="px-6 py-4 font-bold text-gray-200 drop-shadow">{rep.nam}</td>
                            <td className="px-6 py-4 font-semibold text-emerald-300 drop-shadow-lg">{rep.tongThuNhap.toLocaleString()} VNĐ</td>
                            <td className="px-6 py-4 font-semibold text-red-300 drop-shadow-lg">{rep.tongChiTieu.toLocaleString()} VNĐ</td>
                            <td className="px-6 py-4 font-semibold text-blue-300 drop-shadow-lg">{rep.soTienTietKiem.toLocaleString()} VNĐ</td>
                            <td className="px-6 py-4 text-gray-200 max-w-xs truncate drop-shadow">{rep.ghiChu || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Report