import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Plus, Camera, Trash2, 
  ArrowLeft, ChevronLeft, ChevronRight, 
  RefreshCw, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import foodDiaryHeaderImg from '../../assets/dashboard/food-diary.jpg';

const SAMPLE_PRESETS = [
  {
    id: 'avocado_toast',
    label: 'Avocado Toast & Egg',
    name: 'Artisan Avocado Sourdough with Soft-Poached Egg',
    calories: 380,
    macros: { protein: 16, carbs: 28, fats: 22, fiber: 9 },
    mealType: 'breakfast',
    confidence: '95%',
    ingredients: ['Sourdough bread', 'Haas avocado', 'Pasture egg', 'Microgreens', 'Hemp seeds'],
  },
  {
    id: 'quinoa_bowl',
    label: 'Quinoa Veggie Bowl',
    name: 'Mediterranean Quinoa Bowl with Crispy Chickpeas & Greens',
    calories: 520,
    macros: { protein: 21, carbs: 64, fats: 16, fiber: 14 },
    mealType: 'lunch',
    confidence: '93%',
    ingredients: ['Cooked quinoa', 'Spiced chickpeas', 'Cucumber', 'Baby spinach', 'Herb tahini'],
  },
  {
    id: 'berry_smoothie',
    label: 'Wild Berry Chia Smoothie',
    name: 'Wild Blueberry & Spinach Chia Seed Protein Smoothie',
    calories: 310,
    macros: { protein: 24, carbs: 32, fats: 6, fiber: 8 },
    mealType: 'snack',
    confidence: '91%',
    ingredients: ['Wild blueberries', 'Baby spinach', 'Oat milk', 'Chia seeds', 'Plant protein'],
  },
];

export default function FoodDiaryView() {
  const { user } = useAuth();
  const calorieTarget = user?.preferences?.calorieTarget || 2000;

  const [currentDateIndex, setCurrentDateIndex] = useState(0); // 0 = Today
  const dates = ['Today, Oct 16', 'Yesterday, Oct 15', 'Wed, Oct 14'];
  const currentDate = dates[currentDateIndex];

  // Logged Meals State
  const [meals, setMeals] = useState([
    {
      id: 1,
      type: 'breakfast',
      name: 'Rolled Oats with Almond Butter & Wild Blueberries',
      time: '8:30 AM',
      calories: 390,
      protein: 14,
      carbs: 54,
      fats: 12,
      fiber: 8,
      source: 'manual',
    },
    {
      id: 2,
      type: 'lunch',
      name: 'Mediterranean Quinoa Salad with Roasted Chickpeas',
      time: '1:15 PM',
      calories: 540,
      protein: 20,
      carbs: 66,
      fats: 16,
      fiber: 14,
      source: 'vision',
    },
  ]);

  // Modal states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logMode, setLogMode] = useState('vision'); // 'vision' or 'manual'
  const [imgError, setImgError] = useState(false);

  // Vision scanner states
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Manual entry states
  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState('breakfast');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFats, setManualFats] = useState('');

  // Daily Totals
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);
  const caloriePercent = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));

  const handleDeleteMeal = (id) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setAnalyzingPhoto(true);
    setScanResult(null);

    setTimeout(() => {
      setAnalyzingPhoto(false);
      setScanResult(preset);
    }, 900);
  };

  const handleConfirmScanResult = () => {
    if (!scanResult) return;
    const newMeal = {
      id: Date.now(),
      type: scanResult.mealType,
      name: scanResult.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: scanResult.calories,
      protein: scanResult.macros.protein,
      carbs: scanResult.macros.carbs,
      fats: scanResult.macros.fats,
      fiber: scanResult.macros.fiber,
      source: 'vision',
    };

    setMeals(prev => [...prev, newMeal]);
    setIsLogModalOpen(false);
    setSelectedPreset(null);
    setScanResult(null);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualCalories) return;

    const newMeal = {
      id: Date.now(),
      type: manualType,
      name: manualName.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: parseInt(manualCalories, 10) || 0,
      protein: parseInt(manualProtein, 10) || 0,
      carbs: parseInt(manualCarbs, 10) || 0,
      fats: parseInt(manualFats, 10) || 0,
      fiber: 0,
      source: 'manual',
    };

    setMeals(prev => [...prev, newMeal]);
    setIsLogModalOpen(false);
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFats('');
  };

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
      {/* 1. VISUAL HEADER WITH DEDICATED AI FOOD DIARY FLAT-LAY       */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF4E8] text-[11px] font-bold text-[#D9A441]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Phase 3 Vision & Journaling</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Mindful Food Diary & AI Vision
            </h1>
            
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl">
              Log meals manually or scan food photos for instant ingredient recognition, macronutrient estimates, and habit tracking calibrated to your {calorieTarget} kcal target.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setLogMode('vision');
                  setIsLogModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold shadow-sm transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>AI Photo Scanner Demo</span>
              </button>

              <button
                onClick={() => {
                  setLogMode('manual');
                  setIsLogModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#F8FAF7] hover:bg-[#EBF1ED] text-[#1E293B] text-xs font-bold border border-gray-200/90 transition-all"
              >
                <Plus className="w-4 h-4 text-[#6B8E7B]" />
                <span>Manual Entry</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-[#FAF4E8] group">
              {!imgError ? (
                <img
                  src={foodDiaryHeaderImg}
                  alt="Top-down flat-lay food photography with avocado toast, chia pudding, daily journal notebook and mobile app"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-[#FAF4E8] to-white text-center">
                  <BookOpen className="w-8 h-8 text-[#D9A441] mb-2" />
                  <span className="text-xs font-bold text-[#1E293B]">Mindful Food Reflection</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-bold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px]">
                  Visual Food Journal
                </span>
                <span className="text-[10px] text-[#FAF4E8] font-semibold">
                  Photo AI Recognition
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DATE NAVIGATOR & PROGRESS METRICS                         */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-6">
        
        {/* Date Selector Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentDateIndex(prev => Math.min(prev + 1, dates.length - 1))}
              disabled={currentDateIndex === dates.length - 1}
              className="p-2 rounded-xl text-gray-500 hover:text-[#1E293B] hover:bg-[#F8FAF7] disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center sm:text-left">
              <span className="text-xs font-extrabold text-[#1E293B] block">{currentDate}</span>
              <span className="text-[10px] text-[#64748B]">Daily Nutrition Breakdown</span>
            </div>
            <button
              onClick={() => setCurrentDateIndex(prev => Math.max(prev - 1, 0))}
              disabled={currentDateIndex === 0}
              className="p-2 rounded-xl text-gray-500 hover:text-[#1E293B] hover:bg-[#F8FAF7] disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#64748B] block">Daily Calorie Balance</span>
            <span className="text-base font-extrabold text-[#1E293B]">
              {totalCalories} <span className="text-xs font-normal text-gray-400">/ {calorieTarget} kcal</span>
            </span>
          </div>
        </div>

        {/* Calorie Progress Bar */}
        <div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6B8E7B] to-[#567564] rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#64748B] mt-1.5 font-semibold">
            <span>{totalCalories} consumed ({caloriePercent}%)</span>
            <span>{Math.max(0, calorieTarget - totalCalories)} kcal remaining</span>
          </div>
        </div>

        {/* Macro Nutrients Distribution */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <div className="bg-[#F8FAF7] p-3 rounded-2xl text-center">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase tracking-wider">Protein</span>
            <span className="text-base font-extrabold text-[#6B8E7B]">{totalProtein}g</span>
          </div>
          <div className="bg-[#F8FAF7] p-3 rounded-2xl text-center">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase tracking-wider">Carbs</span>
            <span className="text-base font-extrabold text-[#1E293B]">{totalCarbs}g</span>
          </div>
          <div className="bg-[#F8FAF7] p-3 rounded-2xl text-center">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase tracking-wider">Healthy Fats</span>
            <span className="text-base font-extrabold text-[#D9A441]">{totalFats}g</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. LOGGED MEAL ENTRIES LIST                                  */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#1E293B]">Today's Recorded Meals</h2>
          <span className="text-xs text-[#64748B]">{meals.length} items logged</span>
        </div>

        {meals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meals.map((meal) => (
              <div 
                key={meal.id}
                className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EBF1ED] text-[#6B8E7B]">
                      {meal.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#64748B] font-semibold">{meal.time}</span>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#1E293B] leading-snug">{meal.name}</h3>

                  <div className="grid grid-cols-4 gap-2 my-3 text-center bg-[#F8FAF7] p-2 rounded-xl">
                    <div>
                      <span className="text-[9px] text-[#64748B] block">Calories</span>
                      <span className="text-xs font-bold text-[#1E293B]">{meal.calories}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">Protein</span>
                      <span className="text-xs font-bold text-[#6B8E7B]">{meal.protein}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">Carbs</span>
                      <span className="text-xs font-bold text-[#1E293B]">{meal.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">Fats</span>
                      <span className="text-xs font-bold text-[#D9A441]">{meal.fats}g</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Source: {meal.source === 'vision' ? '📸 Multimodal AI Vision' : '✍️ Manual Entry'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 border border-dashed border-gray-200 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-[#1E293B]">No meals logged for this date</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Track your nutrition by testing our photo analyzer or entering ingredients manually.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. LOG MEAL MODAL (VISION & MANUAL)                          */}
      {/* ============================================================ */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">
                  {logMode === 'vision' ? 'Multimodal Photo Analyzer Demo' : 'Manual Meal Logging'}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {logMode === 'vision' ? 'Select a test plate or simulate upload' : 'Enter nutritional values'}
                </p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-[#F8FAF7] rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => setLogMode('vision')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  logMode === 'vision' ? 'bg-white text-[#1E293B] shadow-2xs' : 'text-[#64748B]'
                }`}
              >
                AI Photo Vision
              </button>
              <button
                type="button"
                onClick={() => setLogMode('manual')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  logMode === 'manual' ? 'bg-white text-[#1E293B] shadow-2xs' : 'text-[#64748B]'
                }`}
              >
                Manual Entry
              </button>
            </div>

            {/* Vision Mode */}
            {logMode === 'vision' ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-[#1E293B] block mb-2">
                    Select a sample photo to run AI vision analysis:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedPreset?.id === preset.id
                            ? 'bg-[#EBF1ED] border-[#6B8E7B] text-[#1E293B]'
                            : 'bg-white border-gray-200 text-[#64748B] hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm block mb-1">
                          {preset.id === 'avocado_toast' ? '🥑' : preset.id === 'quinoa_bowl' ? '🥗' : '🫐'}
                        </span>
                        <span className="text-xs font-bold block leading-tight">{preset.label}</span>
                        <span className="text-[10px] text-gray-400">{preset.calories} kcal</span>
                      </button>
                    ))}
                  </div>
                </div>

                {analyzingPhoto && (
                  <div className="p-6 bg-[#F8FAF7] rounded-2xl text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-[#6B8E7B] animate-spin mx-auto" />
                    <p className="text-xs font-bold text-[#1E293B]">Analyzing visual components...</p>
                    <p className="text-[10px] text-[#64748B]">Detecting ingredients, volume, and macronutrient density</p>
                  </div>
                )}

                {scanResult && (
                  <div className="bg-[#EBF1ED]/70 p-4 rounded-2xl border border-[#6B8E7B]/30 space-y-3 animate-fade-slide-up">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E293B]">{scanResult.name}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md">
                        {scanResult.confidence} Match
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center bg-white p-2.5 rounded-xl text-xs font-bold">
                      <div>
                        <span className="text-[9px] text-[#64748B] block">Calories</span>
                        <span>{scanResult.calories}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#64748B] block">Protein</span>
                        <span className="text-[#6B8E7B]">{scanResult.macros.protein}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#64748B] block">Carbs</span>
                        <span>{scanResult.macros.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#64748B] block">Fats</span>
                        <span className="text-[#D9A441]">{scanResult.macros.fats}g</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmScanResult}
                      className="w-full py-2.5 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Confirm & Add to Today's Diary
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Manual Mode Form */
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Meal Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grilled Chicken & Quinoa"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6B8E7B]/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1E293B] block mb-1">Meal Slot</label>
                    <select
                      value={manualType}
                      onChange={(e) => setManualType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1E293B] block mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 450"
                      value={manualCalories}
                      onChange={(e) => setManualCalories(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">Protein (g)</label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={manualProtein}
                      onChange={(e) => setManualProtein(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      placeholder="e.g. 40"
                      value={manualCarbs}
                      onChange={(e) => setManualCarbs(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#64748B] block mb-1">Fats (g)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={manualFats}
                      onChange={(e) => setManualFats(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold transition-colors cursor-pointer mt-2"
                >
                  Save Entry to Diary
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
