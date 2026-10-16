import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, BookOpen, ShoppingCart, Pill, Users, 
  Sparkles, Activity, User, ArrowRight, ShieldCheck, CheckCircle2, Clock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHome() {
  const { user } = useAuth();

  const featureCards = [
    {
      title: 'Meal Planner',
      description: 'Create meal plans based on your preferences, allergies, and budget.',
      to: '/dashboard/meals',
      buttonText: 'Open Meal Planner',
      icon: Utensils,
      color: 'text-[#6B8E7B]',
      bg: 'bg-[#EBF1ED]',
      status: 'Phase 2',
    },
    {
      title: 'Food Diary',
      description: 'Record what you eat and review estimated nutrition information.',
      to: '/dashboard/food-diary',
      buttonText: 'Open Food Diary',
      icon: BookOpen,
      color: 'text-[#D9A441]',
      bg: 'bg-[#FAF4E8]',
      status: 'Phase 3',
    },
    {
      title: 'Grocery List',
      description: 'Organize ingredients you need to buy and optimize your grocery budget.',
      to: '/dashboard/groceries',
      buttonText: 'Open Grocery List',
      icon: ShoppingCart,
      color: 'text-[#6B8E7B]',
      bg: 'bg-[#EBF1ED]',
      status: 'Phase 2',
    },
    {
      title: 'Medicine Tracker',
      description: 'Manage your medicine schedule and record daily doses with gentle reminders.',
      to: '/dashboard/medicines',
      buttonText: 'Open Medicine Tracker',
      icon: Pill,
      color: 'text-[#D9A441]',
      bg: 'bg-[#FAF4E8]',
      status: 'Phase 2',
    },
    {
      title: 'Caregiver Access',
      description: 'Share wellness updates and medicine adherence with a trusted family member or caregiver.',
      to: '/dashboard/caregiver',
      buttonText: 'Open Caregiver Access',
      icon: Users,
      color: 'text-[#1E293B]',
      bg: 'bg-slate-100',
      status: 'Phase 2',
    },
    {
      title: 'AI Wellness Assistant',
      description: 'Ask general wellness and nutrition questions with citations from trusted sources.',
      to: '/dashboard/assistant',
      buttonText: 'Open AI Assistant',
      icon: Sparkles,
      color: 'text-[#6B8E7B]',
      bg: 'bg-[#EBF1ED]',
      status: 'Phase 3',
    },
    {
      title: 'My Insights',
      description: 'Review your long-term wellness patterns, consistency, and progress.',
      to: '/dashboard/insights',
      buttonText: 'Open My Insights',
      icon: Activity,
      color: 'text-[#1E293B]',
      bg: 'bg-slate-100',
      status: 'Phase 4',
    },
    {
      title: 'My Profile',
      description: 'Manage your dietary preferences, allergies, budget, and wellness goals.',
      to: '/dashboard/profile',
      buttonText: 'Manage Profile',
      icon: User,
      color: 'text-[#6B8E7B]',
      bg: 'bg-[#EBF1ED]',
      status: 'Available',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* ============================================================ */}
      {/* WELCOME BANNER                                               */}
      {/* ============================================================ */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1ED] border border-[#6B8E7B]/20 text-[11px] font-bold text-[#6B8E7B] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>WellSync Foundation Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Good morning, {user?.name || 'Friend'}! 👋
          </h1>

          <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
            Welcome to WellSync — your AI-powered personal wellness companion. This dashboard is your central control center to manage meals, medicine adherence, grocery shopping, and wellness queries in one organized place.
          </p>

          {/* User Account Snapshot */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
            <div>
              <span className="text-[#1E293B] font-semibold">Account: </span>
              <span>{user?.email}</span>
            </div>
            <span className="hidden sm:inline text-gray-300">•</span>
            <div>
              <span className="text-[#1E293B] font-semibold">Session: </span>
              <span className="text-[#6B8E7B] font-medium">HttpOnly Cookie Verified</span>
            </div>
            <span className="hidden sm:inline text-gray-300">•</span>
            <div>
              <span className="text-[#1E293B] font-semibold">Status: </span>
              <span className="text-[#6B8E7B] font-medium">Phase 1 Foundation Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURE MODULE CARDS GRID                                    */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B]">WellSync Modules</h2>
            <p className="text-xs text-[#64748B]">Select any module below to view its planned features and roadmap.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featureCards.map((card) => {
            const IconComp = card.icon;
            const isAvailable = card.status === 'Available';

            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#F8FAF7] text-[#64748B] border border-gray-200'
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#1E293B] mb-1.5">
                    {card.title}
                  </h3>

                  <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                    {card.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <Link
                    to={card.to}
                    className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isAvailable
                        ? 'bg-[#6B8E7B] hover:bg-[#567564] text-white shadow-2xs'
                        : 'bg-[#F8FAF7] hover:bg-gray-100 text-[#1E293B] border border-gray-200'
                    }`}
                  >
                    <span>{card.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* QUICK GETTING STARTED GUIDE                                  */}
      {/* ============================================================ */}
      <section className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
        <h3 className="text-sm font-bold text-[#1E293B] mb-1">Getting Started with Phase 1</h3>
        <p className="text-xs text-[#64748B] mb-4">
          Your account is registered and authenticated. Here is what has been built and what is planned next:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200">
            <span className="font-bold text-[#1E293B] block mb-1">1. Authentication</span>
            <p className="text-[#64748B] leading-relaxed">
              Real JWT sessions stored in HttpOnly cookies, protecting your dashboard routes on every page refresh.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200">
            <span className="font-bold text-[#1E293B] block mb-1">2. Intuitive Navigation</span>
            <p className="text-[#64748B] leading-relaxed">
              Clean sidebar with direct links to all upcoming modules, adhering strictly to WellSync design guidelines.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200">
            <span className="font-bold text-[#1E293B] block mb-1">3. Next: Phase 2 Core</span>
            <p className="text-[#64748B] leading-relaxed">
              Connecting persistent health profile preferences, medicine schedule tracking, and budget-aware meal plans.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
