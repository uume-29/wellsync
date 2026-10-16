import React, { useState } from 'react';
import { 
  ArrowRight, Camera, Sparkles, Calendar, HeartPulse, 
  ShoppingCart, Activity, Pill, CheckCircle2 
} from 'lucide-react';

import mealPlannerImg from '../assets/generated/meal-planner.jpg';
import foodDiaryImg from '../assets/generated/food-diary.jpg';
import groceryListImg from '../assets/generated/grocery-list.jpg';
import medicineTrackerImg from '../assets/generated/medicine-tracker.jpg';
import aiAssistantImg from '../assets/generated/ai-assistant.jpg';
import wellnessInsightsImg from '../assets/generated/wellness-insights.jpg';

export default function Features({ onOpenFoodDemo, onOpenAiDemo }) {
  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (key) => {
    setImgErrors(prev => ({ ...prev, [key]: true }));
  };

  const featureCards = [
    {
      key: 'mealPlanner',
      image: mealPlannerImg,
      badge: 'Weekly Personalization',
      badgeColor: 'bg-[#EBF1ED] text-[#6B8E7B]',
      icon: Calendar,
      title: 'AI Meal Planner',
      description: 'Balanced, delicious meals crafted dynamically around your taste preferences, allergies, dietary restrictions, and grocery budget.',
      actionType: 'link',
      actionText: 'Explore Meal Plans',
      actionHref: '#dashboard-preview',
    },
    {
      key: 'foodDiary',
      image: foodDiaryImg,
      badge: 'Multimodal AI Vision',
      badgeColor: 'bg-[#FAF4E8] text-[#D9A441]',
      icon: Camera,
      title: 'Food Diary & Vision',
      description: 'Snap or upload a photo of any meal for instant ingredient recognition, macronutrient estimation, and daily habit logging.',
      actionType: 'button',
      actionText: 'Test Photo Analyzer Demo',
      onAction: onOpenFoodDemo,
      isPrimaryAction: true,
    },
    {
      key: 'groceryList',
      image: groceryListImg,
      badge: 'Aisle & Cost Optimization',
      badgeColor: 'bg-[#EBF1ED] text-[#6B8E7B]',
      icon: ShoppingCart,
      title: 'Smart Grocery Organizer',
      description: 'Automatically compile grocery shopping lists directly from your confirmed weekly meal plans, optimized against budget targets.',
      actionType: 'link',
      actionText: 'Budget Shopping Cart',
      actionHref: '#dashboard-preview',
    },
    {
      key: 'medicineTracker',
      image: medicineTrackerImg,
      badge: 'Adherence Reminders',
      badgeColor: 'bg-[#FAF4E8] text-[#D9A441]',
      icon: Pill,
      title: 'Medicine & Habit Tracker',
      description: 'Effortlessly manage dosage schedules, confirm medication adherence with one tap, and keep trusted family caregivers aligned.',
      actionType: 'link',
      actionText: 'Explore Tracker',
      actionHref: '#dashboard-preview',
    },
    {
      key: 'aiAssistant',
      image: aiAssistantImg,
      badge: 'Biomedical RAG Knowledge',
      badgeColor: 'bg-[#EBF1ED] text-[#6B8E7B]',
      icon: Sparkles,
      title: 'AI Wellness Assistant',
      description: 'Ask questions on nutrition, habit building, and ingredient swaps with transparent source citations from peer-reviewed literature.',
      actionType: 'button',
      actionText: 'Try Assistant Query',
      onAction: onOpenAiDemo,
      isPrimaryAction: true,
    },
    {
      key: 'wellnessInsights',
      image: wellnessInsightsImg,
      badge: 'Holistic Health Reflection',
      badgeColor: 'bg-slate-100 text-[#1E293B]',
      icon: Activity,
      title: 'Personal Wellness Insights',
      description: 'Correlate your nutrition logs, daily medication adherence, and habit momentum into actionable weekly reflections.',
      actionType: 'link',
      actionText: 'View Wellness Trends',
      actionHref: '#dashboard-preview',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-[#F8FAF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E7B] bg-[#EBF1ED] px-3.5 py-1.5 rounded-full border border-[#6B8E7B]/20 shadow-2xs">
            Intelligent Wellness Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight mt-4 mb-4 leading-tight">
            Everything you need to live in sync.
          </h2>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Six interconnected wellness capabilities working together seamlessly to remove friction from your health and nutrition routines.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureCards.map((card) => {
            const IconComp = card.icon;
            const hasError = imgErrors[card.key];

            return (
              <div
                key={card.key}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container with Hover Micro-Zoom */}
                  <div className="relative mb-5 aspect-[16/10] rounded-2xl overflow-hidden bg-[#EBF1ED] shadow-xs">
                    {!hasError ? (
                      <img
                        src={card.image}
                        alt={`${card.title} - WellSync AI Wellness Companion`}
                        onError={() => handleImgError(card.key)}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-[#EBF1ED] to-white text-center">
                        <IconComp className="w-8 h-8 text-[#6B8E7B] mb-1" />
                        <span className="text-xs font-bold text-[#1E293B]">{card.title}</span>
                      </div>
                    )}

                    {/* Gradient Overlay for Tag Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Category Floating Pill Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-bold text-white bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/20">
                        {card.badge}
                      </span>
                    </div>
                  </div>

                  {/* Title & Icon Header */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#EBF1ED] flex items-center justify-center text-[#6B8E7B] shrink-0 group-hover:scale-105 transition-transform">
                      <IconComp className="w-4 h-4" />
                    </span>
                    <h3 className="text-xl font-bold text-[#1E293B] group-hover:text-[#6B8E7B] transition-colors">
                      {card.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                {/* Footer Action Strip */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  {card.actionType === 'button' ? (
                    <button
                      onClick={card.onAction}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D9A441] bg-[#FAF4E8] hover:bg-[#F5E6CA] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{card.actionText}</span>
                    </button>
                  ) : (
                    <a
                      href={card.actionHref}
                      className="text-xs font-bold text-[#1E293B] group-hover:text-[#6B8E7B] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>{card.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}

                  <span className="text-[11px] text-[#64748B] font-semibold">
                    WellSync Core
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
