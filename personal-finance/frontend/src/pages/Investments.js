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
  TagIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon
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
  const [reminders, setReminders] = useState([]);
  const [showRemindersList, setShowRemindersList] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(null);
  const [loadingActions, setLoadingActions] = useState({});
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

  // Lấy danh sách nhắc nhở
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/reminders/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReminders(res.data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách nhắc nhở:', err);
      }
    };
    if (userId) fetchReminders();
  }, [userId]);

  // Đóng quick actions menu khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showQuickActions && !event.target.closest('.quick-actions-menu')) {
        setShowQuickActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickActions]);

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
    
    setLoadingActions(prev => ({ ...prev, [id]: true }));
    
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
    } finally {
      setLoadingActions(prev => ({ ...prev, [id]: false }));
    }
  };

  // Hàm xóa nhắc nhở
  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhắc nhở này?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/reminders/${reminderId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId }
      });
      setReminders(reminders.filter(reminder => reminder._id !== reminderId));
      toast.success('Đã xóa nhắc nhở thành công!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa nhắc nhở';
      toast.error(errorMessage);
    }
  };

  // Hàm chỉnh sửa nhắc nhở
  const handleEditReminder = async (e) => {
    e.preventDefault();
    if (!editingReminder || !reminderDate) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const reminderDateTime = new Date(reminderDate);
    if (isNaN(reminderDateTime.getTime())) {
      toast.error('Ngày nhắc nhở không hợp lệ');
      return;
    }

    if (reminderDateTime <= new Date()) {
      toast.error('Ngày nhắc nhở phải lớn hơn thời gian hiện tại');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/reminders/${editingReminder._id}`, {
        userId,
        date: reminderDate,
        note: reminderNote
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReminders(reminders.map(reminder => 
        reminder._id === editingReminder._id ? response.data : reminder
      ));
      
      toast.success('Đã cập nhật nhắc nhở thành công!');
      setEditingReminder(null);
      setReminderDate('');
      setReminderNote('');
      setShowReminderModal(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật nhắc nhở';
      toast.error(errorMessage);
    }
  };

  // Hàm mở modal chỉnh sửa nhắc nhở
  const openEditReminderModal = (reminder) => {
    setEditingReminder(reminder);
    setReminderDate(new Date(reminder.ngayNhacNho).toISOString().slice(0, 16));
    setReminderNote(reminder.noiDung || '');
    setShowReminderModal(true);
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
    setEditingReminder(null);
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
    if (!reminderDate || !selectedInvestment) {
      toast.error('Vui lòng nhập đầy đủ thông tin nhắc nhở');
      return;
    }

    const reminderDateTime = new Date(reminderDate);
    if (isNaN(reminderDateTime.getTime())) {
      toast.error('Ngày nhắc nhở không hợp lệ');
      return;
    }

    if (reminderDateTime <= new Date()) {
      toast.error('Ngày nhắc nhở phải lớn hơn thời gian hiện tại');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Gọi API tạo nhắc nhở
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/reminders`, {
        userId,
        investmentId: selectedInvestment._id,
        date: reminderDate,
        note: reminderNote || `Nhắc nhở về đầu tư "${selectedInvestment.loai}"`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Cập nhật danh sách reminders
      setReminders([...reminders, response.data]);
      
      toast.success('Đã thêm nhắc nhở thành công!');
      setShowReminderModal(false);
      setReminderDate('');
      setReminderNote('');
      setSelectedInvestment(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi thêm nhắc nhở';
      toast.error(errorMessage);
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

  // Skeleton loading component
  const InvestmentSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-28"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );

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
        <motion.div variants={itemVariants} className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tổng giá trị đầu tư */}
            <div className="flex items-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow p-5 hover:scale-105 transition">
              <span className="text-4xl mr-4">💰</span>
              <div>
                <div className="text-sm text-gray-500 font-medium">Tổng giá trị đầu tư</div>
                <div className="text-2xl font-bold text-blue-600">{totalInvestmentValue.toLocaleString()} VNĐ</div>
              </div>
            </div>
            {/* Tổng lợi nhuận */}
            <div className="flex items-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow p-5 hover:scale-105 transition">
              <span className="text-4xl mr-4">📈</span>
              <div>
                <div className="text-sm text-gray-500 font-medium">Tổng lợi nhuận</div>
                <div className="text-2xl font-bold text-green-600">{totalProfit.toLocaleString()} VNĐ</div>
              </div>
            </div>
            {/* Tỷ suất lợi nhuận */}
            <div className="flex items-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow p-5 hover:scale-105 transition">
              <span className="text-4xl mr-4">📊</span>
              <div>
                <div className="text-sm text-gray-500 font-medium">Tỷ suất lợi nhuận</div>
                <div className="text-2xl font-bold text-purple-600">{averageROI.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bộ lọc và tìm kiếm */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Lọc và Sắp xếp */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Lọc */}
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm font-medium whitespace-nowrap">Lọc:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="Tất cả">Tất cả</option>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Đã bán">Đã bán</option>
                  <option value="Đang chờ">Đang chờ</option>
                </select>
              </div>
              {/* Sắp xếp */}
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm font-medium whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sortConfig.key}
                  onChange={(e) => handleSort(e.target.value)}
                  className="p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="ngay">Ngày đầu tư</option>
                  <option value="giaTri">Giá trị</option>
                  <option value="loiNhuan">Lợi nhuận</option>
                </select>
                <button
                  onClick={() => handleSort(sortConfig.key)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  {sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {/* Tìm kiếm và Nút nhóm */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Tìm kiếm */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full p-2 pl-10 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {/* Nút nhóm */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  <ChartPieIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{showStats ? 'Ẩn thống kê' : 'Thống kê'}</span>
                </button>
                <button
                  onClick={() => setShowRemindersList(!showRemindersList)}
                  className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg border border-yellow-200 hover:bg-yellow-100 flex items-center gap-2 text-sm"
                >
                  <BellIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Nhắc nhở ({reminders.length})</span>
                </button>
                <button
                  onClick={openAddModal}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Đầu tư</span>
                </button>
              </div>
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

        {/* Danh sách nhắc nhở */}
        <AnimatePresence>
          {showRemindersList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl">
                    <BellIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Danh sách nhắc nhở</h3>
                    <p className="text-sm text-gray-500">Quản lý các nhắc nhở cho đầu tư</p>
                  </div>
                </div>
              </div>

              {reminders.length === 0 ? (
                <div className="text-center py-12">
                  <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có nhắc nhở nào</h3>
                  <p className="text-gray-500">Hãy thêm nhắc nhở cho đầu tư của bạn</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reminders.map((reminder) => {
                    const now = new Date();
                    const remindTime = new Date(reminder.ngayNhacNho);
                    const msLeft = remindTime - now;
                    const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
                    const hoursLeft = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
                    const minutesLeft = Math.floor((msLeft / (1000 * 60)) % 60);
                    let timeLeftStr = '';
                    if (msLeft > 0) {
                      if (daysLeft > 0) timeLeftStr = `Còn ${daysLeft} ngày`;
                      else if (hoursLeft > 0) timeLeftStr = `Còn ${hoursLeft} giờ`;
                      else timeLeftStr = `Còn ${minutesLeft} phút`;
                    } else {
                      timeLeftStr = 'Đã đến hạn';
                    }
                    return (
                      <motion.div
                        key={reminder._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.03, boxShadow: '0 4px 24px rgba(255,193,7,0.15)' }}
                        className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200 shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <BellIcon className="h-6 w-6 text-yellow-500 animate-bounce" />
                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md transition-all duration-200 ${
                              reminder.trangThai === 'Chưa gửi'
                                ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                                : reminder.trangThai === 'Đã gửi'
                                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                                : 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
                            }`}>
                              {reminder.trangThai}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 font-medium">{timeLeftStr}</span>
                          </div>
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={() => openEditReminderModal(reminder)}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Chỉnh sửa nhắc nhở"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteReminder(reminder._id)}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Xóa nhắc nhở"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </motion.button>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center">
                            <ChartBarIcon className="h-4 w-4 mr-1 text-yellow-600" />
                            {reminder.investmentId ? `${reminder.investmentId.loai} - ${reminder.investmentId.giaTri.toLocaleString()} VNĐ` : 'Đầu tư không tồn tại'}
                          </h4>
                          <p className="text-gray-600 mb-2">{reminder.noiDung}</p>
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(reminder.ngayNhacNho).toLocaleString()}
                            <span className="ml-2">•</span>
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(reminder.ngayTao).toLocaleDateString()}
                          </div>
                          {reminder.investmentId && (
                            <div className="mt-2 p-2 bg-white/50 rounded-lg">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Giá trị:</span>
                                <span className="font-semibold text-gray-800">
                                  {reminder.investmentId.giaTri.toLocaleString()} VNĐ
                                </span>
                              </div>
                              {reminder.investmentId.loiNhuan && (
                                <div className="flex justify-between text-xs mt-1">
                                  <span className="text-gray-600">Lợi nhuận:</span>
                                  <span className={`font-semibold ${reminder.investmentId.loiNhuan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {reminder.investmentId.loiNhuan >= 0 ? '+' : ''}{reminder.investmentId.loiNhuan.toLocaleString()} VNĐ
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Danh sách đầu tư */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <InvestmentSkeleton key={index} />
            ))
          ) : filteredAndSortedInvestments.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <ArrowTrendingUpIcon className="h-12 w-12 text-emerald-500" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Chưa có đầu tư nào</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Bắt đầu theo dõi các khoản đầu tư của bạn để quản lý tài chính hiệu quả hơn
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  onClick={openAddModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                >
                  <PlusIcon className="h-5 w-5" />
                  Thêm đầu tư đầu tiên
                </motion.button>
                <motion.button
                  onClick={() => setShowStats(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                >
                  <ChartPieIcon className="h-5 w-5" />
                  Xem thống kê
                </motion.button>
              </div>
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
                    <div className="flex items-center gap-2">
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
                      <motion.button
                        onClick={() => setExpandedCard(expandedCard === investment._id ? null : investment._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title={expandedCard === investment._id ? "Thu gọn" : "Mở rộng"}
                      >
                        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${
                          expandedCard === investment._id ? 'rotate-180' : ''
                        }`} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Basic Info - Always visible */}
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
                  </div>

                  {/* Expanded Info */}
                  <AnimatePresence>
                    {expandedCard === investment._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
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
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-1">
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
                        <BellIcon className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleShare(investment)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Chia sẻ đầu tư"
                      >
                        <ShareIcon className="h-4 w-4" />
                      </motion.button>
                    </div>
                    
                    {/* Quick Actions Menu */}
                    <div className="relative quick-actions-menu">
                      <motion.button
                        onClick={() => setShowQuickActions(showQuickActions === investment._id ? null : investment._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        title="Thêm tùy chọn"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </motion.button>
                      
                      <AnimatePresence>
                        {showQuickActions === investment._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[120px]"
                          >
                            <motion.button
                              onClick={() => {
                                openEditModal(investment);
                                setShowQuickActions(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                            >
                              <PencilIcon className="h-4 w-4" />
                              Sửa
                            </motion.button>
                            <motion.button
                              onClick={() => {
                                handleDelete(investment._id);
                                setShowQuickActions(null);
                              }}
                              disabled={loadingActions[investment._id]}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingActions[investment._id] ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"
                                />
                              ) : (
                                <TrashIcon className="h-4 w-4" />
                              )}
                              {loadingActions[investment._id] ? 'Đang xóa...' : 'Xóa'}
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto"
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
                      {editingReminder ? "Chỉnh Sửa Nhắc Nhở" : "Thêm Nhắc Nhở"}
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

              <form onSubmit={editingReminder ? handleEditReminder : handleAddReminder} className="p-6 space-y-6">
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
                    <span>{editingReminder ? "Cập Nhật Nhắc Nhở" : "Thêm Nhắc Nhở"}</span>
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