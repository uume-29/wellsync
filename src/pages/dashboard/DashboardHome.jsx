import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, BookOpen, ShoppingCart, Pill, Users, 
  Sparkles, Activity, ArrowRight, ShieldCheck, 
  Sliders, ChevronRight, Leaf, Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatWholeCurrency } from '../../utils/currency';

// Import newly generated high-res dashboard AI visuals
import heroLifestyleImg from '../../assets/dashboard/hero-lifestyle.jpg';
import mealPlannerImg from '../../assets/dashboard/meal-planner.jpg';
import foodDiaryImg from '../../assets/dashboard/food-diary.jpg';
import groceryListImg from '../../assets/dashboard/grocery-list.jpg';
import medicineTrackerImg from '../../assets/dashboard/medicine-tracker.jpg';
import aiCompanionImg from '../../assets/dashboard/ai-companion.jpg';
import wellnessInsightsImg from '../../assets/dashboard/wellness-insights.jpg';

export default function DashboardHome() {
  const { user } = useAuth();
  const [heroImgError, setHeroImgError] = useState(false);
  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (key) => {
    setImgErrors(prev => ({ ...prev, [key]: true }));
  };

  // Time-of-day greeting
  const [greetingTime] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  // User Profile Metrics backed by real user.preferences
  const weeklyBudget = user?.preferences?.weeklyBudget || 2500;
  const calorieTarget = user?.preferences?.calorieTarget || 2000;
  const dietaryRestrictions = user?.preferences?.dietaryRestrictions || [];
  const allergies = user?.preferences?.allergies || [];
  const wellnessGoals = user?.preferences?.wellnessGoals || [];

  // Formatted join date
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '2026';

  // Feature Discovery Modules
  const featureModules = [
    {
      key: 'mealPlanner',
      title: 'AI Meal Planner',
      subtitle: 'Personalized Nutrition & Recipes',
      description: 'Weekly balanced meal plans tailored to your allergies, taste preferences, and grocery spending limits.',
      to: '/dashboard/meals',
      actionText: 'Plan This Week',
      image: mealPlannerImg,
      icon: Utensils,
      tag: 'Nutrition Hub',
      tagColor: 'bg-[#EBF1ED] text-[#6B8E7B]',
      meta: dietaryRestrictions.length > 0 
        ? `${dietaryRestrictions.slice(0, 2).join(', ')} configured`
        : 'Allergen & budget optimized',
    },
    {
      key: 'foodDiary',
      title: 'Food Diary & Vision',
      subtitle: 'Multimodal Photo & Habit Log',
      description: 'Snap or record meals with instant AI macronutrient estimation and automated calorie tracking.',
      to: '/dashboard/food-diary',
      actionText: 'View Food Journal',
      image: foodDiaryImg,
      icon: BookOpen,
      tag: 'Daily Tracking',
      tagColor: 'bg-[#FAF4E8] text-[#D9A441]',
      meta: `Target: ${calorieTarget} kcal / day`,
    },
    {
      key: 'groceryList',
      title: 'Smart Grocery Organizer',
      subtitle: 'Budget & Aisle Optimization',
      description: 'Automatically compile grocery shopping lists directly from your confirmed meal plans.',
      to: '/dashboard/groceries',
      actionText: 'Open Grocery Cart',
      image: groceryListImg,
      icon: ShoppingCart,
      tag: 'Budget Sync',
      tagColor: 'bg-[#EBF1ED] text-[#6B8E7B]',
      meta: `Weekly Budget: ${formatWholeCurrency(weeklyBudget)}`,
    },
    {
      key: 'medicineTracker',
      title: 'Medicine & Habit Tracker',
      subtitle: 'Daily Adherence Schedules',
      description: 'Gentle reminders for vitamins, supplements, and prescriptions with one-tap confirmation.',
      to: '/dashboard/medicines',
      actionText: 'Check Schedule',
      image: medicineTrackerImg,
      icon: Pill,
      tag: 'Routine Hub',
      tagColor: 'bg-[#FAF4E8] text-[#D9A441]',
      meta: '4 Daily Dosages active',
    },
    {
      key: 'aiAssistant',
      title: 'AI Wellness Assistant',
      subtitle: 'Biomedical Grounded Inquiries',
      description: 'Ask questions on nutrition science, ingredient swaps, and habits with citations from peer-reviewed literature.',
      to: '/dashboard/assistant',
      actionText: 'Start Consultation',
      image: aiCompanionImg,
      icon: Sparkles,
      tag: 'AI Intelligence',
      tagColor: 'bg-[#EBF1ED] text-[#6B8E7B]',
      meta: 'USDA & NIH evidence retrieval',
    },
    {
      key: 'wellnessInsights',
      title: 'Personal Wellness Insights',
      subtitle: 'Holistic Weekly Reflection',
      description: 'Correlate your nutrition logs, daily medication adherence, and habit momentum into clear reflections.',
      to: '/dashboard/insights',
      actionText: 'Explore Insights',
      image: wellnessInsightsImg,
      icon: Activity,
      tag: 'Analytics',
      tagColor: 'bg-slate-100 text-[#1E293B]',
      meta: 'Weekly consistency review',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      
      {/* ============================================================ */}
      {/* 1. REIMAGINED ASYMMETRIC DASHBOARD HERO                      */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-gray-200/90 shadow-sm p-6 sm:p-8 lg:p-10">
        
        {/* Subtle Decorative Ambient Background Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#EBF1ED]/70 via-[#FAF4E8]/40 to-transparent rounded-full -mr-20 -mt-20 -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-[#6B8E7B]/5 to-transparent rounded-full -mb-16 -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Greeting, Philosophy & Primary Action (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF1ED] border border-[#6B8E7B]/20 text-[#6B8E7B] text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#6B8E7B] animate-pulse" />
              <span>Personalized Wellness Companion</span>
            </div>

            {/* Personalized Heading */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight leading-tight">
                {greetingTime},{' '}
                <span className="text-[#6B8E7B]">
                  {user?.name ? user.name.split(' ')[0] : 'there'}
                </span>
                .
              </h1>
              <p className="mt-3 text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">
                WellSync balances your meals, tracks daily health habits, and optimizes grocery costs — all synchronized with your personal goals.
              </p>
            </div>

            {/* Real Data Highlights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 border-t border-gray-100">
              <div className="bg-[#F8FAF7] p-3 rounded-2xl border border-gray-100">
                <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">Weekly Budget</span>
                <span className="text-lg font-extrabold text-[#1E293B]">{formatWholeCurrency(weeklyBudget)}</span>
                <span className="text-[10px] text-[#6B8E7B] block font-semibold">Active target</span>
              </div>
              <div className="bg-[#F8FAF7] p-3 rounded-2xl border border-gray-100">
                <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">Daily Calorie Target</span>
                <span className="text-lg font-extrabold text-[#1E293B]">{calorieTarget}</span>
                <span className="text-[10px] text-[#6B8E7B] block font-semibold">kcal / day</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-[#F8FAF7] p-3 rounded-2xl border border-gray-100">
                <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">Member Since</span>
                <span className="text-lg font-extrabold text-[#1E293B]">{memberSince}</span>
                <span className="text-[10px] text-[#D9A441] block font-semibold">Verified account</span>
              </div>
            </div>

            {/* Clear Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/dashboard/meals"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50"
              >
                <Utensils className="w-4 h-4" />
                <span>Explore Meal Plan</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>

              <Link
                to="/dashboard/profile"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-gray-50 text-[#1E293B] text-sm font-bold border border-gray-200 shadow-2xs hover:shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <Sliders className="w-4 h-4 text-[#64748B]" />
                <span>Manage Preferences</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Hero Visual Photography (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Organic Image Container */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-[#EBF1ED] group">
                {!heroImgError ? (
                  <img
                    src={heroLifestyleImg}
                    alt="Young adult enjoying a healthy balanced breakfast bowl at a bright Scandinavian kitchen table with wellness tablet"
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-[#EBF1ED] via-[#F8FAF7] to-white text-center">
                    <Leaf className="w-10 h-10 text-[#6B8E7B] mb-2 animate-bounce-subtle" />
                    <span className="font-extrabold text-[#1E293B] text-base">WellSync Sanctuary</span>
                    <span className="text-xs text-[#64748B] mt-1">Nourishing mind & body</span>
                  </div>
                )}

                {/* Editorial Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/30 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                  <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[11px]">
                    🌿 Mindful Eating Protocol
                  </span>
                  <span className="bg-[#6B8E7B]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Synced
                  </span>
                </div>
              </div>

              {/* Floating Accent Badge: Nutrition Alignment */}
              <div className="absolute -bottom-3 -left-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2.5 z-10 animate-float-slow">
                <div className="w-8 h-8 rounded-xl bg-[#EBF1ED] flex items-center justify-center text-sm">
                  🥗
                </div>
                <div>
                  <span className="text-xs font-extrabold text-[#1E293B] block leading-tight">Nutritional Balance</span>
                  <span className="text-[10px] text-[#6B8E7B] font-bold">100% Allergy-Safe</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* ============================================================ */}
      {/* 2. QUICK PERSONALIZED PROTOCOL STATUS                       */}
      {/* ============================================================ */}
      <section className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B8E7B]">Your Active Protocol</span>
            <h2 className="text-lg font-extrabold text-[#1E293B] mt-0.5">Custom Wellness Settings</h2>
          </div>
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B8E7B] hover:text-[#567564] transition-colors"
          >
            <span>Update Profile Settings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Dietary Restrictions */}
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#1E293B]">
              <Leaf className="w-3.5 h-3.5 text-[#6B8E7B]" />
              <span>Dietary Focus</span>
            </div>
            {dietaryRestrictions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {dietaryRestrictions.map(diet => (
                  <span key={diet} className="px-2 py-0.5 bg-[#EBF1ED] text-[#6B8E7B] text-[11px] font-bold rounded-md">
                    {diet}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">No restrictions set. Open profile to configure.</p>
            )}
          </div>

          {/* Allergens Tracked */}
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#1E293B]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D9A441]" />
              <span>Allergen Shield</span>
            </div>
            {allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allergies.map(allergy => (
                  <span key={allergy} className="px-2 py-0.5 bg-[#FAF4E8] text-[#D9A441] text-[11px] font-bold rounded-md">
                    ✕ {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">None registered. All common ingredients allowed.</p>
            )}
          </div>

          {/* Wellness Goals */}
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#1E293B]">
              <Target className="w-3.5 h-3.5 text-[#1E293B]" />
              <span>Priority Goal</span>
            </div>
            <p className="text-xs font-semibold text-[#1E293B]">
              {wellnessGoals.length > 0 
                ? wellnessGoals.map(g => g.replace('_', ' ')).join(' • ')
                : 'Balanced Clean Eating & Energy'}
            </p>
            <span className="text-[10px] text-[#64748B] block mt-1">Synchronized with AI recommendations</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. FEATURE DISCOVERY GRID (6 CORE MODULES)                   */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#6B8E7B]">
              Wellness Modules
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight mt-1">
              Explore WellSync Features
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Each module works seamlessly with your preferences to support clean, stress-free healthy habits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {featureModules.map((card) => {
            const IconComp = card.icon;
            const hasError = imgErrors[card.key];

            return (
              <div
                key={card.key}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Dedicated AI Visual Header with Micro-zoom */}
                  <div className="relative mb-5 aspect-[16/10] rounded-2xl overflow-hidden bg-[#EBF1ED] shadow-2xs">
                    {!hasError ? (
                      <img
                        src={card.image}
                        alt={`${card.title} - WellSync AI Visual Asset`}
                        onError={() => handleImgError(card.key)}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-[#EBF1ED] to-white text-center">
                        <IconComp className="w-8 h-8 text-[#6B8E7B] mb-2" />
                        <span className="text-xs font-bold text-[#1E293B]">{card.title}</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Top Tag */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${card.tagColor}`}>
                        {card.tag}
                      </span>
                    </div>

                    {/* Bottom Metadata Pill */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <span className="text-[11px] font-bold text-white bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg inline-block">
                        {card.meta}
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Icon */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#1E293B] tracking-tight group-hover:text-[#6B8E7B] transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[11px] font-bold text-[#64748B]">{card.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                    {card.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <Link
                    to={card.to}
                    className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#F8FAF7] hover:bg-[#EBF1ED] text-xs font-bold text-[#1E293B] group-hover:text-[#6B8E7B] border border-gray-200/80 hover:border-[#6B8E7B]/30 transition-all duration-200"
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ANCILLARY MODULES: CAREGIVER ACCESS & PROFILE QUICK HUB    */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Caregiver Access Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-[#1E293B] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                Privacy-First
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#1E293B]">Caregiver Access & Sharing</h3>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Grant view-only or adherence-monitoring permissions to a trusted family member or physician. You retain 100% control with one-click revocation.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Granular permission controls</span>
            <Link
              to="/dashboard/caregiver"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E293B] hover:text-[#6B8E7B] transition-colors"
            >
              <span>Manage Access</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Holistic Insights Teaser Card */}
        <div className="bg-gradient-to-tr from-white via-white to-[#EBF1ED]/40 rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B8E7B] bg-[#EBF1ED] px-3 py-1 rounded-full">
                Weekly Reflection
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#1E293B]">Holistic Habit Momentum</h3>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              WellSync analyzes the correlation between your meal nutrition, medication regularity, and grocery budget adherence to surface actionable weekly insights.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Automated habit synthesis</span>
            <Link
              to="/dashboard/insights"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B8E7B] hover:text-[#567564] transition-colors"
            >
              <span>View Insights</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </section>

    </div>
  );
}
