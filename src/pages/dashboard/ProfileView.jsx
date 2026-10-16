import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Calendar, ShieldCheck, Key, LogOut, 
  ArrowLeft, CheckCircle2, Sparkles, Sliders 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileView() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent Member';

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Home</span>
        </Link>
      </div>

      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center font-bold text-2xl shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight">
              {user?.name || 'WellSync User'}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6B8E7B] bg-[#EBF1ED] px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Authenticated Member
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Account Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-[#1E293B]">Account Information</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Verified credentials stored securely in MongoDB.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200">
            <span className="text-[#64748B] block mb-1">Full Name</span>
            <div className="flex items-center gap-2 font-bold text-[#1E293B]">
              <User className="w-4 h-4 text-[#6B8E7B]" />
              <span>{user?.name}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200">
            <span className="text-[#64748B] block mb-1">Email Address</span>
            <div className="flex items-center gap-2 font-bold text-[#1E293B]">
              <Mail className="w-4 h-4 text-[#6B8E7B]" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200">
            <span className="text-[#64748B] block mb-1">Member Since</span>
            <div className="flex items-center gap-2 font-bold text-[#1E293B]">
              <Calendar className="w-4 h-4 text-[#6B8E7B]" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200">
            <span className="text-[#64748B] block mb-1">User Identifier</span>
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-[#1E293B]">
              <Key className="w-4 h-4 text-[#6B8E7B]" />
              <span className="truncate">{user?.id || 'Verified'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences & Health Settings Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Wellness & Dietary Preferences</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              These settings will directly customize your AI meal plans and allergen safety checks in Phase 2.
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#D9A441] bg-[#FAF4E8] border border-[#D9A441]/30 px-2.5 py-1 rounded-full">
            Phase 2 Integration
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200 flex flex-col justify-between">
            <div>
              <span className="font-bold text-[#1E293B] block mb-1">Dietary Restriction</span>
              <p className="text-[#64748B]">e.g. Vegetarian, Gluten-Free, Vegan, Mediterranean, Balanced.</p>
            </div>
            <span className="mt-3 text-[11px] font-semibold text-[#6B8E7B]">Configurable in Phase 2</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200 flex flex-col justify-between">
            <div>
              <span className="font-bold text-[#1E293B] block mb-1">Known Allergies</span>
              <p className="text-[#64748B]">e.g. Peanuts, Shellfish, Dairy, Soy, Tree Nuts, Eggs.</p>
            </div>
            <span className="mt-3 text-[11px] font-semibold text-[#6B8E7B]">Configurable in Phase 2</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200 flex flex-col justify-between">
            <div>
              <span className="font-bold text-[#1E293B] block mb-1">Weekly Grocery Budget</span>
              <p className="text-[#64748B]">Auto-scales recipe portions to stay within your spending targets.</p>
            </div>
            <span className="mt-3 text-[11px] font-semibold text-[#6B8E7B]">Configurable in Phase 2</span>
          </div>
        </div>
      </div>

      {/* Security Info Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <h3 className="font-bold text-[#1E293B]">Security & Session Privacy</h3>
          <p className="text-[#64748B] mt-0.5 leading-relaxed">
            Your login token is encrypted and transmitted in an HttpOnly cookie that cannot be read by third-party JavaScript. Passwords are never stored in plain text and are salted using bcrypt before database storage.
          </p>
        </div>
      </div>
    </div>
  );
}
