import React, { useState } from 'react';
import { Database, Search, Cpu, CheckCircle2, ShieldAlert, BookOpen, ArrowRight, ExternalLink } from 'lucide-react';

export default function RagSection() {
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);

  const sampleQueries = [
    {
      question: "What is the recommended dietary timing for magnesium to optimize sleep?",
      retrievedSource: "PubMed & NIH Dietary Supplement Database",
      citation: "Journal of Clinical Sleep Medicine, Vol 18 (2022)",
      answer: "Magnesium glycinate is most effective when taken 30 to 60 minutes before bedtime. Clinical evidence indicates 200–400mg reduces sleep latency without laxative side effects.",
      safetyPassed: true
    },
    {
      question: "Can I combine Omega-3 supplements with vitamin K2?",
      retrievedSource: "Linus Pauling Institute Micronutrient Center",
      citation: "American Journal of Clinical Nutrition (2021)",
      answer: "Yes. Omega-3 fatty acids and Vitamin K2 are both fat-soluble nutrients that complement cardiovascular and bone health when taken with a meal containing healthy fats.",
      safetyPassed: true
    }
  ];

  const currentSample = sampleQueries[activeQueryIndex];

  return (
    <section id="rag-ai" className="py-20 lg:py-32 bg-[#1E293B] text-white relative overflow-hidden">
      
      {/* Background Subtle Organic Gradient Lines */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#6B8E7B]/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D9A441]/10 rounded-full blur-3xl -z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6B8E7B]/20 border border-[#6B8E7B]/40 mb-4">
            <Database className="w-4 h-4 text-[#D9A441]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF3E5]">
              RAG-Grounded AI Architecture
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            AI that doesn't just answer — <span className="text-[#D9A441]">it retrieves.</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Unlike generic chatbots that hallucinate health advice, WellSync indexes peer-reviewed clinical literature and dietary guidelines before generating a single word.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#6B8E7B]/20 text-[#6B8E7B] flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Trusted Knowledge Sources</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated access to clinical research databases, USDA nutrition tables, and accredited health guidelines.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#D9A441]/20 text-[#D9A441] flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">RAG-Powered Answers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Retrieval-Augmented Generation embeds factual fragments before feeding context to Gemini LLM.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#6B8E7B]/20 text-[#6B8E7B] flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Source Citations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every wellness response includes clickable source footnotes and publication metadata for full transparency.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Safety Checks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated safety guardrails suppress non-evidence claims and flag prescription contraindications.
            </p>
          </div>
        </div>

        {/* Visual RAG Flow Diagram */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl mb-12">
          
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-[#D9A441] uppercase tracking-wider">Pipeline Flow Diagram</span>
            <h3 className="text-xl font-bold text-white mt-1">How WellSync Processes Your Wellness Questions</h3>
          </div>

          {/* Step Flow Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-10">
            
            {/* Step 1 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center relative group">
              <span className="text-[10px] font-bold text-[#6B8E7B] uppercase block mb-1">Step 1</span>
              <p className="text-sm font-bold text-white">Your Question</p>
              <p className="text-[11px] text-slate-400 mt-1">User Query Input</p>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-500 absolute -right-4 top-1/2 -translate-y-1/2 z-20" />
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-[#6B8E7B]/40 text-center relative group">
              <span className="text-[10px] font-bold text-[#6B8E7B] uppercase block mb-1">Step 2</span>
              <p className="text-sm font-bold text-white">Knowledge Retrieval</p>
              <p className="text-[11px] text-slate-400 mt-1">Vector DB Search</p>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-500 absolute -right-4 top-1/2 -translate-y-1/2 z-20" />
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-[#D9A441]/40 text-center relative group">
              <span className="text-[10px] font-bold text-[#D9A441] uppercase block mb-1">Step 3</span>
              <p className="text-sm font-bold text-white">Gemini Synthesis</p>
              <p className="text-[11px] text-slate-400 mt-1">Grounded Prompting</p>
              <ArrowRight className="hidden md:block w-4 h-4 text-slate-500 absolute -right-4 top-1/2 -translate-y-1/2 z-20" />
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-emerald-500/40 text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Step 4</span>
              <p className="text-sm font-bold text-white">Grounded Answer</p>
              <p className="text-[11px] text-slate-400 mt-1">With Citations</p>
            </div>

          </div>

          {/* Interactive RAG Example Box */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-300">Live RAG Retrieval Preview</span>
              </div>
              <div className="flex items-center gap-2">
                {sampleQueries.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveQueryIndex(idx)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                      activeQueryIndex === idx
                        ? 'bg-[#6B8E7B] text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Sample {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-[#D9A441] bg-[#D9A441]/10 px-2 py-1 rounded shrink-0">User</span>
                <p className="text-sm font-medium text-slate-100">{currentSample.question}</p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 ml-0 sm:ml-9 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700/40 pb-2">
                  <span className="flex items-center gap-1.5 text-[#6B8E7B] font-semibold">
                    <Database className="w-3.5 h-3.5" /> Retrieved from: {currentSample.retrievedSource}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Safety Verified
                  </span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">
                  "{currentSample.answer}"
                </p>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#D9A441]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="font-semibold underline cursor-pointer">{currentSample.citation}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Gemini 1.5 Pro + Vector Index</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Responsible AI Disclaimer Notice */}
        <p className="text-center text-xs text-slate-400 max-w-2xl mx-auto">
          WellSync provides personalized wellness organization and informational retrieval. It does not replace professional medical diagnosis or treatment from a licensed physician.
        </p>

      </div>
    </section>
  );
}
