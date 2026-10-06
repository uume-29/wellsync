import React from 'react';
import { Leaf, RefreshCw, Heart, Shield, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1E293B] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#6B8E7B]/20">
                <Leaf className="w-5 h-5 text-[#6B8E7B] absolute transform -translate-x-0.5 -translate-y-0.5" />
                <RefreshCw className="w-4 h-4 text-[#D9A441] absolute transform translate-x-1 translate-y-1 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Well<span className="text-[#6B8E7B]">Sync</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Your AI-powered personal wellness companion. Engineered for smarter food choices, grounded health retrieval, and everyday lifestyle harmony.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-[#6B8E7B]" /> Encrypted</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-[#D9A441]" /> Privacy First</span>
            </div>
          </div>

          {/* Nav Col 1: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">AI Meal Planner</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Food Intelligence</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Medicine Tracker</a></li>
              <li><a href="#rag-ai" className="hover:text-white transition-colors">RAG Assistant</a></li>
              <li><a href="#dashboard-preview" className="hover:text-white transition-colors">SaaS Dashboard</a></li>
            </ul>
          </div>

          {/* Nav Col 2: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="#press" className="hover:text-white transition-colors">Press & Editorial</a></li>
            </ul>
          </div>

          {/* Nav Col 3: Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Data Security</a></li>
              <li><a href="#medical-disclaimer" className="hover:text-white transition-colors">Medical Disclaimer</a></li>
              <li><a href="#cookie-settings" className="hover:text-white transition-colors">Cookie Preferences</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 WellSync Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with care for human wellness <Heart className="w-3.5 h-3.5 text-[#6B8E7B] fill-[#6B8E7B]" />
          </p>
        </div>

      </div>
    </footer>
  );
}
