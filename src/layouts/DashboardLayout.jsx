import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  Home, User, Utensils, BookOpen, ShoppingCart, Pill, Users, 
  Sparkles, Activity, LogOut, Menu, X, Leaf, RefreshCw, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

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

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: Home, end: true },
    { to: '/dashboard/profile', label: 'My Profile', icon: User },
    { to: '/dashboard/meals', label: 'Meal Planner', icon: Utensils },
    { to: '/dashboard/food-diary', label: 'Food Diary', icon: BookOpen },
    { to: '/dashboard/groceries', label: 'Grocery List', icon: ShoppingCart },
    { to: '/dashboard/medicines', label: 'Medicine Tracker', icon: Pill },
    { to: '/dashboard/caregiver', label: 'Caregiver Access', icon: Users },
    { to: '/dashboard/assistant', label: 'AI Wellness Assistant', icon: Sparkles },
    { to: '/dashboard/insights', label: 'My Insights', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#17201B] flex flex-col md:flex-row">
      
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR                                             */}
      {/* ============================================================ */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white border-r border-gray-200 shrink-0 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#6B8E7B]/10 group-hover:bg-[#6B8E7B]/20 transition-colors">
              <Leaf className="w-5 h-5 text-[#6B8E7B] absolute transform -translate-x-0.5 -translate-y-0.5" />
              <RefreshCw className="w-3.5 h-3.5 text-[#D9A441] absolute transform translate-x-1 translate-y-1 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1E293B] block leading-none">
                Well<span className="text-[#6B8E7B]">Sync</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8E7B] block mt-1">
                Wellness Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const IconComp = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#EBF1ED] text-[#1E293B] font-bold border border-[#6B8E7B]/30'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#6B8E7B]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Logout Area (Sidebar Bottom) */}
        <div className="p-4 border-t border-gray-100 bg-[#F8FAF7]/80">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[#6B8E7B] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1E293B] truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-[#64748B] truncate">{user?.email || ''}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-[#64748B] hover:text-red-700 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE HEADER & NAVIGATION                                   */}
      {/* ============================================================ */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6B8E7B]/10 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-[#6B8E7B]" />
          </div>
          <span className="text-lg font-bold text-[#1E293B]">
            Well<span className="text-[#6B8E7B]">Sync</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-[#1E293B] hover:bg-gray-100"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          <div className="pb-3 mb-2 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6B8E7B] text-white flex items-center justify-center text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E293B]">{user?.name}</p>
              <p className="text-[11px] text-[#64748B]">{user?.email}</p>
            </div>
          </div>

          {navItems.map((item) => {
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

          <div className="pt-3 mt-2 border-t border-gray-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-xl"
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
        <header className="hidden md:flex h-16 bg-white/80 backdrop-blur-xs border-b border-gray-200 px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="font-semibold text-[#1E293B]">Dashboard</span>
            <span>/</span>
            <span className="text-[#6B8E7B] font-medium">Control Center</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] bg-[#F8FAF7] px-3 py-1.5 rounded-full border border-gray-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6B8E7B]" />
              <span>Signed in as <strong className="text-[#1E293B]">{user?.name}</strong></span>
            </div>

            <Link
              to="/"
              className="text-xs font-semibold text-[#64748B] hover:text-[#1E293B] px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Public Site
            </Link>
          </div>
        </header>

        {/* Child Page Render Area */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
