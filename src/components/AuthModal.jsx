import React, { useState, useEffect } from 'react';
import { X, Leaf, ArrowRight, ShieldCheck, Mail, Lock, User, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register } = useAuth();

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const res = await register({ name: name.trim(), email: email.trim(), password });
        if (res.success && res.user) {
          setSuccessMsg(`Welcome to WellSync, ${res.user.name}! Redirecting to your dashboard...`);
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess(res.user);
            onClose();
          }, 800);
        } else {
          setErrorMsg(res.message || 'Registration failed.');
        }
      } else {
        const res = await login({ email: email.trim(), password });
        if (res.success && res.user) {
          setSuccessMsg(`Welcome back, ${res.user.name}! Redirecting to your dashboard...`);
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess(res.user);
            onClose();
          }, 800);
        } else {
          setErrorMsg(res.message || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Icon */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1E293B]">
              {mode === 'signup' ? 'Get Started with WellSync' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-[#64748B]">Your AI-powered personal wellness companion</p>
          </div>
        </div>

        {/* Error Feedback Banner */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Feedback Banner */}
        {successMsg ? (
          <div className="bg-[#EBF1ED] p-5 rounded-2xl text-center border border-[#6B8E7B]/30 my-4">
            <ShieldCheck className="w-8 h-8 text-[#6B8E7B] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1E293B]">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B8E7B] outline-none text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@wellsync.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B8E7B] outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B8E7B] outline-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#6B8E7B] hover:bg-[#567564] text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  {mode === 'signup' ? 'Create Free Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              {mode === 'signup' ? (
                <p className="text-xs text-[#64748B]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setErrorMsg(''); setMode('login'); }}
                    className="text-[#6B8E7B] font-bold hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              ) : (
                <p className="text-xs text-[#64748B]">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setErrorMsg(''); setMode('signup'); }}
                    className="text-[#6B8E7B] font-bold hover:underline cursor-pointer"
                  >
                    Get Started
                  </button>
                </p>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
