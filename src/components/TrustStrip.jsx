import React from 'react';
import { UserCheck, Cpu, ShieldCheck, BookOpenCheck } from 'lucide-react';

export default function TrustStrip() {
  const benefits = [
    {
      icon: UserCheck,
      title: "Personalized",
      description: "Customized to your allergies, dietary preferences & daily goals."
    },
    {
      icon: Cpu,
      title: "AI-Powered",
      description: "Driven by advanced Gemini models with context-aware learning."
    },
    {
      icon: ShieldCheck,
      title: "Privacy Focused",
      description: "End-to-end encrypted health data that is never sold or shared."
    },
    {
      icon: BookOpenCheck,
      title: "Evidence-Informed",
      description: "Grounded recommendations cited from verified health literature."
    }
  ];

  return (
    <section className="py-10 bg-white border-y border-[#6B8E7B]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, index) => {
            const IconComp = item.icon;
            return (
              <div 
                key={index}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#F8FAF7] transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-[#EBF1ED] flex items-center justify-center shrink-0 text-[#6B8E7B]">
                  <IconComp className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E293B] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
