import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Mail, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, 
  Save, X, Sparkles, Target, Edit3, XCircle, 
  Activity, DollarSign, Heart, Lock, Calendar, RefreshCw, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatWholeCurrency } from '../../utils/currency';

// Preset options matching WellSync clinical wellness architecture
const DIETARY_PREFERENCES = [
  { id: 'Vegetarian', label: 'Vegetarian', desc: 'Plant foods & dairy; no meat or seafood' },
  { id: 'Vegan', label: 'Vegan', desc: '100% plant foods; zero animal byproducts' },
  { id: 'Eggetarian', label: 'Eggetarian', desc: 'Vegetarian diet including poultry eggs' },
  { id: 'Pescatarian', label: 'Pescatarian', desc: 'Plant-based with fish and seafood' },
  { id: 'Non-Vegetarian', label: 'Non-Vegetarian', desc: 'Omnivorous; includes poultry, meat & fish' },
  { id: 'Jain', label: 'Jain Vegetarian', desc: 'Strict vegetarian without underground roots' },
];

const PREFERRED_DIET_TYPES = [
  { id: 'Balanced / Whole Food', label: 'Balanced / Whole Food', desc: 'Classic plate ratio: vegetables, clean protein & complex carbs' },
  { id: 'High Protein', label: 'High Protein', desc: 'Elevated protein ratio (> 25% kcal) for satiety & lean muscle' },
  { id: 'Keto / Low-Carb', label: 'Keto / Low-Carb', desc: 'Controlled carbohydrates (< 50g net) favoring healthy fats' },
  { id: 'Mediterranean', label: 'Mediterranean', desc: 'Cold-pressed olive oil, legumes, whole grains, nuts & herbs' },
  { id: 'Plant-Based', label: 'Plant-Based', desc: 'Rich in pulses, grains, seasonal vegetables, seeds & greens' },
  { id: 'Intermittent Fasting', label: 'Intermittent Fasting', desc: 'Time-restricted eating window (16:8) with nutrient density' },
];

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Dairy',
  'Eggs',
  'Soy',
  'Wheat / Gluten',
  'Fish',
  'Sesame',
  'Mustard',
  'Corn',
  'Sulfites',
];

const WELLNESS_GOALS = [
  { id: 'clean_eating', label: 'Clean & Whole Eating', desc: 'Unprocessed, nutrient-dense foods with minimal additives' },
  { id: 'sustained_energy', label: 'Sustained Daily Energy', desc: 'Steady glycemic impact meals preventing afternoon energy slumps' },
  { id: 'digestive_health', label: 'Digestive Wellness', desc: 'High-fiber, prebiotic and gut-biome friendly ingredients' },
  { id: 'weight_management', label: 'Healthy Weight Target', desc: 'Portion-balanced meals optimized for long-term body composition' },
  { id: 'muscle_recovery', label: 'Active Muscle Recovery', desc: 'Balanced amino acids and protein timing for physical fitness' },
  { id: 'heart_health', label: 'Cardiovascular Support', desc: 'Low-sodium, healthy unsaturated lipids and antioxidant greens' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, minimal daily movement, < 3,000 steps/day' },
  { id: 'lightly_active', label: 'Lightly Active', desc: 'Light walking or light exercise 1–3 days/week' },
  { id: 'moderately_active', label: 'Moderately Active', desc: 'Moderate workout 3–5 days/week or active daily work' },
  { id: 'very_active', label: 'Very Active', desc: 'Vigorous training 6–7 days/week' },
  { id: 'extremely_active', label: 'Extremely Active', desc: 'Competitive athletic training or heavy physical labor' },
];

const BUDGET_PRESETS = [6000, 10000, 15000, 25000];

export default function ProfileView() {
  const { user, setUser } = useAuth();

  // Workflow state: View Mode vs Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Saved Profile State (Source of Truth from MongoDB)
  const [savedProfile, setSavedProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: '',
    dietaryPreference: 'Vegetarian',
    foodAllergies: [],
    wellnessGoals: ['clean_eating', 'sustained_energy'],
    activityLevel: 'moderately_active',
    preferredDietType: 'Balanced / Whole Food',
    monthlyFoodBudget: 10000,
    calorieTarget: 2000,
    memberSince: user?.createdAt || null,
  });

  // Working Form State (Used while in Edit Mode)
  const [formData, setFormData] = useState({ ...savedProfile });
  const [customAllergen, setCustomAllergen] = useState('');

  // 1. Fetch profile from MongoDB on mount
  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      setLoadingProfile(true);
      setErrorMessage('');
      try {
        const res = await api.profile.getProfile();
        if (isMounted && res.success && res.profile) {
          const p = res.profile;
          const loadedData = {
            name: p.name || user?.name || '',
            email: p.email || user?.email || '',
            age: p.age !== null && p.age !== undefined ? p.age : '',
            dietaryPreference: p.dietaryPreference || 'Vegetarian',
            foodAllergies: Array.isArray(p.foodAllergies) ? p.foodAllergies : (user?.preferences?.allergies || []),
            wellnessGoals: Array.isArray(p.wellnessGoals) && p.wellnessGoals.length > 0 ? p.wellnessGoals : (user?.preferences?.wellnessGoals || ['clean_eating', 'sustained_energy']),
            activityLevel: p.activityLevel || 'moderately_active',
            preferredDietType: p.preferredDietType || 'Balanced / Whole Food',
            monthlyFoodBudget: Number(p.monthlyFoodBudget) || (user?.preferences?.weeklyBudget ? user.preferences.weeklyBudget * 4 : 10000),
            calorieTarget: Number(p.calorieTarget) || user?.preferences?.calorieTarget || 2000,
            memberSince: p.memberSince || user?.createdAt || null,
          };

          setSavedProfile(loadedData);
          setFormData(loadedData);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (isMounted) {
          // Fall back gracefully to user context
          const fallback = {
            name: user?.name || '',
            email: user?.email || '',
            age: '',
            dietaryPreference: user?.preferences?.dietaryRestrictions?.[0] || 'Vegetarian',
            foodAllergies: user?.preferences?.allergies || [],
            wellnessGoals: user?.preferences?.wellnessGoals || ['clean_eating', 'sustained_energy'],
            activityLevel: 'moderately_active',
            preferredDietType: 'Balanced / Whole Food',
            monthlyFoodBudget: user?.preferences?.weeklyBudget ? user.preferences.weeklyBudget * 4 : 10000,
            calorieTarget: user?.preferences?.calorieTarget || 2000,
            memberSince: user?.createdAt || null,
          };
          setSavedProfile(fallback);
          setFormData(fallback);
          setErrorMessage('Could not load profile from server. Displaying cached session details.');
        }
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle entering Edit Mode
  const handleStartEdit = () => {
    setFormData({ ...savedProfile });
    setValidationErrors({});
    setErrorMessage('');
    setSaveSuccess(false);
    setIsEditing(true);
  };

  // Handle Canceling edits (reverts working state back to savedProfile)
  const handleCancelEdit = () => {
    setFormData({ ...savedProfile });
    setValidationErrors({});
    setErrorMessage('');
    setCustomAllergen('');
    setIsEditing(false);
  };

  // Toggle helpers
  const toggleAllergy = (allergy) => {
    setFormData(prev => {
      const exists = prev.foodAllergies.includes(allergy);
      return {
        ...prev,
        foodAllergies: exists 
          ? prev.foodAllergies.filter(a => a !== allergy)
          : [...prev.foodAllergies, allergy]
      };
    });
  };

  const handleAddCustomAllergen = (e) => {
    e.preventDefault();
    const clean = customAllergen.trim();
    if (!clean) return;
    if (!formData.foodAllergies.includes(clean)) {
      setFormData(prev => ({
        ...prev,
        foodAllergies: [...prev.foodAllergies, clean]
      }));
    }
    setCustomAllergen('');
  };

  const handleRemoveAllergy = (allergyToRemove) => {
    setFormData(prev => ({
      ...prev,
      foodAllergies: prev.foodAllergies.filter(a => a !== allergyToRemove)
    }));
  };

  const toggleGoal = (goalId) => {
    setFormData(prev => {
      const exists = prev.wellnessGoals.includes(goalId);
      if (exists && prev.wellnessGoals.length === 1) {
        // Prevent deselecting all goals
        return prev;
      }
      return {
        ...prev,
        wellnessGoals: exists 
          ? prev.wellnessGoals.filter(g => g !== goalId)
          : [...prev.wellnessGoals, goalId]
      };
    });
  };

  // Validate form before sending
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Please provide your full name.';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name cannot exceed 100 characters.';
    }

    if (formData.age !== '' && formData.age !== null) {
      const numAge = Number(formData.age);
      if (isNaN(numAge) || !Number.isInteger(numAge) || numAge < 1 || numAge > 120) {
        errors.age = 'Age must be a valid whole number between 1 and 120.';
      }
    }

    if (formData.monthlyFoodBudget !== '' && formData.monthlyFoodBudget !== null) {
      const numBudget = Number(formData.monthlyFoodBudget);
      if (isNaN(numBudget) || numBudget < 0) {
        errors.monthlyFoodBudget = 'Budget must be a positive number in INR (₹).';
      }
    }

    if (formData.calorieTarget !== '' && formData.calorieTarget !== null) {
      const numCal = Number(formData.calorieTarget);
      if (isNaN(numCal) || numCal < 500 || numCal > 10000) {
        errors.calorieTarget = 'Daily calorie target must be between 500 and 10,000 kcal.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save changes to backend MongoDB
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const payload = {
        name: formData.name.trim(),
        age: formData.age !== '' ? Number(formData.age) : null,
        dietaryPreference: formData.dietaryPreference,
        foodAllergies: formData.foodAllergies,
        wellnessGoals: formData.wellnessGoals,
        activityLevel: formData.activityLevel,
        preferredDietType: formData.preferredDietType,
        monthlyFoodBudget: Number(formData.monthlyFoodBudget),
        calorieTarget: Number(formData.calorieTarget),
      };

      const res = await api.profile.updateProfile(payload);

      if (res.success && res.profile) {
        const p = res.profile;
        const newSaved = {
          name: p.name || formData.name.trim(),
          email: p.email || savedProfile.email,
          age: p.age !== null && p.age !== undefined ? p.age : '',
          dietaryPreference: p.dietaryPreference,
          foodAllergies: p.foodAllergies || [],
          wellnessGoals: p.wellnessGoals || [],
          activityLevel: p.activityLevel,
          preferredDietType: p.preferredDietType,
          monthlyFoodBudget: Number(p.monthlyFoodBudget),
          calorieTarget: Number(p.calorieTarget),
          memberSince: p.memberSince || savedProfile.memberSince,
        };

        setSavedProfile(newSaved);
        setFormData(newSaved);
        setIsEditing(false);
        setSaveSuccess(true);

        // Update global auth context user state
        if (res.user) {
          setUser(prev => ({
            ...prev,
            name: res.user.name,
            preferences: res.user.preferences || prev?.preferences,
          }));
        }

        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMessage(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      const backendMsg = err.response?.data?.message || err.message || 'Could not save profile changes.';
      setErrorMessage(backendMsg);
    } finally {
      setSaving(false);
    }
  };

  const memberDateFormatted = savedProfile.memberSince
    ? new Date(savedProfile.memberSince).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '2026';

  // Loading skeleton screen
  if (loadingProfile) {
    return (
      <div className="space-y-6 animate-pulse pb-16">
        <div className="h-6 w-48 bg-gray-200 rounded-lg" />
        <div className="h-44 bg-white rounded-3xl border border-gray-200/80 p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gray-200" />
          <div className="space-y-3 flex-1">
            <div className="h-6 w-60 bg-gray-200 rounded-md" />
            <div className="h-4 w-40 bg-gray-200 rounded-md" />
            <div className="h-4 w-32 bg-gray-200 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white rounded-3xl border border-gray-200/80" />
          <div className="h-64 bg-white rounded-3xl border border-gray-200/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-slide-up pb-20">
      
      {/* Top Breadcrumb & Status Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50 rounded-lg px-1.5 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Home</span>
        </Link>

        {/* Edit / Save / Cancel Top Actions */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-gray-100 text-[#64748B] hover:text-[#1E293B] border border-gray-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-fade-slide-up shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profile and wellness goals successfully saved to MongoDB database!</span>
          </div>
          <button 
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-fade-slide-up shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage('')}
            className="text-red-700 hover:text-red-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editing Mode Alert Callout */}
      {isEditing && (
        <div className="bg-[#FAF4E8] border border-[#D9A441]/40 rounded-2xl p-4 flex items-center justify-between text-xs text-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#D9A441] shrink-0" />
            <span>
              <strong>You are in Edit Mode.</strong> Update your parameters below and click <strong>Save Changes</strong> to store them in your persistent profile.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#D9A441] bg-white px-2.5 py-1 rounded-md border border-[#D9A441]/30">
            Unsaved Edits
          </span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. HERO PROFILE OVERVIEW CARD                                 */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            {/* User Avatar Circle */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6B8E7B] to-[#4e6f5c] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0">
              {savedProfile.name ? savedProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight">
                  {savedProfile.name || 'WellSync User'}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#EBF1ED] text-[#6B8E7B] px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Authenticated Member</span>
                </span>
              </div>

              <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{savedProfile.email}</span>
                <span className="text-gray-300">•</span>
                <Calendar className="w-3.5 h-3.5" />
                <span>Member since {memberDateFormatted}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px]">
                <span className="font-bold text-[#1E293B] bg-[#F8FAF7] border border-gray-200 px-2.5 py-0.5 rounded-lg">
                  {savedProfile.dietaryPreference}
                </span>
                <span className="font-semibold text-[#64748B] bg-[#F8FAF7] border border-gray-200 px-2.5 py-0.5 rounded-lg">
                  {savedProfile.preferredDietType}
                </span>
                <span className="font-bold text-[#6B8E7B] bg-[#EBF1ED] px-2.5 py-0.5 rounded-lg">
                  Budget: {formatWholeCurrency(savedProfile.monthlyFoodBudget)} / mo
                </span>
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#F8FAF7] hover:bg-[#EBF1ED] text-[#1E293B] text-xs font-bold border border-gray-200 transition-all cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#6B8E7B]" />
              <span>Modify Details</span>
            </button>
          )}

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN PROFILE SECTIONS FORM                                 */}
      {/* ============================================================ */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        
        {/* SECTION A: PERSONAL & ACCOUNT IDENTITY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#6B8E7B]" />
              <h2 className="text-base font-bold text-[#1E293B]">Personal Identity</h2>
            </div>
            <span className="text-[11px] text-[#64748B]">Core identification details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-[#1E293B] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs bg-[#F8FAF7] focus:ring-2 focus:ring-[#6B8E7B]/50 transition-all ${
                      validationErrors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
                    }`}
                  />
                  {validationErrors.name && (
                    <span className="text-[10px] text-red-600 font-semibold block mt-1">
                      {validationErrors.name}
                    </span>
                  )}
                </div>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-gray-200 text-[#1E293B] font-semibold">
                  {savedProfile.name || 'Not provided'}
                </div>
              )}
            </div>

            {/* Email Address (Protected / Read-Only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-[#1E293B]">
                  Email Address
                </label>
                <span className="text-[10px] font-bold text-[#64748B] flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-gray-400" />
                  <span>Account Login</span>
                </span>
              </div>
              <input
                type="email"
                disabled
                value={savedProfile.email}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100/80 text-gray-500 text-xs cursor-not-allowed select-none"
                title="Email is tied to your verified login credentials"
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                Primary login ID (cannot be changed directly)
              </span>
            </div>

            {/* Age */}
            <div>
              <label className="block font-bold text-[#1E293B] mb-1.5">
                Age (Years)
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 26"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs bg-[#F8FAF7] focus:ring-2 focus:ring-[#6B8E7B]/50 transition-all ${
                      validationErrors.age ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
                    }`}
                  />
                  {validationErrors.age ? (
                    <span className="text-[10px] text-red-600 font-semibold block mt-1">
                      {validationErrors.age}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Used for metabolic and BMR estimation
                    </span>
                  )}
                </div>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-gray-200 text-[#1E293B] font-semibold">
                  {savedProfile.age ? `${savedProfile.age} years old` : 'Not specified'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION B: DIETARY PREFERENCE & DIET TYPE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#6B8E7B]" />
              <h2 className="text-base font-bold text-[#1E293B]">Dietary Preferences & Diet Type</h2>
            </div>
            <span className="text-[11px] text-[#64748B]">Nutritional philosophy & meal styling</span>
          </div>

          <div className="space-y-6 text-xs">
            {/* Dietary Preference Selector */}
            <div>
              <label className="block font-bold text-[#1E293B] mb-2">
                Primary Dietary Preference
              </label>
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DIETARY_PREFERENCES.map(diet => {
                    const active = formData.dietaryPreference === diet.id;
                    return (
                      <button
                        type="button"
                        key={diet.id}
                        onClick={() => setFormData({ ...formData, dietaryPreference: diet.id })}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? 'bg-[#EBF1ED] border-[#6B8E7B] text-[#1E293B] ring-1 ring-[#6B8E7B]'
                            : 'bg-[#F8FAF7] border-gray-200/90 text-[#64748B] hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold ${active ? 'text-[#6B8E7B]' : 'text-[#1E293B]'}`}>
                            {diet.label}
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-[#6B8E7B] stroke-[3]" />}
                        </div>
                        <p className="text-[10px] text-[#64748B] leading-normal">{diet.desc}</p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200 flex items-center justify-between max-w-md">
                  <div>
                    <span className="text-xs font-bold text-[#1E293B] block">
                      {savedProfile.dietaryPreference}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      {DIETARY_PREFERENCES.find(d => d.id === savedProfile.dietaryPreference)?.desc}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#6B8E7B] bg-[#EBF1ED] px-2.5 py-1 rounded-lg">
                    Active
                  </span>
                </div>
              )}
            </div>

            {/* Preferred Diet Type */}
            <div>
              <label className="block font-bold text-[#1E293B] mb-2">
                Preferred Macro / Diet Paradigm
              </label>
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PREFERRED_DIET_TYPES.map(type => {
                    const active = formData.preferredDietType === type.id;
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setFormData({ ...formData, preferredDietType: type.id })}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? 'bg-[#FAF4E8] border-[#D9A441] text-[#1E293B] ring-1 ring-[#D9A441]'
                            : 'bg-[#F8FAF7] border-gray-200/90 text-[#64748B] hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold ${active ? 'text-[#D9A441]' : 'text-[#1E293B]'}`}>
                            {type.label}
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-[#D9A441] stroke-[3]" />}
                        </div>
                        <p className="text-[10px] text-[#64748B] leading-normal">{type.desc}</p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200 flex items-center justify-between max-w-md">
                  <div>
                    <span className="text-xs font-bold text-[#1E293B] block">
                      {savedProfile.preferredDietType}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      {PREFERRED_DIET_TYPES.find(t => t.id === savedProfile.preferredDietType)?.desc}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#D9A441] bg-[#FAF4E8] px-2.5 py-1 rounded-lg">
                    Selected
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION C: FOOD ALLERGIES & SENSITIVITIES */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D9A441]" />
              <h2 className="text-base font-bold text-[#1E293B]">Food Allergies & Intolerances</h2>
            </div>
            <span className="text-[11px] text-[#64748B]">Ingredients strictly excluded by AI meal curation</span>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map(allergy => {
                  const active = formData.foodAllergies.includes(allergy);
                  return (
                    <button
                      type="button"
                      key={allergy}
                      onClick={() => toggleAllergy(allergy)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#1E293B] text-white shadow-xs'
                          : 'bg-[#F8FAF7] text-[#64748B] hover:text-[#1E293B] border border-gray-200'
                      }`}
                    >
                      {active ? `✓ ${allergy}` : `+ ${allergy}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom Allergy Entry */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-[#1E293B] mb-1">
                  Add Custom Allergy / Intolerance
                </label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="e.g. Bell peppers, Mushrooms"
                    value={customAllergen}
                    onChange={(e) => setCustomAllergen(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-[#F8FAF7] text-xs focus:ring-2 focus:ring-[#6B8E7B]/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllergen}
                    className="px-4 py-2 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Current Active List */}
              {formData.foodAllergies.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider mb-2">
                    Active Exclusions ({formData.foodAllergies.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.foodAllergies.map(item => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-xl text-xs font-bold"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAllergy(item)}
                          className="hover:text-red-900 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {savedProfile.foodAllergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {savedProfile.foodAllergies.map(item => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 bg-[#FAF4E8] text-[#D9A441] border border-[#D9A441]/30 px-3.5 py-1.5 rounded-xl text-xs font-bold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200 text-xs text-[#64748B]">
                  No food allergies or intolerances specified. All healthy whole ingredients will be considered for meal planning.
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION D: HEALTH & WELLNESS GOALS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#6B8E7B]" />
              <h2 className="text-base font-bold text-[#1E293B]">Health & Wellness Goals</h2>
            </div>
            <span className="text-[11px] text-[#64748B]">Guiding principles for routine scoring</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {WELLNESS_GOALS.map(goal => {
              const active = isEditing 
                ? formData.wellnessGoals.includes(goal.id)
                : savedProfile.wellnessGoals.includes(goal.id);

              return (
                <div
                  key={goal.id}
                  onClick={() => isEditing && toggleGoal(goal.id)}
                  className={`p-4 rounded-2xl border transition-all ${
                    isEditing ? 'cursor-pointer hover:shadow-xs' : 'cursor-default'
                  } ${
                    active
                      ? 'bg-[#EBF1ED] border-[#6B8E7B] text-[#1E293B]'
                      : 'bg-[#F8FAF7] border-gray-200/80 text-[#64748B] opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#1E293B]">{goal.label}</span>
                    {active && <CheckCircle2 className="w-4 h-4 text-[#6B8E7B] shrink-0" />}
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#64748B]">{goal.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION E: DAILY ACTIVITY LEVEL */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#6B8E7B]" />
              <h2 className="text-base font-bold text-[#1E293B]">Daily Activity Level</h2>
            </div>
            <span className="text-[11px] text-[#64748B]">Exercise volume and energy expenditure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {ACTIVITY_LEVELS.map(level => {
              const active = isEditing
                ? formData.activityLevel === level.id
                : savedProfile.activityLevel === level.id;

              return (
                <div
                  key={level.id}
                  onClick={() => isEditing && setFormData({ ...formData, activityLevel: level.id })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isEditing ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    active
                      ? 'bg-[#1E293B] border-[#1E293B] text-white shadow-xs'
                      : 'bg-[#F8FAF7] border-gray-200 text-[#64748B]'
                  }`}
                >
                  <span className={`font-bold block text-xs mb-1 ${active ? 'text-white' : 'text-[#1E293B]'}`}>
                    {level.label}
                  </span>
                  <p className={`text-[10px] leading-tight ${active ? 'text-slate-300' : 'text-[#64748B]'}`}>
                    {level.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION F: MONTHLY FOOD BUDGET (INR) & CALORIC TARGET */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#6B8E7B]" />
              <h2 className="text-base font-bold text-[#1E293B]">Monthly Food Budget in INR (₹) & Caloric Targets</h2>
            </div>
            <span className="text-[11px] text-[#64748B]">Indian currency and dietary limits</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Monthly Food Budget in INR */}
            <div className="p-5 rounded-2xl bg-[#F8FAF7] border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-[#1E293B] block">
                    Monthly Food Budget (INR)
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Allocated for grocery items & daily wholesome meal plans
                  </span>
                </div>
                <span className="text-base font-extrabold text-[#6B8E7B]">
                  {formatWholeCurrency(isEditing ? formData.monthlyFoodBudget : savedProfile.monthlyFoodBudget)} / mo
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="range"
                    min="2000"
                    max="60000"
                    step="500"
                    value={formData.monthlyFoodBudget}
                    onChange={(e) => setFormData({ ...formData, monthlyFoodBudget: Number(e.target.value) })}
                    className="w-full accent-[#6B8E7B] cursor-pointer"
                  />

                  <div className="flex justify-between items-center text-[10px] text-[#64748B] font-semibold">
                    <span>Min: ₹2,000</span>
                    <span className="font-bold text-[#1E293B]">
                      Equivalent to ~{formatWholeCurrency(Math.round(formData.monthlyFoodBudget / 4))} / week
                    </span>
                    <span>Max: ₹60,000</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-[#64748B] font-bold">Presets:</span>
                    {BUDGET_PRESETS.map(preset => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setFormData({ ...formData, monthlyFoodBudget: preset })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          formData.monthlyFoodBudget === preset
                            ? 'bg-[#6B8E7B] text-white'
                            : 'bg-white text-[#64748B] hover:text-[#1E293B] border border-gray-200'
                        }`}
                      >
                        {formatWholeCurrency(preset)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#6B8E7B] h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((savedProfile.monthlyFoodBudget / 30000) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#64748B]">
                    <span>Target: {formatWholeCurrency(savedProfile.monthlyFoodBudget)} monthly</span>
                    <span className="font-semibold text-[#1E293B]">
                      ~{formatWholeCurrency(Math.round(savedProfile.monthlyFoodBudget / 4))} per week
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Caloric Target */}
            <div className="p-5 rounded-2xl bg-[#F8FAF7] border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-[#1E293B] block">
                    Daily Calorie Target
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    Energy baseline used for recipe sizing & macro balances
                  </span>
                </div>
                <span className="text-base font-extrabold text-[#D9A441]">
                  {isEditing ? formData.calorieTarget : savedProfile.calorieTarget} kcal
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1200"
                    max="4500"
                    step="50"
                    value={formData.calorieTarget}
                    onChange={(e) => setFormData({ ...formData, calorieTarget: Number(e.target.value) })}
                    className="w-full accent-[#D9A441] cursor-pointer"
                  />

                  <div className="flex justify-between items-center text-[10px] text-[#64748B] font-semibold">
                    <span>1,200 kcal</span>
                    <span className="font-bold text-[#1E293B]">{formData.calorieTarget} kcal / day</span>
                    <span>4,500 kcal</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#D9A441] h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((savedProfile.calorieTarget / 3500) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#64748B]">
                    <span>Metabolic Baseline</span>
                    <span className="font-semibold text-[#1E293B]">{savedProfile.calorieTarget} kcal / day</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR FOR EDIT MODE */}
        {isEditing && (
          <div className="p-4 sm:p-6 bg-white rounded-3xl border border-gray-200/90 shadow-sm flex items-center justify-between gap-4">
            <span className="text-xs text-[#64748B]">
              Changes will immediately synchronize across your meal schedules and grocery planner.
            </span>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#64748B] hover:text-[#1E293B] border border-gray-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </form>

    </div>
  );
}
