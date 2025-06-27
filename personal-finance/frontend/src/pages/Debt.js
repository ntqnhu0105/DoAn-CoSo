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
  CreditCardIcon,
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
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const DebtManagement = () => {
  const [debts, setDebts] = useState([]);
  const [soTien, setSoTien] = useState('');
  const [soTienDaTra, setSoTienDaTra] = useState('');
  const [laiSuat, setLaiSuat] = useState('');
  const [kyHan, setKyHan] = useState('');
  const [ngayBatDau, setNgayBatDau] = useState('');
  const [ngayKetThuc, setNgayKetThuc] = useState('');
  const [ngayTraTiepTheo, setNgayTraTiepTheo] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [trangThai, setTrangThai] = useState('Hoạt động');
  const [soTienTra, setSoTienTra] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [payDebtId, setPayDebtId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'ngayBatDau', direction: 'desc' });
  const [showStats, setShowStats] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [draggedDebt, setDraggedDebt] = useState(null);

  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Kiểm tra userId
  useEffect(() => {
    if (!userId) {
      navigate('/');
      toast.error('Vui lòng đăng nhập để xem khoản nợ', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  }, [userId, navigate]);

  // Lấy danh sách khoản nợ
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/debts/${userId}`);
        const newDebts = res.data;
        setDebts(newDebts);

        // Thông báo khoản nợ quá hạn, thanh toán, hoặc nhắc nhở
        const recentlyUpdated = newDebts.filter(
          (debt) =>
            debt.updatedAt &&
            (debt.trangThai === 'Quá hạn' || debt.trangThai === 'Đã thanh toán' || debt.ngayTraTiepTheo) &&
            new Date(debt.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        recentlyUpdated.forEach((debt) => {
          if (debt.trangThai === 'Quá hạn') {
            toast.error(`Khoản nợ ${debt.soTien.toLocaleString()} VNĐ đã quá hạn!`, {
              style: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
              },
            });
          } else if (debt.trangThai === 'Đã thanh toán') {
            toast.success(`Khoản nợ ${debt.soTien.toLocaleString()} VNĐ đã được thanh toán hoàn toàn!`, {
              style: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
              },
            });
          } else if (debt.ngayTraTiepTheo) {
            const nextPaymentDate = new Date(debt.ngayTraTiepTheo);
            if (
              nextPaymentDate.getFullYear() === new Date().getFullYear() &&
              nextPaymentDate.getMonth() === new Date().getMonth() &&
              nextPaymentDate.getDate() === new Date().getDate()
            ) {
              toast.info(`Hôm nay là ngày trả nợ cho khoản nợ ${debt.soTien.toLocaleString()} VNĐ`, {
                style: {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                },
              });
            }
          }
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Lỗi khi tải dữ liệu khoản nợ';
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

  // Thêm hoặc cập nhật khoản nợ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!soTien || !ngayBatDau || !kyHan) {
      setError('Vui lòng nhập số tiền, kỳ hạn và ngày bắt đầu');
      toast.error('Vui lòng nhập số tiền, kỳ hạn và ngày bắt đầu', {
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
    const soTienNum = parseFloat(soTien);
    const soTienDaTraNum = parseFloat(soTienDaTra) || 0;
    const laiSuatNum = parseFloat(laiSuat) || 0;
    const kyHanNum = parseInt(kyHan);

    if (isNaN(soTienNum) || soTienNum <= 0) {
      setError('Số tiền phải là số dương hợp lệ');
      toast.error('Số tiền phải là số dương hợp lệ', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    if (isNaN(soTienDaTraNum) || soTienDaTraNum < 0) {
      setError('Số tiền đã trả không được âm');
      toast.error('Số tiền đã trả không được âm', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    if (laiSuat && (isNaN(laiSuatNum) || laiSuatNum < 0)) {
      setError('Lãi suất phải là số không âm');
      toast.error('Lãi suất phải là số không âm', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    if (isNaN(kyHanNum) || kyHanNum < 1) {
      setError('Kỳ hạn phải là số nguyên dương');
      toast.error('Kỳ hạn phải là số nguyên dương', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }

    const totalInterest = laiSuatNum ? (soTienNum * laiSuatNum * kyHanNum) / 100 : 0;
    if (soTienDaTraNum > soTienNum + totalInterest) {
      setError('Số tiền đã trả không được vượt quá tổng tiền gốc và lãi');
      toast.error('Số tiền đã trả không được vượt quá tổng tiền gốc và lãi', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }

    const startDate = new Date(ngayBatDau);
    const endDate = ngayKetThuc ? new Date(ngayKetThuc) : null;
    const nextPaymentDate = ngayTraTiepTheo ? new Date(ngayTraTiepTheo) : null;

    if (isNaN(startDate.getTime())) {
      setError('Ngày bắt đầu phải là ngày hợp lệ');
      toast.error('Ngày bắt đầu phải là ngày hợp lệ', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    if (endDate && isNaN(endDate.getTime())) {
      setError('Ngày kết thúc phải là ngày hợp lệ');
      toast.error('Ngày kết thúc phải là ngày hợp lệ', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    if (nextPaymentDate && isNaN(nextPaymentDate.getTime())) {
      setError('Ngày trả tiếp theo phải là ngày hợp lệ');
      toast.error('Ngày trả tiếp theo phải là ngày hợp lệ', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    if (endDate && endDate < startDate) {
      setError('Ngày kết thúc phải sau ngày bắt đầu');
      toast.error('Ngày kết thúc phải sau ngày bắt đầu', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    if (nextPaymentDate && nextPaymentDate < startDate) {
      setError('Ngày trả tiếp theo phải sau ngày bắt đầu');
      toast.error('Ngày trả tiếp theo phải sau ngày bắt đầu', {
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
        soTien: soTienNum,
        soTienDaTra: soTienDaTraNum,
        laiSuat: laiSuatNum || undefined,
        kyHan: kyHanNum,
        ngayBatDau,
        ngayKetThuc: ngayKetThuc || undefined,
        ngayTraTiepTheo: ngayTraTiepTheo || undefined,
        ghiChu,
        trangThai,
      };
      let res;
      if (editId) {
        res = await axios.put(`${process.env.REACT_APP_API_URL}/debts/${editId}`, payload);
        setDebts(debts.map((debt) => (debt._id === editId ? res.data.debt : debt)));
        toast.success('Cập nhật khoản nợ thành công!', {
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
          },
        });
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/debts`, payload);
        setDebts([...debts, res.data.debt]);
        toast.success('Thêm khoản nợ thành công!', {
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
          },
        });
      }
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi lưu khoản nợ';
      setError(errorMessage);
      toast.error(errorMessage, {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  };

  // Thêm lần trả nợ
  const handlePayDebt = async () => {
    if (!userId) {
      setError('Không tìm thấy userId. Vui lòng đăng nhập lại.');
      toast.error('Không tìm thấy userId. Vui lòng đăng nhập lại.', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    if (!soTienTra || parseFloat(soTienTra) <= 0) {
      setError('Vui lòng nhập số tiền trả hợp lệ');
      toast.error('Vui lòng nhập số tiền trả hợp lệ', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
      return;
    }
    try {
      const payload = { userId, soTienTra: parseFloat(soTienTra) };
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/debts/${payDebtId}/pay`, payload);
      if (res.data.debt && res.data.debt.soTienDaTra !== undefined) {
        setDebts(debts.map((debt) => (debt._id === payDebtId ? res.data.debt : debt)));
        toast.success('Thêm lần trả nợ thành công!', {
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
          },
        });
      } else {
        throw new Error(res.data.message || 'Dữ liệu trả nợ không hợp lệ');
      }
      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi thêm lần trả nợ';
      setError(errorMessage);
      toast.error(errorMessage, {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  };

  // Xóa khoản nợ
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khoản nợ này?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/debts/${id}?userId=${userId}`);
      setDebts(debts.filter((debt) => debt._id !== id));
      toast.success('Xóa khoản nợ thành công!', {
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
        },
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa khoản nợ';
      setError(errorMessage);
      toast.error(errorMessage, {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  };

  // Mở modal thêm khoản nợ
  const openAddModal = () => {
    setModalType('add');
    setEditId(null);
    setSoTien('');
    setSoTienDaTra('');
    setLaiSuat('');
    setKyHan('');
    setNgayBatDau('');
    setNgayKetThuc('');
    setNgayTraTiepTheo('');
    setGhiChu('');
    setTrangThai('Hoạt động');
    setError('');
    setShowModal(true);
  };

  // Mở modal sửa khoản nợ
  const openEditModal = (debt) => {
    setModalType('edit');
    setEditId(debt._id);
    setSoTien(debt.soTien?.toString() || '');
    setSoTienDaTra(debt.soTienDaTra?.toString() || '');
    setLaiSuat(debt.laiSuat?.toString() || '');
    setKyHan(debt.kyHan?.toString() || '');
    setNgayBatDau(debt.ngayBatDau ? new Date(debt.ngayBatDau).toISOString().split('T')[0] : '');
    setNgayKetThuc(debt.ngayKetThuc ? new Date(debt.ngayKetThuc).toISOString().split('T')[0] : '');
    setNgayTraTiepTheo(debt.ngayTraTiepTheo ? new Date(debt.ngayTraTiepTheo).toISOString().split('T')[0] : '');
    setGhiChu(debt.ghiChu || '');
    setTrangThai(debt.trangThai || 'Hoạt động');
    setError('');
    setShowModal(true);
  };

  // Mở modal trả nợ
  const openPayDebtModal = (debtId) => {
    setModalType('pay');
    setPayDebtId(debtId);
    setSoTienTra('');
    setError('');
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditId(null);
    setPayDebtId(null);
    setSoTien('');
    setSoTienDaTra('');
    setLaiSuat('');
    setKyHan('');
    setNgayBatDau('');
    setNgayKetThuc('');
    setNgayTraTiepTheo('');
    setGhiChu('');
    setTrangThai('Hoạt động');
    setSoTienTra('');
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

  // Hàm lọc và sắp xếp khoản nợ
  const filteredAndSortedDebts = useMemo(() => {
    let result = debts;

    // Lọc theo trạng thái
    if (filterStatus !== 'Tất cả') {
      result = result.filter(debt => debt.trangThai === filterStatus);
    }

    // Tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(debt => 
        debt.ghiChu?.toLowerCase().includes(query) ||
        debt.soTien.toString().includes(query)
      );
    }

    // Sắp xếp
    result = [...result].sort((a, b) => {
      if (sortConfig.key === 'ngayBatDau') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.ngayBatDau) - new Date(b.ngayBatDau)
          : new Date(b.ngayBatDau) - new Date(a.ngayBatDau);
      }
      if (sortConfig.key === 'soTien') {
        return sortConfig.direction === 'asc'
          ? a.soTien - b.soTien
          : b.soTien - a.soTien;
      }
      if (sortConfig.key === 'soTienDaTra') {
        return sortConfig.direction === 'asc'
          ? (a.soTienDaTra || 0) - (b.soTienDaTra || 0)
          : (b.soTienDaTra || 0) - (a.soTienDaTra || 0);
      }
      if (sortConfig.key === 'trangThai') {
        return sortConfig.direction === 'asc'
          ? a.trangThai.localeCompare(b.trangThai)
          : b.trangThai.localeCompare(a.trangThai);
      }
      return 0;
    });

    return result;
  }, [debts, filterStatus, searchQuery, sortConfig]);

  // Hàm xử lý kéo thả
  const handleDragStart = (debt) => {
    setDraggedDebt(debt);
  };

  const handleDragOver = (e, debt) => {
    e.preventDefault();
    if (draggedDebt && draggedDebt._id !== debt._id) {
      const items = Array.from(filteredAndSortedDebts);
      const draggedIndex = items.findIndex(item => item._id === draggedDebt._id);
      const dropIndex = items.findIndex(item => item._id === debt._id);

      const newItems = Array.from(items);
      newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedDebt);

      // Cập nhật thứ tự ưu tiên trong database
      const updatePriority = async () => {
        try {
          await axios.put(`${process.env.REACT_APP_API_URL}/debts/priority`, {
            userId,
            debts: newItems.map((debt, index) => ({
              id: debt._id,
              priority: index
            }))
          });
          setDebts(newItems);
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
    setDraggedDebt(null);
  };

  // Hàm chia sẻ khoản nợ
  const handleShare = async (debt) => {
    try {
      const shareData = {
        title: 'Khoản nợ',
        text: `Khoản nợ: ${debt.soTien.toLocaleString()} VNĐ\nĐã trả: ${(debt.soTienDaTra || 0).toLocaleString()} VNĐ\nNgày bắt đầu: ${new Date(debt.ngayBatDau).toLocaleDateString()}\nTrạng thái: ${debt.trangThai}`,
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
    if (!reminderDate || !selectedDebt) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/reminders`, {
        userId,
        debtId: selectedDebt._id,
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
      setSelectedDebt(null);
    } catch (err) {
      toast.error('Lỗi khi thêm nhắc nhở', {
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        },
      });
    }
  };

  // Tính toán dữ liệu cho biểu đồ
  const chartData = useMemo(() => ({
    pie: {
      labels: ['Hoạt động', 'Đã thanh toán', 'Quá hạn'],
      datasets: [{
        data: [
          debts.filter(debt => debt.trangThai === 'Hoạt động').length,
          debts.filter(debt => debt.trangThai === 'Đã thanh toán').length,
          debts.filter(debt => debt.trangThai === 'Quá hạn').length
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
        borderColor: ['#059669', '#2563EB', '#DC2626'],
        borderWidth: 1
      }]
    },
    line: {
      labels: debts.map(debt => new Date(debt.ngayBatDau).toLocaleDateString('vi-VN')),
      datasets: [{
        label: 'Số tiền nợ',
        data: debts.map(debt => debt.soTien),
        borderColor: '#3B82F6',
        tension: 0.4
      }]
    }
  }), [debts]);

  // Tính toán các chỉ số thống kê
  const stats = useMemo(() => {
    const totalDebt = debts.reduce((sum, debt) => sum + (debt.soTien || 0), 0);
    const totalPaid = debts.reduce((sum, debt) => sum + (debt.soTienDaTra || 0), 0);
    const totalInterest = debts.reduce((sum, debt) => {
    const soTien = debt.soTien || 0;
    const laiSuat = debt.laiSuat || 0;
    const kyHan = debt.kyHan || 1;
      return sum + (soTien * laiSuat * kyHan) / 100;
  }, 0);
    const activeDebts = debts.filter(debt => debt.trangThai === 'Hoạt động').length;
    const overdueDebts = debts.filter(debt => debt.trangThai === 'Quá hạn').length;
    const paidDebts = debts.filter(debt => debt.trangThai === 'Đã thanh toán').length;

    return {
      totalDebt,
      totalPaid,
      totalInterest,
      activeDebts,
      overdueDebts,
      paidDebts,
      remainingDebt: totalDebt + totalInterest - totalPaid
    };
  }, [debts]);

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
            <CreditCardIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Khoản Nợ
          </h2>
          <p className="text-gray-600 font-medium">Theo dõi và quản lý các khoản nợ của bạn</p>
        </motion.div>

        {/* Tổng quan */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng nợ</h3>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalDebt.toLocaleString()} VNĐ
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Còn lại: {stats.remainingDebt.toLocaleString()} VNĐ
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Đã trả</h3>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalPaid.toLocaleString()} VNĐ
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Tỷ lệ: {stats.totalDebt ? ((stats.totalPaid / (stats.totalDebt + stats.totalInterest)) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng lãi</h3>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalInterest.toLocaleString()} VNĐ
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Quá hạn: {stats.overdueDebts} khoản
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
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Quá hạn">Quá hạn</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium whitespace-nowrap">Sắp xếp:</label>
              <select
                value={sortConfig.key}
                onChange={(e) => handleSort(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="ngayBatDau">Ngày bắt đầu</option>
                <option value="soTien">Số tiền</option>
                <option value="soTienDaTra">Đã trả</option>
                <option value="trangThai">Trạng thái</option>
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
                placeholder="Tìm kiếm khoản nợ..."
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
                <PlusIcon className="h-5 w-5" />
                <span>Khoản nợ</span>
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
                      data={chartData.pie}
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
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                    <span>Xu hướng khoản nợ</span>
                  </h3>
                  <div className="h-64">
                    <Line
                      data={chartData.line}
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
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Tổng số khoản nợ</h4>
                      <p className="text-2xl font-bold text-blue-600">{debts.length}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-blue-600">Hoạt động:</span>
                        <span className="text-sm font-medium text-blue-800">{stats.activeDebts}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-green-800 mb-1">Đã thanh toán</h4>
                      <p className="text-2xl font-bold text-green-600">{stats.paidDebts}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-green-600">Tỷ lệ:</span>
                        <span className="text-sm font-medium text-green-800">
                          {debts.length ? ((stats.paidDebts / debts.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Quá hạn</h4>
                      <p className="text-2xl font-bold text-red-600">{stats.overdueDebts}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-red-600">Tỷ lệ:</span>
                        <span className="text-sm font-medium text-red-800">
                          {debts.length ? ((stats.overdueDebts / debts.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-purple-800 mb-1">Tổng lãi suất</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.totalInterest.toLocaleString()} VNĐ
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-purple-600">Trung bình:</span>
                        <span className="text-sm font-medium text-purple-800">
                          {debts.length ? (stats.totalInterest / debts.length).toLocaleString() : 0} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Danh sách khoản nợ */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredAndSortedDebts.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có khoản nợ nào</h3>
              <p className="text-gray-500">Hãy thêm khoản nợ đầu tiên của bạn</p>
            </div>
          ) : (
            filteredAndSortedDebts.map((debt, index) => {
              const totalAmount = debt.soTien + (debt.soTien * (debt.laiSuat || 0) * debt.kyHan) / 100;
              const remainingAmount = totalAmount - (debt.soTienDaTra || 0);
              const progress = totalAmount ? ((debt.soTienDaTra || 0) / totalAmount) * 100 : 0;

              return (
                <motion.div
                  key={debt._id}
                  variants={itemVariants}
                  draggable
                  onDragStart={() => handleDragStart(debt)}
                  onDragOver={(e) => handleDragOver(e, debt)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200 ${
                    draggedDebt?._id === debt._id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Khoản nợ #{index + 1}</h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        debt.trangThai === 'Hoạt động'
                          ? 'bg-green-100 text-green-800'
                          : debt.trangThai === 'Đã thanh toán'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {debt.trangThai}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Số tiền nợ:</span>
                      <span className="font-semibold text-indigo-800">
                        {debt.soTien.toLocaleString()} VNĐ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Đã trả:</span>
                      <span className="font-semibold text-green-600">
                        {(debt.soTienDaTra || 0).toLocaleString()} VNĐ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Còn lại:</span>
                      <span className="font-semibold text-red-600">
                        {remainingAmount.toLocaleString()} VNĐ
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
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

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Lãi suất:</span>
                      <span className="font-semibold text-gray-800">
                        {debt.laiSuat || 0}%/tháng
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Kỳ hạn:</span>
                      <span className="font-semibold text-gray-800">
                        {debt.kyHan} tháng
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Ngày bắt đầu:</span>
                      <span className="text-gray-800">
                        {new Date(debt.ngayBatDau).toLocaleDateString()}
                      </span>
                    </div>

                    {debt.ghiChu && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{debt.ghiChu}</p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-4">
                      <motion.button
                        onClick={() => {
                          setSelectedDebt(debt);
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
                        onClick={() => handleShare(debt)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Chia sẻ khoản nợ"
                      >
                        <ShareIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => openPayDebtModal(debt._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Trả nợ"
                      >
                        <CreditCardIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => openEditModal(debt)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                        title="Sửa khoản nợ"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(debt._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Xóa khoản nợ"
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

        {/* Modal thêm/sửa/trả nợ */}
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
                        <CreditCardIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {modalType === 'add' ? 'Thêm Khoản Nợ' : modalType === 'edit' ? 'Sửa Khoản Nợ' : 'Trả Nợ'}
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

                <form onSubmit={modalType === 'pay' ? handlePayDebt : handleSubmit} className="p-6 space-y-6">
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

                  {modalType === 'pay' ? (
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                        {/* <CreditCardIcon className="h-4 w-4 text-blue-600" /> */}
                        <span>Số Tiền Trả</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={soTienTra}
                          onChange={(e) => setSoTienTra(e.target.value)}
                          className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300"
                          required
                          step="0.01"
                          min="0.01"
                          placeholder="..."
                        />
                        <BanknotesIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Số tiền nợ */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <BanknotesIcon className="h-4 w-4 text-blue-600" />
                          <span>Số Tiền Nợ</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={soTien}
                            onChange={(e) => setSoTien(e.target.value)}
                            className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300"
                            required
                            step="0.01"
                            min="0.01"
                            placeholder="Số tiền nợ"
                          />
                          <BanknotesIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                        </div>
                      </div>

                      {/* Số tiền đã trả */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <ChartBarIcon className="h-4 w-4 text-green-600" />
                          <span>Số Tiền Đã Trả</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={soTienDaTra}
                            onChange={(e) => setSoTienDaTra(e.target.value)}
                            className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-green-500/20 focus:shadow-lg transition-all duration-300"
                            step="0.01"
                            min="0"
                            placeholder="Số tiền đã trả"
                          />
                          <ChartBarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        </div>
                      </div>

                      {/* Lãi suất */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <ChartPieIcon className="h-4 w-4 text-purple-600" />
                          <span>Lãi Suất (%)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={laiSuat}
                            onChange={(e) => setLaiSuat(e.target.value)}
                            className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg transition-all duration-300"
                            step="0.01"
                            min="0"
                            placeholder="Lãi suất"
                          />
                          <ChartPieIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                        </div>
                      </div>

                      {/* Kỳ hạn */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <ClockIcon className="h-4 w-4 text-indigo-600" />
                          <span>Kỳ Hạn (tháng)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={kyHan}
                            onChange={(e) => setKyHan(e.target.value)}
                            className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:shadow-lg transition-all duration-300"
                            required
                            min="1"
                            placeholder="Kỳ hạn"
                          />
                          <ClockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500" />
                        </div>
                      </div>

                      {/* Ngày bắt đầu */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <CalendarIcon className="h-4 w-4 text-pink-600" />
                          <span>Ngày Bắt Đầu</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={ngayBatDau}
                            onChange={(e) => setNgayBatDau(e.target.value)}
                            className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-pink-500/20 focus:shadow-lg transition-all duration-300"
                            required
                          />
                          <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-500" />
                        </div>
                      </div>

                      {/* Ngày kết thúc */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <CalendarIcon className="h-4 w-4 text-pink-600" />
                          <span>Ngày Kết Thúc</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={ngayKetThuc}
                            onChange={(e) => setNgayKetThuc(e.target.value)}
                            className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-pink-500/20 focus:shadow-lg transition-all duration-300"
                          />
                          <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-500" />
                        </div>
                      </div>

                      {/* Ngày trả tiếp theo */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <CalendarIcon className="h-4 w-4 text-pink-600" />
                          <span>Ngày Trả Tiếp Theo</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={ngayTraTiepTheo}
                            onChange={(e) => setNgayTraTiepTheo(e.target.value)}
                            className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-pink-500/20 focus:shadow-lg transition-all duration-300"
                          />
                          <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-500" />
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

                      {/* Trạng thái */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                          <span>Trạng Thái</span>
                        </label>
                        <div className="relative">
                          <select
                            value={trangThai}
                            onChange={(e) => setTrangThai(e.target.value)}
                            className="w-full p-4 pl-12 border-0 rounded-2xl bg-white/70 backdrop-blur-sm text-gray-800 shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:shadow-lg transition-all duration-300 appearance-none"
                          >
                            <option value="Hoạt động">Hoạt động</option>
                            <option value="Đã thanh toán">Đã thanh toán</option>
                            <option value="Quá hạn">Quá hạn</option>
                          </select>
                          <CheckCircleIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  )}

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
                      <span>
                        {modalType === 'add' ? 'Thêm Khoản Nợ' : 
                         modalType === 'edit' ? 'Cập Nhật Khoản Nợ' : 
                         'Trả Nợ'}
                      </span>
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
                        setSelectedDebt(null);
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
                        setSelectedDebt(null);
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
      </div>
    </motion.div>
  );
};

export default DebtManagement;