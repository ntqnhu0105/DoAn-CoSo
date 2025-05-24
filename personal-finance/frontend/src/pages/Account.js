import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const [accounts, setAccounts] = useState([]);
  const [tenTaiKhoan, setTenTaiKhoan] = useState('');
  const [soDu, setSoDu] = useState('');
  const [loaiTaiKhoan, setLoaiTaiKhoan] = useState('Tiền mặt');
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId')?.replace(/[^\w-]/g, '');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Kiểm tra userId và token
  useEffect(() => {
    if (!userId || !token) {
      setError('Vui lòng đăng nhập để quản lý tài khoản');
      navigate('/');
    }
  }, [userId, token, navigate]);

  // Lấy danh sách tài khoản
  useEffect(() => {
    if (!userId || !token) return;

    const fetchAccounts = async () => {
      try {
        console.log('Fetching accounts with userId:', userId, 'token:', token.slice(0, 10) + '...');
        const headers = { Authorization: `Bearer ${token}` };
        console.log('Request headers:', headers);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/accounts/${userId}`, { headers });
        console.log('Accounts response:', res.data);
        setAccounts(res.data);
        setError('');
      } catch (err) {
        console.error('Lỗi tải tài khoản:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        const errorMessage = err.response?.data?.message || 'Lỗi khi tải tài khoản';
        setError(errorMessage);
        if (err.response?.status === 401) {
          console.error('Phiên đăng nhập hết hạn, xóa localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/');
        }
      }
    };
    fetchAccounts();
  }, [userId, token, navigate]);

  // Thêm tài khoản mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !token) {
      setError('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      console.log('Submitting account:', { maNguoiDung: userId, tenTaiKhoan, soDu, loaiTaiKhoan });
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/accounts`,
        {
          maNguoiDung: userId,
          tenTaiKhoan,
          soDu: parseFloat(soDu) || 0,
          loaiTaiKhoan,
        },
        { headers }
      );
      console.log('Create account response:', res.data);
      setAccounts([...accounts, res.data]);
      setTenTaiKhoan('');
      setSoDu('');
      setLoaiTaiKhoan('Tiền mặt');
      setError('');
    } catch (err) {
      console.error('Lỗi thêm tài khoản:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage = err.response?.data?.message || 'Lỗi khi thêm tài khoản';
      setError(errorMessage);
      if (err.response?.status === 401) {
        console.error('Phiên đăng nhập hết hạn, xóa localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Quản lý tài khoản</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Form thêm tài khoản */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Tên tài khoản</label>
              <input
                type="text"
                value={tenTaiKhoan}
                onChange={(e) => setTenTaiKhoan(e.target.value)}
                placeholder="Tên tài khoản"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Số dư ban đầu</label>
              <input
                type="number"
                value={soDu}
                onChange={(e) => setSoDu(e.target.value)}
                placeholder="Số dư"
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-gray-700">Loại tài khoản</label>
              <select
                value={loaiTaiKhoan}
                onChange={(e) => setLoaiTaiKhoan(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                <option value="Tài khoản ngân hàng">Tài khoản ngân hàng</option>
                <option value="Ví điện tử">Ví điện tử</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Thêm tài khoản
              </button>
            </div>
          </div>
        </form>

        {/* Danh sách tài khoản */}
        <div className="bg-white rounded shadow-md">
          <h3 className="text-xl font-semibold p-4">Danh sách tài khoản</h3>
          {accounts.length === 0 ? (
            <p className="p-4 text-center">Chưa có tài khoản nào</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {accounts.map((account) => (
                <div key={account._id} className="p-4 flex justify-between">
                  <div>
                    <span className="font-medium">{account.tenTaiKhoan}</span><br />
                    <span className="text-gray-600">
                      Loại: {account.loaiTaiKhoan}<br />
                      Số dư: {account.soDu.toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;