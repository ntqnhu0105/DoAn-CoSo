"use client"

import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import {
  HomeIcon,
  BanknotesIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ChartPieIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline"
import { debounce } from "lodash"

// Đăng ký ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

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
const AccountCard = ({ accounts, loading, navigate }) => (
  <div className="group relative bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-emerald-100/50 backdrop-blur-sm overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
            <BanknotesIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Tài khoản</h3>
        </div>
        <div className="bg-emerald-100 px-3 py-1 rounded-full">
          <span className="text-xs font-semibold text-emerald-700">{accounts.list.length} tài khoản</span>
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
            <p className="text-sm text-gray-500 mb-2">Tổng số dư</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              {formatCurrency(accounts.totalBalance)}
            </p>
          </div>

          {accounts.list.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BanknotesIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Chưa có tài khoản nào</p>
              <button
                onClick={() => navigate("/accounts/new")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm tài khoản
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {accounts.list.map((account) => (
                <div
                  key={account._id}
                  className="group/item p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800 group-hover/item:text-emerald-700 transition-colors">
                        {account.tenTaiKhoan}
                      </p>
                      <p className="text-sm text-gray-500">{account.loaiTaiKhoan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(account.soDu)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
)

// Sub-component: SavingGoalCard
const SavingGoalCard = ({ savingGoals, loading, navigate }) => (
  <div className="group relative bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100/50 backdrop-blur-sm overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
            <CurrencyDollarIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Mục tiêu tiết kiệm</h3>
        </div>
        <div className="bg-blue-100 px-3 py-1 rounded-full">
          <span className="text-xs font-semibold text-blue-700">{savingGoals.list.length} mục tiêu</span>
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
            <p className="text-sm text-gray-500 mb-2">Tổng tiết kiệm</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {formatCurrency(savingGoals.totalSavings)}
            </p>
          </div>

          {savingGoals.list.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Chưa có mục tiêu tiết kiệm nào</p>
              <button
                onClick={() => navigate("/saving-goals/new")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm mục tiêu
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
              {savingGoals.list.map((sg) => (
                <div
                  key={sg._id}
                  className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{sg.tenMucTieu}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Hạn: {new Date(sg.hanChot).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        {((sg.soTienHienTai / sg.soTienMucTieu) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{ width: `${Math.min((sg.soTienHienTai / sg.soTienMucTieu) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatCurrency(sg.soTienHienTai)}</span>
                      <span>{formatCurrency(sg.soTienMucTieu)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
)

// Sub-component: InvestmentCard
const InvestmentCard = ({ investments, loading, navigate }) => (
  <div className="group relative bg-gradient-to-br from-white via-purple-50/30 to-purple-100/20 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-100/50 backdrop-blur-sm overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Đầu tư</h3>
        </div>
        <div className="bg-purple-100 px-3 py-1 rounded-full">
          <span className="text-xs font-semibold text-purple-700">{investments.list.length} khoản</span>
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
            <p className="text-sm text-gray-500 mb-2">Tổng đầu tư</p>
            <div className="flex items-end space-x-3">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                {formatCurrency(investments.totalInvestment)}
              </p>
              <div className="flex items-center space-x-1 pb-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-600">+{formatCurrency(investments.totalProfit)}</p>
              </div>
            </div>
          </div>

          {investments.list.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChartBarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Chưa có khoản đầu tư nào</p>
              <button
                onClick={() => navigate("/investments/new")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm đầu tư
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {investments.list.map((inv) => (
                <div
                  key={inv._id}
                  className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{inv.loai}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">Lợi nhuận:</span>
                        <span className="text-sm font-semibold text-emerald-600">{formatCurrency(inv.loiNhuan)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">{formatCurrency(inv.giaTri)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
)

// Sub-component: IncomeExpenseChart
const IncomeExpenseChart = ({ transactions }) => {
  const chartData = useMemo(() => {
    if (!transactions) return { labels: [], datasets: [] }
    return {
      labels: ["Thu nhập", "Chi tiêu"],
      datasets: [
        {
          label: "Số tiền (VNĐ)",
          data: [transactions.totalIncome, transactions.totalExpense],
          backgroundColor: ["rgba(16, 185, 129, 0.8)", "rgba(239, 68, 68, 0.8)"],
          borderColor: ["rgba(16, 185, 129, 1)", "rgba(239, 68, 68, 1)"],
          borderWidth: 2,
          borderRadius: 12,
          borderSkipped: false,
        },
      ],
    }
  }, [transactions])

  const difference = transactions.totalIncome - transactions.totalExpense

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-100/20 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
            </h3>
            <p className="text-sm text-gray-500">Phân tích thu chi</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-2xl ${difference >= 0 ? "bg-emerald-100" : "bg-red-100"}`}>
          <span className={`text-sm font-semibold ${difference >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {difference >= 0 ? "Thặng dư" : "Thâm hụt"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="group p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ArrowUpCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700 mb-1">Thu nhập</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(transactions.totalIncome)}</p>
              </div>
            </div>
          </div>

          <div className="group p-6 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl border border-red-200/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ArrowDownCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Chi tiêu</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(transactions.totalExpense)}</p>
              </div>
            </div>
          </div>

          <div
            className={`group p-6 bg-gradient-to-br ${difference >= 0 ? "from-blue-50 to-blue-100/50 border-blue-200/50" : "from-orange-50 to-orange-100/50 border-orange-200/50"} rounded-2xl border hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`bg-gradient-to-br ${difference >= 0 ? "from-blue-500 to-blue-600" : "from-orange-500 to-orange-600"} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {difference >= 0 ? (
                  <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                ) : (
                  <ArrowTrendingDownIcon className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${difference >= 0 ? "text-blue-700" : "text-orange-700"} mb-1`}>
                  Chênh lệch
                </p>
                <p className={`text-2xl font-bold ${difference >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                  {formatCurrency(Math.abs(difference))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 h-80 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                  cornerRadius: 12,
                  padding: 16,
                  titleFont: { size: 14, weight: "bold" },
                  bodyFont: { size: 13 },
                  callbacks: {
                    label: (context) => formatCurrency(context.raw),
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    display: true,
                    color: "rgba(0, 0, 0, 0.05)",
                    drawBorder: false,
                  },
                  ticks: {
                    font: { size: 12 },
                    color: "#6B7280",
                  },
                },
                x: {
                  grid: { display: false },
                  ticks: {
                    font: { size: 12, weight: "bold" },
                    color: "#374151",
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Sub-component: DebtCard
const DebtCard = ({ debts, loading, navigate }) => (
  <div className="group relative bg-gradient-to-br from-white via-red-50/30 to-red-100/20 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-red-100/50 backdrop-blur-sm overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-2xl shadow-lg">
            <CreditCardIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Nợ/Khoản vay</h3>
        </div>
        <div className="bg-red-100 px-3 py-1 rounded-full">
          <span className="text-xs font-semibold text-red-700">{debts.list.length} khoản</span>
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
            <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {formatCurrency(debts.totalDebt)}
            </p>
          </div>

          {debts.list.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCardIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Chưa có khoản nợ nào</p>
              <button
                onClick={() => navigate("/debts/new")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm khoản nợ
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
              {debts.list.map((debt) => (
                <div
                  key={debt._id}
                  className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{debt.ghiChu || "Nợ"}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Hạn:{" "}
                        {debt.ngayKetThuc ? new Date(debt.ngayKetThuc).toLocaleDateString("vi-VN") : "Không xác định"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{formatCurrency(debt.soTien - debt.soTienDaTra)}</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min((debt.soTienDaTra / debt.soTien) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Đã trả: {formatCurrency(debt.soTienDaTra)}</span>
                      <span>Tổng: {formatCurrency(debt.soTien)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
)

// Sub-component: BudgetCard
const BudgetCard = ({ budgets, navigate }) => {
  const chartData = useMemo(() => {
    if (!budgets || !budgets.length) return { labels: [], datasets: [] }
    return {
      labels: budgets.map((b) => b.tenDanhMuc),
      datasets: [
        {
          data: budgets.map((b) => b.spent),
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
  }, [budgets])

  return (
    <div className="group relative bg-gradient-to-br from-white via-orange-50/30 to-orange-100/20 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-100/50 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl shadow-lg">
              <ChartPieIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Ngân sách</h3>
          </div>
          <div className="bg-orange-100 px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-orange-700">{budgets.length} danh mục</span>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ChartPieIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Chưa có ngân sách nào</p>
            <button
              onClick={() => navigate("/budgets/new")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Thêm ngân sách
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
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
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {budgets.map((budget, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-gray-800">{budget.tenDanhMuc}</p>
                    <p
                      className={`text-sm font-bold px-2 py-1 rounded-full ${
                        budget.progress > 90
                          ? "bg-red-100 text-red-700"
                          : budget.progress > 70
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {((budget.spent / budget.soTien) * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                          budget.progress > 90
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : budget.progress > 70
                              ? "bg-gradient-to-r from-amber-500 to-amber-600"
                              : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                        }`}
                        style={{ width: `${Math.min(budget.progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatCurrency(budget.spent)}</span>
                      <span>{formatCurrency(budget.soTien)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Overview Component
const Overview = () => {
  const [data, setData] = useState(null)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [loadingSavingGoals, setLoadingSavingGoals] = useState(true)
  const [loadingInvestments, setLoadingInvestments] = useState(true)
  const [loadingDebts, setLoadingDebts] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("month")
  const navigate = useNavigate()

  // Sanitize userId
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

  // Debounced fetch data
  const fetchData = debounce(async () => {
    if (!userId) return

    try {
      setLoadingAccounts(true)
      setLoadingSavingGoals(true)
      setLoadingInvestments(true)
      setLoadingDebts(true)

      const res = await axios.get(`${API_URL}/overview/${userId}?range=${timeRange}`)
      console.log("Overview fetched:", res.data)
      setData(res.data)

      if (!res.data.accounts.list.length && !res.data.savingGoals.list.length && !res.data.debts.list.length) {
        setError("Chưa có dữ liệu tài chính. Vui lòng thêm tài khoản, mục tiêu tiết kiệm hoặc giao dịch.")
        toast.info("Chưa có dữ liệu tài chính.")
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
    }
  }, 300)

  useEffect(() => {
    fetchData()
    return () => fetchData.cancel()
  }, [userId, timeRange])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex justify-center items-center p-4">
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/50 text-center max-w-md">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <HomeIcon className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-8 px-4 sm:px-6 lg:px-8">
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
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-3xl shadow-xl">
              <HomeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Tổng quan Tài chính
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
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-3 border-0 rounded-2xl bg-white/80 backdrop-blur-sm text-gray-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group bg-gradient-to-br from-white to-emerald-50/50 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-emerald-100/50 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-emerald-700 mb-2">Tổng tài sản</p>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  {data ? formatCurrency(data.accounts.totalBalance) : "0 VNĐ"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BanknotesIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100/50 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-2">Tổng thu nhập</p>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  {data ? formatCurrency(data.transactions.totalIncome) : "0 VNĐ"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ArrowUpCircleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-white to-red-50/50 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-red-100/50 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-red-700 mb-2">Tổng chi tiêu</p>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  {data ? formatCurrency(data.transactions.totalExpense) : "0 VNĐ"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ArrowDownCircleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-white to-purple-50/50 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-100/50 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-purple-700 mb-2">Tổng đầu tư</p>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                  {data ? formatCurrency(data.investments.totalInvestment) : "0 VNĐ"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tài sản Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Tài sản
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <AccountCard
              accounts={data?.accounts || { totalBalance: 0, list: [] }}
              loading={loadingAccounts}
              navigate={navigate}
            />
            <SavingGoalCard
              savingGoals={data?.savingGoals || { totalSavings: 0, list: [] }}
              loading={loadingSavingGoals}
              navigate={navigate}
            />
            <InvestmentCard
              investments={data?.investments || { totalInvestment: 0, totalProfit: 0, list: [] }}
              loading={loadingInvestments}
              navigate={navigate}
            />
          </div>
        </div>

        {/* Thu nhập & Chi tiêu Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Thu nhập & Chi tiêu
            </h2>
          </div>
          <IncomeExpenseChart transactions={data?.transactions || { totalIncome: 0, totalExpense: 0 }} />
        </div>

        {/* Nợ và Ngân sách Section */}
        <div className="mb-10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-2xl shadow-lg">
              <ChartPieIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Nợ và Ngân sách
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DebtCard debts={data?.debts || { totalDebt: 0, list: [] }} loading={loadingDebts} navigate={navigate} />
            <BudgetCard budgets={data?.budgets || []} navigate={navigate} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview
