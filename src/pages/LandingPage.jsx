import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import RagSection from '../components/RagSection';
import DashboardPreview from '../components/DashboardPreview';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import FoodAnalysisModal from '../components/FoodAnalysisModal';
import AiAssistantModal from '../components/AiAssistantModal';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'

  const handleOpenSignup = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthMode('signup');
      setAuthModalOpen(true);
    }
  };

  const handleOpenLogin = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthMode('login');
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    navigate('/dashboard');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#17201B] font-sans antialiased selection:bg-[#6B8E7B]/20 selection:text-[#1E293B]">
      
      {/* Navbar with Auth awareness */}
      <Navbar 
        user={user}
        onOpenLogin={handleOpenLogin}
        onOpenSignup={handleOpenSignup}
        onGoToDashboard={handleGoToDashboard}
        onLogout={handleLogout}
      />

      {/* Main Landing Page Content */}
      <main>
        {/* 1. Hero */}
        <Hero onOpenSignup={handleOpenSignup} />

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

        {/* 6. Dashboard Preview (Landing visual) */}
        <DashboardPreview />

        {/* 7. Final CTA */}
        <FinalCTA onOpenSignup={handleOpenSignup} />
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
