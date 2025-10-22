import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@shared/types';
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const user = useAuth((state) => state.user);
  const userRole = user?.role;
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to a relevant page if role is not allowed, e.g., dashboard
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};