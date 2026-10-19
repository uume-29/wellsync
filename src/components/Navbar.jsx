import React, { useState } from 'react';
import { Leaf, RefreshCw, Menu, X, ArrowRight, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar({ user, onOpenLogin, onOpenSignup, onGoToDashboard, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F8FAF7]/90 backdrop-blur-md border-b border-[#6B8E7B]/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with leaf/sync icon */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#6B8E7B]/10 group-hover:bg-[#6B8E7B]/20 transition-colors">
              <Leaf className="w-5 h-5 text-[#6B8E7B] absolute transform -translate-x-0.5 -translate-y-0.5" />
              <RefreshCw className="w-4 h-4 text-[#D9A441] absolute transform translate-x-1 translate-y-1 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#1E293B]">
                Well<span className="text-[#6B8E7B]">Sync</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium text-[#1E293B] hover:text-[#6B8E7B] transition-colors">
              Home
            </a>
            <a href="#features" className="text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors">
              Features
            </a>
            <a href="/dashboard" className="text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors">
              Dashboard
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onGoToDashboard}
                  className="inline-flex items-center gap-2 bg-[#6B8E7B] hover:bg-[#567564] text-white text-sm font-semibold px-4 py-2 rounded-full shadow-xs transition-all cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Dashboard</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs font-semibold text-[#64748B] hover:text-[#1E293B] p-2 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={onOpenLogin}
                  className="text-sm font-semibold text-[#1E293B] hover:text-[#6B8E7B] px-3 py-2 transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button 
                  onClick={onOpenSignup}
                  className="inline-flex items-center gap-2 bg-[#6B8E7B] hover:bg-[#567564] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#1E293B] p-2 rounded-lg hover:bg-black/5"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-gray-200 px-6 py-6 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4">
            <a 
              href="#home" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-base font-semibold text-[#1E293B] py-1"
            >
              Home
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-base font-medium text-[#64748B] py-1"
            >
              Features
            </a>
            <a 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)} 
              className="text-base font-medium text-[#64748B] py-1"
            >
              Dashboard
            </a>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              {user ? (
                <>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onGoToDashboard(); }}
                    className="w-full flex items-center justify-center gap-2 bg-[#6B8E7B] text-white py-3 rounded-xl font-medium shadow"
                  >
                    <LayoutDashboard className="w-4 h-4" /> My Dashboard
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                    className="w-full text-center py-2 text-sm font-semibold text-red-600 border border-gray-200 rounded-xl"
                  >
                    Logout ({user.email})
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
                    className="w-full text-center py-2.5 text-base font-semibold text-[#1E293B] border border-gray-200 rounded-xl"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenSignup(); }}
                    className="w-full flex items-center justify-center gap-2 bg-[#6B8E7B] text-white py-3 rounded-xl font-medium shadow"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
