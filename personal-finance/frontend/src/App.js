import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Category from './pages/Category';
import Budget from './pages/Budget';
import SavingGoal from './pages/SavingGoal';
import Debt from './pages/Debt';
import Investments from './pages/Investments';
import Report from './pages/Report';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import Overview from './pages/Overview';
import Chatbot from './components/Chatbot';

// Component để ẩn Navbar và thêm Chatbot trên các trang được bảo vệ
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = ['/', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      <Chatbot />
    </>
  );
};

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/accounts"
          element={
            <Layout>
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/categories"
          element={
            <Layout>
              <ProtectedRoute>
                <Category />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/budgets"
          element={
            <Layout>
              <ProtectedRoute>
                <Budget />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/saving-goals"
          element={
            <Layout>
              <ProtectedRoute>
                <SavingGoal />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/debts"
          element={
            <Layout>
              <ProtectedRoute>
                <Debt />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/investments"
          element={
            <Layout>
              <ProtectedRoute>
                <Investments />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/reports"
          element={
            <Layout>
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/overview"
          element={
            <Layout>
              <ProtectedRoute>
                <Overview />
              </ProtectedRoute>
            </Layout>
          }
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;