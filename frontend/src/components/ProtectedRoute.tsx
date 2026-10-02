import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{children: React.ReactNode, requireGerente?: boolean}> = ({ children, requireGerente }) => {
  const { isAuthenticated, isGerente, user } = useAuth();
  
  if (!isAuthenticated && localStorage.getItem('token') === null) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireGerente && !isGerente && user) {
    return <Navigate to="/batches" replace />;
  }
  
  return <>{children}</>;
};
