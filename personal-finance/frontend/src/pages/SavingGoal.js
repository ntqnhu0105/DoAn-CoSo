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
  ArchiveBoxIcon,
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

// Animation variants for Framer Motion
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

const SavingGoal = () => {
  const [savingGoals, setSavingGoals] = useState([]);
  const [tenMucTieu, setTenMucTieu] = useState('');
  const [soTienMucTieu, setSoTienMucTieu] = useState('');
  const [soTienHienTai, setSoTienHienTai] = useState('');
  const [hanChot, setHanChot] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [trangThai, setTrangThai] = useState('Đang thực hiện');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'ngayTao', direction: 'desc' });
  const [showStats, setShowStats] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [draggedGoal, setDraggedGoal] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [showRemindersList, setShowRemindersList] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Kiểm tra userId
  useEffect(() => {
    if (!userId) {
      navigate('/');
      toast.error('Vui lòng đăng nhập để xem mục tiêu tiết kiệm');
    }
  }, [userId, navigate]);

  // Lấy danh sách mục tiêu tiết kiệm
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/saving-goals/${userId}`);
        const newGoals = res.data;
        setSavingGoals(newGoals);
        // Thông báo mục tiêu vừa hoàn thành/thất bại (trong 24 giờ qua)
        const recentlyUpdated = newGoals.filter(
          (goal) => goal.trangThai !== 'Đang thực hiện' && new Date(goal.ngayTao) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        recentlyUpdated.forEach((goal) => {
          toast.info(`Mục tiêu "${goal.tenMucTieu}" đã ${goal.trangThai === 'Hoàn thành' ? 'hoàn thành' : 'thất bại'} vào ${new Date(goal.hanChot).toLocaleDateString()}`, {
            toastId: goal._id,
          });
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Lỗi khi tải dữ liệu';
        setError(errorMessage);
        toast.error(errorMessage);
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

  // Thêm hoặc cập nhật mục tiêu tiết kiệm
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenMucTieu || !soTienMucTieu || !hanChot) {
      setError('Vui lòng nhập đầy đủ tên mục tiêu, số tiền mục tiêu và hạn chót');
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (tenMucTieu.length > 100) {
      setError('Tên mục tiêu không được vượt quá 100 ký tự');
      toast.error('Tên mục tiêu không được vượt quá 100 ký tự');
      return;
    }
    if (ghiChu && ghiChu.length > 200) {
      setError('Ghi chú không được vượt quá 200 ký tự');
      toast.error('Ghi chú không được vượt quá 200 ký tự');
      return;
    }
    const soTienMucTieuNum = parseFloat(soTienMucTieu);
    const soTienHienTaiNum = parseFloat(soTienHienTai) || 0;
    if (isNaN(soTienMucTieuNum) || soTienMucTieuNum <= 0) {
      setError('Số tiền mục tiêu phải là số dương hợp lệ');
      toast.error('Số tiền mục tiêu phải là số dương hợp lệ');
      return;
    }
    if (soTienHienTaiNum < 0) {
      setError('Số tiền hiện tại không được âm');
      toast.error('Số tiền hiện tại không được âm');
      return;
    }
    const hanChotDate = new Date(hanChot);
    if (isNaN(hanChotDate.getTime())) {
      setError('Hạn chót phải là ngày hợp lệ');
      toast.error('Hạn chót phải là ngày hợp lệ');
      return;
    }

    try {
      const payload = {
        userId,
        tenMucTieu,
        soTienMucTieu: soTienMucTieuNum,
        soTienHienTai: soTienHienTaiNum,
        hanChot,
        ghiChu,
        trangThai,
      };
      let res;
      if (editId) {
        res = await axios.put(`${process.env.REACT_APP_API_URL}/saving-goals/${editId}`, payload);
        setSavingGoals(savingGoals.map((goal) => (goal._id === editId ? res.data : goal)));
        toast.success('Cập nhật mục tiêu tiết kiệm thành công!');
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/saving-goals`, payload);
        setSavingGoals([...savingGoals, res.data]);
        toast.success('Thêm mục tiêu tiết kiệm thành công!');
      }
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu mục tiêu tiết kiệm';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Xóa mục tiêu tiết kiệm
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mục tiêu tiết kiệm này?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/saving-goals/${id}?userId=${userId}`);
      setSavingGoals(savingGoals.filter((goal) => goal._id !== id));
      toast.success('Xóa mục tiêu tiết kiệm thành công!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa mục tiêu tiết kiệm';
      setError(errorMessage);
      toast.error(errorMessage);
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

  // Mở modal thêm mục tiêu
  const openAddModal = () => {
    setEditId(null);
    setTenMucTieu('');
    setSoTienMucTieu('');
    setSoTienHienTai('');
    setHanChot('');
    setGhiChu('');
    setTrangThai('Đang thực hiện');
    setError('');
    setShowModal(true);
  };

  // Mở modal sửa mục tiêu
  const openEditModal = (goal) => {
    setEditId(goal._id);
    setTenMucTieu(goal.tenMucTieu);
    setSoTienMucTieu(goal.soTienMucTieu.toString());
    setSoTienHienTai(goal.soTienHienTai.toString());
    setHanChot(new Date(goal.hanChot).toISOString().split('T')[0]);
    setGhiChu(goal.ghiChu || '');
    setTrangThai(goal.trangThai);
    setError('');
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setTenMucTieu('');
    setSoTienMucTieu('');
    setSoTienHienTai('');
    setHanChot('');
    setGhiChu('');
    setTrangThai('Đang thực hiện');
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

  // Hàm lọc và sắp xếp mục tiêu
  const filteredAndSortedGoals = useMemo(() => {
    let result = savingGoals;

    // Lọc theo trạng thái
    if (filterStatus !== 'Tất cả') {
      result = result.filter(goal => goal.trangThai === filterStatus);
    }

    // Tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(goal => 
        goal.tenMucTieu.toLowerCase().includes(query) ||
        (goal.ghiChu && goal.ghiChu.toLowerCase().includes(query))
      );
    }

    // Sắp xếp
    result = [...result].sort((a, b) => {
      if (sortConfig.key === 'ngayTao') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.ngayTao) - new Date(b.ngayTao)
          : new Date(b.ngayTao) - new Date(a.ngayTao);
      }
      if (sortConfig.key === 'soTienMucTieu') {
        return sortConfig.direction === 'asc'
          ? a.soTienMucTieu - b.soTienMucTieu
          : b.soTienMucTieu - a.soTienMucTieu;
      }
      if (sortConfig.key === 'hanChot') {
        return sortConfig.direction === 'asc'
          ? new Date(a.hanChot) - new Date(b.hanChot)
          : new Date(b.hanChot) - new Date(a.hanChot);
      }
      return 0;
    });

    return result;
  }, [savingGoals, filterStatus, searchQuery, sortConfig]);

  // Hàm xử lý kéo thả
  const handleDragStart = (goal) => {
    setDraggedGoal(goal);
  };

  const handleDragOver = (e, goal) => {
    e.preventDefault();
    if (draggedGoal && draggedGoal._id !== goal._id) {
      const items = Array.from(filteredAndSortedGoals);
      const draggedIndex = items.findIndex(item => item._id === draggedGoal._id);
      const dropIndex = items.findIndex(item => item._id === goal._id);
      
      const newItems = Array.from(items);
      newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedGoal);
      
      // Cập nhật thứ tự ưu tiên trong database
      const updatePriority = async () => {
        try {
          // Fix: Endpoint không tồn tại, tạm thời chỉ cập nhật local state
          setSavingGoals(newItems);
          toast.success('Đã cập nhật thứ tự ưu tiên');
        } catch (err) {
          toast.error('Lỗi khi cập nhật thứ tự ưu tiên');
        }
      };
      updatePriority();
    }
  };

  const handleDragEnd = () => {
    setDraggedGoal(null);
  };

  // Hàm chia sẻ mục tiêu
  const handleShare = async (goal) => {
    try {
      const shareData = {
        title: goal.tenMucTieu,
        text: `Mục tiêu tiết kiệm: ${goal.tenMucTieu}\nSố tiền mục tiêu: ${goal.soTienMucTieu.toLocaleString()} VNĐ\nĐã tiết kiệm: ${goal.soTienHienTai.toLocaleString()} VNĐ\nHạn chót: ${new Date(goal.hanChot).toLocaleDateString()}`,
        url: window.location.href
      };
      
      // Fix: Kiểm tra hỗ trợ navigator.share
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        const textToCopy = `${shareData.title}\n${shareData.text}`;
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Đã sao chép thông tin mục tiêu vào clipboard');
      }
    } catch (err) {
      toast.error('Lỗi khi chia sẻ mục tiêu');
    }
  };

  // Hàm thêm nhắc nhở
  const handleAddReminder = async () => {
    if (!reminderDate || !selectedGoal) {
      toast.error('Vui lòng nhập đầy đủ thông tin nhắc nhở');
      return;
    }

    // Fix: Validate reminder date
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
        goalId: selectedGoal._id,
        date: reminderDate,
        note: reminderNote || `Nhắc nhở về mục tiêu "${selectedGoal.tenMucTieu}"`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Cập nhật danh sách reminders
      setReminders([...reminders, response.data]);
      
      toast.success('Đã thêm nhắc nhở thành công!');
      setShowReminderModal(false);
      setReminderDate('');
      setReminderNote('');
      setSelectedGoal(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi thêm nhắc nhở';
      toast.error(errorMessage);
    }
  };

  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: ['Hoàn thành', 'Đang thực hiện', 'Thất bại'],
    datasets: [
      {
        data: [
          savingGoals.filter(g => g.trangThai === 'Hoàn thành').length,
          savingGoals.filter(g => g.trangThai === 'Đang thực hiện').length,
          savingGoals.filter(g => g.trangThai === 'Thất bại').length
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#EF4444']
      }
    ]
  };

  const progressData = {
    labels: savingGoals.map(g => g.tenMucTieu),
    datasets: [
      {
        label: 'Tiến độ',
        data: savingGoals.map(g => {
          // Fix division by zero bug
          if (g.soTienMucTieu === 0) return 0;
          return (g.soTienHienTai / g.soTienMucTieu) * 100;
        }),
        borderColor: '#3B82F6',
        tension: 0.1
      }
    ]
  };

  // Lọc mục tiêu theo trạng thái
  const filteredGoals = filterStatus === 'Tất cả' 
    ? savingGoals 
    : savingGoals.filter(goal => goal.trangThai === filterStatus);

  // Tính tổng tiền đã tiết kiệm
  const totalSaved = filteredGoals.reduce((sum, goal) => sum + (goal.soTienHienTai || 0), 0);

  // Tính tổng tiền mục tiêu
  const totalTarget = filteredGoals.reduce((sum, goal) => sum + (goal.soTienMucTieu || 0), 0);

  // Tính phần trăm hoàn thành
  const completionPercentage = totalTarget ? (totalSaved / totalTarget) * 100 : 0;

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
            <ArchiveBoxIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Mục Tiêu Tiết Kiệm
          </h2>
          <p className="text-gray-600 font-medium">Theo dõi và quản lý các mục tiêu tiết kiệm của bạn</p>
        </motion.div>

        {/* Tổng quan */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tổng tiền đã tiết kiệm */}
            <div className="flex items-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow p-5 hover:scale-105 transition">
              <span className="text-4xl mr-4">🏦</span>
              <div>
                <div className="text-sm text-gray-500 font-medium">Đã tiết kiệm</div>
                <div className="text-2xl font-bold text-blue-600">{totalSaved.toLocaleString()} VNĐ</div>
              </div>
            </div>
            {/* Tổng tiền mục tiêu */}
            <div className="flex items-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow p-5 hover:scale-105 transition">
              <span className="text-4xl mr-4">🎯</span>
              <div>
                <div className="text-sm text-gray-500 font-medium">Mục tiêu</div>
                <div className="text-2xl font-bold text-green-600">{totalTarget.toLocaleString()} VNĐ</div>
              </div>
            </div>
            {/* Tiến độ chung */}
            <div className="flex items-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow p-5 hover:scale-105 transition">
              <span className="text-4xl mr-4">📈</span>
              <div className="w-full">
                <div className="text-sm text-gray-500 font-medium">Tiến độ</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 h-2.5 rounded-full"
                  ></motion.div>
                </div>
                <div className="text-lg font-semibold text-purple-600">{completionPercentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bộ lọc và tìm kiếm */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
            {/* Lọc */}
            <div className="flex items-center gap-2">
              <span className="text-gray-700 text-sm font-medium">Lọc:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="Tất cả">Tất cả</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Thất bại">Thất bại</option>
              </select>
            </div>
            {/* Sắp xếp */}
            <div className="flex items-center gap-2">
              <span className="text-gray-700 text-sm font-medium">Sắp xếp:</span>
              <select
                value={sortConfig.key}
                onChange={(e) => handleSort(e.target.value)}
                className="p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="ngayTao">Ngày tạo</option>
                <option value="soTienMucTieu">Số tiền mục tiêu</option>
                <option value="hanChot">Hạn chót</option>
              </select>
              <button
                onClick={() => handleSort(sortConfig.key)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                aria-label="Đổi chiều sắp xếp"
              >
                {sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
              </button>
            </div>
            {/* Tìm kiếm */}
            <div className="relative w-full max-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full p-2 pl-10 rounded-lg border focus:ring-2 focus:ring-blue-500 bg-gray-50 truncate"
                style={{ textOverflow: 'ellipsis' }}
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {/* Nút nhóm */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border hover:bg-gray-100 flex items-center gap-2 shadow-sm"
              >
                <ChartPieIcon className="h-5 w-5" />
                <span>{showStats ? 'Ẩn Thống kê' : 'Thống kê'}</span>
              </button>
              <button
                onClick={() => setShowRemindersList(!showRemindersList)}
                className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-200 hover:bg-yellow-100 flex items-center gap-2 shadow-sm"
              >
                <BellIcon className="h-5 w-5" />
                <span>Nhắc nhở ({reminders.length})</span>
              </button>
              <button
                onClick={openAddModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Mục tiêu</span>
              </button>
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
                    <span>Tiến độ tiết kiệm</span>
                  </h3>
                  <div className="h-64">
                    <Line
                      data={progressData}
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
                            max: 100,
                            ticks: {
                              callback: function(value) {
                                return value + '%';
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
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Tổng số mục tiêu</h4>
                      <p className="text-2xl font-bold text-blue-600">{savingGoals.length}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-blue-600">Đang tiết kiệm:</span>
                        <span className="text-sm font-medium text-blue-800">
                          {savingGoals.filter(goal => goal.trangThai === 'Đang thực hiện').length}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-green-800 mb-1">Hoàn thành</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {savingGoals.filter(goal => goal.trangThai === 'Hoàn thành').length}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-green-600">Tỷ lệ:</span>
                        <span className="text-sm font-medium text-green-800">
                          {savingGoals.length ? ((savingGoals.filter(goal => goal.trangThai === 'Hoàn thành').length / savingGoals.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">Đã hủy</h4>
                      <p className="text-2xl font-bold text-yellow-600">
                        {savingGoals.filter(goal => goal.trangThai === 'Thất bại').length}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-yellow-600">Tỷ lệ:</span>
                        <span className="text-sm font-medium text-yellow-800">
                          {savingGoals.length ? ((savingGoals.filter(goal => goal.trangThai === 'Thất bại').length / savingGoals.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-purple-800 mb-1">Tổng tiền tiết kiệm</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {totalSaved.toLocaleString()} VNĐ
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-purple-600">Tổng mục tiêu:</span>
                        <span className="text-sm font-medium text-purple-800">
                          {totalTarget.toLocaleString()} VNĐ
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
                    <p className="text-sm text-gray-500">Quản lý các nhắc nhở cho mục tiêu tiết kiệm</p>
                  </div>
                </div>
              </div>

              {reminders.length === 0 ? (
                <div className="text-center py-12">
                  <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có nhắc nhở nào</h3>
                  <p className="text-gray-500">Hãy thêm nhắc nhở cho mục tiêu tiết kiệm của bạn</p>
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
                            <ArchiveBoxIcon className="h-4 w-4 mr-1 text-yellow-600" />
                            {reminder.goalId?.tenMucTieu || 'Mục tiêu không tồn tại'}
                          </h4>
                          <p className="text-gray-600 mb-2">{reminder.noiDung}</p>
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(reminder.ngayNhacNho).toLocaleString()}
                            <span className="ml-2">•</span>
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(reminder.ngayTao).toLocaleDateString()}
                          </div>
                          {reminder.goalId && (
                            <div className="mt-2 p-2 bg-white/50 rounded-lg">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Tiến độ:</span>
                                <span className="font-semibold text-gray-800">
                                  {((reminder.goalId.soTienHienTai / reminder.goalId.soTienMucTieu) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((reminder.goalId.soTienHienTai / reminder.goalId.soTienMucTieu) * 100, 100)}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full"
                                ></motion.div>
                              </div>
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

        {/* Danh sách mục tiêu */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredAndSortedGoals.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <span className="inline-block mb-4 text-5xl">🎯</span>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có mục tiêu nào</h3>
              <p className="text-gray-500">Hãy thêm mục tiêu tiết kiệm đầu tiên của bạn</p>
            </div>
          ) : (
            filteredAndSortedGoals.map((goal, index) => {
              const progress = (goal.soTienHienTai / goal.soTienMucTieu) * 100;
              const daysRemaining = Math.ceil((new Date(goal.hanChot) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <motion.div
                  key={goal._id}
                  variants={itemVariants}
                  draggable
                  onDragStart={() => handleDragStart(goal)}
                  onDragOver={(e) => handleDragOver(e, goal)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-200 flex flex-col justify-between ${
                    draggedGoal?._id === goal._id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-2xl">🏦</span> {goal.tenMucTieu}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        goal.trangThai === 'Hoàn thành'
                          ? 'bg-green-100 text-green-800'
                          : goal.trangThai === 'Thất bại'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {goal.trangThai}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Số tiền mục tiêu:</span>
                      <span className="font-semibold text-indigo-800">
                        {goal.soTienMucTieu.toLocaleString()} VNĐ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Đã tiết kiệm:</span>
                      <span className="font-semibold text-emerald-800">
                        {goal.soTienHienTai.toLocaleString()} VNĐ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Còn lại:</span>
                      <span className="font-semibold text-gray-800">
                        {(goal.soTienMucTieu - goal.soTienHienTai).toLocaleString()} VNĐ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Hạn chót:</span>
                      <span className="text-gray-800">
                        {new Date(goal.hanChot).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Còn lại:</span>
                      <span className={`font-semibold ${daysRemaining < 7 ? 'text-red-600' : 'text-gray-800'}`}> 
                        {daysRemaining} ngày
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-2.5 rounded-full ${
                            progress >= 100
                              ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                              : progress >= 75
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                              : progress >= 50
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                              : 'bg-gradient-to-r from-red-500 to-pink-600'
                          }`}
                        ></motion.div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {progress.toFixed(1)}% hoàn thành
                      </p>
                    </div>

                    {goal.ghiChu && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{goal.ghiChu}</p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-4">
                      <motion.button
                        onClick={() => {
                          setSelectedGoal(goal);
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
                        onClick={() => handleShare(goal)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Chia sẻ mục tiêu"
                      >
                        <ShareIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => openEditModal(goal)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Sửa mục tiêu"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(goal._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Xóa mục tiêu"
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

      {/* Modal thêm/sửa mục tiêu */}
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
                      <ArchiveBoxIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editId ? "Sửa Mục Tiêu" : "Thêm Mục Tiêu"}
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
                  {/* Tên mục tiêu */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <TagIcon className="h-4 w-4 text-emerald-600" />
                      <span>Tên Mục Tiêu</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tenMucTieu}
                        onChange={(e) => setTenMucTieu(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:shadow-lg transition-all duration-300"
                        required
                        placeholder="Ví dụ: Mua xe, Mua nhà..."
                        maxLength={100}
                      />
                      <TagIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                    </div>
                  </div>

                  {/* Số tiền mục tiêu */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <BanknotesIcon className="h-4 w-4 text-blue-600" />
                      <span>Số Tiền Mục Tiêu</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={soTienMucTieu}
                        onChange={(e) => setSoTienMucTieu(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300"
                        required
                        step="0.01"
                        min="0.01"
                        placeholder="Số tiền mục tiêu"
                      />
                      <BanknotesIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                    </div>
                  </div>

                  {/* Số tiền hiện tại */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <ChartBarIcon className="h-4 w-4 text-purple-600" />
                      <span>Số Tiền Hiện Tại</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={soTienHienTai}
                        onChange={(e) => setSoTienHienTai(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg transition-all duration-300"
                        step="0.01"
                        min="0"
                        placeholder="Số tiền đã tiết kiệm"
                      />
                      <ChartBarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                    </div>
                  </div>

                  {/* Hạn chót */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <CalendarIcon className="h-4 w-4 text-indigo-600" />
                      <span>Hạn Chót</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={hanChot}
                        onChange={(e) => setHanChot(e.target.value)}
                        className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:shadow-lg transition-all duration-300"
                        required
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
                        <option value="Đang thực hiện">Đang thực hiện</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Thất bại">Thất bại</option>
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
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>{editId ? "Cập Nhật" : "Thêm"} Mục Tiêu</span>
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
                      setSelectedGoal(null);
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
                      setSelectedGoal(null);
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
                    <span>{editingReminder ? "Cập Nhật" : "Thêm"} </span>
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

export default SavingGoal;