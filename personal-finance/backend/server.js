const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
const updateBudgetStatus = require('./cron/updateBudgetStatus');
  updateBudgetStatus();
const updateReport = require('./cron/updateReport');
  updateReport();
const updateSavingGoalStatus = require('./cron/updateSavingGoalStatus');
  updateSavingGoalStatus();
const updateDebtStatus = require('./cron/updateDebtStatus');
  updateDebtStatus();
// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);
const savingGoalRoutes = require('./routes/savingGoalRoutes');
app.use('/api/saving-goals', savingGoalRoutes);
const debtRoutes = require('./routes/debtRoutes');
app.use('/api/debts', debtRoutes);
const investmentRoutes = require('./routes/investmentRoutes'); 
app.use('/api/investments', investmentRoutes);

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));