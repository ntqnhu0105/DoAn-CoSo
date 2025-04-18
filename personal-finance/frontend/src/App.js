import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Category from './pages/Category';
import Budget from './pages/Budget';
import Report from './pages/Report';
import SavingGoal from './pages/SavingGoal';
import Debt from './pages/Debt';
import Investments from './pages/Investments';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Account />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/budgets" element={<Budget />} />
        <Route path="/reports" element={<Report />} />
        <Route path="/saving-goals" element={<SavingGoal />} />
        <Route path="/debts" element={<Debt />} />
        <Route path="/investments" element={<Investments />} />
      </Routes>
    </Router>
  );
}

export default App;