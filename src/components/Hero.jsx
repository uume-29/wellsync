import React from 'react';
import { ArrowRight, Utensils, Pill, ShieldCheck, Cpu } from 'lucide-react';
import EditorialWellnessHero from './illustrations/EditorialWellnessHero';

export default function Hero({ onOpenSignup }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative pt-6 pb-16 lg:pt-12 lg:pb-28 overflow-hidden bg-[#F8FAF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          
          {/* Left Column: Messaging & Hierarchy (Aligned with Reference Board) */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            
            {/* Main Brand Title */}
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#6B8E7B] mb-2">
              WellSync
            </div>

            {/* Main Tagline Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1E293B] leading-[1.18] mb-4">
              Your AI-powered personal wellness companion.
            </h1>

            {/* Subhead text */}
            <p className="text-lg sm:text-xl font-medium text-[#64748B] mb-8 leading-relaxed max-w-xl">
              Smarter food choices. Better habits. Healthier you.
            </p>

            {/* Action Buttons (Reference style: Pill buttons) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={onOpenSignup}
                className="inline-flex items-center justify-center gap-2.5 bg-[#6B8E7B] hover:bg-[#567564] text-white text-base font-semibold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => scrollToSection('features')}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#EBF1ED]/60 text-[#1E293B] border border-[#CBD5E1] hover:border-[#6B8E7B] text-base font-medium px-7 py-3.5 rounded-full shadow-xs transition-all cursor-pointer"
              >
                Learn More
              </button>
            </div>

            {/* 4 Feature Badges Bar (Directly matching Reference Hero icons strip) */}
            <div className="w-full pt-6 border-t border-[#6B8E7B]/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E293B] bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center shrink-0">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <span>AI Meal Plans</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E293B] bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[#FAF4E8] text-[#D9A441] flex items-center justify-center shrink-0">
                  <Pill className="w-3.5 h-3.5" />
                </div>
                <span>Medicine Reminders</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E293B] bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Wellness Insights</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E293B] bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[#1E293B] text-white flex items-center justify-center shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span>RAG Assistant</span>
              </div>

            </div>

          </div>

          {/* Right Column: Reference-inspired Graphic (Custom Artwork, NO AI/Stock Person) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <EditorialWellnessHero />
          </div>

        </div>
      </div>
    </section>
  );
}
