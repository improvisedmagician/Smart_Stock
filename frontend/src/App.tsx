import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Inbound from './pages/Inbound';
import Outbound from './pages/Outbound';
import PurchaseOrders from './pages/PurchaseOrders';
import Batches from './pages/Batches';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';

const IndexRedirect = () => {
  const { isGerente, user } = useAuth();
  if (!user) return null;
  return <Navigate to={isGerente ? "/dashboard" : "/batches"} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<IndexRedirect />} />
            <Route path="dashboard" element={<ProtectedRoute requireGerente><Dashboard /></ProtectedRoute>} />
            <Route path="products" element={<Products />} />
            <Route path="suppliers" element={<ProtectedRoute requireGerente><Suppliers /></ProtectedRoute>} />
            <Route path="inbound" element={<Inbound />} />
            <Route path="outbound" element={<Outbound />} />
            <Route path="batches" element={<Batches />} />
            <Route path="purchase-orders" element={<ProtectedRoute requireGerente><PurchaseOrders /></ProtectedRoute>} />
            <Route path="audit" element={<ProtectedRoute requireGerente><AuditLogs /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute requireGerente><Users /></ProtectedRoute>} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
