import React, { useState } from 'react';
import heroLifestyleImg from '../../assets/generated/hero-lifestyle.jpg';

export default function EditorialWellnessHero({ className = "" }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative w-full max-w-2xl mx-auto flex items-center justify-center p-2 sm:p-4 ${className}`}>
      
      {/* Background Soft Sage Circle Glow */}
      <div className="absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] lg:w-[500px] lg:h-[500px] rounded-full bg-gradient-to-tr from-[#EBF1ED] via-[#6B8E7B]/15 to-[#FAF4E8] -z-10 animate-pulse-subtle flex items-center justify-center">
        {/* Inner subtle outline ring */}
        <div className="w-[90%] h-[90%] rounded-full border border-[#6B8E7B]/20" />
      </div>

      <div className="relative w-full aspect-[4/3.5] sm:aspect-[4/3.2] max-h-[500px] flex items-center justify-center">

        {/* Soft Organic Masked Frame for Main Hero Lifestyle Photo */}
        <div className="relative w-[92%] h-[94%] rounded-[36px] sm:rounded-[48px] overflow-hidden border-4 border-white shadow-2xl bg-[#EBF1ED] group">
          
          {!imgError ? (
            <img
              src={heroLifestyleImg}
              alt="Young adult enjoying a colorful grain and avocado bowl naturally at a sunlit Scandinavian table, WellSync wellness app"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-tr from-[#EBF1ED] via-[#F8FAF7] to-white text-center">
              <span className="text-3xl mb-2">🌿</span>
              <p className="font-extrabold text-[#1E293B] text-lg">WellSync Sanctuary</p>
              <p className="text-xs text-[#64748B] mt-1">Smarter food choices. Healthier you.</p>
            </div>
          )}

          {/* Soft Editorial Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/25 via-transparent to-transparent pointer-events-none" />

          {/* Soft Botanical Leaf Accents in Top Right */}
          <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-85">
            <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
              <path d="M90,10 C90,70 30,90 10,90 C10,30 70,10 90,10 Z" fill="#6B8E7B" opacity="0.85" />
              <path d="M85,15 L15,85" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>

        </div>

        {/* --- Floating Badges matching the premium wellness aesthetic --- */}

        {/* Floating Card 1: Healthy Food • Better Mood (Top Left) */}
        <div className="absolute top-2 -left-2 sm:-left-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl border border-gray-100 flex items-center gap-2.5 animate-float-slow transform -rotate-2 hover:rotate-0 transition-all z-20">
          <div className="w-8 h-8 rounded-full bg-[#EBF1ED] flex items-center justify-center text-sm shrink-0">
            🥑
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#1E293B] block leading-tight">Healthy Food</span>
            <span className="text-[10px] text-[#6B8E7B] font-bold">Better Mood</span>
          </div>
        </div>

        {/* Floating Card 2: Your Wellness • In Sync (Middle Right) */}
        <div className="absolute top-1/2 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl border border-gray-100 flex items-center gap-2.5 animate-float-delayed transform rotate-2 hover:rotate-0 transition-all z-20">
          <div className="w-8 h-8 rounded-full bg-[#FAF4E8] text-[#D9A441] flex items-center justify-center text-sm shrink-0">
            💚
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#1E293B] block leading-tight">Your Wellness</span>
            <span className="text-[10px] text-[#D9A441] font-bold">In Sync</span>
          </div>
        </div>

        {/* Floating Card 3: AI Meal Balance (Bottom Left) */}
        <div className="absolute -bottom-2 left-6 sm:left-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 z-20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-[#1E293B]">98% Nutritional Match</span>
        </div>

      </div>

    </div>
  );
}
