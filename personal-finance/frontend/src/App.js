import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Category from './pages/Category';
import Budget from './pages/Budget';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Account />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/budgets" element={<Budget />} />
      </Routes>
    </Router>
  );
}

export default App;