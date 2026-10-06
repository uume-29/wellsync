import React, { useState } from 'react';
import { 
  LayoutDashboard, Utensils, Camera, DollarSign, Pill, Users, 
  Sparkles, Activity, User, CheckCircle2, XCircle, Clock, 
  Search, Bell, ChevronRight, ShieldCheck, ArrowRight, Heart
} from 'lucide-react';

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'meal-planner', label: 'Meal Planner', icon: Utensils },
    { id: 'food-analysis', label: 'Food Scanner', icon: Camera },
    { id: 'ai-assistant', label: 'RAG AI Assistant', icon: Sparkles },
    { id: 'medicine', label: 'Medicine Tracker', icon: Pill },
    { id: 'grocery', label: 'Grocery Budget', icon: DollarSign },
    { id: 'insights', label: 'Wellness Insights', icon: Activity },
  ];

  return (
    <section id="dashboard-preview" className="py-20 lg:py-32 bg-[#F8FAF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E7B] bg-[#EBF1ED] px-3.5 py-1 rounded-full border border-[#6B8E7B]/20">
            Interactive Product Preview
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight mt-4 mb-4">
            Designed for real human wellness.
          </h2>
          <p className="text-base sm:text-lg text-[#64748B]">
            Explore the exact modules that power the WellSync platform — from personalized meal schedules to grounded AI answers and grocery budget optimization.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#6B8E7B] text-white shadow-md'
                    : 'bg-white text-[#64748B] hover:text-[#1E293B] border border-gray-200'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Canvas Container (SaaS Window Frame) */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden max-w-6xl mx-auto">
          
          {/* Window Header Bar */}
          <div className="bg-[#1E293B] text-white px-6 py-3 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2 hidden sm:inline">
                wellsync.app/{activeTab}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sync Active</span>
            </div>
          </div>

          {/* Module Screen Content */}
          <div className="p-6 sm:p-8 bg-[#F8FAF7]">

            {/* TAB 1: MAIN DASHBOARD (Matching Reference Left Screen) */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
                
                {/* Dashboard Sidebar */}
                <div className="hidden lg:block lg:col-span-3 bg-[#1E293B] text-slate-300 p-5 rounded-2xl space-y-6">
                  <div className="flex items-center gap-2 text-white font-bold text-lg px-2">
                    <span className="w-3 h-3 rounded-full bg-[#6B8E7B]"></span> WellSync
                  </div>

                  <nav className="space-y-1.5 text-xs font-medium">
                    <div className="flex items-center gap-3 bg-[#6B8E7B] text-white px-3 py-2.5 rounded-xl font-bold">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </div>
                    <div className="flex items-center gap-3 hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer">
                      <Utensils className="w-4 h-4 text-slate-400" /> Meal Planner
                    </div>
                    <div className="flex items-center gap-3 hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer">
                      <Camera className="w-4 h-4 text-slate-400" /> Food Diary
                    </div>
                    <div className="flex items-center gap-3 hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer">
                      <DollarSign className="w-4 h-4 text-slate-400" /> Grocery List
                    </div>
                    <div className="flex items-center gap-3 hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer">
                      <Pill className="w-4 h-4 text-slate-400" /> Medicines
                    </div>
                    <div className="flex items-center gap-3 hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer">
                      <Users className="w-4 h-4 text-slate-400" /> Caregiver
                    </div>
                    <div className="flex items-center gap-3 hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer">
                      <Sparkles className="w-4 h-4 text-slate-400" /> AI Assistant
                    </div>
                    <div className="flex items-center gap-3 hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer">
                      <Activity className="w-4 h-4 text-slate-400" /> Insights
                    </div>
                  </nav>

                  <div className="pt-6 border-t border-slate-700 flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-[#6B8E7B] flex items-center justify-center font-bold text-white text-xs">
                      R
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Riyanka</p>
                      <p className="text-[10px] text-slate-400">Student • Personal Plan</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Main Panel */}
                <div className="lg:col-span-9 space-y-6">
                  
                  {/* Greeting Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                    <div>
                      <h3 className="text-xl font-bold text-[#1E293B]">Good Morning, Riyanka! 👋</h3>
                      <p className="text-xs text-[#64748B]">Small steps every day lead to big results.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="p-2 rounded-xl bg-[#F8FAF7] border border-gray-200 text-[#64748B]">
                        <Bell className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-xl bg-[#F8FAF7] border border-gray-200 text-[#64748B]">
                        <User className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Top Metric Cards (Exact Reference Values) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Meals This Week</span>
                      <div className="text-2xl font-black text-[#1E293B] mt-1">5/7</div>
                      <span className="text-[10px] font-bold text-[#6B8E7B]">Great job!</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Medicine Adherence</span>
                      <div className="text-2xl font-black text-[#1E293B] mt-1">92%</div>
                      <span className="text-[10px] font-bold text-[#6B8E7B]">On track</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Mood</span>
                      <div className="text-2xl font-black text-[#1E293B] mt-1">Good</div>
                      <span className="text-[10px] font-bold text-[#64748B]">Keep it up!</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Budget Left</span>
                      <div className="text-2xl font-black text-[#1E293B] mt-1">₹1,240</div>
                      <span className="text-[10px] text-[#64748B]">of ₹1,500</span>
                    </div>
                  </div>

                  {/* Inspiring Wellness Quote Banner */}
                  <div className="bg-gradient-to-r from-[#1E293B] to-[#2D3E50] text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex items-center justify-between">
                    <div className="relative z-10">
                      <p className="text-sm sm:text-base font-semibold italic text-[#EBF1ED]">
                        "Your health isn't just about what you eat, but how you live."
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-[#6B8E7B]/20 blur-xl absolute right-4 top-2 pointer-events-none" />
                  </div>

                  {/* Today's Schedule + Quick Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Today's Plan */}
                    <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-gray-200/80">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-[#1E293B]">Today's Plan</h4>
                        <span className="text-xs text-[#6B8E7B] font-semibold cursor-pointer">View All</span>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF7]">
                          <span className="font-semibold text-[#1E293B]">Breakfast: Oats + Fruits + Nuts</span>
                          <span className="text-[#64748B]">8:00 AM <CheckCircle2 className="w-3.5 h-3.5 text-[#6B8E7B] inline ml-1" /></span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF7]">
                          <span className="font-semibold text-[#1E293B]">Lunch: Dal + Rice + Sabzi</span>
                          <span className="text-[#64748B]">1:00 PM <CheckCircle2 className="w-3.5 h-3.5 text-[#6B8E7B] inline ml-1" /></span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF7]">
                          <span className="font-semibold text-[#1E293B]">Medicine: Vitamin D</span>
                          <span className="text-[#64748B]">8:00 PM <Clock className="w-3.5 h-3.5 text-[#D9A441] inline ml-1" /></span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-gray-200/80">
                      <h4 className="text-sm font-bold text-[#1E293B] mb-4">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-3 text-center text-xs">
                        <button className="p-3 rounded-xl bg-[#F8FAF7] hover:bg-[#EBF1ED] font-semibold text-[#1E293B] border border-gray-200 flex flex-col items-center gap-1 cursor-pointer">
                          <Utensils className="w-4 h-4 text-[#6B8E7B]" /> Plan Meals
                        </button>
                        <button className="p-3 rounded-xl bg-[#F8FAF7] hover:bg-[#FAF4E8] font-semibold text-[#1E293B] border border-gray-200 flex flex-col items-center gap-1 cursor-pointer">
                          <Camera className="w-4 h-4 text-[#D9A441]" /> Scan Food
                        </button>
                        <button className="p-3 rounded-xl bg-[#F8FAF7] hover:bg-[#EBF1ED] font-semibold text-[#1E293B] border border-gray-200 flex flex-col items-center gap-1 cursor-pointer">
                          <Pill className="w-4 h-4 text-[#6B8E7B]" /> Add Medicine
                        </button>
                        <button className="p-3 rounded-xl bg-[#F8FAF7] hover:bg-slate-100 font-semibold text-[#1E293B] border border-gray-200 flex flex-col items-center gap-1 cursor-pointer">
                          <Sparkles className="w-4 h-4 text-[#1E293B]" /> Ask AI
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: MEAL PLANNER (Matching Reference Top Right Module) */}
            {activeTab === 'meal-planner' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 max-w-2xl mx-auto space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-[#1E293B]">Meal Planner</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B] font-semibold">This Week</span>
                  </div>
                </div>

                {/* Day selector pills */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
                  {['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16', 'Sat 17', 'Sun 18'].map((day, idx) => (
                    <div 
                      key={idx}
                      className={`text-center px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        idx === 0 ? 'bg-[#6B8E7B] text-white' : 'bg-[#F8FAF7] text-[#64748B] hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Meals list */}
                <div className="space-y-4 text-xs">
                  {/* Breakfast */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF4E8] text-[#D9A441] flex items-center justify-center font-bold text-lg">
                      🥣
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Breakfast</span>
                      <h4 className="text-sm font-bold text-[#1E293B]">Oats with Banana & Almonds</h4>
                      <p className="text-[11px] text-[#64748B]">~ 350 kcal</p>
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center font-bold text-lg">
                      🥗
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Lunch</span>
                      <h4 className="text-sm font-bold text-[#1E293B]">Paneer Sabzi + Roti + Salad</h4>
                      <p className="text-[11px] text-[#64748B]">~ 520 kcal</p>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAF7] border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg">
                      🍲
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Dinner</span>
                      <h4 className="text-sm font-bold text-[#1E293B]">Moong Dal Khichdi + Curd</h4>
                      <p className="text-[11px] text-[#64748B]">~ 420 kcal</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#64748B]">
                  <p className="max-w-xs">Based on your budget (₹1,500/week), allergies and food preferences.</p>
                  <button className="bg-[#6B8E7B] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#567564]">
                    View Grocery List
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: FOOD ANALYSIS (Matching Reference Top Right 2nd Module) */}
            {activeTab === 'food-analysis' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 max-w-xl mx-auto space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-[#1E293B]">← Food Analysis</h3>
                </div>

                {/* Scanned Food Graphic */}
                <div className="bg-[#FAF4E8] rounded-2xl p-6 text-center border border-[#D9A441]/20">
                  <div className="text-4xl mb-2">🍛</div>
                  <h4 className="text-sm font-bold text-[#1E293B]">Indian Meal Plate</h4>
                  <span className="text-xs text-[#6B8E7B] font-semibold bg-white px-2.5 py-0.5 rounded-full inline-block mt-1">
                    Vision Confidence: Medium (94%)
                  </span>
                </div>

                {/* Estimated Nutrition Table */}
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-[#1E293B]">Estimated Nutrition</h4>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[#64748B]">Calories</span>
                    <span className="font-bold text-[#1E293B]">520 kcal</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[#64748B]">Protein</span>
                    <span className="font-bold text-[#1E293B]">18 g</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[#64748B]">Carbs</span>
                    <span className="font-bold text-[#1E293B]">72 g</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[#64748B]">Fat</span>
                    <span className="font-bold text-[#1E293B]">14 g</span>
                  </div>
                </div>

                {/* Detected Items Tags */}
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B] mb-2">Detected Food Items</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-[#F8FAF7] text-[#1E293B] px-3 py-1 rounded-full border border-gray-200 font-semibold">Dal</span>
                    <span className="bg-[#F8FAF7] text-[#1E293B] px-3 py-1 rounded-full border border-gray-200 font-semibold">Roti</span>
                    <span className="bg-[#F8FAF7] text-[#1E293B] px-3 py-1 rounded-full border border-gray-200 font-semibold">Sabzi</span>
                    <span className="bg-[#F8FAF7] text-[#1E293B] px-3 py-1 rounded-full border border-gray-200 font-semibold">Rice</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#64748B] italic">
                  This is an estimated analysis. Actual values may vary based on portion size and ingredients.
                </p>

                <button className="w-full bg-[#6B8E7B] text-white py-3 rounded-xl font-bold hover:bg-[#567564]">
                  Save to Food Diary
                </button>
              </div>
            )}

            {/* TAB 4: AI WELLNESS ASSISTANT (Matching Reference Bottom Left Module) */}
            {activeTab === 'ai-assistant' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 max-w-xl mx-auto space-y-6 animate-in fade-in">
                <div className="pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-[#1E293B]">AI Wellness Assistant</h3>
                  <p className="text-xs text-[#64748B]">Ask anything about your health, food, or wellness.</p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* User Question Bubble */}
                  <div className="flex justify-end">
                    <div className="bg-[#EBF1ED] text-[#1E293B] p-3.5 rounded-2xl rounded-tr-none max-w-xs font-semibold">
                      "Aaj dinner mein kya khaun? I'm on a budget and I'm vegetarian."
                    </div>
                  </div>

                  {/* AI Grounded Response */}
                  <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#6B8E7B] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      🍃
                    </div>
                    <div className="bg-[#F8FAF7] p-4 rounded-2xl rounded-tl-none border border-gray-200 space-y-3">
                      <p className="text-[#1E293B] leading-relaxed">
                        Here are some healthy and budget-friendly dinner options for you:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-[#64748B]">
                        <li>Moong dal chilla + green chutney</li>
                        <li>Vegetable khichdi + curd</li>
                        <li>Paneer bhurji + roti (if within budget)</li>
                      </ul>
                      <p className="text-[#64748B]">
                        All are high in protein, easy to digest and fit your vegetarian preference.
                      </p>

                      <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="bg-white text-[#6B8E7B] font-bold px-2 py-0.5 rounded border border-[#6B8E7B]/20">
                          Source 1: NIN Nutrition Guide
                        </span>
                        <span className="bg-white text-[#6B8E7B] font-bold px-2 py-0.5 rounded border border-[#6B8E7B]/20">
                          Source 2: WHO Food Guide
                        </span>
                        <span className="text-[#D9A441] font-bold">Confidence 92%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    disabled
                    value="Type your question..."
                    className="w-full bg-[#F8FAF7] border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: MEDICINE REMINDER (Matching Reference Bottom Center Module 1) */}
            {activeTab === 'medicine' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 max-w-xl mx-auto space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-[#1E293B]">Medicine Reminder</h3>
                  <span className="text-xs bg-[#EBF1ED] text-[#6B8E7B] px-3 py-1 rounded-full font-bold">Today</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Dose 1 */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAF7] border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center font-bold">
                        💊
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1E293B]">Vitamin D</h4>
                        <p className="text-[11px] text-[#64748B]">8:00 AM</p>
                      </div>
                    </div>
                    <span className="bg-[#EBF1ED] text-[#6B8E7B] font-bold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                    </span>
                  </div>

                  {/* Dose 2 */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAF7] border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center font-bold">
                        💊
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1E293B]">Iron Tablet</h4>
                        <p className="text-[11px] text-[#64748B]">1:00 PM</p>
                      </div>
                    </div>
                    <span className="bg-red-50 text-red-500 font-bold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Missed
                    </span>
                  </div>

                  {/* Dose 3 */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAF7] border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF4E8] text-[#D9A441] flex items-center justify-center font-bold">
                        💊
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1E293B]">Omega 3</h4>
                        <p className="text-[11px] text-[#64748B]">9:00 PM</p>
                      </div>
                    </div>
                    <span className="bg-[#FAF4E8] text-[#D9A441] font-bold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold text-[#1E293B]">
                    <span>Weekly Adherence</span>
                    <span className="text-[#6B8E7B]">92%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#6B8E7B] h-full w-[92%]"></div>
                  </div>
                </div>

                {/* Caregiver note */}
                <div className="bg-[#F8FAF7] p-4 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">Caregiver Access</h4>
                    <p className="text-[11px] text-[#64748B]">Allow a trusted person to view your doses.</p>
                  </div>
                  <button className="text-xs font-bold text-[#6B8E7B] bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                    Manage
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: GROCERY LIST (Matching Reference Bottom Center Module 2) */}
            {activeTab === 'grocery' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 max-w-xl mx-auto space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-[#1E293B]">Grocery List</h3>
                  <span className="text-xs text-[#64748B]">Estimated Cost: <strong className="text-[#1E293B]">₹1,420</strong></span>
                </div>

                <div className="space-y-2.5 text-xs text-[#1E293B]">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF7]">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6B8E7B]" /> Oats (1 kg)</span>
                    <span className="font-bold">₹120</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF7]">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6B8E7B]" /> Banana (1 dozen)</span>
                    <span className="font-bold">₹60</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF7]">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6B8E7B]" /> Paneer (500 g)</span>
                    <span className="font-bold">₹180</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF7]">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6B8E7B]" /> Tomato (1 kg)</span>
                    <span className="font-bold">₹50</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF7]">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#6B8E7B]" /> Spinach (500 g)</span>
                    <span className="font-bold">₹40</span>
                  </div>
                </div>

                <button className="w-full bg-[#6B8E7B] text-white py-3 rounded-xl font-bold hover:bg-[#567564]">
                  Optimize Cost
                </button>

                <div className="bg-[#FAF4E8] p-3 rounded-xl border border-[#D9A441]/20 text-xs text-[#D9A441] font-medium">
                  💡 We found cheaper alternatives for paneer and spinach. You can save ~₹60.
                </div>
              </div>
            )}

            {/* TAB 7: WELLNESS INSIGHTS (Matching Reference Bottom Right Module) */}
            {activeTab === 'insights' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 max-w-xl mx-auto space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-[#1E293B]">Wellness Insights</h3>
                  <div className="flex gap-1 bg-[#F8FAF7] p-1 rounded-xl text-xs">
                    <span className="bg-[#6B8E7B] text-white px-2.5 py-1 rounded-lg font-bold">Overview</span>
                    <span className="text-[#64748B] px-2.5 py-1">Food</span>
                    <span className="text-[#64748B] px-2.5 py-1">Medicine</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF7]">
                    <span className="text-[#64748B]">Meals Logged</span>
                    <span className="font-bold text-[#1E293B]">6 / 7</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF7]">
                    <span className="text-[#64748B]">Medicine Adherence</span>
                    <span className="font-bold text-[#6B8E7B]">92% (+5% from last week)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF7]">
                    <span className="text-[#64748B]">Avg Daily Calories</span>
                    <span className="font-bold text-[#1E293B]">1,420 kcal (Within goal)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF7]">
                    <span className="text-[#64748B]">Mood Trend</span>
                    <span className="font-bold text-[#1E293B]">Mostly Good (+2 better days)</span>
                  </div>
                </div>

                <div className="bg-[#EBF1ED] p-4 rounded-xl border border-[#6B8E7B]/20 text-xs text-[#1E293B] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#6B8E7B]">
                    <Heart className="w-4 h-4 fill-[#6B8E7B]" /> You're doing great!
                  </div>
                  <p className="text-[#64748B]">Your consistency with meals and medicine is improving. Keep it up!</p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
