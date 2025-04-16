import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [soTien, setSoTien] = useState('');
  const [loai, setLoai] = useState('Chi tiêu');
  const [ghiChu, setGhiChu] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/transactions/${userId}`);
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTransactions();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/transactions`, {
        maNguoiDung: userId,
        soTien: parseFloat(soTien),
        loai,
        ghiChu,
      });
      setTransactions([...transactions, res.data]);
      setSoTien('');
      setGhiChu('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Quản lý chi tiêu</h2>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex space-x-4">
          <input
            type="number"
            value={soTien}
            onChange={(e) => setSoTien(e.target.value)}
            placeholder="Số tiền"
            className="p-2 border rounded"
            required
          />
          <select
            value={loai}
            onChange={(e) => setLoai(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="Thu nhập">Thu nhập</option>
            <option value="Chi tiêu">Chi tiêu</option>
          </select>
          <input
            type="text"
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="Ghi chú"
            className="p-2 border rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Thêm giao dịch
          </button>
        </div>
      </form>
      <h3 className="text-xl font-semibold mb-2">Danh sách giao dịch</h3>
      <ul className="space-y-2">
        {transactions.map((transaction) => (
          <li key={transaction._id} className="p-2 border rounded">
            {transaction.loai}: {transaction.soTien} - {transaction.ghiChu || 'Không có ghi chú'} -{' '}
            {new Date(transaction.ngayGiaoDich).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;