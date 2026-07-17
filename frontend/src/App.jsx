import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Listings from './pages/Listings.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import SwapRequestPage from './pages/SwapRequestPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Chat from './pages/Chat.jsx';
import Admin from './pages/Admin.jsx';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/listings" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
        <Route path="/listings/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
        <Route path="/swap/:itemId" element={<ProtectedRoute><SwapRequestPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/swaps/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/listings" replace />} />
      </Routes>
    </div>
  );
}
