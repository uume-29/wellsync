import React from 'react';
import heroImage from '../../assets/hero-lifestyle.jpg';

export default function EditorialWellnessHero({ className = "" }) {
  return (
    <div className={`relative w-full max-w-xl mx-auto flex items-center justify-center p-2 sm:p-4 ${className}`}>
      
      {/* Background Soft Sage Circle - Inspired by the original WellSync reference mockup */}
      <div className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tr from-[#EBF1ED] via-[#6B8E7B]/15 to-[#FAF4E8] -z-10 animate-pulse-subtle flex items-center justify-center">
        {/* Inner subtle outline ring */}
        <div className="w-[88%] h-[88%] rounded-full border border-[#6B8E7B]/20" />
      </div>

      <div className="relative w-full aspect-[4/3.8] sm:aspect-[4/3.5] max-h-[460px] flex items-center justify-center">

        {/* Soft Organic Masked Frame for Main Hero Lifestyle Photo */}
        <div className="relative w-[88%] h-[92%] rounded-[48px] sm:rounded-[56px] overflow-hidden border-4 border-white shadow-2xl bg-[#EBF1ED] group">
          
          <img
            src={heroImage}
            alt="Young adult enjoying a healthy salad meal naturally with laptop open, WellSync wellness app"
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
          />

          {/* Soft Editorial Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/20 via-transparent to-transparent pointer-events-none" />

          {/* Soft Botanical Leaf Accents in Top Right */}
          <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-80">
            <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
              <path d="M90,10 C90,70 30,90 10,90 C10,30 70,10 90,10 Z" fill="#6B8E7B" opacity="0.85" />
              <path d="M85,15 L15,85" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>

        </div>

        {/* --- Floating Badges directly matching the reference mockup --- */}

        {/* Floating Card 1: Healthy Food • Better Mood (Top Left) */}
        <div className="absolute top-2 -left-2 sm:-left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl border border-gray-100/90 flex items-center gap-2.5 animate-float-slow transform -rotate-2 hover:rotate-0 transition-all z-20">
          <div className="w-8 h-8 rounded-full bg-[#EBF1ED] flex items-center justify-center text-sm shrink-0">
            🥑
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#1E293B] block leading-tight">Healthy Food</span>
            <span className="text-[10px] text-[#6B8E7B] font-bold">Better Mood</span>
          </div>
        </div>

        {/* Floating Card 2: Your Wellness • In Sync (Middle Right) */}
        <div className="absolute top-1/3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl border border-gray-100/90 flex items-center gap-2.5 animate-float-delayed transform rotate-2 hover:rotate-0 transition-all z-20">
          <div className="w-8 h-8 rounded-full bg-[#FAF4E8] text-[#D9A441] flex items-center justify-center text-sm shrink-0">
            💚
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#1E293B] block leading-tight">Your Wellness</span>
            <span className="text-[10px] text-[#D9A441] font-bold">In Sync</span>
          </div>
        </div>

      </div>

    </div>
  );
}
