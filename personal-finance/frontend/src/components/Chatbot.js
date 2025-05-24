import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const socket = io('http://localhost:5000', { autoConnect: false });

const Chatbot = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Xin chào! Tôi là trợ lý quản lý chi tiêu. Nhập "giúp đỡ" để xem các lệnh.', isBot: true },
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!user || ['/', '/register'].includes(location.pathname)) {
      socket.disconnect();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessages((prev) => [...prev, { text: 'Không tìm thấy token. Vui lòng đăng nhập lại.', isBot: true }]);
      navigate('/');
      return;
    }

    socket.auth = { token };
    socket.connect();
    socket.emit('joinRoom', user._id);

    socket.on('chatResponse', (data) => {
      console.log('Nhận chatResponse:', data);
      setMessages((prev) => [...prev, { text: data.message, isBot: true }]);
    });

    socket.on('notification', (data) => {
      console.log('Nhận notification:', data);
      setMessages((prev) => [...prev, { text: `Thông báo: ${data.noiDung}`, isBot: true }]);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connect error:', error.message);
      setMessages((prev) => [...prev, { text: 'Lỗi kết nối server. Vui lòng thử lại.', isBot: true }]);
      if (error.message === 'Token không hợp lệ') {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
      }
    });

    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications for user:', user._id, 'token:', token.slice(0, 10) + '...');
        const res = await axios.get(`http://localhost:5000/api/notifications/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Notifications response:', res.data);
        res.data.forEach((notif) => {
          if (!notif.daDoc) {
            setMessages((prev) => [...prev, { text: `Thông báo: ${notif.noiDung}`, isBot: true }]);
          }
        });
      } catch (error) {
        console.error('Lỗi lấy thông báo:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        setMessages((prev) => [...prev, { text: 'Lỗi lấy thông báo. Vui lòng thử lại.', isBot: true }]);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/');
        }
      }
    };
    fetchNotifications();

    return () => {
      socket.off('chatResponse');
      socket.off('notification');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [user, location.pathname, navigate]);

  const sendMessage = () => {
    if (!input.trim() || !user) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setMessages((prev) => [...prev, { text: 'Không tìm thấy token. Vui lòng đăng nhập lại.', isBot: true }]);
      navigate('/');
      return;
    }

    const message = input.trim();
    setMessages((prev) => [...prev, { text: message, isBot: false }]);
    console.log('Gửi chatMessage:', { userId: user._id, token: token.slice(0, 10) + '...', message });
    socket.emit('chatMessage', { userId: user._id, token, message });
    setInput('');
  };

  const handleSuggestion = (command) => {
    setInput(command);
    setTimeout(sendMessage, 0);
  };

  if (!user || ['/', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        {isOpen ? '✖' : '💬'}
      </button>
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-lg shadow-xl mt-2 flex flex-col">
          <div className="bg-blue-500 text-white p-3 rounded-t-lg">
            <h3 className="text-lg font-semibold">Trợ Lý Chi Tiêu</h3>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                  msg.isBot ? 'bg-gray-200 text-left' : 'bg-green-500 text-white ml-auto text-right'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSuggestion('kiểm tra số dư')}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200"
              >
                Kiểm tra số dư
              </button>
              <button
                onClick={() => handleSuggestion('thêm giao dịch chi 100000 ăn uống tiền mặt')}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200"
              >
                Thêm chi tiêu
              </button>
              <button
                onClick={() => handleSuggestion('thêm danh mục ăn uống chi')}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200"
              >
                Thêm danh mục
              </button>
              <button
                onClick={() => handleSuggestion('giúp đỡ')}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200"
              >
                Giúp đỡ
              </button>
            </div>
          </div>
          <div className="p-3 border-t flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập lệnh..."
              className="flex-1 p-2 border rounded-l focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;