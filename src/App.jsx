import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustStrip from './components/TrustStrip';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import RagSection from './components/RagSection';
import DashboardPreview from './components/DashboardPreview';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import FoodAnalysisModal from './components/FoodAnalysisModal';
import AiAssistantModal from './components/AiAssistantModal';
import AuthModal from './components/AuthModal';
import ProtectedDashboardView from './components/ProtectedDashboardView';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentRoute, setCurrentRoute] = useState(window.location.hash === '#dashboard' ? '/dashboard' : '/');

  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'

  // On application startup, check if user is already authenticated via HttpOnly cookie
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.auth.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          // If hash is #dashboard or user is logged in, show dashboard
          if (window.location.hash === '#dashboard') {
            setCurrentRoute('/dashboard');
          }
        }
      } catch (err) {
        // Unauthenticated or expired cookie
        setUser(null);
        if (currentRoute === '/dashboard') {
          setCurrentRoute('/');
          window.location.hash = '';
        }
      } finally {
        setLoadingAuth(false);
      }
    };

    checkAuthStatus();

    const handleHashChange = () => {
      if (window.location.hash === '#dashboard') {
        setCurrentRoute('/dashboard');
      } else {
        setCurrentRoute('/');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenSignup = () => {
    if (user) {
      navigateToDashboard();
    } else {
      setAuthMode('signup');
      setAuthModalOpen(true);
    }
  };

  const handleOpenLogin = () => {
    if (user) {
      navigateToDashboard();
    } else {
      setAuthMode('login');
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    navigateToDashboard();
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRoute('/');
    window.location.hash = '';
  };

  const navigateToDashboard = () => {
    setCurrentRoute('/dashboard');
    window.location.hash = 'dashboard';
  };

  const navigateToLanding = () => {
    setCurrentRoute('/');
    window.location.hash = '';
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6B8E7B] flex items-center justify-center text-white font-bold animate-bounce">
            🍃
          </div>
          <span className="text-xs font-bold text-[#6B8E7B] tracking-wider uppercase">Loading WellSync...</span>
        </div>
      </div>
    );
  }

  // If user is trying to access protected /dashboard route
  if (currentRoute === '/dashboard') {
    if (!user) {
      // Unauthenticated access attempt -> redirect to landing and open auth modal
      setTimeout(() => {
        setCurrentRoute('/');
        window.location.hash = '';
        setAuthMode('login');
        setAuthModalOpen(true);
      }, 50);

      return (
        <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-lg">
            <p className="text-sm font-bold text-[#1E293B]">Authentication Required</p>
            <p className="text-xs text-[#64748B] mt-1">Redirecting to login...</p>
          </div>
        </div>
      );
    }

    return (
      <ProtectedDashboardView 
        user={user} 
        onLogout={handleLogout} 
      />
    );
  }

  // Otherwise render main landing page
  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#17201B] font-sans antialiased selection:bg-[#6B8E7B]/20 selection:text-[#1E293B]">
      
      {/* Navbar */}
      <Navbar 
        user={user}
        onOpenLogin={handleOpenLogin}
        onOpenSignup={handleOpenSignup}
        onGoToDashboard={navigateToDashboard}
        onLogout={handleLogout}
      />

      {/* Main Page Sections */}
      <main>
        {/* 1. Hero */}
        <Hero 
          onOpenSignup={handleOpenSignup}
        />

        {/* 2. Trust Strip */}
        <TrustStrip />

        {/* 3. Core Features */}
        <Features 
          onOpenFoodDemo={() => setFoodModalOpen(true)}
          onOpenAiDemo={() => setAiModalOpen(true)}
        />

        {/* 4. How It Works */}
        <HowItWorks />

        {/* 5. RAG & Grounded AI Section */}
        <RagSection />

        {/* 6. Dashboard Preview */}
        <DashboardPreview />

        {/* 7. Final CTA */}
        <FinalCTA 
          onOpenSignup={handleOpenSignup}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <FoodAnalysisModal 
        isOpen={foodModalOpen}
        onClose={() => setFoodModalOpen(false)}
      />

      <AiAssistantModal 
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
