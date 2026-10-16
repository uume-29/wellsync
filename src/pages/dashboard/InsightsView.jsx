import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, ArrowLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatWholeCurrency } from '../../utils/currency';
import insightsHeaderImg from '../../assets/dashboard/wellness-insights.jpg';

export default function InsightsView() {
  const { user } = useAuth();
  const weeklyBudget = user?.preferences?.weeklyBudget || 2500;
  const calorieTarget = user?.preferences?.calorieTarget || 2000;
  const dietaryRestrictions = user?.preferences?.dietaryRestrictions || [];
  const [imgError, setImgError] = useState(false);

  const weeklyHabitData = [
    { day: 'Mon', score: 85, mealsLogged: 3, medsTaken: 4, isComplete: true },
    { day: 'Tue', score: 90, mealsLogged: 3, medsTaken: 4, isComplete: true },
    { day: 'Wed', score: 78, mealsLogged: 2, medsTaken: 3, isComplete: true },
    { day: 'Thu', score: 94, mealsLogged: 3, medsTaken: 4, isComplete: true },
    { day: 'Fri', score: 82, mealsLogged: 2, medsTaken: 4, isComplete: true },
    { day: 'Sat', score: 70, mealsLogged: 2, medsTaken: 2, isComplete: false },
    { day: 'Sun', score: 88, mealsLogged: 3, medsTaken: 4, isComplete: true },
  ];

  const averageWeeklyScore = Math.round(
    weeklyHabitData.reduce((acc, d) => acc + d.score, 0) / weeklyHabitData.length
  );

  return (
    <div className="space-y-8 animate-fade-slide-up pb-16">
      
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50 rounded-lg px-1.5 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Home</span>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 1. VISUAL HEADER WITH DEDICATED AI INSIGHTS VISUAL           */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-[#1E293B]">
              <Activity className="w-3.5 h-3.5 text-[#6B8E7B]" />
              <span>Holistic Health Analytics</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Personal Wellness Insights
            </h1>
            
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl">
              Correlating your logged nutrition, medication regularity, and grocery budget adherence into actionable weekly reflections and habit momentum.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="bg-[#EBF1ED] text-[#6B8E7B] font-bold px-3 py-1 rounded-lg">
                Consistency Score: {averageWeeklyScore}/100
              </span>
              <span className="bg-[#FAF4E8] text-[#D9A441] font-bold px-3 py-1 rounded-lg">
                +6% Improvement this week
              </span>
              <span className="bg-[#F8FAF7] border border-gray-200 text-[#1E293B] font-semibold px-3 py-1 rounded-lg">
                Goal: {calorieTarget} kcal/day
              </span>
              {dietaryRestrictions.length > 0 && (
                <span className="bg-[#EBF1ED] text-[#6B8E7B] font-semibold px-3 py-1 rounded-lg">
                  Focus: {dietaryRestrictions.slice(0, 2).join(', ')}
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-[#EBF1ED] group">
              {!imgError ? (
                <img
                  src={insightsHeaderImg}
                  alt="Sleek modern tablet computer resting flat on white oak desk displaying circular habit rings and health charts with linen journal"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-[#EBF1ED] to-white text-center">
                  <Activity className="w-8 h-8 text-[#6B8E7B] mb-2" />
                  <span className="text-xs font-bold text-[#1E293B]">Habit Analytics Sanctuary</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-bold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px]">
                  Weekly Analytics
                </span>
                <span className="text-[10px] text-[#FAF4E8] font-semibold">
                  Habit Synthesis
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. THREE CORE SUMMARY METRICS CARDS                          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8E7B]">Habit Consistency</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+5.2%</span>
          </div>
          <p className="text-3xl font-extrabold text-[#1E293B]">{averageWeeklyScore}%</p>
          <p className="text-xs text-[#64748B] mt-1">Excellent routine momentum</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9A441]">Medication Regularity</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">92%</span>
          </div>
          <p className="text-3xl font-extrabold text-[#1E293B]">23 / 25</p>
          <p className="text-xs text-[#64748B] mt-1">Scheduled doses confirmed</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E293B]">Budget Efficiency</span>
            <span className="text-xs font-bold text-[#6B8E7B] bg-[#EBF1ED] px-2 py-0.5 rounded-md">Under Limit</span>
          </div>
          <p className="text-3xl font-extrabold text-[#1E293B]">{formatWholeCurrency(Math.max(0, weeklyBudget - 250))}</p>
          <p className="text-xs text-[#64748B] mt-1">From {formatWholeCurrency(weeklyBudget)} weekly target</p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. 7-DAY HABIT ADHERENCE VISUAL CHART                        */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8E7B]">Weekly Trends</span>
            <h2 className="text-lg font-extrabold text-[#1E293B]">Daily Health Adherence Pattern</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B8E7B]" />
              <span>Nutrition & Routine</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="grid grid-cols-7 gap-3 pt-4 items-end h-48 border-b border-gray-100 pb-2">
          {weeklyHabitData.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] font-bold text-[#1E293B] opacity-0 group-hover:opacity-100 transition-opacity">
                {d.score}%
              </span>
              <div 
                className="w-full max-w-[40px] bg-gradient-to-t from-[#6B8E7B] to-[#88ac97] rounded-xl transition-all duration-500 hover:brightness-110 shadow-2xs cursor-pointer"
                style={{ height: `${d.score}%` }}
              />
              <span className="text-xs font-bold text-[#64748B] group-hover:text-[#1E293B] transition-colors">
                {d.day}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span>Peak adherence: <strong>Thursday (94%)</strong></span>
          <span>Consistent tracking across 6 of 7 days</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. AI ACTIONABLE WEEKLY SYNTHESIS                            */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#6B8E7B]" />
          <h2 className="text-lg font-extrabold text-[#1E293B]">AI Synthesis & Recommendations</h2>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100 flex items-start gap-3">
            <span className="text-base">🥑</span>
            <div>
              <h4 className="text-xs font-bold text-[#1E293B]">Solid Macronutrient Balance</h4>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Your daily protein intake averaged within 5% of your target without exceeding your {formatWholeCurrency(weeklyBudget)} weekly grocery budget.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100 flex items-start gap-3">
            <span className="text-base">💊</span>
            <div>
              <h4 className="text-xs font-bold text-[#1E293B]">Evening Routine Optimization</h4>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Magnesium Glycinate was taken consistently at bedtime on 6 nights, correlating with higher perceived morning restfulness.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Link
            to="/dashboard/meals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B8E7B] hover:text-[#567564] transition-colors"
          >
            <span>Review Upcoming Week's Plan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
