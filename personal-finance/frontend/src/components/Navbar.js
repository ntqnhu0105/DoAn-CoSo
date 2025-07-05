"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import axios from "axios"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import {
  HomeIcon,
  WalletIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  ChartPieIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  TagIcon,
  CalculatorIcon,
  FlagIcon,
  DocumentChartBarIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
  StarIcon,
  CheckIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline"

const Navbar = () => {
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showFinanceDropdown, setShowFinanceDropdown] = useState(false)
  const [showGoalsDropdown, setShowGoalsDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showModalNotification, setShowModalNotification] = useState(false)
  const [currentNotification, setCurrentNotification] = useState(null)
  const [floatingNotification, setFloatingNotification] = useState(null)
  const [audioContext, setAudioContext] = useState(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showNewsTicker, setShowNewsTicker] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [tickerSpeed, setTickerSpeed] = useState(20)
  const [tickerColor, setTickerColor] = useState('emerald')
  const [isHovered, setIsHovered] = useState(false)
  const controls = useAnimation()
  const [currentX, setCurrentX] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all") // all, unread, read
  const [notificationType, setNotificationType] = useState("all") // all, important, normal
  const [showFilters, setShowFilters] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const tickerRef = useRef(null)
  const styleSheetRef = useRef(null)
  const [soundSettings, setSoundSettings] = useState(() => {
    const savedSettings = localStorage.getItem('soundSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      duration: 0.5,
      delayTime: 0.3,
      delayFeedback: 0.3,
      reverbTime: 2.0,
      distortionAmount: 20,
      enabled: true // Thêm tùy chọn bật/tắt âm thanh
    };
  })
  const [showSoundSettings, setShowSoundSettings] = useState(false)

  const userId = localStorage.getItem("userId")
  const userName = localStorage.getItem("userName")
  const anhDaiDien = localStorage.getItem("anhDaiDien")
    ? `${process.env.REACT_APP_API_URL}${localStorage.getItem("anhDaiDien")}`
    : ""
  const navigate = useNavigate()
  const location = useLocation()

  // Cleanup function for AudioContext
  const cleanupAudioContext = useCallback(() => {
    if (audioContext) {
      audioContext.close().catch(console.error);
      setAudioContext(null);
    }
  }, [audioContext]);

  // Cleanup function for style sheet
  const cleanupStyleSheet = useCallback(() => {
    if (styleSheetRef.current && document.head.contains(styleSheetRef.current)) {
      document.head.removeChild(styleSheetRef.current);
      styleSheetRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioContext();
      cleanupStyleSheet();
    };
  }, [cleanupAudioContext, cleanupStyleSheet]);

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/register") return
    if (!userId) navigate("/")
  }, [userId, navigate, location.pathname])

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/${userId}`)
      setNotifications(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tải thông báo")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const vibrateOnNotification = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]); // Pattern: vibrate, pause, vibrate
    }
  }, []);

  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].daDoc) {
      vibrateOnNotification();
    }
  }, [notifications, vibrateOnNotification]);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/notifications/${id}/read`, { userId })
      setNotifications(prev => prev.map((notif) => 
        (notif._id === id ? { ...notif, daDoc: true } : notif)
      ))
      toast.success("Đánh dấu thông báo đã đọc!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi đánh dấu thông báo")
    }
  }, [userId])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("email")
    localStorage.removeItem("ngaySinh")
    localStorage.removeItem("gioiTinh")
    localStorage.removeItem("anhDaiDien")
    localStorage.removeItem("token")
    navigate("/")
    toast.success("Đăng xuất thành công!")
  }, [navigate])

  const unreadCount = notifications.filter((notif) => !notif.daDoc).length

  const financeMenuItems = [
    { to: "/dashboard", label: "Giao dịch", icon: DocumentTextIcon, description: "Quản lý thu chi" },
    { to: "/accounts", label: "Tài khoản", icon: UserCircleIcon, description: "Tài khoản ngân hàng" },
    { to: "/categories", label: "Danh mục", icon: TagIcon, description: "Phân loại chi tiêu" },
    { to: "/budgets", label: "Ngân sách", icon: CalculatorIcon, description: "Lập kế hoạch chi tiêu" },
  ]

  const goalsMenuItems = [
    { to: "/saving-goals", label: "Tiết kiệm", icon: ArchiveBoxIcon, description: "Mục tiêu tiết kiệm" },
    { to: "/debts", label: "Khoản nợ", icon: CreditCardIcon, description: "Quản lý nợ vay" },
  ]

  const showDesktopNotification = (notification) => {
    if (Notification.permission === "granted") {
      new Notification("ViSmart", {
        body: notification.noiDung,
        icon: "/logo.png",
        requireInteraction: true // Yêu cầu người dùng tương tác để đóng
      });
    }
  };

  // Yêu cầu quyền notification khi component mount
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const handleNewNotification = (notification) => {
    if (notification.quanTrong) {
      setCurrentNotification(notification);
      setShowModalNotification(true);
    }
  };

  const showToastNotification = (notification) => {
    toast(
      <div className="flex items-center space-x-3">
        <BellIcon className="h-5 w-5 text-white" />
        <div>
          <p className="font-medium text-white">{notification.noiDung}</p>
          <p className="text-sm text-white/80">{new Date(notification.ngay).toLocaleString()}</p>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false, // Không tự đóng
        closeOnClick: false, // Không đóng khi click
        draggable: true, // Cho phép kéo
        closeButton: true, // Hiển thị nút đóng
        className: "bg-gradient-to-r from-emerald-500 to-blue-600",
        bodyClassName: "p-4",
        progressClassName: "bg-white/20",
        onClick: () => handleMarkAsRead(notification._id)
      }
    );
  };

  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].daDoc) {
      setFloatingNotification(notifications[0]);
      const timer = setTimeout(() => {
        setFloatingNotification(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Thêm hàm khởi tạo AudioContext
  const initAudio = () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);
    } catch (error) {
      console.log('Không thể khởi tạo AudioContext:', error);
    }
  };

  // Hàm phát âm thanh thông báo
  const playNotificationSound = useCallback(() => {
    if (!audioContext || !hasInteracted || !soundSettings.enabled) return;
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const delay = audioContext.createDelay();
      const delayGain = audioContext.createGain();
      const reverb = audioContext.createConvolver();
      const distortion = audioContext.createWaveShaper();
      // Không còn compressor

      // Delay
      delay.delayTime.setValueAtTime(soundSettings.delayTime, audioContext.currentTime);
      delayGain.gain.setValueAtTime(soundSettings.delayFeedback, audioContext.currentTime);

      // Reverb
      const reverbBuffer = audioContext.createBuffer(2, audioContext.sampleRate * soundSettings.reverbTime, audioContext.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const channelData = reverbBuffer.getChannelData(channel);
        for (let i = 0; i < reverbBuffer.length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbBuffer.length, 2);
        }
      }
      reverb.buffer = reverbBuffer;

      // Distortion
      const makeDistortionCurve = (amount) => {
        const samples = 44100;
        const curve = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
          const x = (i * 2) / samples - 1;
          curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
        }
        return curve;
      };
      distortion.curve = makeDistortionCurve(soundSettings.distortionAmount);

      // Kết nối
      oscillator.connect(distortion);
      distortion.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(delay);
      delay.connect(reverb);
      distortion.connect(reverb);
      reverb.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + soundSettings.duration);
    } catch (error) {
      console.log('Lỗi khi phát âm thanh:', error);
    }
  }, [audioContext, hasInteracted, soundSettings]);

  // Thêm hàm test âm thanh
  const testSound = () => {
    playNotificationSound();
  };

  // Thêm hàm toggle âm thanh
  const toggleSound = () => {
    setSoundSettings(prev => {
      const newSettings = {
        ...prev,
        enabled: !prev.enabled
      };
      localStorage.setItem('soundSettings', JSON.stringify(newSettings));
      
      // Hiển thị toast notification
      toast.success(
        newSettings.enabled ? "Đã bật âm thanh thông báo" : "Đã tắt âm thanh thông báo",
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      
      return newSettings;
    });
  };

  // Thêm hàm cập nhật settings
  const handleSoundSettingChange = (setting, value) => {
    setSoundSettings(prev => {
      const newSettings = {
        ...prev,
        [setting]: value
      };
      localStorage.setItem('soundSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  // Thêm event listener cho tương tác người dùng
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        initAudio();
      }
    };

    // Thêm các event listeners
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      // Cleanup event listeners
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [hasInteracted]);

  // Sửa lại useEffect cho notifications
  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].daDoc && hasInteracted && soundSettings.enabled) {
      // Chỉ phát âm thanh nếu thông báo mới được thêm vào (không phải khi load lần đầu)
      const lastNotification = notifications[0];
      const now = new Date();
      const notificationTime = new Date(lastNotification.ngay);
      const timeDiff = now - notificationTime;
      
      // Chỉ phát âm thanh nếu thông báo được tạo trong vòng 5 giây qua
      if (timeDiff < 5000) {
        playNotificationSound();
      }
    }
  }, [notifications, hasInteracted, soundSettings.enabled, playNotificationSound]);

  // Sửa lại useEffect cho ticker animation
  useEffect(() => {
    // Bắt đầu animation ngay khi component mount
    controls.start({
      x: [0, -1000],
      transition: {
        x: {
          duration: tickerSpeed,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 0
        }
      }
    })

    // Cleanup function
    return () => {
      controls.stop()
    }
  }, [tickerSpeed, controls])

  // Sửa lại handleMouseEnter
  const handleMouseEnter = () => {
    if (tickerRef.current) {
      const transform = getComputedStyle(tickerRef.current).transform
      if (transform !== 'none') {
        const matrix = transform.match(/matrix.*\((.+)\)/)[1].split(', ')
        const translateX = parseFloat(matrix[4])
        setCurrentX(translateX)
      }
    }
    setIsHovered(true)
    controls.stop() // Dừng animation khi hover
  }

  // Sửa lại handleMouseLeave
  const handleMouseLeave = () => {
    setIsHovered(false)
    // Tiếp tục animation từ vị trí hiện tại
    controls.start({
      x: [currentX, -1000],
      transition: {
        x: {
          duration: tickerSpeed,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 0
        }
      }
    })
  }

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.noiDung.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesReadFilter = activeFilter === "all" || 
      (activeFilter === "unread" && !notif.daDoc) || 
      (activeFilter === "read" && notif.daDoc)
    const matchesTypeFilter = notificationType === "all" || 
      (notificationType === "important" && notif.quanTrong) || 
      (notificationType === "normal" && !notif.quanTrong)
    
    return matchesSearch && matchesReadFilter && matchesTypeFilter
  })

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/notifications/${id}`)
      setNotifications(notifications.filter(notif => notif._id !== id))
      toast.success("Đã xóa thông báo!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa thông báo")
    }
  }

  const handleToggleImportant = async (id) => {
    try {
      const notif = notifications.find(n => n._id === id)
      await axios.put(`${process.env.REACT_APP_API_URL}/notifications/${id}/important`, {
        userId,
        quanTrong: !notif.quanTrong
      })
      setNotifications(notifications.map((notif) => 
        notif._id === id ? { ...notif, quanTrong: !notif.quanTrong } : notif
      ))
      toast.success(notif.quanTrong ? "Đã bỏ đánh dấu quan trọng" : "Đã đánh dấu quan trọng")
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật thông báo")
    }
  }

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(n => n !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id))
    }
  }

  const handleBulkMarkAsRead = async () => {
    try {
      await Promise.all(
        selectedNotifications.map(id =>
          axios.put(`${process.env.REACT_APP_API_URL}/notifications/${id}/read`, { userId })
        )
      )
      setNotifications(notifications.map(notif => 
        selectedNotifications.includes(notif._id) ? { ...notif, daDoc: true } : notif
      ))
      setSelectedNotifications([])
      setIsMultiSelectMode(false)
      toast.success("Đã đánh dấu đã đọc các thông báo đã chọn!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật thông báo")
    }
  }

  const handleBulkMarkAsImportant = async () => {
    try {
      await Promise.all(
        selectedNotifications.map(id =>
          axios.put(`${process.env.REACT_APP_API_URL}/notifications/${id}/important`, {
            userId,
            quanTrong: true
          })
        )
      )
      setNotifications(notifications.map(notif => 
        selectedNotifications.includes(notif._id) ? { ...notif, quanTrong: true } : notif
      ))
      setSelectedNotifications([])
      setIsMultiSelectMode(false)
      toast.success("Đã đánh dấu quan trọng các thông báo đã chọn!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật thông báo")
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedNotifications.map(id =>
          axios.delete(`${process.env.REACT_APP_API_URL}/notifications/${id}`)
        )
      )
      setNotifications(notifications.filter(notif => !selectedNotifications.includes(notif._id)))
      setSelectedNotifications([])
      setIsMultiSelectMode(false)
      toast.success("Đã xóa các thông báo đã chọn!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa thông báo")
    }
  }

  // Thêm style cho ticker animation
  const tickerStyle = {
    animation: `ticker ${tickerSpeed}s linear infinite`,
    animationPlayState: isHovered ? 'paused' : 'running'
  }

  // Thêm keyframes animation vào style
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    @keyframes ticker {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }
  `
  document.head.appendChild(styleSheet)

  // Cleanup style khi component unmount
  useEffect(() => {
    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  // Sửa lại phần render của ticker
  return (
    <>
      <nav className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/overview"
                className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-emerald-500 to-blue-600 p-2.5 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                >
                  <WalletIcon className="h-6 w-6 text-white" />
                </motion.div>
                <div className="hidden sm:block">
                  <motion.span 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"
                  >
                    ViSmart
                  </motion.span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {userId ? (
                <>
                  {/* Overview */}
                  <Link
                    to="/overview"
                    className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      location.pathname === "/overview"
                        ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`p-1.5 rounded-lg ${
                        location.pathname === "/overview"
                          ? "bg-white/20"
                          : "bg-gray-100 group-hover:bg-emerald-100"
                    }`}
                  >
                    <HomeIcon className="h-5 w-5" />
                    </motion.div>
                    <span className="font-medium">Tổng quan</span>
                  </Link>

                  {/* Finance Dropdown */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowFinanceDropdown(!showFinanceDropdown)}
                      whileHover={{ scale: 1.02 }}
                      className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                        showFinanceDropdown
                          ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`p-1.5 rounded-lg ${
                          showFinanceDropdown
                            ? "bg-white/20"
                            : "bg-gray-100 group-hover:bg-emerald-100"
                        }`}
                    >
                      <CurrencyDollarIcon className="h-5 w-5" />
                      </motion.div>
                      <span className="font-medium">Tài chính</span>
                      <motion.div 
                        animate={{ rotate: showFinanceDropdown ? 180 : 0 }} 
                        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {showFinanceDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 mt-2 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 z-50"
                        >
                          <div className="p-2">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <h3 className="text-sm font-semibold text-gray-900">Quản lý tài chính</h3>
                              <p className="text-xs text-gray-500 mt-1">Theo dõi và quản lý chi tiêu của bạn</p>
                            </div>
                            <div className="py-2">
                              {financeMenuItems.map((item) => (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    location.pathname === item.to
                                      ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                                      : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                                  }`}
                                  onClick={() => setShowFinanceDropdown(false)}
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`p-2 rounded-lg ${
                                      location.pathname === item.to
                                        ? "bg-white/20"
                                        : "bg-gray-100 group-hover:bg-emerald-100"
                                    }`}
                                  >
                                    <item.icon className="h-5 w-5" />
                                  </motion.div>
                                  <div>
                                    <p className="font-medium">{item.label}</p>
                                    <p
                                      className={`text-xs ${
                                        location.pathname === item.to ? "text-white/80" : "text-gray-500"
                                      }`}
                                    >
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Goals Dropdown */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowGoalsDropdown(!showGoalsDropdown)}
                      whileHover={{ scale: 1.02 }}
                      className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                        showGoalsDropdown
                          ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`p-1.5 rounded-lg ${
                          showGoalsDropdown
                            ? "bg-white/20"
                            : "bg-gray-100 group-hover:bg-emerald-100"
                        }`}
                    >
                      <FlagIcon className="h-5 w-5" />
                      </motion.div>
                      <span className="font-medium">Mục tiêu</span>
                      <motion.div 
                        animate={{ rotate: showGoalsDropdown ? 180 : 0 }} 
                        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {showGoalsDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 mt-2 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 z-50"
                        >
                          <div className="p-2">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <h3 className="text-sm font-semibold text-gray-900">Mục tiêu tài chính</h3>
                              <p className="text-xs text-gray-500 mt-1">Đặt và theo dõi mục tiêu của bạn</p>
                            </div>
                            <div className="py-2">
                              {goalsMenuItems.map((item) => (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    location.pathname === item.to
                                      ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                                      : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                                  }`}
                                  onClick={() => setShowGoalsDropdown(false)}
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`p-2 rounded-lg ${
                                      location.pathname === item.to
                                        ? "bg-white/20"
                                        : "bg-gray-100 group-hover:bg-emerald-100"
                                    }`}
                                  >
                                    <item.icon className="h-5 w-5" />
                                  </motion.div>
                                  <div>
                                    <p className="font-medium">{item.label}</p>
                                    <p
                                      className={`text-xs ${
                                        location.pathname === item.to ? "text-white/80" : "text-gray-500"
                                      }`}
                                    >
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Investments */}
                  <Link
                    to="/investments"
                    className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      location.pathname === "/investments"
                        ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`p-1.5 rounded-lg ${
                        location.pathname === "/investments"
                          ? "bg-white/20"
                          : "bg-gray-100 group-hover:bg-emerald-100"
                    }`}
                  >
                    <ArrowTrendingUpIcon className="h-5 w-5" />
                    </motion.div>
                    <span className="font-medium">Đầu tư</span>
                  </Link>

                  {/* Reports */}
                  <Link
                    to="/reports"
                    className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      location.pathname === "/reports"
                        ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`p-1.5 rounded-lg ${
                        location.pathname === "/reports"
                          ? "bg-white/20"
                          : "bg-gray-100 group-hover:bg-emerald-100"
                    }`}
                  >
                    <ChartPieIcon className="h-5 w-5" />
                    </motion.div>
                    <span className="font-medium">Báo cáo</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 shadow-lg font-medium"
                >
                  Đăng Nhập
                </Link>
              )}
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-2">
              {userId && (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowNotifications(!showNotifications)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 rounded-xl transition-all duration-300 ${
                        showNotifications ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white" : ""
                      }`}
                    >
                      <BellIcon className="h-6 w-6" />
                      {unreadCount > 0 && (
                        <motion.span
                          animate={{ 
                            scale: [1, 1.2, 1],
                            backgroundColor: ["#ef4444", "#dc2626", "#ef4444"]
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut"
                          }}
                          className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </motion.span>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-[90vw] sm:w-[400px] md:w-[450px] lg:w-[500px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 z-50 max-h-[80vh] overflow-hidden"
                        >
                          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <motion.div
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.5 }}
                                  className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600"
                                >
                                  <BellIcon className="h-5 w-5 text-white" />
                                </motion.div>
                                <div>
                              <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
                              {unreadCount > 0 && (
                                    <span className="text-sm text-gray-500">
                                      {unreadCount} thông báo mới
                                </span>
                              )}
                            </div>
                          </div>
                              <div className="flex items-center space-x-2">
                                {isMultiSelectMode ? (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setIsMultiSelectMode(false)
                                      setSelectedNotifications([])
                                    }}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                                  >
                                    <XMarkIcon className="h-5 w-5" />
                                  </motion.button>
                                ) : (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsMultiSelectMode(true)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                                  >
                                    <CheckIcon className="h-5 w-5" />
                                  </motion.button>
                                )}
                                {/* Nút bánh răng cài đặt âm thanh chuyển lên đây */}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setShowSoundSettings(!showSoundSettings)}
                                  className={`relative p-2 rounded-xl transition-colors duration-200 ${showSoundSettings ? "bg-emerald-100 text-emerald-600" : "text-gray-600 hover:bg-gray-100"}`}
                                >
                                  <Cog6ToothIcon className="h-5 w-5" />
                                  {/* Sound status indicator */}
                                  {!soundSettings.enabled && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                                    />
                                  )}
                                </motion.button>
                              </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative mb-4">
                              <input
                                type="text"
                                placeholder="Tìm kiếm thông báo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                              />
                              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex flex-col items-center w-full mb-4 gap-2">
                              <div className="flex w-full justify-center">
                                <div className="flex-1 flex space-x-1 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl max-w-[400px]">
                                  {['all', 'unread', 'read'].map((filter) => (
                                    <button
                                      key={filter}
                                      onClick={() => setActiveFilter(filter)}
                                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-center
                                        ${activeFilter === filter
                                          ? 'bg-white text-emerald-600 shadow-sm'
                                          : 'text-gray-600 hover:text-gray-900'}
                                      `}
                                    >
                                      {filter === 'all' ? 'Tất cả' : filter === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
                                    </button>
                                  ))}
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setShowFilters(!showFilters)}
                                  className={`ml-2 p-2 rounded-xl transition-colors duration-200 self-center
                                    ${showFilters ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                  <FunnelIcon className="h-5 w-5" />
                                </motion.button>
                              </div>
                              {/* Type Filters */}
                              <AnimatePresence>
                                {showFilters && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden w-full flex justify-center"
                                  >
                                    <div className="flex flex-1 justify-center gap-2 max-w-[400px] mt-2">
                                      {['all', 'important', 'normal'].map((type) => (
                                        <button
                                          key={type}
                                          onClick={() => setNotificationType(type)}
                                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-center
                                            ${notificationType === type
                                              ? 'bg-emerald-100 text-emerald-600'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                                          `}
                                        >
                                          {type === 'all' ? 'Tất cả' : type === 'important' ? 'Quan trọng' : 'Thông thường'}
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Bulk Actions */}
                            {isMultiSelectMode && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl mb-4 border border-gray-100"
                              >
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedNotifications.length === filteredNotifications.length}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                  />
                                  <span className="text-sm text-gray-600">
                                    {selectedNotifications.length} thông báo đã chọn
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleBulkMarkAsRead}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                                  >
                                    <CheckCircleIcon className="h-5 w-5" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleBulkMarkAsImportant}
                                    className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                                  >
                                    <StarIcon className="h-5 w-5" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleBulkDelete}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Form cài đặt âm thanh */}
                          <AnimatePresence>
                            {showSoundSettings && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 border-b border-gray-100 bg-gray-50">
                                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Cài đặt âm thanh thông báo</h3>
                                  
                                  {/* Toggle Sound Switch */}
                                  <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-xl border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                      <div className={`p-2 rounded-lg ${soundSettings.enabled ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                        <BellIcon className={`h-5 w-5 ${soundSettings.enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">Âm thanh thông báo</p>
                                        <p className="text-xs text-gray-500">
                                          {soundSettings.enabled ? 'Đang bật' : 'Đang tắt'}
                                        </p>
                                      </div>
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={toggleSound}
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                                        soundSettings.enabled ? 'bg-emerald-600' : 'bg-gray-300'
                                      }`}
                                    >
                                      <motion.span
                                        animate={{ x: soundSettings.enabled ? 20 : 2 }}
                                        transition={{ duration: 0.2 }}
                                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
                                      />
                                    </motion.button>
                                  </div>
                                  
                                  <div className="pr-2 space-y-4 custom-scrollbar">
                                    {/* Duration */}
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700">Thời lượng</span>
                                        <span className="text-sm text-gray-500">Envelope Duration</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="range"
                                          min="0.1"
                                          max="1"
                                          step="0.1"
                                          value={soundSettings.duration}
                                          onChange={(e) => handleSoundSettingChange('duration', Number(e.target.value))}
                                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 w-16 text-right">{soundSettings.duration}s</span>
                                      </div>
                                    </div>

                                    {/* Delay Controls */}
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700">Độ trễ</span>
                                        <span className="text-sm text-gray-500">Delay Time</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="range"
                                          min="0"
                                          max="1"
                                          step="0.1"
                                          value={soundSettings.delayTime}
                                          onChange={(e) => handleSoundSettingChange('delayTime', Number(e.target.value))}
                                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 w-16 text-right">{soundSettings.delayTime}s</span>
                                      </div>
                                    </div>

                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700">Phản hồi trễ</span>
                                        <span className="text-sm text-gray-500">Delay Feedback</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="range"
                                          min="0"
                                          max="0.9"
                                          step="0.1"
                                          value={soundSettings.delayFeedback}
                                          onChange={(e) => handleSoundSettingChange('delayFeedback', Number(e.target.value))}
                                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 w-16 text-right">{Math.round(soundSettings.delayFeedback * 100)}%</span>
                                      </div>
                                    </div>

                                    {/* Reverb Control */}
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700">Độ vang</span>
                                        <span className="text-sm text-gray-500">Reverb Time</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="range"
                                          min="0.1"
                                          max="5"
                                          step="0.1"
                                          value={soundSettings.reverbTime}
                                          onChange={(e) => handleSoundSettingChange('reverbTime', Number(e.target.value))}
                                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 w-16 text-right">{soundSettings.reverbTime}s</span>
                                      </div>
                                    </div>

                                    {/* Distortion Control */}
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700">Độ méo</span>
                                        <span className="text-sm text-gray-500">Distortion</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          step="1"
                                          value={soundSettings.distortionAmount}
                                          onChange={(e) => handleSoundSettingChange('distortionAmount', Number(e.target.value))}
                                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 w-16 text-right">{soundSettings.distortionAmount}%</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Test Button - Fixed at bottom */}
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={testSound}
                                      className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300"
                                    >
                                      Thử âm thanh
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Add custom scrollbar styles */}
                          <style jsx>{`
                            .custom-scrollbar::-webkit-scrollbar {
                              width: 6px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                              background: #f1f1f1;
                              border-radius: 3px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                              background: #888;
                              border-radius: 3px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                              background: #555;
                            }
                          `}</style>

                          {/* Notifications List */}
                          <div className="max-h-[calc(80vh-200px)] overflow-y-auto">
                            {loading ? (
                              <div className="flex justify-center py-8">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                  className="rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"
                                />
                              </div>
                            ) : filteredNotifications.length === 0 ? (
                              <div className="text-center py-12">
                                <motion.div
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.5 }}
                                  className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4"
                                >
                                  <BellIcon className="h-8 w-8 text-gray-300" />
                                </motion.div>
                                <p className="text-gray-500 mb-2">Không tìm thấy thông báo nào</p>
                                <p className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                              </div>
                            ) : (
                              filteredNotifications.map((notif) => (
                                <motion.div
                                  key={notif._id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  className="group"
                                >
                                  <div className={`p-4 border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:bg-gray-50/50 ${
                                    notif.daDoc ? "opacity-60" : ""
                                  }`}>
                                  <div className="flex items-start space-x-3">
                                      {isMultiSelectMode && (
                                        <input
                                          type="checkbox"
                                          checked={selectedNotifications.includes(notif._id)}
                                          onChange={() => handleSelectNotification(notif._id)}
                                          className="mt-1 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                        />
                                      )}
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      className={`p-2 rounded-lg ${
                                          notif.quanTrong
                                            ? "bg-gradient-to-r from-red-500 to-pink-500"
                                            : notif.daDoc
                                            ? "bg-gray-100"
                                            : "bg-gradient-to-r from-emerald-500 to-blue-600"
                                      }`}
                                    >
                                        {notif.quanTrong ? (
                                          <ExclamationCircleIcon className="h-4 w-4 text-white" />
                                        ) : (
                                      <BellIcon className={`h-4 w-4 ${notif.daDoc ? "text-gray-400" : "text-white"}`} />
                                        )}
                                    </motion.div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                          <p className={`text-sm ${notif.daDoc ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                                        {notif.noiDung}
                                      </p>
                                          {!isMultiSelectMode && (
                                            <motion.button
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.9 }}
                                              onClick={() => handleToggleImportant(notif._id)}
                                              className={`p-1 rounded-lg transition-colors duration-200 ${
                                                notif.quanTrong
                                                  ? "text-yellow-500 hover:bg-yellow-50"
                                                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                              }`}
                                            >
                                              <StarIcon className={`h-4 w-4 ${notif.quanTrong ? "fill-current" : ""}`} />
                                            </motion.button>
                                          )}
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <p className="text-xs text-gray-500">
                                            {new Date(notif.ngay).toLocaleString()}
                                          </p>
                                          <span className="text-gray-300">•</span>
                                          <p className="text-xs text-gray-500">{notif.loai}</p>
                                          {notif.quanTrong && (
                                            <>
                                              <span className="text-gray-300">•</span>
                                              <span className="text-xs text-yellow-500 font-medium">Quan trọng</span>
                                            </>
                                          )}
                                        </div>
                                        {!isMultiSelectMode && (
                                          <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      {!notif.daDoc && (
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                                onClick={() => handleMarkAsRead(notif._id)}
                                                className="text-emerald-600 text-xs hover:underline font-medium"
                                        >
                                          Đánh dấu đã đọc
                                        </motion.button>
                                      )}
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              onClick={() => handleDeleteNotification(notif._id)}
                                              className="text-red-600 text-xs hover:underline font-medium"
                                            >
                                              Xóa
                                            </motion.button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User Dropdown */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center space-x-2 p-2 rounded-xl transition-all duration-300 ${
                        showUserDropdown 
                          ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white" 
                          : "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50"
                      }`}
                    >
                      {anhDaiDien ? (
                        <motion.img
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          src={anhDaiDien || "/placeholder.svg"}
                          alt="Ảnh đại diện"
                          className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => (e.target.src = "https://placehold.co/32x32")}
                        />
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm"
                        >
                          {userName?.charAt(0)?.toUpperCase() || "U"}
                        </motion.div>
                      )}
                      <div className="hidden lg:block text-left">
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm font-medium text-gray-900"
                        >
                          {userName || "Người Dùng"}
                        </motion.p>
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-xs text-gray-500"
                        >
                          Tài khoản cá nhân
                        </motion.p>
                      </div>
                      <motion.div 
                        animate={{ rotate: showUserDropdown ? 180 : 0 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                      >
                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ 
                            duration: 0.2,
                            type: "spring",
                            stiffness: 300,
                            damping: 25
                          }}
                          className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 z-50"
                        >
                          <div className="p-2">
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="px-4 py-3 border-b border-gray-100"
                            >
                              <motion.p 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-semibold text-gray-900"
                              >
                                {userName || "Người Dùng"}
                              </motion.p>
                              <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xs text-gray-500"
                              >
                                {/* Quản lý tài khoản */}
                              </motion.p>
                            </motion.div>
                            <div className="py-2">
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                <Link
                                  to="/settings"
                                  className="group flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 transition-all duration-200"
                                  onClick={() => setShowUserDropdown(false)}
                                >
                                  <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className="p-2 rounded-lg bg-gray-100 group-hover:bg-emerald-100"
                                  >
                                    <Cog6ToothIcon className="h-5 w-5" />
                                  </motion.div>
                                  <span className="font-medium">Cài Đặt</span>
                                </Link>
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 }}
                              >
                                <Link
                                  to="/about-us"
                                  className="group flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-700 transition-all duration-200"
                                  onClick={() => setShowUserDropdown(false)}
                                >
                                  <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className="p-2 rounded-lg bg-gray-100 group-hover:bg-purple-100"
                                  >
                                    <InformationCircleIcon className="h-5 w-5" />
                                  </motion.div>
                                  <span className="font-medium">Về chúng tôi</span>
                                </Link>
                              </motion.div>
                              <div className="border-t border-gray-200 my-2"></div>
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                              >
                                <motion.button
                                  onClick={() => {
                                    handleLogout()
                                    setShowUserDropdown(false)
                                  }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="group flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 w-full"
                                >
                                  <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className="p-2 rounded-lg bg-gray-100 group-hover:bg-red-100"
                                  >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                  </motion.div>
                                  <span className="font-medium">Đăng Xuất</span>
                                </motion.button>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`lg:hidden p-2 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 rounded-xl transition-all duration-300 ${
                  showMenu ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white" : ""
                }`}
              >
                <motion.div 
                  animate={{ rotate: showMenu ? 180 : 0 }}
                  transition={{ 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  {showMenu ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 25
              }}
              className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="px-4 py-4 space-y-2"
              >
                {userId ? (
                  <>
                    <Link
                      to="/overview"
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        location.pathname === "/overview"
                          ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                      }`}
                      onClick={() => setShowMenu(false)}
                    >
                      <HomeIcon className="h-5 w-5" />
                      <span className="font-medium">Tổng quan</span>
                    </Link>

                    {/* Mobile Finance Section */}
                    <div>
                      <motion.button
                        onClick={() => setShowFinanceDropdown(!showFinanceDropdown)}
                        whileHover={{ scale: 1.02 }}
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 rounded-xl transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          <ChartBarIcon className="h-5 w-5" />
                          <span className="font-medium">Tài chính</span>
                        </div>
                        <motion.div animate={{ rotate: showFinanceDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDownIcon className="h-4 w-4" />
                        </motion.div>
                      </motion.button>
                      <AnimatePresence>
                        {showFinanceDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 space-y-1 mt-2"
                          >
                            {financeMenuItems.map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                  location.pathname === item.to
                                    ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                                }`}
                                onClick={() => setShowMenu(false)}
                              >
                                <item.icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Mobile Goals Section */}
                    <div>
                      <motion.button
                        onClick={() => setShowGoalsDropdown(!showGoalsDropdown)}
                        whileHover={{ scale: 1.02 }}
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 rounded-xl transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3">
                          <FlagIcon className="h-5 w-5" />
                          <span className="font-medium">Mục tiêu</span>
                        </div>
                        <motion.div animate={{ rotate: showGoalsDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDownIcon className="h-4 w-4" />
                        </motion.div>
                      </motion.button>
                      <AnimatePresence>
                        {showGoalsDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 space-y-1 mt-2"
                          >
                            {goalsMenuItems.map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                  location.pathname === item.to
                                    ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                                }`}
                                onClick={() => setShowMenu(false)}
                              >
                                <item.icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Link
                      to="/investments"
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        location.pathname === "/investments"
                          ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                      }`}
                      onClick={() => setShowMenu(false)}
                    >
                      <ArrowTrendingUpIcon className="h-5 w-5" />
                      <span className="font-medium">Đầu tư</span>
                    </Link>

                    <Link
                      to="/reports"
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        location.pathname === "/reports"
                          ? "bg-gradient-to-r from-emerald-500 to-blue-600 text-white"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600"
                      }`}
                      onClick={() => setShowMenu(false)}
                    >
                      <ClipboardDocumentListIcon className="h-5 w-5" />
                      <span className="font-medium">Báo cáo</span>
                    </Link>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-emerald-600 rounded-xl transition-all duration-300"
                        onClick={() => setShowMenu(false)}
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                        <span className="font-medium">Cài Đặt</span>
                      </Link>
                      <motion.button
                        onClick={() => {
                          handleLogout()
                          setShowMenu(false)
                        }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 rounded-xl transition-all duration-300 w-full"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span className="font-medium">Đăng Xuất</span>
                      </motion.button>
                    </div>
                    <Link
                      to="/about-us"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-700 rounded-xl transition-all duration-300"
                      onClick={() => setShowMenu(false)}
                    >
                      <InformationCircleIcon className="h-5 w-5" />
                      <span className="font-medium">Về chúng tôi</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/"
                    className="block px-4 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 text-center font-medium"
                    onClick={() => setShowMenu(false)}
                  >
                    Đăng Nhập
                  </Link>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {showModalNotification && currentNotification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thông báo quan trọng</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowModalNotification(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </motion.button>
            </div>
            <p className="text-gray-700 mb-4">{currentNotification.noiDung}</p>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  handleMarkAsRead(currentNotification._id);
                  setShowModalNotification(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300"
              >
                Đánh dấu đã đọc
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {floatingNotification && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl p-4 max-w-sm w-full border border-gray-100"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-600">
              <BellIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{floatingNotification.noiDung}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(floatingNotification.ngay).toLocaleString()}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => handleMarkAsRead(floatingNotification._id)}
                className="text-emerald-600 text-sm hover:underline mt-2 font-medium"
              >
                Đánh dấu đã đọc
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* News Ticker */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`bg-gradient-to-r from-${tickerColor}-500/10 to-blue-600/10 border-y border-gray-100 sticky top-16 z-40`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center h-10 overflow-hidden group">
              {/* Controls */}
              <div className="absolute right-0 z-10 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Speed Control */}
                <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTickerSpeed(prev => Math.max(5, prev - 5))}
                    className="p-1 text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </motion.button>
                  <span className="text-xs font-medium text-gray-600">{tickerSpeed}s</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTickerSpeed(prev => Math.min(40, prev + 5))}
                    className="p-1 text-gray-600 hover:text-gray-900"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Color Control */}
                <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTickerColor('emerald')}
                    className={`w-4 h-4 rounded-full bg-emerald-500 ${tickerColor === 'emerald' ? 'ring-2 ring-offset-2 ring-emerald-500' : ''}`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTickerColor('blue')}
                    className={`w-4 h-4 rounded-full bg-blue-500 ${tickerColor === 'blue' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTickerColor('purple')}
                    className={`w-4 h-4 rounded-full bg-purple-500 ${tickerColor === 'purple' ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                  />
                </div>
              </div>

              {/* Ticker content */}
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 text-${tickerColor}-600`}>
                  <BellIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Thông báo mới:</span>
                </div>
                <div 
                  className="relative flex-1 overflow-hidden"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div 
                    ref={tickerRef}
                    style={tickerStyle}
                    className="flex space-x-8 whitespace-nowrap"
                  >
                    {/* First set of notifications */}
                    {notifications.map((notif) => (
                      <div
                        key={`first-${notif._id}`}
                        className="inline-flex items-center space-x-2 text-sm text-gray-600 px-2 py-1 rounded-lg transition-all duration-200"
                      >
                        <span className="font-medium">{notif.noiDung}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                          {new Date(notif.ngay).toLocaleString()}
                        </span>
                        {!notif.daDoc && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className={`text-${tickerColor}-600 hover:underline text-xs font-medium`}
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {notifications.map((notif) => (
                      <div
                        key={`second-${notif._id}`}
                        className="inline-flex items-center space-x-2 text-sm text-gray-600 px-2 py-1 rounded-lg transition-all duration-200"
                      >
                        <span className="font-medium">{notif.noiDung}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                          {new Date(notif.ngay).toLocaleString()}
                        </span>
                        {!notif.daDoc && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className={`text-${tickerColor}-600 hover:underline text-xs font-medium`}
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default Navbar
