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
  ChartLineIcon
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
          await axios.put(`${process.env.REACT_APP_API_URL}/saving-goals/priority`, {
            userId,
            goals: newItems.map((goal, index) => ({
              id: goal._id,
              priority: index
            }))
          });
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
      await navigator.share(shareData);
    } catch (err) {
      toast.error('Trình duyệt không hỗ trợ tính năng chia sẻ');
    }
  };

  // Hàm thêm nhắc nhở
  const handleAddReminder = async () => {
    if (!reminderDate || !selectedGoal) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/reminders`, {
        userId,
        goalId: selectedGoal._id,
        date: reminderDate,
        note: reminderNote
      });
      toast.success('Đã thêm nhắc nhở');
      setShowReminderModal(false);
      setReminderDate('');
      setReminderNote('');
      setSelectedGoal(null);
    } catch (err) {
      toast.error('Lỗi khi thêm nhắc nhở');
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
        data: savingGoals.map(g => (g.soTienHienTai / g.soTienMucTieu) * 100),
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-6">
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
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Quản lý mục tiêu tiết kiệm</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200 flex items-center space-x-2"
            >
              <ChartPieIcon className="h-5 w-5" />
              <span>Thống kê</span>
            </button>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Thêm mục tiêu</span>
            </button>
          </div>
        </div>

        {/* Tổng quan */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng tiền đã tiết kiệm</h3>
              <p className="text-2xl font-bold text-blue-600">
                {totalSaved.toLocaleString()} VNĐ
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng tiền mục tiêu</h3>
              <p className="text-2xl font-bold text-green-600">
                {totalTarget.toLocaleString()} VNĐ
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tiến độ chung</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-purple-600 h-2.5 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-lg font-semibold text-purple-600">
                {completionPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Thống kê */}
        {showStats && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">Thống kê</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-2">Phân bố trạng thái</h4>
                <div className="h-64">
                  <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-2">Tiến độ theo mục tiêu</h4>
                <div className="h-64">
                  <Line 
                    data={progressData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bộ lọc và tìm kiếm */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium">Lọc trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tất cả">Tất cả</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Thất bại">Thất bại</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium">Sắp xếp theo:</label>
              <select
                value={sortConfig.key}
                onChange={(e) => handleSort(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ngayTao">Ngày tạo</option>
                <option value="soTienMucTieu">Số tiền mục tiêu</option>
                <option value="hanChot">Hạn chót</option>
              </select>
              <button
                onClick={() => handleSort(sortConfig.key)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {sortConfig.direction === 'asc' ? (
                  <ArrowUpIcon className="h-5 w-5" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tìm kiếm mục tiêu..."
                className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Danh sách mục tiêu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredAndSortedGoals.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có mục tiêu nào</h3>
              <p className="text-gray-500">Hãy thêm mục tiêu tiết kiệm đầu tiên của bạn</p>
            </div>
          ) : (
            filteredAndSortedGoals.map((goal, index) => {
              const progress = (goal.soTienHienTai / goal.soTienMucTieu) * 100;
              const daysRemaining = Math.ceil((new Date(goal.hanChot) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={goal._id}
                  draggable
                  onDragStart={() => handleDragStart(goal)}
                  onDragOver={(e) => handleDragOver(e, goal)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200 ${
                    draggedGoal?._id === goal._id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{goal.tenMucTieu}</h3>
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
                      <span className="font-semibold text-gray-800">
                        {goal.soTienMucTieu.toLocaleString()} VNĐ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Đã tiết kiệm:</span>
                      <span className="font-semibold text-gray-800">
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
                        <div
                          className={`h-2.5 rounded-full ${
                            progress >= 100
                              ? 'bg-green-600'
                              : progress >= 75
                              ? 'bg-blue-600'
                              : progress >= 50
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
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
                      <button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setShowReminderModal(true);
                        }}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                        title="Thêm nhắc nhở"
                      >
                        <BellIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleShare(goal)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Chia sẻ mục tiêu"
                      >
                        <ShareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(goal)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Sửa mục tiêu"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Xóa mục tiêu"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal thêm/sửa mục tiêu */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">
              {editId ? 'Sửa mục tiêu tiết kiệm' : 'Thêm mục tiêu tiết kiệm'}
            </h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Tên mục tiêu
                  <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Tên mục tiêu tiết kiệm của bạn" />
                </label>
                <input
                  type="text"
                  value={tenMucTieu}
                  onChange={(e) => setTenMucTieu(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Ví dụ: Mua xe"
                  maxLength={100}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Số tiền mục tiêu
                    <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Số tiền bạn muốn tiết kiệm" />
                  </label>
                <input
                  type="number"
                  value={soTienMucTieu}
                  onChange={(e) => setSoTienMucTieu(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="Số tiền mục tiêu"
                />
              </div>

              <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Số tiền hiện tại
                    <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Số tiền bạn đã tiết kiệm được" />
                  </label>
                <input
                  type="number"
                  value={soTienHienTai}
                  onChange={(e) => setSoTienHienTai(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  placeholder="Số tiền đã tiết kiệm"
                />
              </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Hạn chót
                  <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Ngày bạn muốn hoàn thành mục tiêu" />
                </label>
                <input
                  type="date"
                  value={hanChot}
                  onChange={(e) => setHanChot(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Ghi chú
                  <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Thông tin bổ sung về mục tiêu" />
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
                  <InformationCircleIcon className="h-5 w-5 inline ml-1 text-gray-500" title="Trạng thái hiện tại của mục tiêu" />
                </label>
                <select
                  value={trangThai}
                  onChange={(e) => setTrangThai(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Thất bại">Thất bại</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  {editId ? 'Cập nhật' : 'Thêm mục tiêu'}
                </button>
                  <button
                    type="button"
                  onClick={closeModal}
                  className="w-full bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-200"
                  >
                    Hủy
                  </button>
              </div>
            </form>
              </div>
            </div>
      )}

      {/* Modal thêm nhắc nhở */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                    <button
                  onClick={handleAddReminder}
                  className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                  Thêm nhắc nhở
                    </button>
                    <button
                  onClick={() => {
                    setShowReminderModal(false);
                    setReminderDate('');
                    setReminderNote('');
                    setSelectedGoal(null);
                  }}
                  className="w-full bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Hủy
                    </button>
                  </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SavingGoal;