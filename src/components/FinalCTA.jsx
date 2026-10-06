import React from 'react';
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from 'lucide-react';

export default function FinalCTA({ onOpenSignup }) {
  return (
    <section className="py-20 lg:py-28 bg-[#6B8E7B] text-white relative overflow-hidden">
      
      {/* Background Organic Vector Shapes */}
      <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 200 200" fill="currentColor">
          <path d="M40,-50 C60,-30 80,0 70,30 C60,60 20,80 -10,75 C-40,70 -60,40 -65,10 C-70,-20 -60,-50 -40,-65 C-20,-80 20,-70 40,-50 Z" transform="translate(100, 100)" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 transform -translate-x-12 translate-y-12 opacity-10 pointer-events-none">
        <svg width="350" height="350" viewBox="0 0 200 200" fill="currentColor">
          <path d="M30,-40 C50,-20 70,10 60,40 C50,70 10,80 -20,70 C-50,60 -70,30 -60,-10 C-50,-50 -20,-70 0,-65 C20,-60 10,-60 30,-40 Z" transform="translate(100, 100)" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Leaf icon header */}
        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center mb-6">
          <Leaf className="w-7 h-7 text-[#FAF4E8]" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Start building healthier <br className="hidden sm:inline" />
          everyday habits.
        </h2>

        <p className="text-base sm:text-lg text-[#EBF1ED] max-w-xl mx-auto mb-10 leading-relaxed">
          Join thousands of proactive individuals aligning their food choices, medication routines, and wellness intelligence with grounded AI.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenSignup}
            className="inline-flex items-center justify-center gap-2.5 bg-white text-[#1E293B] hover:bg-[#FAF4E8] font-bold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#6B8E7B]" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-white/15 flex flex-wrap items-center justify-center gap-8 text-xs text-[#EBF1ED]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D9A441]" /> Free 14-day trial
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D9A441]" /> Cancel anytime
          </span>
          <span className="flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-[#D9A441]" /> No credit card required
          </span>
        </div>

      </div>
    </section>
  );
}
