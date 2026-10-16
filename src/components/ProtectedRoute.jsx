import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#6B8E7B]/15 border border-[#6B8E7B]/30 flex items-center justify-center text-[#6B8E7B] animate-pulse">
            <Leaf className="w-6 h-6 text-[#6B8E7B]" />
          </div>
          <span className="text-xs font-bold text-[#6B8E7B] tracking-wider uppercase">
            Verifying WellSync Session...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
