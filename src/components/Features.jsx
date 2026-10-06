import React, { useState } from 'react';
import { ArrowRight, Camera, Sparkles, Calendar, HeartPulse, ExternalLink } from 'lucide-react';
import { 
  MealPlannerIllustration, 
  FoodIntelligenceIllustration, 
  MedicineIllustration, 
  GroundedAiIllustration 
} from './illustrations/FeatureIllustrations';

export default function Features({ onOpenFoodDemo, onOpenAiDemo }) {
  return (
    <section id="features" className="py-20 lg:py-32 bg-[#F8FAF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E7B] bg-[#EBF1ED] px-3 py-1 rounded-full border border-[#6B8E7B]/20">
            Core Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight mt-4 mb-4">
            Everything you need to stay in sync.
          </h2>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Four interconnected systems working together seamlessly to remove friction from your health and wellness routines.
          </p>
        </div>

        {/* Feature Cards Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Feature 1: AI Meal Planner */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="mb-6 overflow-hidden rounded-2xl bg-[#F2F6F3] p-2 group-hover:scale-[1.01] transition-transform">
                <MealPlannerIllustration className="w-full h-48 object-contain" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#EBF1ED] flex items-center justify-center text-[#6B8E7B]">
                  <Calendar className="w-4 h-4" />
                </span>
                <h3 className="text-2xl font-bold text-[#1E293B]">AI Meal Planner</h3>
              </div>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                Personalized meals crafted dynamically based on your taste preferences, food allergies, dietary restrictions, and weekly grocery budget.
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B8E7B] bg-[#EBF1ED] px-2.5 py-1 rounded-md">
                Grocery & Macro Sync
              </span>
              <a href="#dashboard-preview" className="text-xs font-bold text-[#1E293B] group-hover:text-[#6B8E7B] flex items-center gap-1 transition-colors">
                View Sample Plan <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Feature 2: Food Intelligence */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="mb-6 overflow-hidden rounded-2xl bg-[#FAF4E8] p-2 group-hover:scale-[1.01] transition-transform">
                <FoodIntelligenceIllustration className="w-full h-48 object-contain" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#FAF4E8] flex items-center justify-center text-[#D9A441]">
                  <Camera className="w-4 h-4" />
                </span>
                <h3 className="text-2xl font-bold text-[#1E293B]">Food Intelligence</h3>
              </div>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                Upload or snap a photo of any meal or plate to receive instant, approximate nutritional breakdowns, macronutrients, and micro-nutrient insights.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button 
                onClick={onOpenFoodDemo}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D9A441] bg-[#FAF4E8] hover:bg-[#F5E6CA] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" /> Test Photo Analyzer Demo
              </button>
              <span className="text-xs text-[#64748B] font-medium">Vision AI Powered</span>
            </div>
          </div>

          {/* Feature 3: Medicine & Care */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="mb-6 overflow-hidden rounded-2xl bg-[#F2F6F3] p-2 group-hover:scale-[1.01] transition-transform">
                <MedicineIllustration className="w-full h-48 object-contain" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#EBF1ED] flex items-center justify-center text-[#6B8E7B]">
                  <HeartPulse className="w-4 h-4" />
                </span>
                <h3 className="text-2xl font-bold text-[#1E293B]">Medicine & Care</h3>
              </div>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                Effortlessly manage dosage schedules, track medication adherence over time, and receive gentle, smart notifications synced to your day.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1E293B] bg-[#F1F5F9] px-2.5 py-1 rounded-md">
                Smart Schedules
              </span>
              <a href="#dashboard-preview" className="text-xs font-bold text-[#1E293B] group-hover:text-[#6B8E7B] flex items-center gap-1 transition-colors">
                Explore Tracker <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Feature 4: AI Wellness Assistant */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="mb-6 overflow-hidden rounded-2xl bg-[#F8FAF7] p-2 group-hover:scale-[1.01] transition-transform">
                <GroundedAiIllustration className="w-full h-48 object-contain" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-[#D9A441]" />
                </span>
                <h3 className="text-2xl font-bold text-[#1E293B]">AI Wellness Assistant</h3>
              </div>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                Ask wellness and nutrition questions with confidence. Every response is grounded in trusted, peer-reviewed knowledge sources with transparent citations.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button 
                onClick={onOpenAiDemo}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E293B] bg-[#EBF1ED] hover:bg-[#DDE7E0] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#6B8E7B]" /> Try Assistant Query
              </button>
              <span className="text-xs font-semibold text-[#D9A441]">RAG Grounded</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
