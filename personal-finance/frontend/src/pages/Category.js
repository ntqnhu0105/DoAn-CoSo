"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline"
import { toast } from "react-toastify"

const Category = () => {
  const [categories, setCategories] = useState([])
  const [tenDanhMuc, setTenDanhMuc] = useState("")
  const [loai, setLoai] = useState("Chi tiêu")
  const [moTa, setMoTa] = useState("")
  const [error, setError] = useState("")
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const navigate = useNavigate()

  // Lấy token từ localStorage
  const token = localStorage.getItem("token")

  // Kiểm tra token
  useEffect(() => {
    if (!token) {
      setError("Vui lòng đăng nhập để quản lý danh mục")
      toast.error("Vui lòng đăng nhập để quản lý danh mục", {
        icon: "🔒",
      })
      navigate("/")
    }
  }, [token, navigate])

  // Lấy danh sách danh mục
  useEffect(() => {
    if (!token) return

    const fetchCategories = async () => {
      setLoading(true)
      try {
        console.log("Fetching categories with token:", token.slice(0, 10) + "...")
        const headers = { Authorization: `Bearer ${token}` }
        console.log("Request headers:", headers)
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/categories`, { headers })
        console.log("Categories response:", res.data)
        setCategories(res.data)
        setError("")
        toast.success("Tải danh sách danh mục thành công", {
          icon: "🏷️",
          autoClose: 2000,
          hideProgressBar: true,
        })
      } catch (err) {
        console.error("Lỗi tải danh mục:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        })
        setError(err.response?.data?.message || "Lỗi khi tải danh mục")
        toast.error(err.response?.data?.message || "Lỗi khi tải danh mục", {
          icon: "❌",
        })
        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          navigate("/")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [token, navigate])

  // Thêm hoặc cập nhật danh mục
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      setError("Vui lòng đăng nhập để thực hiện thao tác này")
      toast.error("Vui lòng đăng nhập để thực hiện thao tác này")
      return
    }

    if (!tenDanhMuc.trim()) {
      toast.warning("Vui lòng nhập tên danh mục", {
        icon: "⚠️",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      console.log("Submitting category:", { tenDanhMuc, loai, moTa, editId })
      if (editId) {
        // Cập nhật danh mục
        const res = await axios.put(
          `${process.env.REACT_APP_API_URL}/categories/${editId}`,
          { tenDanhMuc, loai, moTa },
          { headers },
        )
        console.log("Update category response:", res.data)
        setCategories(categories.map((cat) => (cat._id === editId ? res.data.category : cat)))
        toast.success("Cập nhật danh mục thành công!", {
          icon: "✅",
        })
        setEditId(null)
      } else {
        // Thêm danh mục mới
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/categories`,
          { tenDanhMuc, loai, moTa },
          { headers },
        )
        console.log("Create category response:", res.data)
        setCategories([...categories, res.data.category])
        toast.success("Thêm danh mục thành công!", {
          icon: "✅",
        })
      }
      setTenDanhMuc("")
      setLoai("Chi tiêu")
      setMoTa("")
      setError("")
    } catch (err) {
      console.error("Lỗi lưu danh mục:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      })
      setError(err.response?.data?.message || "Lỗi khi lưu danh mục")
      toast.error(err.response?.data?.message || "Lỗi khi lưu danh mục", {
        icon: "❌",
      })
      if (err.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        navigate("/")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Xóa danh mục
  const handleDelete = async (id) => {
    if (!token) {
      setError("Vui lòng đăng nhập để thực hiện thao tác này")
      toast.error("Vui lòng đăng nhập để thực hiện thao tác này")
      return
    }

    try {
      const headers = { Authorization: `Bearer ${token}` }
      console.log("Deleting category:", id)
      await axios.delete(`${process.env.REACT_APP_API_URL}/categories/${id}`, { headers })
      console.log("Category deleted:", id)
      setCategories(categories.filter((cat) => cat._id !== id))
      setError("")
      toast.success("Xóa danh mục thành công!", {
        icon: "🗑️",
      })
      setConfirmDelete(null)
    } catch (err) {
      console.error("Lỗi xóa danh mục:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      })
      setError(err.response?.data?.message || "Lỗi khi xóa danh mục")
      toast.error(err.response?.data?.message || "Lỗi khi xóa danh mục", {
        icon: "❌",
      })
      if (err.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        navigate("/")
      }
    }
  }

  // Chọn danh mục để sửa
  const handleEdit = (category) => {
    setEditId(category._id)
    setTenDanhMuc(category.tenDanhMuc)
    setLoai(category.loai)
    setMoTa(category.moTa || "")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <TagIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Danh Mục
          </h2>
          <p className="text-gray-600 font-medium">Phân loại và quản lý các danh mục chi tiêu</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50/80 backdrop-blur-sm p-4 rounded-2xl shadow-md mb-6 border border-red-100/50 flex items-center space-x-3"
          >
            <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Form thêm/sửa danh mục */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8 border border-white/20"
        >
          <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
            {editId ? (
              <>
                <PencilIcon className="h-5 w-5 mr-2 text-blue-500" />
                Sửa danh mục
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5 mr-2 text-emerald-500" />
                Thêm danh mục mới
              </>
            )}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                <input
                  type="text"
                  value={tenDanhMuc}
                  onChange={(e) => setTenDanhMuc(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Loại</label>
                <select
                  value={loai}
                  onChange={(e) => setLoai(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                >
                  <option value="Chi tiêu">Chi tiêu</option>
                  <option value="Thu nhập">Thu nhập</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                  placeholder="Nhập mô tả (không bắt buộc)"
                  rows="3"
                />
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 bg-gradient-to-r ${
                    editId ? "from-blue-500 to-indigo-600" : "from-emerald-500 to-blue-600"
                  } text-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : editId ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Cập nhật danh mục</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" />
                      <span>Thêm danh mục</span>
                    </>
                  )}
                </motion.button>

                {editId && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setEditId(null)
                      setTenDanhMuc("")
                      setLoai("Chi tiêu")
                      setMoTa("")
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Hủy</span>
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </motion.div>

        {/* Danh sách danh mục */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
        >
          <h3 className="text-xl font-semibold p-6 border-b border-gray-100 text-gray-800 flex items-center">
            <TagIcon className="h-5 w-5 mr-2 text-emerald-500" />
            Danh sách danh mục
          </h3>

          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 rounded-2xl p-6 inline-block"
              >
                <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Chưa có danh mục nào</p>
                <p className="text-gray-400 text-sm mt-1">Thêm danh mục để phân loại giao dịch của bạn</p>
              </motion.div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="p-4 text-left text-gray-600 font-semibold">Tên danh mục</th>
                    <th className="p-4 text-left text-gray-600 font-semibold">Loại</th>
                    <th className="p-4 text-left text-gray-600 font-semibold">Mô tả</th>
                    <th className="p-4 text-right text-gray-600 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {categories.map((category) => (
                      <motion.tr
                        key={category._id}
                        variants={itemVariants}
                        className="border-t border-gray-100 hover:bg-gray-50/80 transition-colors duration-200"
                        layout
                      >
                        <td className="p-4 font-medium text-gray-800">{category.tenDanhMuc}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              category.loai === "Chi tiêu"
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {category.loai === "Chi tiêu" ? (
                              <ArrowDownCircleIcon className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowUpCircleIcon className="h-3 w-3 mr-1" />
                            )}
                            {category.loai}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{category.moTa || "-"}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(category)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                              title="Sửa danh mục"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setConfirmDelete(category._id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                              title="Xóa danh mục"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium"
                >
                  Xóa danh mục
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Hủy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Category
