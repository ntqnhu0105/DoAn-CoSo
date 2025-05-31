import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import MouseParticles from 'react-mouse-particles'

// Root Component
const Root = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-screen overflow-hidden"
      >
        {/* Interactive Background Effect */}
        <MouseParticles 
          g={1}
          color="random"
          cull="stats,dom"
          level={6}
        />

        {/* Content */}
        <div className="relative z-10">
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

reportWebVitals();