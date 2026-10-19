import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ProfileView from './pages/dashboard/ProfileView';
import MealPlannerView from './pages/dashboard/MealPlannerView';
import FoodDiaryView from './pages/dashboard/FoodDiaryView';
import GroceryListView from './pages/dashboard/GroceryListView';
import MedicineTrackerView from './pages/dashboard/MedicineTrackerView';
import CaregiverAccessView from './pages/dashboard/CaregiverAccessView';
import AiAssistantView from './pages/dashboard/AiAssistantView';
import InsightsView from './pages/dashboard/InsightsView';

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

            {/* Dedicated Feature Routes */}
            <Route path="profile" element={<ProfileView />} />
            <Route path="meals" element={<MealPlannerView />} />
            <Route path="food-diary" element={<FoodDiaryView />} />
            <Route path="groceries" element={<GroceryListView />} />
            <Route path="medicines" element={<MedicineTrackerView />} />
            <Route path="caregiver" element={<CaregiverAccessView />} />
            <Route path="assistant" element={<AiAssistantView />} />
            <Route path="insights" element={<InsightsView />} />

            {/* Backward-compatible legacy redirects */}
            <Route path="meal-planner" element={<Navigate to="/dashboard/meals" replace />} />
            <Route path="grocery-list" element={<Navigate to="/dashboard/groceries" replace />} />
          </Route>

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
