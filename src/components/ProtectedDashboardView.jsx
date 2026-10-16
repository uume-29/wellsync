import React, { useState } from 'react';
import { 
  LayoutDashboard, Utensils, Camera, Pill, Users, 
  Sparkles, Activity, User, LogOut, CheckCircle2, XCircle, Clock, 
  Bell, ChevronRight, ShieldCheck, Heart, RefreshCw, Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency, formatWholeCurrency } from '../utils/currency';

export default function ProtectedDashboardView({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutClick = async () => {
    setLoggingOut(true);
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('[Logout Error]:', err);
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#17201B]">
      
      {/* Dashboard Protected Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#6B8E7B] flex items-center justify-center text-white font-bold text-sm">
                🍃
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1E293B]">
                Well<span className="text-[#6B8E7B]">Sync</span>
              </span>
              <span className="ml-2 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-[#EBF1ED] text-[#6B8E7B] border border-[#6B8E7B]/20">
                Protected Dashboard
              </span>
            </div>

            {/* Authenticated User Status & Logout Button */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8FAF7] border border-gray-200 text-xs text-[#1E293B]">
                <User className="w-3.5 h-3.5 text-[#6B8E7B]" />
                <span>{user.name || user.email}</span>
              </div>

              <button
                onClick={handleLogoutClick}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {loggingOut ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Protected Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* User Greeting & Status Banner */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">
                Welcome back, {user.name}! 👋
              </h1>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> JWT Auth Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Logged in as <strong className="text-[#1E293B]">{user.email}</strong> • Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6B8E7B] bg-[#EBF1ED] px-3.5 py-2 rounded-xl border border-[#6B8E7B]/20">
              HttpOnly Secure Session
            </span>
          </div>
        </div>

        {/* Dashboard 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Metric Overview & Actions */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Metric Cards Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Meals Logged</span>
                <div className="text-2xl font-black text-[#1E293B] mt-1">6 / 7</div>
                <span className="text-[10px] font-bold text-[#6B8E7B]">Great Consistency</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Med Adherence</span>
                <div className="text-2xl font-black text-[#1E293B] mt-1">94%</div>
                <span className="text-[10px] font-bold text-[#6B8E7B]">On Track</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Grocery Spend</span>
                <div className="text-2xl font-black text-[#1E293B] mt-1">{formatCurrency(2150)}</div>
                <span className="text-[10px] text-[#64748B]">Under {formatWholeCurrency(2500)} budget</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">AI Health Score</span>
                <div className="text-2xl font-black text-[#1E293B] mt-1">Optimal</div>
                <span className="text-[10px] font-bold text-[#D9A441]">RAG Verified</span>
              </div>
            </div>

            {/* Daily Schedule Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#6B8E7B]" />
                  <h3 className="text-base font-bold text-[#1E293B]">Your Synced Timeline Today</h3>
                </div>
                <span className="text-xs font-semibold text-[#6B8E7B] bg-[#EBF1ED] px-2.5 py-1 rounded-md">
                  Active Sync
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAF7] border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#6B8E7B]">08:00 AM</span>
                    <span className="font-semibold text-[#1E293B]">Vitamin D3 + K2 (2,000 IU)</span>
                  </div>
                  <span className="text-[#6B8E7B] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Taken
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF4E8] border border-[#D9A441]/20">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#D9A441]">12:30 PM</span>
                    <span className="font-semibold text-[#1E293B]">Quinoa & Avocado Bowl (520 kcal)</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#D9A441] bg-white px-2 py-0.5 rounded">
                    Photo Verified
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAF7] border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-500">09:30 PM</span>
                    <span className="font-semibold text-[#1E293B]">Magnesium Glycinate (200 mg)</span>
                  </div>
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Scheduled
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Grounded AI Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Sparkles className="w-5 h-5 text-[#D9A441]" />
                <h3 className="text-base font-bold text-[#1E293B]">Grounded AI Assistant</h3>
              </div>

              <div className="bg-[#FAF4E8] p-4 rounded-2xl border border-[#D9A441]/20 text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9A441] block">
                  Personal Insight for {user.name}
                </span>
                <p className="text-[#1E293B] leading-relaxed">
                  "Based on your meal log history, pairing your iron supplement with Vitamin C rich foods will increase absorption by ~34%."
                </p>
                <div className="pt-2 border-t border-[#D9A441]/20 text-[10px] text-[#64748B]">
                  Source: NIH Clinical Micronutrient Fact Sheet
                </div>
              </div>

              <div className="bg-[#EBF1ED] p-4 rounded-2xl border border-[#6B8E7B]/20 text-xs flex items-center gap-2 text-[#1E293B]">
                <Heart className="w-4 h-4 text-[#6B8E7B] fill-[#6B8E7B] shrink-0" />
                <span className="font-semibold">Consistency score: Excellent! Keep it up.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
