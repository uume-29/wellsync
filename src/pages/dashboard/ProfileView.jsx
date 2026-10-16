import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, ShieldCheck, LogOut, 
  ArrowLeft, CheckCircle2, AlertCircle, Save, Plus, X, 
  Sparkles, Target, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatWholeCurrency } from '../../utils/currency';

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Mediterranean',
  'Keto / Low-Carb',
  'Balanced / Whole Food',
  'Gluten-Free',
  'Dairy-Free',
];

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Dairy',
  'Eggs',
  'Soy',
  'Wheat',
  'Fish',
  'Sesame',
];

const WELLNESS_GOALS = [
  { id: 'clean_eating', label: 'Clean & Whole Eating', desc: 'Focus on unprocessed, nutrient-dense natural foods' },
  { id: 'sustained_energy', label: 'Sustained Daily Energy', desc: 'Even glycemic impact meals without afternoon energy dips' },
  { id: 'digestive_health', label: 'Digestive Wellness', desc: 'High-fiber, prebiotic and probiotic-friendly ingredients' },
  { id: 'budget_mastery', label: 'Smart Budget Planning', desc: 'Nutrient-rich meals optimized under weekly spending targets' },
  { id: 'muscle_recovery', label: 'Active Muscle Recovery', desc: 'Balanced lean protein targets for athletic recovery' },
  { id: 'heart_health', label: 'Cardiovascular Support', desc: 'Low-sodium, healthy unsaturated fats and omega-3s' },
];

export default function ProfileView() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  // Form State initialized from user preferences
  const [name, setName] = useState(user?.name || '');
  const [selectedDiets, setSelectedDiets] = useState(user?.preferences?.dietaryRestrictions || []);
  const [selectedAllergies, setSelectedAllergies] = useState(user?.preferences?.allergies || []);
  const [customAllergen, setCustomAllergen] = useState('');
  const [weeklyBudget, setWeeklyBudget] = useState(user?.preferences?.weeklyBudget ? (user.preferences.weeklyBudget <= 150 ? 2500 : user.preferences.weeklyBudget) : 2500);
  const [calorieTarget, setCalorieTarget] = useState(user?.preferences?.calorieTarget || 2000);
  const [selectedGoals, setSelectedGoals] = useState(user?.preferences?.wellnessGoals || ['clean_eating', 'sustained_energy']);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  // Sync state if user reloads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.preferences) {
        if (user.preferences.dietaryRestrictions) setSelectedDiets(user.preferences.dietaryRestrictions);
        if (user.preferences.allergies) setSelectedAllergies(user.preferences.allergies);
        if (user.preferences.weeklyBudget) setWeeklyBudget(user.preferences.weeklyBudget <= 150 ? 2500 : user.preferences.weeklyBudget);
        if (user.preferences.calorieTarget) setCalorieTarget(user.preferences.calorieTarget);
        if (user.preferences.wellnessGoals) setSelectedGoals(user.preferences.wellnessGoals);
      }
    }
  }, [user]);

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

  const toggleDiet = (diet) => {
    setSelectedDiets(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  const toggleAllergy = (allergy) => {
    setSelectedAllergies(prev => 
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const handleAddCustomAllergen = (e) => {
    e.preventDefault();
    if (!customAllergen.trim()) return;
    const clean = customAllergen.trim();
    if (!selectedAllergies.includes(clean)) {
      setSelectedAllergies(prev => [...prev, clean]);
    }
    setCustomAllergen('');
  };

  const handleRemoveAllergy = (allergy) => {
    setSelectedAllergies(prev => prev.filter(a => a !== allergy));
  };

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setSaveError('Please enter your name.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const preferencesData = {
        dietaryRestrictions: selectedDiets,
        allergies: selectedAllergies,
        weeklyBudget: Number(weeklyBudget),
        calorieTarget: Number(calorieTarget),
        wellnessGoals: selectedGoals,
      };

      const res = await api.auth.updateProfile({
        name: name.trim(),
        preferences: preferencesData,
      });

      if (res.success && res.user) {
        setUser(res.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setSaveError(err.response?.data?.message || err.message || 'Could not save profile changes.');
    } finally {
      setSaving(false);
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
    <div className="space-y-8 animate-fade-slide-up max-w-4xl mx-auto pb-12">
      
      {/* Top Breadcrumb Navigation */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50 rounded-lg px-1.5 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Home</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center font-bold text-2xl shrink-0 shadow-2xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span 
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" 
              title="Session Verified"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight">
              {user?.name || 'WellSync Member'}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6B8E7B] bg-[#EBF1ED] px-2.5 py-0.5 rounded-full border border-[#6B8E7B]/20">
                <ShieldCheck className="w-3 h-3" /> Authenticated Member
              </span>
              <span className="text-[10px] text-[#64748B] bg-[#F8FAF7] px-2 py-0.5 rounded-full border border-gray-200">
                Joined {formattedDate}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl border border-red-200 transition-all cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <LogOut className="w-4 h-4" />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Main Profile Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">

        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <User className="w-4 h-4 text-[#6B8E7B]" />
                <span>Personal Information</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">Your core credentials and display profile.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#6B8E7B] focus:ring-2 focus:ring-[#6B8E7B]/20 text-xs text-[#1E293B] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Email Address <span className="text-[10px] text-[#64748B] font-normal">(Primary Identifier)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F8FAF7] text-gray-500 text-xs cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Dietary Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6B8E7B]" />
                <span>Dietary Preferences</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Choose any eating frameworks you follow. Our Meal Planner strictly respects these tags.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {DIETARY_OPTIONS.map((diet) => {
              const active = selectedDiets.includes(diet);
              return (
                <button
                  type="button"
                  key={diet}
                  onClick={() => toggleDiet(diet)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#6B8E7B] text-white shadow-2xs'
                      : 'bg-[#F8FAF7] text-[#1E293B] border border-gray-200 hover:border-[#6B8E7B]/40'
                  }`}
                >
                  {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{diet}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Allergies & Intolerances */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D9A441]" />
                <span>Food Allergies & Exclusions</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Ingredients to flag as hazardous. Excluded recipes will never appear in your weekly plan.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-2">Common Allergens</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGIES.map((allergy) => {
                const active = selectedAllergies.includes(allergy);
                return (
                  <button
                    type="button"
                    key={allergy}
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-[#FAF4E8] text-[#D9A441] border border-[#D9A441] font-bold'
                        : 'bg-[#F8FAF7] text-[#64748B] border border-gray-200 hover:text-[#1E293B]'
                    }`}
                  >
                    {active ? `✓ ${allergy}` : `+ ${allergy}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Allergen Input */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Custom Ingredient Exclusions</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAllergen}
                onChange={(e) => setCustomAllergen(e.target.value)}
                placeholder="e.g. Cilantro, Bell Peppers, Mustard"
                className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#1E293B] focus:border-[#6B8E7B] focus:ring-2 focus:ring-[#6B8E7B]/20 outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomAllergen}
                className="px-4 py-2 bg-[#EBF1ED] hover:bg-[#dce7e0] text-[#6B8E7B] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Selected Allergies Badges */}
            {selectedAllergies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedAllergies.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(item)}
                      className="hover:text-red-900 cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Budget & Nutrition Goals */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center font-extrabold text-xs">₹</span>
                <span>Budget (INR) & Caloric Targets</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">Parameters that guide grocery compilation and portion sizing in Indian Rupees.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Weekly Budget */}
            <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1E293B]">Weekly Grocery Budget (INR)</span>
                <span className="text-sm font-extrabold text-[#6B8E7B]">{formatWholeCurrency(weeklyBudget)} / wk</span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="100"
                value={weeklyBudget}
                onChange={(e) => setWeeklyBudget(Number(e.target.value))}
                className="w-full accent-[#6B8E7B] cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-[#64748B] font-semibold">
                <span>Min: ₹500</span>
                <span>Target: {formatWholeCurrency(weeklyBudget)}</span>
                <span>Max: ₹15,000</span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                AI meal recommendations will prioritize in-season produce, pulses, and staples to stay within your ₹ budget.
              </p>
            </div>

            {/* Daily Caloric Target */}
            <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1E293B]">Daily Caloric Target</span>
                <span className="text-sm font-extrabold text-[#D9A441]">{calorieTarget} kcal</span>
              </div>
              <input
                type="range"
                min="1400"
                max="3500"
                step="50"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(Number(e.target.value))}
                className="w-full accent-[#D9A441] cursor-pointer"
              />
              <p className="text-[11px] text-[#64748B]">
                Macro distributions (protein, carbs, fats) are calculated based on your wellness goals.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Wellness Goals */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#6B8E7B]" />
                <span>Wellness Goals</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">Select what matters most for your daily routine.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WELLNESS_GOALS.map((goal) => {
              const active = selectedGoals.includes(goal.id);
              return (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    active
                      ? 'bg-[#EBF1ED]/70 border-[#6B8E7B] shadow-2xs'
                      : 'bg-[#F8FAF7] border-gray-200 hover:border-[#6B8E7B]/40'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    active ? 'bg-[#6B8E7B] text-white' : 'bg-white border border-gray-300'
                  }`}>
                    {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">{goal.label}</h3>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">{goal.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Banners & Submit Bar */}
        {saveError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Preferences saved! Your meal planner and grocery lists are updated.</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-[#64748B]">
            All changes persist directly to your secure user record in MongoDB.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
