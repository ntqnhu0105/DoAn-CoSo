"use client"

import { useState, useEffect, useContext } from "react"
import io from "socket.io-client"
import { AuthContext } from "../context/AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  BanknotesIcon,
  PlusIcon,
  TagIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from "chart.js"

const socket = io("http://localhost:5000", { autoConnect: false })

const Chatbot = () => {
  const { user } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      text: 'Xin chào! Tôi là trợ lý quản lý chi tiêu thông minh. Nhập "giúp đỡ" để xem các lệnh có thể sử dụng.',
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!user || ["/", "/register"].includes(location.pathname)) {
      socket.disconnect()
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { text: "Không tìm thấy token. Vui lòng đăng nhập lại.", isBot: true, timestamp: new Date() },
      ])
      navigate("/")
      return
    }

    socket.auth = { token }
    socket.connect()
    socket.emit("joinRoom", user._id)

    socket.on("chatResponse", (data) => {
      console.log("Nhận chatResponse:", data)
      setIsTyping(false)
      setMessages((prev) => [...prev, { text: data.message, isBot: true, timestamp: new Date() }])
    })

    socket.on("notification", (data) => {
      console.log("Nhận notification:", data)
      setMessages((prev) => [...prev, { text: `🔔 Thông báo: ${data.noiDung}`, isBot: true, timestamp: new Date() }])
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connect error:", error.message)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        { text: "Lỗi kết nối server. Vui lòng thử lại.", isBot: true, timestamp: new Date() },
      ])
      if (error.message === "Token không hợp lệ") {
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        navigate("/")
      }
    })

    const fetchNotifications = async () => {
      try {
        console.log("Fetching notifications for user:", user._id, "token:", token.slice(0, 10) + "...")
        const res = await axios.get(`http://localhost:5000/api/notifications/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Notifications response:", res.data)
        res.data.forEach((notif) => {
          if (!notif.daDoc) {
            setMessages((prev) => [
              ...prev,
              { text: `🔔 Thông báo: ${notif.noiDung}`, isBot: true, timestamp: new Date() },
            ])
          }
        })
      } catch (error) {
        console.error("Lỗi lấy thông báo:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
        setMessages((prev) => [
          ...prev,
          { text: "Lỗi lấy thông báo. Vui lòng thử lại.", isBot: true, timestamp: new Date() },
        ])
        if (error.response?.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          navigate("/")
        }
      }
    }
    fetchNotifications()

    return () => {
      socket.off("chatResponse")
      socket.off("notification")
      socket.off("connect_error")
      socket.disconnect()
    }
  }, [user, location.pathname, navigate])

  const sendMessage = () => {
    if (!input.trim() || !user) return

    const token = localStorage.getItem("token")
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { text: "Không tìm thấy token. Vui lòng đăng nhập lại.", isBot: true, timestamp: new Date() },
      ])
      navigate("/")
      return
    }

    const message = input.trim()
    setMessages((prev) => [...prev, { text: message, isBot: false, timestamp: new Date() }])
    setIsTyping(true)
    console.log("Gửi chatMessage:", { userId: user._id, token: token.slice(0, 10) + "...", message })
    socket.emit("chatMessage", { userId: user._id, token, message })
    setInput("")
  }

  const handleSuggestion = (command) => {
    setInput(command)
    setTimeout(sendMessage, 100)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!user || ["/", "/register"].includes(location.pathname)) {
    return null
  }

  const suggestions = [
    {
      text: "Kiểm tra số dư",
      command: "kiểm tra số dư",
      icon: BanknotesIcon,
      color: "emerald",
    },
    {
      text: "Thêm chi tiêu",
      command: "thêm giao dịch chi 100000 ăn uống tiền mặt",
      icon: PlusIcon,
      color: "blue",
    },
    {
      text: "Thêm danh mục",
      command: "thêm danh mục ăn uống chi",
      icon: TagIcon,
      color: "purple",
    },
    {
      text: "Giúp đỡ",
      command: "giúp đỡ",
      icon: QuestionMarkCircleIcon,
      color: "orange",
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`group relative bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <ChatBubbleLeftRightIcon className="h-6 w-6" />}
        </motion.div>

        {/* Notification Badge */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
        >
          <SparklesIcon className="h-3 w-3" />
        </motion.div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-96 h-[32rem] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 p-6 rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="bg-white/20 p-2 rounded-full"
                >
                  <SparklesIcon className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white">Trợ Lý Chi Tiêu</h3>
                  <p className="text-white/80 text-sm">Luôn sẵn sàng hỗ trợ bạn</p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl shadow-sm backdrop-blur-sm ${
                        msg.isBot
                          ? "bg-white/80 border border-gray-100/50 text-gray-800 rounded-bl-md"
                          : "bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-br-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-xs mt-2 ${msg.isBot ? "text-gray-500" : "text-white/70"}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-100/50 p-4 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.2,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Suggestions */}
            <div className="p-4 border-t border-gray-100/50 bg-white/80 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {suggestions.map((suggestion, index) => {
                  const IconComponent = suggestion.icon
                  const colorClasses = {
                    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                    blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
                    purple: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
                    orange: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestion(suggestion.command)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 p-3 rounded-xl border transition-all duration-200 shadow-sm backdrop-blur-sm ${
                        colorClasses[suggestion.color]
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-xs font-medium">{suggestion.text}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-gray-100/50 rounded-b-3xl">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập lệnh hoặc câu hỏi..."
                    className="w-full p-4 pr-12 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <SparklesIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-4 rounded-2xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Chatbot
