import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ProfileView from './pages/dashboard/ProfileView';
import ModulePlaceholder from './pages/dashboard/ModulePlaceholder';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Dedicated Authentication Routes */}
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/register" element={<AuthPage initialMode="register" />} />

          {/* Protected Authenticated Dashboard Foundation */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Home Overview */}
            <Route index element={<DashboardHome />} />

            {/* Profile Route */}
            <Route path="profile" element={<ProfileView />} />

            {/* Phase 2 & 3 Placeholder Routes (No fake data) */}
            <Route path="meals" element={<ModulePlaceholder module="meals" />} />
            <Route path="food-diary" element={<ModulePlaceholder module="food-diary" />} />
            <Route path="groceries" element={<ModulePlaceholder module="groceries" />} />
            <Route path="medicines" element={<ModulePlaceholder module="medicines" />} />
            <Route path="caregiver" element={<ModulePlaceholder module="caregiver" />} />
            <Route path="assistant" element={<ModulePlaceholder module="assistant" />} />
            <Route path="insights" element={<ModulePlaceholder module="insights" />} />
          </Route>

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
