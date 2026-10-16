import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Home, User, Utensils, BookOpen, ShoppingCart, Pill, Users, 
  Sparkles, Activity, LogOut, Menu, X, Leaf, RefreshCw, ExternalLink,
  ChevronRight, ShieldCheck, Bell, Sparkle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const routeTitleMap = {
  '/dashboard': { title: 'Overview', subtitle: 'Your personalized wellness summary & daily habits' },
  '/dashboard/profile': { title: 'My Profile', subtitle: 'Dietary preferences, budget targets & wellness goals' },
  '/dashboard/meals': { title: 'Meal Planner', subtitle: 'Allergy-aware, budget-optimized weekly nutrition' },
  '/dashboard/food-diary': { title: 'Food Diary', subtitle: 'Multimodal nutrient tracking & visual meal journal' },
  '/dashboard/groceries': { title: 'Grocery List', subtitle: 'Smart shopping list organized by aisle & weekly budget' },
  '/dashboard/medicines': { title: 'Medicine Tracker', subtitle: 'Daily supplement & medication adherence schedules' },
  '/dashboard/caregiver': { title: 'Caregiver Access', subtitle: 'Privacy-first sharing with family & healthcare providers' },
  '/dashboard/assistant': { title: 'AI Wellness Assistant', subtitle: 'Evidence-grounded answers with biomedical citations' },
  '/dashboard/insights': { title: 'My Insights', subtitle: 'Holistic habit patterns & weekly health reflections' },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentRouteMeta = routeTitleMap[location.pathname] || {
    title: 'Control Center',
    subtitle: 'Manage your personal wellness journey'
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const navGroups = [
    {
      group: 'Core Hub',
      items: [
        { to: '/dashboard', label: 'Overview', icon: Home, end: true },
        { to: '/dashboard/profile', label: 'My Profile & Goals', icon: User },
      ]
    },
    {
      group: 'Nutrition & Food',
      items: [
        { to: '/dashboard/meals', label: 'Meal Planner', icon: Utensils, badge: 'Phase 2' },
        { to: '/dashboard/food-diary', label: 'Food Diary', icon: BookOpen },
        { to: '/dashboard/groceries', label: 'Grocery List', icon: ShoppingCart },
      ]
    },
    {
      group: 'Routine & Adherence',
      items: [
        { to: '/dashboard/medicines', label: 'Medicine Tracker', icon: Pill },
        { to: '/dashboard/caregiver', label: 'Caregiver Access', icon: Users },
      ]
    },
    {
      group: 'Intelligence',
      items: [
        { to: '/dashboard/assistant', label: 'AI Wellness Assistant', icon: Sparkles, highlight: true },
        { to: '/dashboard/insights', label: 'My Insights', icon: Activity },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#17201B] flex flex-col md:flex-row antialiased selection:bg-[#6B8E7B]/20 selection:text-[#1E293B]">
      
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR                                             */}
      {/* ============================================================ */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white border-r border-gray-200/90 shrink-0 sticky top-0 h-screen shadow-2xs z-30">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50 rounded-xl"
            aria-label="WellSync Dashboard Home"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EBF1ED] to-[#FAF4E8] border border-[#6B8E7B]/20 group-hover:border-[#6B8E7B]/40 group-hover:scale-105 transition-all duration-300 shadow-2xs">
              <Leaf className="w-5 h-5 text-[#6B8E7B] transform -translate-x-0.5 -translate-y-0.5" />
              <RefreshCw className="w-3.5 h-3.5 text-[#D9A441] absolute transform translate-x-1 translate-y-1 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#1E293B] block leading-none">
                Well<span className="text-[#6B8E7B]">Sync</span>
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8E7B]">
                  Workspace Sync
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-3.5 py-4 space-y-4 overflow-y-auto" aria-label="Dashboard navigation">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8]">
                {group.group}
              </div>
              {group.items.map((item) => {
                const IconComp = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50 ${
                        isActive
                          ? 'bg-[#EBF1ED] text-[#1E293B] font-bold border border-[#6B8E7B]/25 shadow-2xs'
                          : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F2F6F3]/70'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1 rounded-lg transition-colors duration-200 ${
                            isActive 
                              ? 'bg-[#6B8E7B] text-white shadow-2xs' 
                              : item.highlight 
                                ? 'text-[#6B8E7B] group-hover:text-[#567564]' 
                                : 'text-[#64748B] group-hover:text-[#1E293B]'
                          }`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>

                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#6B8E7B] shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Profile & Logout Area (Sidebar Bottom) */}
        <div className="p-4 border-t border-gray-100 bg-[#F8FAF7]/95">
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-all border border-transparent hover:border-gray-200/80 group mb-2.5"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6B8E7B] to-[#567564] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span 
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" 
                title="Active Session"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1E293B] truncate group-hover:text-[#6B8E7B] transition-colors">
                {user?.name || 'Member'}
              </p>
              <p className="text-[11px] text-[#64748B] truncate">{user?.email || 'Authenticated'}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#6B8E7B] transition-colors" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-[#64748B] hover:text-red-700 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE HEADER & NAVIGATION                                   */}
      {/* ============================================================ */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#EBF1ED] to-[#FAF4E8] border border-[#6B8E7B]/20 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-[#6B8E7B]" />
          </div>
          <span className="text-lg font-extrabold text-[#1E293B]">
            Well<span className="text-[#6B8E7B]">Sync</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/profile"
            className="w-7 h-7 rounded-full bg-[#6B8E7B] text-white flex items-center justify-center text-xs font-bold"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#1E293B] hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-4 shadow-xl animate-fade-slide-up">
          <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#1E293B]">{user?.name}</p>
              <p className="text-[11px] text-[#64748B]">{user?.email}</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6B8E7B] bg-[#EBF1ED] px-2.5 py-1 rounded-lg"
            >
              <span>Public Landing</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-[#EBF1ED] text-[#1E293B] font-bold border border-[#6B8E7B]/30'
                            : 'text-[#64748B] hover:bg-gray-50'
                        }`
                      }
                    >
                      <IconComp className="w-4 h-4 text-[#6B8E7B]" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA                                            */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link to="/dashboard" className="font-semibold text-[#1E293B] hover:text-[#6B8E7B] transition-colors">
                WellSync
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-[#6B8E7B] font-bold">{currentRouteMeta.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dietary Status Pill */}
            {user?.preferences?.dietaryRestrictions?.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-[#6B8E7B] bg-[#EBF1ED] px-3 py-1 rounded-full border border-[#6B8E7B]/20">
                <Leaf className="w-3 h-3" />
                <span>{user.preferences.dietaryRestrictions.slice(0, 2).join(' • ')}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-[#64748B] bg-[#F8FAF7] px-3.5 py-1.5 rounded-full border border-gray-200/80 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active Member: <strong className="text-[#1E293B] font-bold">{user?.name}</strong></span>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] px-3 py-1.5 rounded-xl hover:bg-gray-100/80 transition-all border border-gray-200/70 shadow-2xs"
            >
              <span>Public Landing</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          </div>
        </header>

        {/* Child Page Render Area */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto animate-fade-slide-up">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
