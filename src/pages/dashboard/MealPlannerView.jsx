import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Utensils, RefreshCw, ShoppingCart, ArrowLeft, CheckCircle2, 
  ChevronRight, X, AlertTriangle, ShieldCheck, Sparkles, 
  Calendar, Clock, DollarSign, Flame, Info, Check, Eye,
  Users, Plus, Minus, ChefHat, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatCurrency, formatWholeCurrency } from '../../utils/currency';
import mealPlannerHeaderImg from '../../assets/dashboard/meal-planner.jpg';

function scaleQuantityStr(qtyStr, baseServings, targetServings) {
  if (!qtyStr || !baseServings || !targetServings) return qtyStr;
  const b = parseFloat(baseServings) || 2;
  const t = parseFloat(targetServings) || 2;
  const ratio = t / b;
  if (Math.abs(ratio - 1) < 0.001) return qtyStr;

  return qtyStr.replace(/^(\d+(?:\.\d+)?|\d+\/\d+)/, (match) => {
    let num = 0;
    if (match.includes('/')) {
      const [numPart, denPart] = match.split('/');
      num = parseFloat(numPart) / parseFloat(denPart);
    } else {
      num = parseFloat(match);
    }
    if (isNaN(num)) return match;
    const scaled = num * ratio;
    const rounded = Math.round(scaled * 10) / 10;
    return rounded.toString();
  });
}

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Mon', full: 'Monday' },
  { id: 'tue', label: 'Tue', full: 'Tuesday' },
  { id: 'wed', label: 'Wed', full: 'Wednesday' },
  { id: 'thu', label: 'Thu', full: 'Thursday' },
  { id: 'fri', label: 'Fri', full: 'Friday' },
  { id: 'sat', label: 'Sat', full: 'Saturday' },
  { id: 'sun', label: 'Sun', full: 'Sunday' },
];

const CUISINE_COLORS = {
  'North Indian': 'bg-amber-50 text-amber-800 border-amber-200',
  'South Indian': 'bg-orange-50 text-orange-800 border-orange-200',
  'Mediterranean': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Italian': 'bg-red-50 text-red-800 border-red-200',
  'Mexican': 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'East Asian': 'bg-purple-50 text-purple-800 border-purple-200',
  'Continental': 'bg-blue-50 text-blue-800 border-blue-200',
};

export default function MealPlannerView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [swappingSlot, setSwappingSlot] = useState(null); // 'mon-breakfast' etc.
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState('mon');
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'
  const [selectedMealForModal, setSelectedMealForModal] = useState(null);
  const [modalServings, setModalServings] = useState(2);
  const [enrichingRecipe, setEnrichingRecipe] = useState(false);
  const [showGroceryToast, setShowGroceryToast] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // User Profile Preferences
  const weeklyBudget = user?.preferences?.weeklyBudget ? (user.preferences.weeklyBudget <= 150 ? 2500 : user.preferences.weeklyBudget) : 2500;
  const calorieTarget = user?.preferences?.calorieTarget || 2000;
  const dietaryRestrictions = user?.preferences?.dietaryRestrictions || [];
  const allergies = user?.preferences?.allergies || [];

  // 1. Fetch saved meal plan from MongoDB Atlas on mount or manual retry
  const fetchCurrentMealPlan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.mealPlanner.getCurrentPlan();
      if (res && res.success && res.plan) {
        setMealPlan(res.plan);
        setError('');
      } else {
        setError(res?.message || 'Could not retrieve meal plan from server.');
      }
    } catch (err) {
      console.error('Error fetching meal plan:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load meal plan from MongoDB Atlas.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialPlan = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.mealPlanner.getCurrentPlan();
        if (ignore) return;

        if (res && res.success && res.plan) {
          setMealPlan(res.plan);
          setError('');
        } else {
          setError(res?.message || 'Could not retrieve meal plan from server.');
        }
      } catch (err) {
        console.error('Error fetching meal plan:', err);
        if (!ignore) {
          const msg = err.response?.data?.message || err.message || 'Failed to load meal plan from MongoDB Atlas.';
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitialPlan();

    return () => {
      ignore = true;
    };
  }, []);

  // Handle regenerating a brand new weekly meal plan
  const handleRegeneratePlan = async () => {
    setRegenerating(true);
    setError('');
    try {
      const res = await api.mealPlanner.generatePlan();
      if (res.success && res.plan) {
        setMealPlan(res.plan);
        setSuccessToast('Personalized 7-day plan successfully re-generated & saved to Atlas!');
        setTimeout(() => setSuccessToast(''), 4500);
      } else {
        setError(res.message || 'Failed to regenerate meal plan.');
      }
    } catch (err) {
      console.error('Regenerate error:', err);
      const msg = err.response?.data?.message || err.message || 'Error regenerating meal plan.';
      setError(msg);
    } finally {
      setRegenerating(false);
    }
  };

  // Handle swapping an individual meal
  const handleSwapMeal = async (dayId, mealType) => {
    const slotKey = `${dayId}-${mealType}`;
    setSwappingSlot(slotKey);
    setError('');
    try {
      const res = await api.mealPlanner.swapMeal({ dayId, mealType });
      if (res.success && res.plan) {
        setMealPlan(res.plan);
        setSuccessToast(`Replaced ${mealType} with a compliant ${res.replacedMeal?.cuisine || 'healthy'} option!`);
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        setError(res.message || 'Failed to swap meal.');
      }
    } catch (err) {
      console.error('Swap meal error:', err);
      const msg = err.response?.data?.message || err.message || 'Could not replace meal.';
      setError(msg);
    } finally {
      setSwappingSlot(null);
    }
  };

  // Open Recipe Details Modal with dynamic serving sizing initialized
  const handleOpenRecipeModal = (meal, dayId, slotKey) => {
    const baseServings = meal.servings || (user?.preferences?.householdSize || 2);
    setSelectedMealForModal({ ...meal, dayId, slotKey });
    setModalServings(baseServings);
  };

  // Explicitly enrich recipe steps using Gemini AI
  const handleEnrichRecipe = async (dayId, mealType) => {
    if (!dayId || !mealType) return;
    setEnrichingRecipe(true);
    try {
      const res = await api.mealPlanner.enrichRecipe({ dayId, mealType });
      if (res.success && res.recipe) {
        setSelectedMealForModal((prev) => ({
          ...prev,
          ...res.recipe,
        }));
        setMealPlan((prev) => {
          if (!prev) return prev;
          const updatedDays = prev.days.map((d) => {
            if (d.dayId === dayId) {
              return {
                ...d,
                meals: {
                  ...d.meals,
                  [mealType.toLowerCase()]: res.recipe,
                },
              };
            }
            return d;
          });
          return { ...prev, days: updatedDays };
        });
        setSuccessToast('Step-by-step cooking instructions successfully enriched with AI!');
        setTimeout(() => setSuccessToast(''), 4000);
      }
    } catch (err) {
      console.error('Enrich recipe error:', err);
      setError(err.response?.data?.message || err.message || 'Could not enrich recipe.');
    } finally {
      setEnrichingRecipe(false);
    }
  };

  const handleAddWeekToGroceries = () => {
    setShowGroceryToast(true);
    setTimeout(() => {
      setShowGroceryToast(false);
      navigate('/dashboard/groceries');
    }, 1200);
  };

  // Selected day data
  const currentDayData = mealPlan?.days?.find((d) => d.dayId === activeDay) || mealPlan?.days?.[0];

  const dayTotalCalories = currentDayData?.totalCalories || 0;
  const dayTotalCost = currentDayData?.totalCost || 0;
  const estWeeklyCost = mealPlan?.summary?.weeklyEstimatedCost || dayTotalCost * 7;
  const targetDailyBudget = Math.round(weeklyBudget / 7);

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse pb-20">
        <div className="h-6 w-48 bg-gray-200 rounded-lg" />
        <div className="h-56 bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-8 w-72 bg-gray-200 rounded-lg" />
            <div className="h-4 w-96 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-6 w-28 bg-gray-200 rounded-md" />
            <div className="h-6 w-36 bg-gray-200 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white rounded-3xl border border-gray-200" />
          <div className="h-64 bg-white rounded-3xl border border-gray-200" />
        </div>
      </div>
    );
  }

  // Error state screen with retry
  if (error && !mealPlan) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-gray-200 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-[#1E293B]">Unable to Load Meal Plan</h2>
        <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
          <button
            onClick={fetchCurrentMealPlan}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E293B] text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Retrying...' : 'Retry Loading Saved Plan'}</span>
          </button>
          <button
            onClick={handleRegeneratePlan}
            disabled={regenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#6B8E7B] text-white text-xs font-bold hover:bg-[#567564] transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Generating Plan...' : 'Generate New Plan'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-slide-up pb-20">
      
      {/* Top Breadcrumb & Status Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50 rounded-lg px-1.5 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Home</span>
        </Link>

        {/* Top Plan Status & Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRegeneratePlan}
            disabled={regenerating}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-gray-50 text-[#1E293B] border border-gray-200 text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Generate a fresh 7-day personalized plan based on your latest profile preferences"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6B8E7B] ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Regenerating...' : 'Regenerate Weekly Plan'}</span>
          </button>

          <button
            type="button"
            onClick={handleAddWeekToGroceries}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>Sync to Groceries</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-fade-slide-up shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-fade-slide-up shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. HERO HEADER WITH PERSISTED PLAN & NUTRITION ENGINE BADGES */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF1ED] text-[11px] font-bold text-[#6B8E7B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Clinical Meal Planner</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>MongoDB Atlas Synced</span>
              </span>
              <span className="text-[10px] font-bold text-[#D9A441] bg-[#FAF4E8] px-2.5 py-1 rounded-full border border-[#D9A441]/30">
                {mealPlan?.summary?.generationEngine === 'gemini-ai' ? `Powered by Gemini AI (${mealPlan?.summary?.geminiModelUsed || 'Gemini 3.5'})` : 'Clinical Nutrition Engine (USDA & IFCT)'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
              {mealPlan?.title || 'Personalized Weekly Meal Planner'}
            </h1>
            
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl">
              Cuisine-diverse meals dynamically calibrated to your profile: <strong>{mealPlan?.preferencesSnapshot?.dietaryPreference || 'Vegetarian'}</strong>,{' '}
              <strong>{mealPlan?.preferencesSnapshot?.preferredDietType || 'Whole Foods'}</strong>, and a monthly budget of{' '}
              <strong>{formatWholeCurrency(mealPlan?.preferencesSnapshot?.monthlyFoodBudget || 10000)}/mo</strong>.
            </p>

            {/* Profile Criteria Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="font-bold text-[#1E293B] bg-[#F8FAF7] border border-gray-200 px-3 py-1 rounded-lg">
                Daily Target: <strong>{mealPlan?.preferencesSnapshot?.calorieTarget || calorieTarget} kcal</strong>
              </span>
              <span className="font-bold text-[#6B8E7B] bg-[#EBF1ED] px-3 py-1 rounded-lg">
                Est. Week Cost: <strong>{formatCurrency(estWeeklyCost)}</strong>
              </span>
              {allergies.length > 0 ? (
                <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Allergy Filtered: {allergies.join(', ')} strictly excluded</span>
                </span>
              ) : (
                <span className="font-semibold text-gray-500 bg-[#F8FAF7] border border-gray-200 px-2.5 py-1 rounded-lg">
                  Zero Allergies Declared
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-[#EBF1ED] group">
              {!imgError ? (
                <img
                  src={mealPlannerHeaderImg}
                  alt="Clinical photography of a balanced wellness meal"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-[#EBF1ED] to-white text-center">
                  <Utensils className="w-8 h-8 text-[#6B8E7B] mb-2" />
                  <span className="text-xs font-bold text-[#1E293B]">Clinical Culinary Design</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-bold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px]">
                  Global Wellness Cuisines
                </span>
                <span className="text-[10px] text-[#FAF4E8] font-semibold">
                  Evidence-Backed Recipes
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. ALLERGY SAFETY NOTICE CALLOUT                             */}
      {/* ============================================================ */}
      <div className="bg-[#F8FAF7] rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[#1E293B]">
            <strong>Clinical Safety Protocol:</strong> All recipes are screened against your profile. Always inspect the full ingredient breakdown before meal preparation.
          </span>
        </div>
        <Link
          to="/dashboard/profile"
          className="text-[11px] font-bold text-[#6B8E7B] hover:text-[#567564] hover:underline shrink-0"
        >
          Edit Dietary & Allergy Profile →
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 3. WEEKDAY SELECTOR & VIEW CONTROLS                          */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Day of Week Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-x-auto scrollbar-none">
          {DAYS_OF_WEEK.map((day) => {
            const isActive = activeDay === day.id;
            const dayData = mealPlan?.days?.find((d) => d.dayId === day.id);
            const calories = dayData?.totalCalories || 0;

            return (
              <button
                key={day.id}
                onClick={() => {
                  setActiveDay(day.id);
                  setViewMode('day');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex flex-col items-center min-w-[65px] ${
                  isActive
                    ? 'bg-[#6B8E7B] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAF7]'
                }`}
              >
                <span>{day.label}</span>
                <span className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                  {calories ? `${calories} kcal` : day.full.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Switcher: Day Focus vs Full Week Overview */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-bold">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'day' ? 'bg-white text-[#1E293B] shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Day Focus
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-white text-[#1E293B] shadow-2xs' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Full Week Overview
            </button>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. DAILY NUTRITIONAL & BUDGET DASHBOARD BAR                  */}
      {/* ============================================================ */}
      <div className="bg-[#FAF4E8] rounded-2xl p-5 border border-[#D9A441]/30 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white text-[#D9A441] flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
            <Flame className="w-5 h-5 text-[#D9A441]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#1E293B]">
                {DAYS_OF_WEEK.find(d => d.id === activeDay)?.full} Nutritional Intake
              </span>
              <span className="text-[10px] uppercase font-bold text-[#6B8E7B] bg-white px-2 py-0.5 rounded-md border border-[#6B8E7B]/30">
                Balanced
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1 text-xs text-[#64748B]">
              <span>Planned: <strong>{dayTotalCalories} kcal</strong> / Goal: {calorieTarget} kcal</span>
              <span>•</span>
              <span>Protein: <strong>{currentDayData?.macros?.protein || 0}g</strong></span>
              <span>•</span>
              <span>Carbs: <strong>{currentDayData?.macros?.carbs || 0}g</strong></span>
              <span>•</span>
              <span>Fiber: <strong>{currentDayData?.macros?.fiber || 0}g</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="text-right">
            <span className="text-[10px] text-[#64748B] block">Daily Cost (Est.)</span>
            <span className="text-sm font-extrabold text-[#1E293B]">{formatCurrency(dayTotalCost)}</span>
          </div>
          <div className="h-7 w-px bg-[#D9A441]/30" />
          <div className="text-right">
            <span className="text-[10px] text-[#64748B] block">Daily Budget</span>
            <span className="text-sm font-extrabold text-[#6B8E7B]">
              {formatCurrency(targetDailyBudget)}
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 5. VIEW MODE A: DAY FOCUS (BREAKFAST, LUNCH, DINNER, SNACK) */}
      {/* ============================================================ */}
      {viewMode === 'day' && currentDayData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'breakfast', type: 'Breakfast', icon: '🌅', color: 'bg-amber-50 text-amber-800' },
            { key: 'lunch', type: 'Lunch', icon: '☀️', color: 'bg-emerald-50 text-emerald-800' },
            { key: 'dinner', type: 'Dinner', icon: '🌙', color: 'bg-indigo-50 text-indigo-800' },
            { key: 'snack', type: 'Daily Snack', icon: '🍎', color: 'bg-orange-50 text-orange-800' },
          ].map((slot) => {
            const meal = currentDayData.meals?.[slot.key];
            if (!meal) return null;

            const slotKey = `${activeDay}-${slot.key}`;
            const isSwapping = swappingSlot === slotKey;
            const cuisineBadgeClass = CUISINE_COLORS[meal.cuisine] || 'bg-gray-100 text-gray-800 border-gray-200';

            return (
              <div
                key={slot.key}
                className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Slot Top Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{slot.icon}</span>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E293B]">
                        {slot.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cuisineBadgeClass}`}>
                        {meal.cuisine}
                      </span>
                      <span className="text-[10px] font-bold text-[#64748B] bg-[#F8FAF7] px-2 py-0.5 rounded-md border border-gray-200/80">
                        {meal.time}
                      </span>
                    </div>
                  </div>

                  {/* Meal Title, Description & Times */}
                  <h3 className="text-base font-extrabold text-[#1E293B] group-hover:text-[#6B8E7B] transition-colors leading-snug">
                    {meal.title}
                  </h3>

                  {meal.description && (
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                      {meal.description}
                    </p>
                  )}

                  {/* Prep & Cook Times & Servings */}
                  <div className="flex items-center gap-2.5 text-[11px] text-[#64748B] mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#6B8E7B]" />
                      <span>Prep: <strong>{meal.prepTime || '10 mins'}</strong></span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Cook: <strong>{meal.cookTime || '15 mins'}</strong></span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>{meal.servings || 2} servings</span>
                    </span>
                  </div>

                  {/* Macro Pills Grid */}
                  <div className="grid grid-cols-4 gap-2 my-3 text-center">
                    <div className="bg-[#F8FAF7] p-2 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-[#64748B] block font-semibold">Calories</span>
                      <span className="text-xs font-extrabold text-[#1E293B]">{meal.calories}</span>
                    </div>
                    <div className="bg-[#F8FAF7] p-2 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-[#64748B] block font-semibold">Protein</span>
                      <span className="text-xs font-extrabold text-[#6B8E7B]">{meal.macros?.protein || `${meal.macros?.proteinGrams || 0}g`}</span>
                    </div>
                    <div className="bg-[#F8FAF7] p-2 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-[#64748B] block font-semibold">Carbs</span>
                      <span className="text-xs font-extrabold text-[#1E293B]">{meal.macros?.carbs || `${meal.macros?.carbsGrams || 0}g`}</span>
                    </div>
                    <div className="bg-[#F8FAF7] p-2 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-[#64748B] block font-semibold">Fiber</span>
                      <span className="text-xs font-extrabold text-[#1E293B]">{meal.macros?.fiber || `${meal.macros?.fiberGrams || 0}g`}</span>
                    </div>
                  </div>

                  {/* Pantry Stock Matched Badge */}
                  {meal.pantryMatchedIngredients && meal.pantryMatchedIngredients.length > 0 && (
                    <div className="mb-2.5 p-2 rounded-xl bg-[#EBF1ED] border border-[#6B8E7B]/30 flex items-center gap-2 text-[11px] text-[#17201B]">
                      <Sparkles className="w-3.5 h-3.5 text-[#6B8E7B] shrink-0" />
                      <span className="font-semibold truncate">
                        Pantry match: {meal.pantryMatchedIngredients.slice(0, 3).join(', ')}{meal.pantryMatchedIngredients.length > 3 ? ` +${meal.pantryMatchedIngredients.length - 3} more` : ''}
                      </span>
                    </div>
                  )}

                  {/* Allergy Status & Cost Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {meal.allergyFlags?.isSafe ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        <span>Allergy Screened</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Inspect Ingredients</span>
                      </span>
                    )}

                    <span className="text-[10px] font-bold text-[#D9A441] bg-[#FAF4E8] px-2.5 py-0.5 rounded-md border border-[#D9A441]/30">
                      Est. Cost: {formatCurrency(meal.cost)}
                    </span>
                  </div>

                  {/* Step Instructions Snippet */}
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {meal.instructions}
                  </p>
                </div>

                {/* Card Action Controls */}
                <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenRecipeModal(meal, activeDay, slot.key)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B8E7B] hover:text-[#567564] py-1.5 px-3 rounded-xl hover:bg-[#EBF1ED] transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Recipe</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwapMeal(activeDay, slot.key)}
                    disabled={isSwapping}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#64748B] hover:text-[#1E293B] py-1.5 px-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                    title="Replace this meal with an alternative compliant recipe"
                  >
                    <RefreshCw className={`w-3 h-3 text-[#6B8E7B] ${isSwapping ? 'animate-spin' : ''}`} />
                    <span>{isSwapping ? 'Swapping...' : 'Swap Meal'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. VIEW MODE B: FULL WEEK OVERVIEW GRID                      */}
      {/* ============================================================ */}
      {viewMode === 'week' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {mealPlan?.days?.map((day) => {
              return (
                <div
                  key={day.dayId}
                  className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="font-extrabold text-xs text-[#1E293B]">{day.dayName}</span>
                      <span className="text-[10px] font-bold text-[#6B8E7B]">{day.totalCalories} kcal</span>
                    </div>

                    {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                      const meal = day.meals?.[type];
                      if (!meal) return null;
                      return (
                        <div
                          key={type}
                          onClick={() => handleOpenRecipeModal(meal, day.dayId, type)}
                          className="p-2 rounded-xl bg-[#F8FAF7] hover:bg-[#EBF1ED]/70 transition-colors border border-gray-100 space-y-1 cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold text-[#64748B] block">
                              {type}
                            </span>
                            {meal.pantryMatchedIngredients?.length > 0 && (
                              <span className="text-[8px] font-bold text-[#6B8E7B] bg-white px-1 rounded border border-[#6B8E7B]/30">
                                Stocked
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-[#1E293B] group-hover:text-[#6B8E7B] line-clamp-1 transition-colors">
                            {meal.title}
                          </span>
                          <div className="flex items-center justify-between text-[9px] text-gray-400">
                            <span>{meal.cuisine}</span>
                            <span>{formatCurrency(meal.cost)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDay(day.dayId);
                      setViewMode('day');
                    }}
                    className="w-full py-1.5 rounded-lg bg-gray-100 hover:bg-[#EBF1ED] text-[#6B8E7B] text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    View Day Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. DEDICATED RECIPE DETAILS & COOKING EXPERIENCE MODAL       */}
      {/* ============================================================ */}
      {selectedMealForModal && (() => {
        const baseServings = selectedMealForModal.servings || (user?.preferences?.householdSize || 2);
        const ratio = modalServings / baseServings;
        const scaledCalories = Math.round((selectedMealForModal.calories || 0) * ratio);
        const scaledCost = Math.round((selectedMealForModal.cost || 0) * ratio);

        let instructionsList = [];
        if (Array.isArray(selectedMealForModal.stepByStepInstructions) && selectedMealForModal.stepByStepInstructions.length > 0) {
          instructionsList = selectedMealForModal.stepByStepInstructions;
        } else if (selectedMealForModal.instructions) {
          const lines = selectedMealForModal.instructions.split(/\n+/).map((l) => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            instructionsList = lines;
          } else {
            const numbered = selectedMealForModal.instructions.split(/(?=\d+[\.\)])/g).map((s) => s.trim()).filter(Boolean);
            if (numbered.length > 1) {
              instructionsList = numbered;
            }
          }
        }

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up max-h-[92vh] overflow-y-auto space-y-6">
              
              {/* Modal Top Nav: Back to Meal Plan & Close */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedMealForModal(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#1E293B] px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Meal Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMealForModal(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Recipe Title & Header Meta */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${CUISINE_COLORS[selectedMealForModal.cuisine] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    {selectedMealForModal.cuisine}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8E7B] bg-[#EBF1ED] px-2.5 py-0.5 rounded-md">
                    {selectedMealForModal.mealType || selectedMealForModal.slotKey}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    Base: {baseServings} {baseServings === 1 ? 'serving' : 'servings'}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
                  {selectedMealForModal.title}
                </h2>

                {selectedMealForModal.description && (
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mt-2">
                    {selectedMealForModal.description}
                  </p>
                )}
              </div>

              {/* Times & Scaled Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F8FAF7] rounded-2xl border border-gray-100 text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] block font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#6B8E7B]" /> Prep Time
                  </span>
                  <span className="font-bold text-[#1E293B]">{selectedMealForModal.prepTime || selectedMealForModal.time || '10 mins'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" /> Cook Time
                  </span>
                  <span className="font-bold text-[#1E293B]">{selectedMealForModal.cookTime || '15 mins'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-semibold">Calories</span>
                  <span className="font-bold text-[#1E293B]">{scaledCalories} kcal</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-semibold">Est. Cost</span>
                  <span className="font-bold text-[#6B8E7B]">{formatCurrency(scaledCost)}</span>
                </div>
              </div>

              {/* Interactive Serving Adjustment Stepper */}
              <div className="bg-[#FAF4E8] rounded-2xl p-4 border border-[#D9A441]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-[#D9A441]" />
                    <span className="text-xs font-extrabold text-[#1E293B]">Adjust Serving Size</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Ingredient quantities scale dynamically to match your desired portion.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalServings((s) => Math.max(1, s - 1))}
                    disabled={modalServings <= 1}
                    className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-[#1E293B] font-bold flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 cursor-pointer shadow-2xs transition-all"
                    title="Decrease servings"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="px-4 py-1.5 bg-white rounded-xl border border-gray-200 text-center min-w-[90px] shadow-2xs">
                    <span className="text-xs font-extrabold text-[#1E293B] flex items-center justify-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#6B8E7B]" />
                      {modalServings} {modalServings === 1 ? 'serving' : 'servings'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalServings((s) => Math.min(12, s + 1))}
                    disabled={modalServings >= 12}
                    className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-[#1E293B] font-bold flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 cursor-pointer shadow-2xs transition-all"
                    title="Increase servings"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Pantry Stock Matches (if available) */}
              {selectedMealForModal.pantryMatchedIngredients && selectedMealForModal.pantryMatchedIngredients.length > 0 && (
                <div className="p-4 bg-[#EBF1ED] rounded-2xl border border-[#6B8E7B]/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6B8E7B] shrink-0" />
                    <h4 className="font-extrabold text-xs text-[#1E293B]">
                      Pantry Stock Prioritized ({selectedMealForModal.pantryMatchedIngredients.length} items at home)
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    This recipe was selected to use ingredients currently available in your home pantry:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedMealForModal.pantryMatchedIngredients.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-white text-[#17201B] px-2.5 py-1 rounded-lg text-xs font-bold border border-[#6B8E7B]/30 shadow-2xs"
                      >
                        <Check className="w-3 h-3 text-[#6B8E7B] stroke-[3]" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scaled Ingredients Required */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-xs text-[#1E293B] uppercase tracking-wider">
                    Ingredients ({modalServings} {modalServings === 1 ? 'Serving' : 'Servings'})
                  </h4>
                  <span className="text-[10px] text-[#64748B]">
                    Scaled from base of {baseServings}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {selectedMealForModal.ingredients?.map((ing, idx) => {
                    const scaledQty = scaleQuantityStr(ing.quantity, baseServings, modalServings);
                    const scaledItemCost = ing.cost > 0 ? Math.round(ing.cost * ratio) : 0;
                    const isPantryMatched = selectedMealForModal.pantryMatchedIngredients?.some(
                      (p) => ing.name?.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(ing.name?.toLowerCase())
                    );

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF7] border border-gray-100 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-2 h-2 rounded-full ${isPantryMatched ? 'bg-emerald-500' : 'bg-[#6B8E7B]'}`} />
                          <span className="font-bold text-[#1E293B]">{ing.name}</span>
                          <span className="text-[#64748B] font-medium">({scaledQty})</span>
                          {isPantryMatched && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              In Pantry ✓
                            </span>
                          )}
                        </div>
                        {scaledItemCost > 0 && (
                          <span className="text-[11px] font-bold text-[#D9A441]">~{formatCurrency(scaledItemCost)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Numbered Step-by-Step Cooking Instructions */}
              <div>
                <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                  <h4 className="font-extrabold text-xs text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#6B8E7B]" />
                    <span>Step-by-Step Cooking Instructions</span>
                  </h4>

                  {/* Enrich with AI button */}
                  <button
                    type="button"
                    onClick={() => handleEnrichRecipe(selectedMealForModal.dayId || activeDay, selectedMealForModal.mealType || selectedMealForModal.slotKey)}
                    disabled={enrichingRecipe}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6B8E7B] hover:text-[#567564] bg-[#EBF1ED] px-2.5 py-1 rounded-lg border border-[#6B8E7B]/30 transition-all cursor-pointer disabled:opacity-50"
                    title="Enrich cooking steps with Gemini AI"
                  >
                    <Sparkles className={`w-3 h-3 ${enrichingRecipe ? 'animate-spin' : ''}`} />
                    <span>{enrichingRecipe ? 'Enriching...' : 'Enrich Steps with AI'}</span>
                  </button>
                </div>

                {instructionsList.length > 0 ? (
                  <div className="space-y-2.5">
                    {instructionsList.map((step, idx) => {
                      const cleanStep = step.replace(/^\d+[\.\)]\s*/, '');
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAF7] border border-gray-100 hover:border-gray-200 transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#6B8E7B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                            {idx + 1}
                          </span>
                          <div className="text-xs text-[#1E293B] leading-relaxed flex-1 pt-0.5">
                            {cleanStep}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100 space-y-3">
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {selectedMealForModal.instructions || 'Standard culinary preparation.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleEnrichRecipe(selectedMealForModal.dayId || activeDay, selectedMealForModal.mealType || selectedMealForModal.slotKey)}
                      disabled={enrichingRecipe}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6B8E7B] text-white text-xs font-bold hover:bg-[#567564] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${enrichingRecipe ? 'animate-spin' : ''}`} />
                      <span>{enrichingRecipe ? 'Generating Steps...' : 'Generate Step-by-Step Instructions with AI'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Health Benefits Clinical Note */}
              {selectedMealForModal.healthBenefits && (
                <div className="p-3.5 rounded-2xl bg-[#EBF1ED] border border-[#6B8E7B]/30 flex items-start gap-2.5 text-xs text-[#17201B]">
                  <Info className="w-4 h-4 text-[#6B8E7B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] font-bold text-[#6B8E7B]">Clinical Nutrition Highlight</strong>
                    <span className="text-[11px] leading-relaxed">{selectedMealForModal.healthBenefits}</span>
                  </div>
                </div>
              )}

              {/* Allergy Screening Safeguard Notice */}
              <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h4 className="font-bold text-xs text-[#1E293B]">Allergy Safety & Screening Safeguards</h4>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Screened against your declared profile allergies ({allergies.length > 0 ? allergies.join(', ') : 'None declared'}).
                  Screening safeguards do not guarantee absence of trace allergens. Always inspect all packaging and fresh ingredients prior to preparation.
                </p>
                {selectedMealForModal.allergens?.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                    <span className="text-gray-500 font-semibold">Identified Allergen Categories:</span>
                    <span className="font-bold text-gray-700">{selectedMealForModal.allergens.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Modal Bottom Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <span className="text-[10px] text-gray-400">
                  * Nutritional values and estimated costs are approximations based on profile criteria.
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMealForModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#6B8E7B] text-white text-xs font-bold hover:bg-[#567564] transition-all cursor-pointer shadow-xs"
                >
                  Back to Meal Plan
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
