import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Listings from './pages/Listings.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import SwapRequestPage from './pages/SwapRequestPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Chat from './pages/Chat.jsx';
import Admin from './pages/Admin.jsx';
import { ProtectedRoute, AdminRoute, GuestRoute } from './routes/ProtectedRoute.jsx';

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isAuthPage ? '' : 'bg-gradient-to-tr from-[#DFD3C3] to-[#F2EAE1] text-ink font-sans'}`}>
      {!isAuthPage && <Navbar />}

      {/* Decorative Gold Curves Background for Logged-In Pages */}
      {!isAuthPage && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Left gold curves */}
          <svg className="absolute -left-20 -bottom-20 w-[600px] h-[600px] opacity-25 text-[#C9962C]" viewBox="0 0 100 100">
            <circle cx="0" cy="100" r="35" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="0" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="0" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="0" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="0" cy="100" r="115" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </svg>
          {/* Right gold curves */}
          <svg className="absolute -right-20 -top-20 w-[700px] h-[700px] opacity-25 text-[#C9962C]" viewBox="0 0 100 100">
            <circle cx="100" cy="0" r="45" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="100" cy="0" r="65" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="100" cy="0" r="85" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="100" cy="0" r="105" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="100" cy="0" r="125" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </svg>
          {/* Sparkle star bottom right */}
          <svg className="absolute right-12 bottom-12 w-6 h-6 text-[#C9962C] opacity-40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
          </svg>
        </div>
      )}

      {/* Render Pages */}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Navigate to="/listings" replace />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
          <Route path="/listings/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
          <Route path="/swap/:itemId" element={<ProtectedRoute><SwapRequestPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/swaps/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/listings" replace />} />
        </Routes>
      </div>
    </div>
  );
}

