"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { motion } from "framer-motion"

const ProtectedRoute = ({ children }) => {
  const { user, isInitialCheckDone } = useContext(AuthContext)

  if (!isInitialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col items-center"
        >
          <div className="w-16 h-16 border-t-4 border-b-4 border-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Đang kiểm tra đăng nhập...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    console.warn("Không có người dùng, chuyển hướng đến trang đăng nhập")
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
