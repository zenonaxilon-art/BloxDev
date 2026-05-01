import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSeller?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireSeller }: ProtectedRouteProps) {
  const { currentUser, isLoadingSession } = useAppStore();
  const location = useLocation();

  if (isLoadingSession) {
    return <div className="text-center py-20 text-slate-400">Loading session...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requireSeller && currentUser.role !== 'seller' && currentUser.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
