import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Kiểm tra userId
  useEffect(() => {
    if (!userId) {
      navigate('/');
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
      setTenMucTieu('');
      setSoTienMucTieu('');
      setSoTienHienTai('');
      setHanChot('');
      setGhiChu('');
      setTrangThai('Đang thực hiện');
      setEditId(null);
      setError('');
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

  // Chọn mục tiêu để sửa
  const handleEdit = (goal) => {
    setEditId(goal._id);
    setTenMucTieu(goal.tenMucTieu);
    setSoTienMucTieu(goal.soTienMucTieu.toString());
    setSoTienHienTai(goal.soTienHienTai.toString());
    setHanChot(new Date(goal.hanChot).toISOString().split('T')[0]);
    setGhiChu(goal.ghiChu || '');
    setTrangThai(goal.trangThai);
    setError('');
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditId(null);
    setTenMucTieu('');
    setSoTienMucTieu('');
    setSoTienHienTai('');
    setHanChot('');
    setGhiChu('');
    setTrangThai('Đang thực hiện');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Quản lý mục tiêu tiết kiệm</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading && <p className="text-gray-500 mb-4 text-center">Đang tải dữ liệu...</p>}

        {/* Form thêm/sửa mục tiêu tiết kiệm */}
        {!loading && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editId ? 'Sửa mục tiêu tiết kiệm' : 'Thêm mục tiêu tiết kiệm'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Tên mục tiêu</label>
                <input
                  type="text"
                  value={tenMucTieu}
                  onChange={(e) => setTenMucTieu(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  placeholder="Ví dụ: Mua xe"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-gray-700">Số tiền mục tiêu</label>
                <input
                  type="number"
                  value={soTienMucTieu}
                  onChange={(e) => setSoTienMucTieu(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="Số tiền mục tiêu"
                />
              </div>
              <div>
                <label className="block text-gray-700">Số tiền hiện tại</label>
                <input
                  type="number"
                  value={soTienHienTai}
                  onChange={(e) => setSoTienHienTai(e.target.value)}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  min="0"
                  placeholder="Số tiền đã tiết kiệm"
                />
              </div>
              <div>
                <label className="block text-gray-700">Hạn chót</label>
                <input
                  type="date"
                  value={hanChot}
                  onChange={(e) => setHanChot(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700">Ghi chú</label>
                <textarea
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Ghi chú"
                  rows="4"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-gray-700">Trạng thái</label>
                <select
                  value={trangThai}
                  onChange={(e) => setTrangThai(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Thất bại">Thất bại</option>
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={!tenMucTieu || !soTienMucTieu || !hanChot || parseFloat(soTienMucTieu) <= 0}
                >
                  {editId ? 'Cập nhật mục tiêu' : 'Thêm mục tiêu'}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    onClick={handleCancelEdit}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Danh sách mục tiêu tiết kiệm */}
        <div className="bg-white rounded shadow-md">
          <h3 className="text-xl font-semibold p-4">Danh sách mục tiêu tiết kiệm</h3>
          {loading ? (
            <p className="p-4 text-center">Đang tải mục tiêu...</p>
          ) : savingGoals.length === 0 ? (
            <p className="p-4 text-center">Chưa có mục tiêu tiết kiệm nào</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {savingGoals.map((goal) => (
                <div key={goal._id} className="p-4 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{goal.tenMucTieu}</span>
                    <br />
                    <span className="text-gray-600">
                      Số tiền mục tiêu: {goal.soTienMucTieu.toLocaleString()} VNĐ<br />
                      Số tiền hiện tại: {goal.soTienHienTai.toLocaleString()} VNĐ<br />
                      Hạn chót: {new Date(goal.hanChot).toLocaleDateString()}<br />
                      Ghi chú: {goal.ghiChu || 'Không có ghi chú'}<br />
                      Trạng thái: {goal.trangThai}<br />
                      Ngày tạo: {new Date(goal.ngayTao).toLocaleDateString()}
                    </span>
                    {/* Thanh tiến độ */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${Math.min((goal.soTienHienTai / goal.soTienMucTieu) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {((goal.soTienHienTai / goal.soTienMucTieu) * 100).toFixed(2)}% hoàn thành
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
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

export default SavingGoal;