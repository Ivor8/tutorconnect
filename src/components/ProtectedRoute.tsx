import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: UserRole }> = ({ children, role }) => {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user || !profile) return <Navigate to="/login" replace />;
  if (role && profile.role !== role) {
    const dest = profile.role === 'tutor' ? '/tutor/dashboard' : profile.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
};
