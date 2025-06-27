import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  PlusIcon, 
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowTrendingUpIcon,
  ShareIcon,
  BellIcon,
  ChartPieIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loai, setLoai] = useState('');
  const [giaTri, setGiaTri] = useState('');
  const [loiNhuan, setLoiNhuan] = useState('');
  const [ngay, setNgay] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [trangThai, setTrangThai] = useState('Hoạt động');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'ngay', direction: 'desc' });
  const [showStats, setShowStats] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [draggedInvestment, setDraggedInvestment] = useState(null);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Kiểm tra userId
  useEffect(() => {
    if (!userId) {
      navigate('/');
      toast.error('Vui lòng đăng nhập để xem đầu tư', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  }, [userId, navigate]);

  // Lấy danh sách đầu tư
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/investments/${userId}`);
        const newInvestments = res.data;
        setInvestments(newInvestments);
        // Thông báo đầu tư vừa hoàn thành/đã bán (trong 24 giờ qua)
        const recentlyUpdated = newInvestments.filter(
          (inv) => inv.trangThai !== 'Hoạt động' && new Date(inv.ngay) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        recentlyUpdated.forEach((inv) => {
          toast.info(`Đầu tư "${inv.loai}" đã ${inv.trangThai === 'Đã bán' ? 'bán' : 'chờ xử lý'} vào ${new Date(inv.ngay).toLocaleDateString()}`, {
            toastId: inv._id,
            style: {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
            },
          });
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Lỗi khi tải dữ liệu đầu tư';
        setError(errorMessage);
        toast.error(errorMessage, {
          style: {
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
          },
        });
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  // Thêm hoặc cập nhật đầu tư
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loai || !giaTri) {
      setError('Vui lòng nhập loại và giá trị đầu tư');
      toast.error('Vui lòng nhập loại và giá trị đầu tư', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    if (loai.length > 50) {
      setError('Loại đầu tư không được vượt quá 50 ký tự');
      toast.error('Loại đầu tư không được vượt quá 50 ký tự', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    if (ghiChu && ghiChu.length > 200) {
      setError('Ghi chú không được vượt quá 200 ký tự');
      toast.error('Ghi chú không được vượt quá 200 ký tự', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    const giaTriNum = parseFloat(giaTri);
    const loiNhuanNum = loiNhuan ? parseFloat(loiNhuan) : 0;
    if (isNaN(giaTriNum) || giaTriNum <= 0) {
      setError('Giá trị đầu tư phải là số dương hợp lệ');
      toast.error('Giá trị đầu tư phải là số dương hợp lệ', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }

    try {
      const payload = {
        userId,
        loai,
        giaTri: giaTriNum,
        loiNhuan: loiNhuanNum,
        ngay: ngay || new Date().toISOString().split('T')[0],
        ghiChu,
        trangThai,
      };
      let res;
      if (editId) {
        res = await axios.put(`${process.env.REACT_APP_API_URL}/investments/${editId}`, payload);
        setInvestments(investments.map((inv) => (inv._id === editId ? res.data.investment : inv)));
        toast.success('Cập nhật đầu tư thành công!', {
          icon: '🎉',
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
          },
        });
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/investments`, payload);
        setInvestments([...investments, res.data.investment]);
        toast.success('Thêm đầu tư thành công!', {
          icon: '🎉',
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
          },
        });
      }
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu đầu tư';
      setError(errorMessage);
      toast.error(errorMessage, {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  };

  // Xóa đầu tư
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đầu tư này?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/investments/${id}?userId=${userId}`);
      setInvestments(investments.filter((inv) => inv._id !== id));
      toast.success('Xóa đầu tư thành công!', {
        icon: '🎉',
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
        },
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa đầu tư';
      setError(errorMessage);
      toast.error(errorMessage, {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  };

  // Mở modal thêm đầu tư
  const openAddModal = () => {
    setEditId(null);
    setLoai('');
    setGiaTri('');
    setLoiNhuan('');
    setNgay('');
    setGhiChu('');
    setTrangThai('Hoạt động');
    setError('');
    setShowModal(true);
  };

  // Mở modal sửa đầu tư
  const openEditModal = (investment) => {
    setEditId(investment._id);
    setLoai(investment.loai);
    setGiaTri(investment.giaTri.toString());
    setLoiNhuan(investment.loiNhuan ? investment.loiNhuan.toString() : '');
    setNgay(investment.ngay ? new Date(investment.ngay).toISOString().split('T')[0] : '');
    setGhiChu(investment.ghiChu || '');
    setTrangThai(investment.trangThai);
    setError('');
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setLoai('');
    setGiaTri('');
    setLoiNhuan('');
    setNgay('');
    setGhiChu('');
    setTrangThai('Hoạt động');
    setError('');
  };

  // Hàm sắp xếp
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Hàm tìm kiếm
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Hàm lọc và sắp xếp đầu tư
  const filteredAndSortedInvestments = useMemo(() => {
    let result = investments;

    // Lọc theo trạng thái
    if (filterStatus !== 'Tất cả') {
      result = result.filter(inv => inv.trangThai === filterStatus);
    }

    // Tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(inv => 
        inv.loai.toLowerCase().includes(query) ||
        (inv.ghiChu && inv.ghiChu.toLowerCase().includes(query))
      );
    }

    // Sắp xếp
    result = [...result].sort((a, b) => {
      if (sortConfig.key === 'ngay') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.ngay) - new Date(b.ngay)
          : new Date(b.ngay) - new Date(a.ngay);
      }
      if (sortConfig.key === 'giaTri') {
        return sortConfig.direction === 'asc'
          ? a.giaTri - b.giaTri
          : b.giaTri - a.giaTri;
      }
      if (sortConfig.key === 'loiNhuan') {
        return sortConfig.direction === 'asc'
          ? (a.loiNhuan || 0) - (b.loiNhuan || 0)
          : (b.loiNhuan || 0) - (a.loiNhuan || 0);
      }
      return 0;
    });

    return result;
  }, [investments, filterStatus, searchQuery, sortConfig]);

  // Hàm xử lý kéo thả
  const handleDragStart = (investment) => {
    setDraggedInvestment(investment);
  };

  const handleDragOver = (e, investment) => {
    e.preventDefault();
    if (draggedInvestment && draggedInvestment._id !== investment._id) {
      const items = Array.from(filteredAndSortedInvestments);
      const draggedIndex = items.findIndex(item => item._id === draggedInvestment._id);
      const dropIndex = items.findIndex(item => item._id === investment._id);
      
      const newItems = Array.from(items);
      newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedInvestment);
      
      // Cập nhật thứ tự ưu tiên trong database
      const updatePriority = async () => {
        try {
          await axios.put(`${process.env.REACT_APP_API_URL}/investments/priority`, {
            userId,
            investments: newItems.map((inv, index) => ({
              id: inv._id,
              priority: index
            }))
          });
          setInvestments(newItems);
          toast.success('Đã cập nhật thứ tự ưu tiên', {
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
            },
          });
        } catch (err) {
          toast.error('Lỗi khi cập nhật thứ tự ưu tiên', {
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
            },
          });
        }
      };
      updatePriority();
    }
  };

  const handleDragEnd = () => {
    setDraggedInvestment(null);
  };

  // Hàm chia sẻ đầu tư
  const handleShare = async (investment) => {
    try {
      const shareData = {
        title: investment.loai,
        text: `Đầu tư: ${investment.loai}\nGiá trị: ${investment.giaTri.toLocaleString()} VNĐ\nLợi nhuận: ${(investment.loiNhuan || 0).toLocaleString()} VNĐ\nNgày: ${new Date(investment.ngay).toLocaleDateString()}`,
        url: window.location.href
      };
      await navigator.share(shareData);
    } catch (err) {
      toast.error('Trình duyệt không hỗ trợ tính năng chia sẻ', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  };

  // Hàm thêm nhắc nhở
  const handleAddReminder = async () => {
    if (!reminderDate || !selectedInvestment) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/reminders`, {
        userId,
        investmentId: selectedInvestment._id,
        date: reminderDate,
        note: reminderNote
      });
      toast.success('Đã thêm nhắc nhở', {
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
        },
      });
      setShowReminderModal(false);
      setReminderDate('');
      setReminderNote('');
      setSelectedInvestment(null);
    } catch (err) {
      toast.error('Lỗi khi thêm nhắc nhở', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  };

  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: ['Hoạt động', 'Đã bán', 'Đang chờ'],
    datasets: [
      {
        data: [
          investments.filter(g => g.trangThai === 'Hoạt động').length,
          investments.filter(g => g.trangThai === 'Đã bán').length,
          investments.filter(g => g.trangThai === 'Đang chờ').length
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B']
      }
    ]
  };

  const profitData = {
    labels: investments.map(g => g.loai),
    datasets: [
      {
        label: 'Lợi nhuận',
        data: investments.map(g => g.loiNhuan || 0),
        borderColor: '#3B82F6',
        tension: 0.1
      }
    ]
  };

  // Tính tổng giá trị đầu tư
  const totalInvestmentValue = filteredAndSortedInvestments.reduce((sum, inv) => sum + (inv.giaTri || 0), 0);

  // Tính tổng lợi nhuận
  const totalProfit = filteredAndSortedInvestments.reduce((sum, inv) => sum + (inv.loiNhuan || 0), 0);

  // Tính tỷ suất lợi nhuận trung bình
  const averageROI = totalInvestmentValue ? (totalProfit / totalInvestmentValue) * 100 : 0;

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <ArrowTrendingUpIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Đầu Tư
          </h2>
          <p className="text-gray-600 font-medium">Theo dõi và quản lý các khoản đầu tư của bạn</p>
        </motion.div>

        {/* Tổng quan */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng giá trị đầu tư</h3>
              <p className="text-2xl font-bold text-blue-600">
                {totalInvestmentValue.toLocaleString()} VNĐ
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng lợi nhuận</h3>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit.toLocaleString()} VNĐ
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tỷ suất lợi nhuận</h3>
              <p className={`text-2xl font-bold ${averageROI >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {averageROI.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bộ lọc và tìm kiếm */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium whitespace-nowrap">Lọc:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="Tất cả">Tất cả</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Đã bán">Đã bán</option>
                <option value="Đang chờ">Đang chờ</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium whitespace-nowrap">Sắp xếp:</label>
              <select
                value={sortConfig.key}
                onChange={(e) => handleSort(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="ngay">Ngày đầu tư</option>
                <option value="giaTri">Giá trị</option>
                <option value="loiNhuan">Lợi nhuận</option>
              </select>
              <motion.button
                onClick={() => handleSort(sortConfig.key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {sortConfig.direction === 'asc' ? (
                  <ArrowUpIcon className="h-5 w-5" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5" />
                )}
              </motion.button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tìm kiếm đầu tư..."
                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => setShowStats(!showStats)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-200 flex items-center space-x-2 border border-gray-200 flex-1"
              >
                <ChartPieIcon className="h-5 w-5" />
                <span>{showStats ? 'Ẩn Thống kê' : 'Thống kê'}</span>
              </motion.button>
              <motion.button
                onClick={openAddModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2 flex-1"
              >
                <ArrowTrendingUpIcon className="h-5 w-5" />
                <span>Đầu tư</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bảng thống kê */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Biểu đồ tròn */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <ChartPieIcon className="h-5 w-5 text-indigo-600" />
                    <span>Phân bố trạng thái</span>
                  </h3>
                  <div className="h-64">
                    <Pie
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              font: {
                                size: 12
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Biểu đồ đường */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <PresentationChartLineIcon className="h-5 w-5 text-blue-600" />
                    <span>Lợi nhuận theo loại đầu tư</span>
                  </h3>
                  <div className="h-64">
                    <Line
                      data={profitData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return value.toLocaleString() + ' VNĐ';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Thống kê chi tiết */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Tổng số đầu tư</h4>
                      <p className="text-2xl font-bold text-blue-600">{investments.length}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-blue-600">Hoạt động:</span>
                        <span className="text-sm font-medium text-blue-800">
                          {investments.filter(inv => inv.trangThai === 'Hoạt động').length}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-green-800 mb-1">Đã bán</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {investments.filter(inv => inv.trangThai === 'Đã bán').length}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-green-600">Tỷ lệ:</span>
                        <span className="text-sm font-medium text-green-800">
                          {investments.length ? ((investments.filter(inv => inv.trangThai === 'Đã bán').length / investments.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">Đang chờ</h4>
                      <p className="text-2xl font-bold text-yellow-600">
                        {investments.filter(inv => inv.trangThai === 'Đang chờ').length}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-yellow-600">Tỷ lệ:</span>
                        <span className="text-sm font-medium text-yellow-800">
                          {investments.length ? ((investments.filter(inv => inv.trangThai === 'Đang chờ').length / investments.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-purple-800 mb-1">Tỷ suất lợi nhuận</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {averageROI.toFixed(1)}%
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-purple-600">Tổng lợi nhuận:</span>
                        <span className="text-sm font-medium text-purple-800">
                          {totalProfit.toLocaleString()} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Danh sách đầu tư */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredAndSortedInvestments.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <ArrowTrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có đầu tư nào</h3>
              <p className="text-gray-500">Hãy thêm đầu tư đầu tiên của bạn</p>
            </div>
          ) : (
            filteredAndSortedInvestments.map((investment, index) => {
              const roi = investment.giaTri ? ((investment.loiNhuan || 0) / investment.giaTri) * 100 : 0;

              return (
                <motion.div
                  key={investment._id}
                  variants={itemVariants}
                  draggable
                  onDragStart={() => handleDragStart(investment)}
                  onDragOver={(e) => handleDragOver(e, investment)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200 ${
                    draggedInvestment?._id === investment._id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{investment.loai}</h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        investment.trangThai === 'Hoạt động'
                          ? 'bg-green-100 text-green-800'
                          : investment.trangThai === 'Đã bán'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {investment.trangThai}
                    </span>
                  </div>

                    <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Giá trị:</span>
                      <span className="font-semibold text-blue-800">
                        {investment.giaTri.toLocaleString()} VNĐ
                        </span>
                      </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Lợi nhuận:</span>
                      <span className={`font-semibold ${investment.loiNhuan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(investment.loiNhuan || 0).toLocaleString()} VNĐ
                        </span>
                      </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Ngày đầu tư:</span>
                      <span className="text-gray-800">
                        {new Date(investment.ngay).toLocaleDateString()}
                        </span>
                      </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Tỷ suất lợi nhuận:</span>
                      <span className={`font-semibold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {roi.toFixed(1)}%
                      </span>
                  </div>

                    {investment.ghiChu && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{investment.ghiChu}</p>
                  </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-4">
                      <motion.button
                        onClick={() => {
                          setSelectedInvestment(investment);
                          setShowReminderModal(true);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                        title="Thêm nhắc nhở"
                      >
                        <BellIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleShare(investment)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Chia sẻ đầu tư"
                      >
                        <ShareIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => openEditModal(investment)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Sửa đầu tư"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(investment._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Xóa đầu tư"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </motion.button>
                              </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* Modal thêm/sửa đầu tư */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl">
                      <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editId ? "Sửa Đầu Tư" : "Thêm Đầu Tư"}
                    </h3>
                  </div>
                  <motion.button
                    onClick={closeModal}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-2xl border border-red-200/50 flex items-center space-x-3"
                    >
                      <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Loại đầu tư */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <TagIcon className="h-4 w-4 text-emerald-600" />
                      <span>Loại Đầu Tư</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loai}
                        onChange={(e) => setLoai(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:shadow-lg transition-all duration-300"
                        required
                        placeholder="Ví dụ: Cổ phiếu, Trái phiếu"
                        maxLength={50}
                      />
                      <TagIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                    </div>
                  </div>

                  {/* Giá trị */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <BanknotesIcon className="h-4 w-4 text-blue-600" />
                      <span>Giá Trị</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={giaTri}
                        onChange={(e) => setGiaTri(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300"
                        required
                        step="0.01"
                        min="0.01"
                        placeholder="Giá trị đầu tư"
                      />
                      <BanknotesIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                    </div>
                  </div>

                  {/* Lợi nhuận */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-purple-600" />
                      <span>Lợi Nhuận</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={loiNhuan}
                        onChange={(e) => setLoiNhuan(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg transition-all duration-300"
                        step="0.01"
                        placeholder="Lợi nhuận"
                      />
                      <ArrowTrendingUpIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                    </div>
                  </div>

                  {/* Ngày đầu tư */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <CalendarIcon className="h-4 w-4 text-indigo-600" />
                      <span>Ngày Đầu Tư</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={ngay}
                        onChange={(e) => setNgay(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:shadow-lg transition-all duration-300"
                      />
                      <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500" />
                    </div>
                  </div>

                  {/* Trạng thái */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <CheckCircleIcon className="h-4 w-4 text-pink-600" />
                      <span>Trạng Thái</span>
                    </label>
                    <div className="relative">
                      <select
                        value={trangThai}
                        onChange={(e) => setTrangThai(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-pink-500/20 focus:shadow-lg transition-all duration-300 appearance-none"
                      >
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Đã bán">Đã bán</option>
                        <option value="Đang chờ">Đang chờ</option>
                      </select>
                      <CheckCircleIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-500" />
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                      <span>Ghi Chú</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={ghiChu}
                        onChange={(e) => setGhiChu(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-gray-500/20 focus:shadow-lg transition-all duration-300 min-h-[100px] resize-none"
                        placeholder="Nhập ghi chú (tối đa 200 ký tự)"
                        maxLength={200}
                      />
                      <DocumentTextIcon className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={closeModal}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-gray-200/80 backdrop-blur-sm text-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg hover:bg-gray-300/80"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    <span>Hủy</span>
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg hover:from-emerald-600 hover:to-blue-700"
                  >
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                    <span>{editId ? "Cập Nhật" : "Thêm"} Đầu Tư</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal thêm nhắc nhở */}
      <AnimatePresence>
        {showReminderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl">
                      <BellIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Thêm Nhắc Nhở
                    </h3>
                  </div>
                  <motion.button
                    onClick={() => {
                      setShowReminderModal(false);
                      setReminderDate('');
                      setReminderNote('');
                      setSelectedInvestment(null);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleAddReminder} className="p-6 space-y-6">
                <div className="space-y-6">
                  {/* Ngày nhắc nhở */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <CalendarIcon className="h-4 w-4 text-indigo-600" />
                      <span>Ngày Nhắc Nhở</span>
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:shadow-lg transition-all duration-300"
                        required
                      />
                      <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500" />
                    </div>
                  </div>

                  {/* Ghi chú nhắc nhở */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                      <span>Ghi Chú Nhắc Nhở</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={reminderNote}
                        onChange={(e) => setReminderNote(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-gray-500/20 focus:shadow-lg transition-all duration-300 min-h-[100px] resize-none"
                        placeholder="Nhập nội dung nhắc nhở..."
                        rows="3"
                      />
                      <DocumentTextIcon className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowReminderModal(false);
                      setReminderDate('');
                      setReminderNote('');
                      setSelectedInvestment(null);
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-gray-200/80 backdrop-blur-sm text-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg hover:bg-gray-300/80"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    <span>Hủy</span>
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-lg hover:from-emerald-600 hover:to-blue-700"
                  >
                    <BellIcon className="w-5 h-5" />
                    <span>Thêm Nhắc Nhở</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Investments;