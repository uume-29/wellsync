import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, RefreshCw, ArrowRight, ShieldCheck, Mail, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { user, login, register, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    clearError();
  }, [clearError]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user && !isSubmitting) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');
    clearError();

    // Client-side validations
    if (mode === 'register' && !name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const res = await register({ name: name.trim(), email: email.trim(), password });
        if (res.success) {
          setSuccessMsg(`Welcome to WellSync, ${res.user.name}! Taking you to your dashboard...`);
          setTimeout(() => {
            navigate(destination, { replace: true });
          }, 600);
        } else {
          setFormError(res.message || 'Registration failed. Please try again.');
        }
      } else {
        const res = await login({ email: email.trim(), password });
        if (res.success) {
          setSuccessMsg(`Welcome back, ${res.user.name}! Redirecting...`);
          setTimeout(() => {
            navigate(destination, { replace: true });
          }, 600);
        } else {
          setFormError(res.message || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setFormError('');
    setSuccessMsg('');
    clearError();
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#17201B] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[#6B8E7B]/10 group-hover:bg-[#6B8E7B]/20 transition-colors">
            <Leaf className="w-5 h-5 text-[#6B8E7B] absolute transform -translate-x-0.5 -translate-y-0.5" />
            <RefreshCw className="w-4 h-4 text-[#D9A441] absolute transform translate-x-1 translate-y-1 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#1E293B]">
            Well<span className="text-[#6B8E7B]">Sync</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-[#1E293B] tracking-tight">
          {mode === 'register' ? 'Create your WellSync account' : 'Sign in to your account'}
        </h2>
        <p className="mt-1.5 text-xs text-[#64748B]">
          Your AI-powered personal wellness companion
        </p>
      </div>

      {/* Main Form Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm rounded-3xl border border-gray-200">
          
          {/* Error Banner */}
          {(formError || authError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError || authError}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-4 rounded-xl bg-[#EBF1ED] border border-[#6B8E7B]/30 text-[#17201B] text-xs font-bold flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#6B8E7B] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B8E7B] focus:ring-2 focus:ring-[#6B8E7B]/20 outline-none text-xs transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@wellsync.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B8E7B] focus:ring-2 focus:ring-[#6B8E7B]/20 outline-none text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#6B8E7B] focus:ring-2 focus:ring-[#6B8E7B]/20 outline-none text-xs transition-all"
                />
              </div>
              {mode === 'register' && (
                <p className="mt-1 text-[11px] text-[#64748B]">
                  Must be at least 6 characters long.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 bg-[#6B8E7B] hover:bg-[#567564] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'register' ? 'Create Free Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Register and Login */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            {mode === 'register' ? (
              <p className="text-xs text-[#64748B]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => toggleMode('login')}
                  className="text-[#6B8E7B] font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#64748B]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => toggleMode('register')}
                  className="text-[#6B8E7B] font-bold hover:underline cursor-pointer"
                >
                  Create Free Account
                </button>
              </p>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6B8E7B]" />
            <span>Secure HttpOnly JWT authentication</span>
          </div>

        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
