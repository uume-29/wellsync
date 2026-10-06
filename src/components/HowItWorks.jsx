import React from 'react';
import { Sliders, Cpu, Activity, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Sliders,
      title: "1. Tell us about you",
      subtitle: "Set preferences, allergies, budget & wellness goals.",
      detail: "Input your dietary restrictions (e.g. gluten-free, vegan), daily calorie targets, medication times, and weekly food budget in under two minutes."
    },
    {
      number: "02",
      icon: Cpu,
      title: "2. Let WellSync personalize",
      subtitle: "AI combines your preferences and trusted knowledge.",
      detail: "Our grounded Gemini RAG engine scans verified nutrition data and your profile to craft tailored meal plans and care reminders specifically for you."
    },
    {
      number: "03",
      icon: Activity,
      title: "3. Stay in sync",
      subtitle: "Track meals, medicines & insights from one dashboard.",
      detail: "Follow your daily timeline, snap meal photos for quick macro checks, and receive gentle reminders that seamlessly fit your lifestyle."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-white border-t border-[#6B8E7B]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E7B] bg-[#EBF1ED] px-3.5 py-1 rounded-full border border-[#6B8E7B]/20">
            Simple Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight mt-4 mb-4">
            Designed for effortless daily alignment.
          </h2>
          <p className="text-base sm:text-lg text-[#64748B]">
            Three straightforward steps to bring clarity and structure to your everyday nutrition and health habits.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Subtle Connecting Line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#6B8E7B]/20 via-[#D9A441]/30 to-[#6B8E7B]/20 -translate-y-12 -z-0" />

          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={idx}
                className="relative bg-[#F8FAF7] rounded-3xl p-8 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-start z-10 group"
              >
                {/* Step Badge */}
                <div className="w-full flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#6B8E7B] group-hover:bg-[#6B8E7B] group-hover:text-white transition-colors shadow-xs">
                    <IconComponent className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className="text-3xl font-black text-[#CBD5E1] group-hover:text-[#D9A441] transition-colors">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#1E293B] mb-2">
                  {step.title}
                </h3>
                
                <p className="text-sm font-semibold text-[#6B8E7B] mb-4">
                  {step.subtitle}
                </p>

                <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                  {step.detail}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-200/60 w-full flex items-center gap-2 text-xs font-semibold text-[#1E293B]">
                  <CheckCircle className="w-4 h-4 text-[#6B8E7B]" />
                  <span>Automated & Adaptive</span>
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
