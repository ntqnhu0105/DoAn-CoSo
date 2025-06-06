"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from "chart.js"
import {
  HomeIcon,
  BanknotesIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ChartPieIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CalculatorIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  UserCircleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline"
import { debounce } from "lodash"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"
import { useSwipeable } from "react-swipeable"

// Đăng ký ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

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

// Sub-component: AccountCard
const AccountCard = ({ accounts, loading, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [sortBy, setSortBy] = useState('balance') // 'balance' or 'name'
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAccounts = useMemo(() => {
    return accounts.list
      .filter(account => 
        account.tenTaiKhoan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.loaiTaiKhoan.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'balance') {
          return b.soDu - a.soDu
        }
        return a.tenTaiKhoan.localeCompare(b.tenTaiKhoan)
      })
  }, [accounts.list, searchTerm, sortBy])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-emerald-100/50 backdrop-blur-sm overflow-hidden"
    >
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-2xl shadow-lg"
            >
            <UserCircleIcon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
          <h3 className="text-lg font-bold text-gray-800">Tài khoản</h3>
              <p className="text-sm text-gray-500">Quản lý tài khoản của bạn</p>
        </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-emerald-100 px-3 py-1 rounded-full"
          >
          <span className="text-xs font-semibold text-emerald-700">{accounts.list.length} tài khoản</span>
          </motion.div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Tổng số dư</p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent"
              >
              {formatCurrency(accounts.totalBalance)}
              </motion.p>
          </div>

          {accounts.list.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                >
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                </motion.div>
              <p className="text-gray-500 mb-4">Chưa có tài khoản nào</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/accounts/new")}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transform transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm tài khoản
                </motion.button>
              </motion.div>
          ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm kiếm tài khoản..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  >
                    <option value="balance">Sắp xếp theo số dư</option>
                    <option value="name">Sắp xếp theo tên</option>
                  </select>
                </div>

                <motion.div
                  layout
                  className={`space-y-3 max-h-${isExpanded ? 'none' : '64'} overflow-y-auto custom-scrollbar`}
                >
                  <AnimatePresence>
                    {filteredAccounts.map((account) => (
                      <motion.div
                  key={account._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ scale: 1.02 }}
                  className="group/item p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800 group-hover/item:text-emerald-700 transition-colors">
                        {account.tenTaiKhoan}
                      </p>
                      <p className="text-sm text-gray-500">{account.loaiTaiKhoan}</p>
                    </div>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="text-right"
                          >
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(account.soDu)}</p>
                          </motion.div>
                    </div>
                      </motion.div>
              ))}
                  </AnimatePresence>
                </motion.div>

                {accounts.list.length > 3 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                  >
                    {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                  </motion.button>
                )}
            </div>
          )}
        </>
      )}
    </div>
    </motion.div>
)
}

// Sub-component: SavingGoalCard
const SavingGoalCard = ({ savingGoals, loading, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [sortBy, setSortBy] = useState('progress') // 'progress', 'amount', 'deadline'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'in-progress', 'completed'

  const filteredGoals = useMemo(() => {
    return savingGoals.list
      .filter(goal => {
        const matchesSearch = goal.tenMucTieu.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' ? true :
          filterStatus === 'completed' ? (goal.soTienHienTai >= goal.soTienMucTieu) :
          (goal.soTienHienTai < goal.soTienMucTieu)
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'progress':
            return (b.soTienHienTai / b.soTienMucTieu) - (a.soTienHienTai / a.soTienMucTieu)
          case 'amount':
            return b.soTienMucTieu - a.soTienMucTieu
          case 'deadline':
            return new Date(a.hanChot) - new Date(b.hanChot)
          default:
            return 0
        }
      })
  }, [savingGoals.list, searchTerm, sortBy, filterStatus])

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'from-emerald-500 to-emerald-600'
    if (progress >= 75) return 'from-blue-500 to-blue-600'
    if (progress >= 50) return 'from-amber-500 to-amber-600'
    return 'from-red-500 to-red-600'
  }

  const getDaysRemaining = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100/50 backdrop-blur-sm overflow-hidden"
    >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg"
            >
            <ArchiveBoxIcon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
          <h3 className="text-lg font-bold text-gray-800">Mục tiêu tiết kiệm</h3>
              <p className="text-sm text-gray-500">Theo dõi tiến độ tiết kiệm</p>
        </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-blue-100 px-3 py-1 rounded-full"
          >
          <span className="text-xs font-semibold text-blue-700">{savingGoals.list.length} mục tiêu</span>
          </motion.div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Tổng tiết kiệm</p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"
              >
              {formatCurrency(savingGoals.totalSavings)}
              </motion.p>
          </div>

          {savingGoals.list.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                >
                <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
                </motion.div>
              <p className="text-gray-500 mb-4">Chưa có mục tiêu tiết kiệm nào</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/saving-goals/new")}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transform transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm mục tiêu
                </motion.button>
              </motion.div>
          ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm kiếm mục tiêu..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="progress">Sắp xếp theo tiến độ</option>
                      <option value="amount">Sắp xếp theo số tiền</option>
                      <option value="deadline">Sắp xếp theo hạn chót</option>
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="all">Tất cả</option>
                      <option value="in-progress">Đang thực hiện</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                  </div>
                </div>

                <motion.div
                  layout
                  className={`space-y-4 max-h-${isExpanded ? 'none' : '64'} overflow-y-auto custom-scrollbar`}
                >
                  <AnimatePresence>
                    {filteredGoals.map((goal) => {
                      const progress = (goal.soTienHienTai / goal.soTienMucTieu) * 100
                      const daysRemaining = getDaysRemaining(goal.hanChot)
                      const isCompleted = progress >= 100
                      const isOverdue = daysRemaining < 0 && !isCompleted

                      return (
                        <motion.div
                          key={goal._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                              <p className="font-semibold text-gray-800">{goal.tenMucTieu}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  Hạn: {new Date(goal.hanChot).toLocaleDateString("vi-VN")}
                                </span>
                                {isOverdue && (
                                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                    Quá hạn
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    Hoàn thành
                                  </span>
                                )}
                              </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                                {progress.toFixed(0)}%
                      </p>
                              {!isCompleted && daysRemaining > 0 && (
                                <p className="text-xs text-gray-500">
                                  Còn {daysRemaining} ngày
                                </p>
                              )}
                    </div>
                  </div>

                  <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-1000 ease-out`}
                              />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                              <span>{formatCurrency(goal.soTienHienTai)}</span>
                              <span>{formatCurrency(goal.soTienMucTieu)}</span>
                    </div>
                  </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </motion.div>

                {savingGoals.list.length > 3 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                  </motion.button>
                )}
            </div>
          )}
        </>
      )}
    </div>
    </motion.div>
)
}

// Sub-component: InvestmentCard
const InvestmentCard = ({ investments, loading, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [sortBy, setSortBy] = useState('profit') // 'profit', 'value', 'type'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [timeRange, setTimeRange] = useState('all') // 'all', 'month', 'year'

  const filteredInvestments = useMemo(() => {
    return investments.list
      .filter(inv => {
        const matchesSearch = inv.loai.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === 'all' ? true : inv.loai === filterType
        return matchesSearch && matchesType
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'profit':
            return b.loiNhuan - a.loiNhuan
          case 'value':
            return b.giaTri - a.giaTri
          case 'type':
            return a.loai.localeCompare(b.loai)
          default:
            return 0
        }
      })
  }, [investments.list, searchTerm, sortBy, filterType])

  const getProfitColor = (profit) => {
    if (profit > 0) return 'text-emerald-600'
    if (profit < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getProfitIcon = (profit) => {
    if (profit > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
    if (profit < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
    return <MinusIcon className="h-4 w-4 text-gray-500" />
  }

  const getInvestmentTypeColor = (type) => {
    const colors = {
      'Chứng khoán': 'from-blue-500 to-blue-600',
      'Bất động sản': 'from-purple-500 to-purple-600',
      'Vàng': 'from-amber-500 to-amber-600',
      'Tiền điện tử': 'from-indigo-500 to-indigo-600',
      'Trái phiếu': 'from-emerald-500 to-emerald-600',
      'Quỹ đầu tư': 'from-rose-500 to-rose-600',
    }
    return colors[type] || 'from-gray-500 to-gray-600'
  }

  const getInvestmentTypeIcon = (type) => {
    const icons = {
      'Chứng khoán': <ChartBarIcon className="h-5 w-5" />,
      'Bất động sản': <HomeIcon className="h-5 w-5" />,
      'Vàng': <CurrencyDollarIcon className="h-5 w-5" />,
      'Tiền điện tử': <CurrencyDollarIcon className="h-5 w-5" />,
      'Trái phiếu': <DocumentTextIcon className="h-5 w-5" />,
      'Quỹ đầu tư': <ChartPieIcon className="h-5 w-5" />,
    }
    return icons[type] || <CurrencyDollarIcon className="h-5 w-5" />
  }

  const calculateTotalProfit = () => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    return investments.list.reduce((total, inv) => {
      const profit = inv.loiNhuan
      if (timeRange === 'month' && new Date(inv.ngayDauTu) < monthStart) return total
      if (timeRange === 'year' && new Date(inv.ngayDauTu) < yearStart) return total
      return total + profit
    }, 0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-gradient-to-br from-white via-purple-50/30 to-purple-100/20 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-100/50 backdrop-blur-sm overflow-hidden"
    >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg"
            >
            <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
          <h3 className="text-lg font-bold text-gray-800">Đầu tư</h3>
              <p className="text-sm text-gray-500">Theo dõi danh mục đầu tư</p>
        </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-purple-100 px-3 py-1 rounded-full"
          >
          <span className="text-xs font-semibold text-purple-700">{investments.list.length} khoản</span>
          </motion.div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Tổng đầu tư</p>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-xs px-2 py-1 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                >
                  <option value="all">Tất cả</option>
                  <option value="month">Tháng này</option>
                  <option value="year">Năm nay</option>
                </select>
              </div>
            <div className="flex items-end space-x-3">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent"
                >
                {formatCurrency(investments.totalInvestment)}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-1 pb-1"
                >
                  {getProfitIcon(calculateTotalProfit())}
                  <p className={`text-sm font-semibold ${getProfitColor(calculateTotalProfit())}`}>
                    {formatCurrency(calculateTotalProfit())}
                  </p>
                </motion.div>
            </div>
          </div>

          {investments.list.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                >
                <ArrowTrendingUpIcon className="h-8 w-8 text-gray-400" />
                </motion.div>
              <p className="text-gray-500 mb-4">Chưa có khoản đầu tư nào</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/investments/new")}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-purple-700 transform transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm đầu tư
                </motion.button>
              </motion.div>
          ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm kiếm đầu tư..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                    >
                      <option value="profit">Sắp xếp theo lợi nhuận</option>
                      <option value="value">Sắp xếp theo giá trị</option>
                      <option value="type">Sắp xếp theo loại</option>
                    </select>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                    >
                      <option value="all">Tất cả loại</option>
                      <option value="Chứng khoán">Chứng khoán</option>
                      <option value="Bất động sản">Bất động sản</option>
                      <option value="Vàng">Vàng</option>
                      <option value="Tiền điện tử">Tiền điện tử</option>
                      <option value="Trái phiếu">Trái phiếu</option>
                      <option value="Quỹ đầu tư">Quỹ đầu tư</option>
                    </select>
                  </div>
                </div>

                <motion.div
                  layout
                  className={`space-y-4 max-h-${isExpanded ? 'none' : '64'} overflow-y-auto custom-scrollbar`}
                >
                  <AnimatePresence>
                    {filteredInvestments.map((inv) => (
                      <motion.div
                  key={inv._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className={`bg-gradient-to-br ${getInvestmentTypeColor(inv.loai)} p-2 rounded-xl shadow-sm`}>
                              {getInvestmentTypeIcon(inv.loai)}
                            </div>
                    <div>
                      <p className="font-semibold text-gray-800">{inv.loai}</p>
                      <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  Ngày đầu tư: {new Date(inv.ngayDauTu).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">{formatCurrency(inv.giaTri)}</p>
                            <div className="flex items-center justify-end space-x-1">
                              {getProfitIcon(inv.loiNhuan)}
                              <p className={`text-sm font-semibold ${getProfitColor(inv.loiNhuan)}`}>
                                {formatCurrency(inv.loiNhuan)}
                              </p>
                    </div>
                  </div>
                </div>
                      </motion.div>
              ))}
                  </AnimatePresence>
                </motion.div>

                {investments.list.length > 3 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors duration-200"
                  >
                    {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                  </motion.button>
                )}
            </div>
          )}
        </>
      )}
    </div>
    </motion.div>
)
}

// Sub-component: IncomeExpenseChart
const IncomeExpenseChart = ({ transactions, timeRange }) => {
  const [chartType, setChartType] = useState('bar') // 'bar', 'line'
  const [viewMode, setViewMode] = useState('split') // 'split', 'chart', 'stats'
  const [selectedCategory, setSelectedCategory] = useState('all') // 'all', 'income', 'expense'

  const chartData = useMemo(() => {
    if (!transactions) return { labels: [], datasets: [] }

    const labels = ["Thu nhập", "Chi tiêu"]
    const incomeData = transactions.totalIncome || 0
    const expenseData = transactions.totalExpense || 0

    return {
      labels,
      datasets: [
        {
          label: "Số tiền (VNĐ)",
          data: [incomeData, expenseData],
          backgroundColor: ["#10B981", "#EF4444"],
          borderColor: ["#059669", "#DC2626"],
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }
  }, [transactions])

  const difference = (transactions.totalIncome || 0) - (transactions.totalExpense || 0)
  const percentage = transactions.totalIncome > 0 
    ? (((transactions.totalExpense || 0) / transactions.totalIncome) * 100).toFixed(1)
    : 0

  const getStatusColor = (value) => {
    if (value >= 0) return 'text-emerald-600'
    return 'text-red-600'
  }

  const getStatusIcon = (value) => {
    if (value >= 0) return <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
    return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
  }

  const getStatusText = (value) => {
    if (value >= 0) return 'Thặng dư'
    return 'Thâm hụt'
  }

  // Hàm lấy tiêu đề dựa trên timeRange
  const getTitle = () => {
    const now = new Date()
    switch (timeRange.toLowerCase()) {
      case 'week':
        return `Tuần này`
      case 'month':
        return `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`
      case 'quarter':
        return `Quý ${Math.floor(now.getMonth() / 3) + 1}/${now.getFullYear()}`
      case 'year':
        return `Năm ${now.getFullYear()}`
      default:
        return `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`
    }
  }

  // Kiểm tra nếu không có dữ liệu
  if (!transactions.totalIncome && !transactions.totalExpense) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-100/50 backdrop-blur-sm text-center py-8"
      >
        <p className="text-gray-500">Không có dữ liệu giao dịch cho {getTitle()}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-md border border-gray-100/50 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 p-2 rounded-lg shadow-md"
          >
            <ChartBarIcon className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{getTitle()}</h3>
            <p className="text-xs text-gray-500">Phân tích thu nhập và chi tiêu</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md ${
                viewMode === 'split' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('chart')}
              className={`p-1.5 rounded-md ${
                viewMode === 'chart' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <ChartBarIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('stats')}
              className={`p-1.5 rounded-md ${
                viewMode === 'stats' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </motion.button>
          </div>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="bar">Biểu đồ cột</option>
            <option value="line">Biểu đồ đường</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="income">Thu nhập</option>
            <option value="expense">Chi tiêu</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid gap-6 ${
        viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-3' :
        viewMode === 'chart' ? 'grid-cols-1' :
        'grid-cols-1'
      }`}>
        {/* Summary Cards */}
        {viewMode !== 'chart' && (
          <div className="flex flex-col space-y-4">
            {/* Income Card */}
            <motion.div
              whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0,0,0,0.1)" }}
              className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-100"
            >
              <div className="p-2 bg-green-500 rounded-lg">
                <ArrowUpCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Thu nhập</p>
                <p className="text-lg font-bold text-green-800">
                  {formatCurrency(transactions.totalIncome || 0)}
                </p>
              </div>
            </motion.div>

            {/* Expense Card */}
            <motion.div
              whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0,0,0,0.1)" }}
              className="flex items-center space-x-4 p-4 bg-red-50 rounded-xl border border-red-100"
            >
              <div className="p-2 bg-red-500 rounded-lg">
                <ArrowDownCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Chi tiêu</p>
                <p className="text-lg font-bold text-red-800">
                  {formatCurrency(transactions.totalExpense || 0)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {percentage}% so với thu nhập
                </p>
              </div>
            </motion.div>

            {/* Difference Card */}
            <motion.div
              whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0,0,0,0.1)" }}
              className={`flex items-center space-x-4 p-4 rounded-xl border ${
                difference >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  difference >= 0 ? "bg-blue-500" : "bg-orange-500"
                }`}
              >
                {difference >= 0 ? (
                  <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                ) : (
                  <ArrowTrendingDownIcon className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    difference >= 0 ? "text-blue-700" : "text-orange-700"
                  }`}
                >
                  Chênh lệch
                </p>
                <p
                  className={`text-lg font-bold ${
                    difference >= 0 ? "text-blue-800" : "text-orange-800"
                  }`}
                >
                  {formatCurrency(Math.abs(difference))}
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`px-2 py-0.5 mt-1 rounded-full text-xs font-medium inline-block ${
                    difference >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {getStatusText(difference)}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Chart */}
        {viewMode !== 'stats' && (
          <div className={`${
            viewMode === 'split' ? 'lg:col-span-2' : ''
          } h-72 bg-gray-50 rounded-xl p-4 border border-gray-100`}>
            {chartType === 'bar' ? (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      cornerRadius: 8,
                      padding: 12,
                      titleFont: { size: 12, weight: "bold" },
                      bodyFont: { size: 12 },
                      callbacks: {
                        label: (context) => formatCurrency(context.raw),
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.03)",
                        drawBorder: false,
                      },
                      ticks: {
                        font: { size: 11 },
                        color: "#6B7280",
                        callback: (value) => formatCurrency(value).replace("₫", ""),
                      },
                    },
                    x: {
                      grid: { display: false },
                      ticks: {
                        font: { size: 12, weight: "600" },
                        color: "#374151",
                      },
                    },
                  },
                }}
              />
            ) : (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      cornerRadius: 8,
                      padding: 12,
                      titleFont: { size: 12, weight: "bold" },
                      bodyFont: { size: 12 },
                      callbacks: {
                        label: (context) => formatCurrency(context.raw),
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.03)",
                        drawBorder: false,
                      },
                      ticks: {
                        font: { size: 11 },
                        color: "#6B7280",
                        callback: (value) => formatCurrency(value).replace("₫", ""),
                      },
                    },
                    x: {
                      grid: { display: false },
                      ticks: {
                        font: { size: 12, weight: "600" },
                        color: "#374151",
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Sub-component: DebtCard
const DebtCard = ({ debts, loading, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [sortBy, setSortBy] = useState('amount') // 'amount', 'dueDate', 'progress'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'active', 'completed'
  const [viewMode, setViewMode] = useState('list') // 'list', 'grid'

  const filteredDebts = useMemo(() => {
    return debts.list
      .filter(debt => {
        const matchesSearch = (debt.ghiChu || '').toLowerCase().includes(searchTerm.toLowerCase())
        const progress = (debt.soTienDaTra / debt.soTien) * 100
        const matchesStatus = filterStatus === 'all' ? true :
          filterStatus === 'completed' ? progress >= 100 :
          progress < 100
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'amount':
            return b.soTien - a.soTien
          case 'dueDate':
            if (!a.ngayKetThuc || !b.ngayKetThuc) return 0
            return new Date(a.ngayKetThuc) - new Date(b.ngayKetThuc)
          case 'progress':
            return (b.soTienDaTra / b.soTien) - (a.soTienDaTra / a.soTien)
          default:
            return 0
        }
      })
  }, [debts.list, searchTerm, sortBy, filterStatus])

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'from-emerald-500 to-emerald-600'
    if (progress >= 75) return 'from-blue-500 to-blue-600'
    if (progress >= 50) return 'from-amber-500 to-amber-600'
    return 'from-red-500 to-red-600'
  }

  const getStatusBadge = (debt) => {
    const progress = (debt.soTienDaTra / debt.soTien) * 100
    const isCompleted = progress >= 100
    const isOverdue = debt.ngayKetThuc && new Date(debt.ngayKetThuc) < new Date() && !isCompleted
    const daysRemaining = debt.ngayKetThuc ? Math.ceil((new Date(debt.ngayKetThuc) - new Date()) / (1000 * 60 * 60 * 24)) : null

    if (isCompleted) {
      return (
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full"
        >
          Đã trả xong
        </motion.span>
      )
    }
    if (isOverdue) {
      return (
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full"
        >
          Quá hạn
        </motion.span>
      )
    }
    if (daysRemaining !== null && daysRemaining <= 7) {
      return (
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full"
        >
          Còn {daysRemaining} ngày
        </motion.span>
      )
    }
    return null
  }

  const getRemainingAmount = (debt) => {
    return debt.soTien - debt.soTienDaTra
  }

  const getProgressPercentage = (debt) => {
    return (debt.soTienDaTra / debt.soTien) * 100
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-gradient-to-br from-white via-red-50/30 to-red-100/20 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-red-100/50 backdrop-blur-sm overflow-hidden"
    >
    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-2xl shadow-lg"
            >
            <CreditCardIcon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
          <h3 className="text-lg font-bold text-gray-800">Nợ/Khoản vay</h3>
              <p className="text-sm text-gray-500">Theo dõi khoản nợ của bạn</p>
        </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-red-100 px-3 py-1 rounded-full"
            >
          <span className="text-xs font-semibold text-red-700">{debts.list.length} khoản</span>
            </motion.div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </motion.button>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Tổng nợ</p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent"
              >
              {formatCurrency(debts.totalDebt)}
              </motion.p>
          </div>

          {debts.list.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                >
                <CreditCardIcon className="h-8 w-8 text-gray-400" />
                </motion.div>
              <p className="text-gray-500 mb-4">Chưa có khoản nợ nào</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/debts/new")}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transform transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm khoản nợ
                </motion.button>
              </motion.div>
          ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm kiếm khoản nợ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                    >
                      <option value="amount">Sắp xếp theo số tiền</option>
                      <option value="dueDate">Sắp xếp theo hạn trả</option>
                      <option value="progress">Sắp xếp theo tiến độ</option>
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                    >
                      <option value="all">Tất cả</option>
                      <option value="active">Đang trả</option>
                      <option value="completed">Đã trả xong</option>
                    </select>
                  </div>
                </div>

                <motion.div
                  layout
                  className={`${
                    viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'
                  } max-h-${isExpanded ? 'none' : '64'} overflow-y-auto custom-scrollbar`}
                >
                  <AnimatePresence>
                    {filteredDebts.map((debt) => {
                      const progress = getProgressPercentage(debt)
                      const remainingAmount = getRemainingAmount(debt)
                      return (
                        <motion.div
                  key={debt._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{debt.ghiChu || "Nợ"}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {debt.ngayKetThuc ? `Hạn: ${new Date(debt.ngayKetThuc).toLocaleDateString("vi-VN")}` : "Không có hạn"}
                                </span>
                                {getStatusBadge(debt)}
                              </div>
                    </div>
                    <div className="text-right">
                              <p className="text-lg font-bold text-red-600">{formatCurrency(remainingAmount)}</p>
                              <p className="text-xs text-gray-500">Còn lại</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-1000 ease-out`}
                              />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                              <span>Đã trả: {formatCurrency(debt.soTienDaTra)}</span>
                              <span>Tổng: {formatCurrency(debt.soTien)}</span>
                    </div>
                  </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </motion.div>

                {debts.list.length > 3 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                  </motion.button>
                )}
            </div>
          )}
        </>
      )}
    </div>
    </motion.div>
)
}

// Add these new components at the top of the file, after imports
const AnimatedSlide = React.memo(({ children, isVisible }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 100 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative"
    >
      {children}
    </motion.div>
  )
})

const AnimatedBudgetItem = React.memo(({ budget, progress, remainingAmount, getProgressColor, getProgressText, getStatusBadge }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="font-semibold text-gray-800">{budget.tenDanhMuc}</p>
          {getStatusBadge(budget)}
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`text-sm font-bold px-2 py-1 rounded-full ${getProgressText(progress)}`}
        >
          {progress.toFixed(0)}%
        </motion.div>
      </div>

      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-1000 ease-out`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Đã chi: {formatCurrency(budget.spent)}</span>
          <span>Còn lại: {formatCurrency(remainingAmount)}</span>
          <span>Tổng: {formatCurrency(budget.soTien)}</span>
        </div>
      </div>
    </motion.div>
  )
})

// Sub-component: BudgetCard
const BudgetCard = ({ budgets, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [sortBy, setSortBy] = useState('spent') // 'spent', 'total', 'progress'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'warning', 'danger'
  const [chartType, setChartType] = useState('pie') // 'pie', 'doughnut'
  const [viewMode, setViewMode] = useState('split') // 'split', 'chart', 'list'
  const [timeRange, setTimeRange] = useState('month') // 'week', 'month', 'year'
  const [selectedCategory, setSelectedCategory] = useState('all') // 'all', 'over', 'under'
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const filteredBudgets = useMemo(() => {
    return budgets
      .filter(budget => {
        const matchesSearch = budget.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase())
        const progress = (budget.spent / budget.soTien) * 100
        const matchesStatus = filterStatus === 'all' ? true :
          filterStatus === 'warning' ? (progress >= 70 && progress < 90) :
          progress >= 90
        const matchesCategory = selectedCategory === 'all' ? true :
          selectedCategory === 'over' ? progress >= 100 :
          progress < 100
        return matchesSearch && matchesStatus && matchesCategory
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'spent':
            return b.spent - a.spent
          case 'total':
            return b.soTien - a.soTien
          case 'progress':
            return (b.spent / b.soTien) - (a.spent / a.soTien)
          default:
            return 0
        }
      })
  }, [budgets, searchTerm, sortBy, filterStatus, selectedCategory])

  const chartData = useMemo(() => {
    if (!filteredBudgets.length) return { labels: [], datasets: [] }
    return {
      labels: filteredBudgets.map((b) => b.tenDanhMuc),
      datasets: [
        {
          data: filteredBudgets.map((b) => b.spent),
          backgroundColor: [
            "rgba(16, 185, 129, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(236, 72, 153, 0.8)",
          ],
          borderColor: [
            "rgba(16, 185, 129, 1)",
            "rgba(59, 130, 246, 1)",
            "rgba(239, 68, 68, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(139, 92, 246, 1)",
            "rgba(236, 72, 153, 1)",
          ],
          borderWidth: 2,
        },
      ],
    }
  }, [filteredBudgets])

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'from-red-500 to-red-600'
    if (progress >= 70) return 'from-amber-500 to-amber-600'
    return 'from-emerald-500 to-emerald-600'
  }

  const getProgressText = (progress) => {
    if (progress >= 90) return 'text-red-700 bg-red-100'
    if (progress >= 70) return 'text-amber-700 bg-amber-100'
    return 'text-emerald-700 bg-emerald-100'
  }

  const getRemainingAmount = (budget) => {
    return budget.soTien - budget.spent
  }

  const getProgressPercentage = (budget) => {
    return (budget.spent / budget.soTien) * 100
  }

  const getStatusBadge = (budget) => {
    const progress = getProgressPercentage(budget)
    if (progress >= 100) {
  return (
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full"
        >
          Vượt ngân sách
        </motion.span>
      )
    }
    if (progress >= 90) {
      return (
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full"
        >
          Gần giới hạn
        </motion.span>
      )
    }
    return null
  }

  const getTotalBudget = () => {
    return budgets.reduce((total, budget) => total + budget.soTien, 0)
  }

  const getTotalSpent = () => {
    return budgets.reduce((total, budget) => total + budget.spent, 0)
  }

  const getTotalRemaining = () => {
    return getTotalBudget() - getTotalSpent()
  }

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-gradient-to-br from-white via-orange-50/30 to-orange-100/20 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-100/50 backdrop-blur-sm overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl shadow-lg"
            >
              <CalculatorIcon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
            <h3 className="text-lg font-bold text-gray-800">Ngân sách</h3>
              <p className="text-sm text-gray-500">Theo dõi chi tiêu theo danh mục</p>
          </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-orange-100 px-3 py-1 rounded-full"
            >
            <span className="text-xs font-semibold text-orange-700">{budgets.length} danh mục</span>
            </motion.div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'split' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('chart')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'chart' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ChartPieIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>

        {budgets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            >
              <CalculatorIcon className="h-8 w-8 text-gray-400" />
            </motion.div>
            <p className="text-gray-500 mb-4">Chưa có ngân sách nào</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/budgets/new")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transform transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Thêm ngân sách
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
                >
                  <option value="spent">Sắp xếp theo đã chi</option>
                  <option value="total">Sắp xếp theo tổng ngân sách</option>
                  <option value="progress">Sắp xếp theo tiến độ</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
                >
                  <option value="all">Tất cả</option>
                  <option value="warning">Cảnh báo (70-90%)</option>
                  <option value="danger">Nguy hiểm (&gt;90%)</option>
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
                >
                  <option value="all">Tất cả</option>
                  <option value="over">Vượt ngân sách</option>
                  <option value="under">Trong ngân sách</option>
                </select>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
                >
                  <option value="pie">Biểu đồ tròn</option>
                  <option value="doughnut">Biểu đồ vành khuyên</option>
                </select>
              </div>
            </div>

            {viewMode !== 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0,0,0,0.1)" }}
                  className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50"
                >
                  <p className="text-sm text-gray-500 mb-1">Tổng ngân sách</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(getTotalBudget())}</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0,0,0,0.1)" }}
                  className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50"
                >
                  <p className="text-sm text-gray-500 mb-1">Đã chi tiêu</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(getTotalSpent())}</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0,0,0,0.1)" }}
                  className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50"
                >
                  <p className="text-sm text-gray-500 mb-1">Còn lại</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(getTotalRemaining())}</p>
                </motion.div>
              </div>
            )}

            <div className={`grid gap-6 ${
              viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' :
              viewMode === 'chart' ? 'grid-cols-1' :
              'grid-cols-1'
            }`}>
              {viewMode !== 'list' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-64 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
                >
                  {chartType === 'pie' ? (
              <Pie
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        font: { size: 11 },
                        boxWidth: 12,
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: "circle",
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.9)",
                      cornerRadius: 12,
                      padding: 12,
                      callbacks: {
                        label: (context) => {
                          const label = context.label || ""
                          const value = context.raw
                          const total = context.dataset.data.reduce((a, b) => a + b, 0)
                          const percentage = ((value / total) * 100).toFixed(1)
                          return `${label}: ${formatCurrency(value)} (${percentage}%)`
                        },
                      },
                    },
                  },
                }}
              />
                  ) : (
                    <Doughnut
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              font: { size: 11 },
                              boxWidth: 12,
                              padding: 15,
                              usePointStyle: true,
                              pointStyle: "circle",
                            },
                          },
                          tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.9)",
                            cornerRadius: 12,
                            padding: 12,
                            callbacks: {
                              label: (context) => {
                                const label = context.label || ""
                                const value = context.raw
                                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                                const percentage = ((value / total) * 100).toFixed(1)
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </motion.div>
              )}

              {viewMode !== 'chart' && (
                <motion.div
                  layout
                  className={`${
                    viewMode === 'list' ? 'space-y-3' : 'space-y-3 max-h-64'
                  } overflow-y-auto custom-scrollbar`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isVisible && filteredBudgets.map((budget) => {
                      const progress = getProgressPercentage(budget)
                      const remainingAmount = getRemainingAmount(budget)
                      return (
                        <AnimatedBudgetItem
                          key={budget._id || budget.tenDanhMuc}
                          budget={budget}
                          progress={progress}
                          remainingAmount={remainingAmount}
                          getProgressColor={getProgressColor}
                          getProgressText={getProgressText}
                          getStatusBadge={getStatusBadge}
                        />
                      )
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
                </div>

            {budgets.length > 3 && viewMode !== 'list' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors duration-200"
              >
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Add this new component before the Overview component
const TimeRangeSelector = ({ timeRange, onTimeRangeChange, isRefreshing }) => {
  const ranges = [
    { 
      label: "Tuần", 
      value: "week",
      activeGradient: "from-emerald-500 via-teal-500 to-cyan-500",
      hoverGradient: "from-emerald-600 via-teal-600 to-cyan-600"
    },
    { 
      label: "Tháng", 
      value: "month",
      activeGradient: "from-blue-500 via-indigo-500 to-violet-500",
      hoverGradient: "from-blue-600 via-indigo-600 to-violet-600"
    },
    { 
      label: "Quý", 
      value: "quarter",
      activeGradient: "from-purple-500 via-fuchsia-500 to-pink-500",
      hoverGradient: "from-purple-600 via-fuchsia-600 to-pink-600"
    },
    { 
      label: "Năm", 
      value: "year",
      activeGradient: "from-rose-500 via-orange-500 to-amber-500",
      hoverGradient: "from-rose-600 via-orange-600 to-amber-600"
    }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-gray-100 flex space-x-2">
      {ranges.map(({ label, value, activeGradient, hoverGradient }) => (
        <div
          key={label}
          onClick={() => !isRefreshing && onTimeRangeChange(label)}
          className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${
            timeRange === value
              ? `bg-gradient-to-r ${activeGradient} text-white shadow-lg hover:shadow-xl hover:bg-gradient-to-r ${hoverGradient}`
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          } ${isRefreshing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

// Main Overview Component
const Overview = () => {
  const [data, setData] = useState(null)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [loadingSavingGoals, setLoadingSavingGoals] = useState(true)
  const [loadingInvestments, setLoadingInvestments] = useState(true)
  const [loadingDebts, setLoadingDebts] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("month")
  const [selectedCard, setSelectedCard] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('list')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const slides = [
    {
      component: <AccountCard accounts={data?.accounts || { list: [], totalBalance: 0 }} loading={loadingAccounts} navigate={navigate} />,
      icon: UserCircleIcon,
      color: 'from-emerald-500 to-emerald-600',
      title: 'Tài khoản'
    },
    {
      component: <SavingGoalCard savingGoals={data?.savingGoals || { list: [], totalSavings: 0 }} loading={loadingSavingGoals} navigate={navigate} />,
      icon: CurrencyDollarIcon,
      color: 'from-blue-500 to-blue-600',
      title: 'Mục tiêu tiết kiệm'
    },
    {
      component: <InvestmentCard investments={data?.investments || { list: [], totalInvestment: 0, totalProfit: 0 }} loading={loadingInvestments} navigate={navigate} />,
      icon: ArrowTrendingUpIcon,
      color: 'from-purple-500 to-purple-600',
      title: 'Đầu tư'
    },
    {
      component: <DebtCard debts={data?.debts || { list: [], totalDebt: 0 }} loading={loadingDebts} navigate={navigate} />,
      icon: CreditCardIcon,
      color: 'from-red-500 to-red-600',
      title: 'Nợ/Khoản vay'
    },
    {
      component: <BudgetCard budgets={data?.budgets || []} navigate={navigate} />,
      icon: ChartPieIcon,
      color: 'from-orange-500 to-orange-600',
      title: 'Ngân sách'
    }
  ]

  const handleSlideChange = useCallback((direction) => {
    if (isTransitioning || !isVisible) return
    
    setIsTransitioning(true)
    if (direction === 'next') {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    } else {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }
    
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [isTransitioning, isVisible])

  const userId = localStorage.getItem("userId")?.replace(/[^\w-]/g, "")

  useEffect(() => {
    if (!userId) {
      navigate("/")
      toast.error("Vui lòng đăng nhập để xem tổng quan", {
        position: "top-right",
        autoClose: 3000,
      })
    } else {
      console.log("API URL:", API_URL)
      console.log("User ID:", userId)
    }
  }, [userId, navigate])

  const fetchData = debounce(async () => {
    if (!userId) return

    try {
      setLoadingAccounts(true)
      setLoadingSavingGoals(true)
      setLoadingInvestments(true)
      setLoadingDebts(true)
      setIsRefreshing(true)

      const res = await axios.get(`${API_URL}/overview/${userId}?range=${timeRange.toLowerCase()}`)
      console.log("Overview fetched:", res.data)
      setData(res.data)
      setLastUpdated(new Date())

      if (!res.data.accounts.list.length && !res.data.savingGoals.list.length && !res.data.debts.list.length) {
        setError("Chưa có dữ liệu tài chính. Vui lòng thêm tài khoản, mục tiêu tiết kiệm hoặc giao dịch.")
        toast.info("Chưa có dữ liệu tài chính.")
      } else {
        setError("")
      }
    } catch (err) {
      let errorMessage = "Lỗi khi tải dữ liệu tổng quan."
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
            navigate("/")
            break
          case 404:
            errorMessage = "Không tìm thấy dữ liệu tài chính."
            break
          default:
            errorMessage = err.response.data.message || "Lỗi server."
        }
      }
      console.error("Fetch overview error:", err.response || err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoadingAccounts(false)
      setLoadingSavingGoals(false)
      setLoadingInvestments(false)
      setLoadingDebts(false)
      setIsRefreshing(false)
    }
  }, 300)

  useEffect(() => {
    fetchData()
    return () => fetchData.cancel()
  }, [userId, timeRange])

  const handleRefresh = () => {
    fetchData()
    toast.info("Đang làm mới dữ liệu...", {
      position: "top-right",
      autoClose: 2000,
    })
  }

  const handleTimeRangeChange = (newRange) => {
    const rangeMapping = {
      'Tuần': 'week',
      'Tháng': 'month',
      'Quý': 'quarter',
      'Năm': 'year'
    }
    const newTimeRange = rangeMapping[newRange] || 'month'
    setTimeRange(newTimeRange)
    toast.info(`Đang tải dữ liệu cho ${newRange.toLowerCase()}...`, {
      position: "top-right",
      autoClose: 2000,
    })
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSlideChange('next'),
    onSwipedRight: () => handleSlideChange('prev'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex justify-center items-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/50 text-center max-w-md"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
          >
            <HomeIcon className="h-8 w-8 text-red-500" />
          </motion.div>
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 transform transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Thử lại
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/accounts/new")}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transform transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Thêm tài khoản
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )
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
          className="flex flex-col md:flex-row items-start justify-between mb-8 bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-100/50"
        >
          <div className="flex flex-col md:flex-row items-start justify-between w-full mb-4 md:mb-0">
            <div className="flex-grow min-w-0 mr-4 mb-4 md:mb-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Tổng Quan Tài Chính
              </h1>
              <p className="text-gray-500 mt-2">Quản lý và theo dõi tài chính của bạn một cách thông minh</p>
            </div>
            <div className="hidden md:block flex-shrink-0">
              {/* {showWeatherCard && <WeatherCard />} */}
            </div>
          </div>
          <div className="mt-0 flex items-center space-x-4 flex-shrink-0 self-end md:self-start">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-gray-100">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('slideshow')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === 'slideshow'
                    ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Slideshow
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === 'list'
                    ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                List View
              </motion.button>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-gray-100 flex space-x-2">
              <TimeRangeSelector 
                timeRange={timeRange} 
                onTimeRangeChange={handleTimeRangeChange} 
                isRefreshing={isRefreshing}
              />
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-emerald-600 transition-colors duration-300 ${
                isRefreshing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              >
                <ArrowPathIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        {viewMode === 'slideshow' ? (
          <div className="relative">
            <div {...handlers}>
              <AnimatePresence mode="wait" initial={false}>
                {mounted && (
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                    className="relative"
                  >
                    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-100/50">
                      {slides[currentSlide].component}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-8 flex justify-center space-x-4">
              {slides.map((slide, index) => (
                <motion.button
                  key={slide.title}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!isTransitioning && mounted) {
                      setCurrentSlide(index)
                    }
                  }}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    currentSlide === index 
                      ? "border-emerald-500 scale-110" 
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${slide.color} p-2 flex items-center justify-center`}>
                    {React.createElement(slide.icon, {
                      className: "h-6 w-6 text-white"
                    })}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Hàng 1 */}
            <div className="lg:col-span-4">
              <AccountCard accounts={data?.accounts || { list: [], totalBalance: 0 }} loading={loadingAccounts} navigate={navigate} />
            </div>
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-100/50 h-full"
              >
                <IncomeExpenseChart 
                  transactions={data?.transactions || { totalIncome: 0, totalExpense: 0 }} 
                  timeRange={timeRange}
                />
              </motion.div>
            </div>

            {/* Hàng 2 */}
            <div className="lg:col-span-6">
              <InvestmentCard investments={data?.investments || { list: [], totalInvestment: 0, totalProfit: 0 }} loading={loadingInvestments} navigate={navigate} />
            </div>
            <div className="lg:col-span-6">
              <BudgetCard budgets={data?.budgets || []} navigate={navigate} />
            </div>

            {/* Hàng 3 */}
            <div className="lg:col-span-6">
              <DebtCard debts={data?.debts || { list: [], totalDebt: 0 }} loading={loadingDebts} navigate={navigate} />
            </div>
            <div className="lg:col-span-6">
              <SavingGoalCard savingGoals={data?.savingGoals || { list: [], totalSavings: 0 }} loading={loadingSavingGoals} navigate={navigate} />
            </div>
          </div>
        )}

        {/* Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-lg rounded-full shadow-lg border border-gray-100/50 p-2"
        >
          <div className="flex items-center space-x-2">
            {[
              { icon: PlusIcon, label: "Thêm giao dịch", path: "/dashboard" },
              { icon: UserCircleIcon, label: "Quản lý tài khoản", path: "/accounts" },
              { icon: ArrowTrendingUpIcon, label: "Đầu tư", path: "/investments" },
              { icon: ChartPieIcon, label: "Báo cáo", path: "/reports" },
              { icon: CreditCardIcon, label: "Ngân sách", path: "/budgets" }
            ].map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300"
              >
                <action.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>  
  )
}

export default Overview
