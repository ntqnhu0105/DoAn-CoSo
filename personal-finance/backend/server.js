const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ file tĩnh từ thư mục Uploads
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'))); // Sửa từ '/uploads' thành '/api/uploads'

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import và khởi động các cron job
const updateBudgetStatus = require('./cron/updateBudgetStatus');
const updateSavingGoalStatus = require('./cron/updateSavingGoalStatus');
const updateDebtStatus = require('./cron/updateDebtStatus');
const { updateReport } = require('./cron/updateReport');
updateBudgetStatus();
updateSavingGoalStatus();
updateDebtStatus();
updateReport();

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/saving-goals', require('./routes/savingGoalRoutes'));
app.use('/api/debts', require('./routes/debtRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/overview', require('./routes/overviewRoutes'));
// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));