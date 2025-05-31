import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  PlusIcon, 
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  CalendarIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShareIcon,
  BellIcon,
  ChartPieIcon,
  ChartLineIcon,
  BanknotesIcon
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
        toastStyle={{
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Quản lý đầu tư</h2>
          <div className="flex space-x-4">
            <motion.button
              onClick={() => setShowStats(!showStats)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center space-x-2"
            >
              <ChartPieIcon className="h-5 w-5" />
              <span>Thống kê</span>
            </motion.button>
            <motion.button
              onClick={openAddModal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Thêm đầu tư</span>
            </motion.button>
          </div>
        </div>

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

        {/* Thống kê */}
        {showStats && (
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">Thống kê</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-2">Phân bố trạng thái</h4>
                <div className="h-64">
                  <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-2">Lợi nhuận theo loại đầu tư</h4>
                    <div className="h-64">
                      <Line
                    data={profitData} 
                        options={{
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                          title: { display: true, text: 'Lợi nhuận (VNĐ)' }
                            },
                            x: {
                          title: { display: true, text: 'Loại đầu tư' }
                        }
                      }
                        }}
                      />
                    </div>
                    </div>
              </div>
          </motion.div>
        )}

        {/* Bộ lọc và tìm kiếm */}
        <motion.div variants={itemVariants} className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium">Lọc trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tất cả">Tất cả</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Đã bán">Đã bán</option>
                <option value="Đang chờ">Đang chờ</option>
              </select>
                        </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium">Sắp xếp theo:</label>
              <select
                value={sortConfig.key}
                onChange={(e) => handleSort(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  </div>
        </motion.div>

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
              <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                      <span className="font-semibold text-gray-800">
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-lg p-6 w-full max-w-lg"
            >
              <h3 className="text-xl font-semibold mb-4">
                {editId ? 'Sửa đầu tư' : 'Thêm đầu tư'}
              </h3>
              {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Loại đầu tư
                    <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Loại đầu tư của bạn" />
                  </label>
                  <input
                    type="text"
                    value={loai}
                    onChange={(e) => setLoai(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Ví dụ: Cổ phiếu, Trái phiếu"
                    maxLength={50}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Giá trị
                      <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Giá trị đầu tư của bạn" />
                    </label>
                    <input
                    type="number"
                    value={giaTri}
                    onChange={(e) => setGiaTri(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    step="0.01"
                    min="0.01"
                      placeholder="Giá trị đầu tư"
                  />
              </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Lợi nhuận
                      <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Lợi nhuận từ đầu tư (có thể âm)" />
                    </label>
                    <input
                    type="number"
                    value={loiNhuan}
                    onChange={(e) => setLoiNhuan(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                      placeholder="Lợi nhuận"
                  />
                </div>
              </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Ngày đầu tư
                    <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Ngày bạn thực hiện đầu tư" />
                  </label>
                  <input
                    type="date"
                    value={ngay}
                    onChange={(e) => setNgay(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Ghi chú
                    <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Thông tin bổ sung về đầu tư" />
                  </label>
                  <textarea
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ghi chú (tối đa 200 ký tự)"
                    rows="3"
                  maxLength={200}
                />
              </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Trạng thái
                    <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Trạng thái hiện tại của đầu tư" />
                  </label>
                  <select
                    value={trangThai}
                    onChange={(e) => setTrangThai(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Đã bán">Đã bán</option>
                    <option value="Đang chờ">Đang chờ</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                  type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    {editId ? 'Cập nhật' : 'Thêm đầu tư'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={closeModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-200"
                  >
                    Hủy
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">Thêm nhắc nhở</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Ngày nhắc nhở
                    <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Ngày bạn muốn được nhắc nhở" />
                  </label>
                  <input
                    type="datetime-local"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
      </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Ghi chú nhắc nhở
                    <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Nội dung nhắc nhở" />
                  </label>
                  <textarea
                    value={reminderNote}
                    onChange={(e) => setReminderNote(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập nội dung nhắc nhở..."
                    rows="3"
                  />
    </div>
                <div className="flex space-x-4">
                  <motion.button
                    onClick={handleAddReminder}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Thêm nhắc nhở
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowReminderModal(false);
                      setReminderDate('');
                      setReminderNote('');
                      setSelectedInvestment(null);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-200"
                  >
                    Hủy
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Investments;