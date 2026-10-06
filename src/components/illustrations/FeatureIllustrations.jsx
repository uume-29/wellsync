import React from 'react';

// 1. AI Meal Planner Illustration
export function MealPlannerIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="280" height="180" rx="16" fill="#F2F6F3" />
      {/* Plate outline */}
      <circle cx="140" cy="90" r="60" fill="#FFFFFF" stroke="#6B8E7B" strokeWidth="3" strokeDasharray="6 4" />
      <circle cx="140" cy="90" r="48" fill="#F8FAF7" stroke="#E2E8F0" strokeWidth="2" />
      
      {/* Meal Items */}
      {/* Salmon / Protein */}
      <path d="M115,75 C125,60 145,60 155,75 C150,90 120,95 115,75 Z" fill="#D9A441" opacity="0.9" />
      {/* Greens */}
      <circle cx="125" cy="105" r="14" fill="#6B8E7B" />
      <circle cx="145" cy="110" r="11" fill="#567564" />
      <circle cx="155" cy="95" r="9" fill="#8BAF9A" />
      
      {/* Macro tags floating */}
      <g transform="translate(30, 35)">
        <rect width="70" height="24" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <text x="35" y="16" fill="#1E293B" fontSize="11" fontWeight="600" textAnchor="middle">540 kcal</text>
      </g>
      <g transform="translate(175, 125)">
        <rect width="75" height="24" rx="12" fill="#6B8E7B" />
        <text x="37" y="16" fill="#FFFFFF" fontSize="11" fontWeight="600" textAnchor="middle">High Protein</text>
      </g>
      
      {/* Calorie Progress Arc */}
      <path d="M140,24 A66,66 0 0,1 200,65" fill="none" stroke="#6B8E7B" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// 2. Food Intelligence Photo Analysis Illustration
export function FoodIntelligenceIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="280" height="180" rx="16" fill="#FAF4E8" />
      
      {/* Viewfinder frame */}
      <rect x="60" y="30" width="160" height="120" rx="12" fill="#FFFFFF" stroke="#D9A441" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Corner Bounding Indicators */}
      <path d="M50,45 L50,30 L65,30" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      <path d="M230,45 L230,30 L215,30" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      <path d="M50,135 L50,150 L65,150" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      <path d="M230,135 L230,150 L215,150" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

      {/* Bowl inside scanner */}
      <ellipse cx="140" cy="95" rx="40" ry="25" fill="#6B8E7B" opacity="0.2" />
      <path d="M110,95 C110,118 170,118 170,95 Z" fill="#6B8E7B" />

      {/* Scanning Laser Line */}
      <line x1="55" y1="85" x2="225" y2="85" stroke="#D9A441" strokeWidth="2.5" />
      
      {/* Floating AI Detection Pill */}
      <g transform="translate(100, 115)">
        <rect width="80" height="26" rx="13" fill="#1E293B" />
        <text x="40" y="17" fill="#FFFFFF" fontSize="10" fontWeight="600" textAnchor="middle">Avocado Salad</text>
      </g>
    </svg>
  );
}

// 3. Medicine & Care Adherence Illustration
export function MedicineIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="280" height="180" rx="16" fill="#F2F6F3" />
      
      {/* Weekly Pill Box Concept */}
      <rect x="40" y="45" width="200" height="90" rx="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      
      {/* Compartment dividers */}
      <line x1="90" y1="45" x2="90" y2="135" stroke="#F1F5F9" strokeWidth="2" />
      <line x1="140" y1="45" x2="140" y2="135" stroke="#F1F5F9" strokeWidth="2" />
      <line x1="190" y1="45" x2="190" y2="135" stroke="#F1F5F9" strokeWidth="2" />

      {/* Days Labels & Pills */}
      {/* Day 1 - Taken */}
      <circle cx="65" cy="75" r="14" fill="#EBF1ED" />
      <path d="M60,75 L64,79 L71,71" stroke="#6B8E7B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="65" y="112" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">MON</text>

      {/* Day 2 - Active Pill */}
      <g transform="translate(115, 63) rotate(-30)">
        <rect width="32" height="16" rx="8" fill="#6B8E7B" />
        <path d="M16,0 L16,16" stroke="#FFFFFF" strokeWidth="1.5" />
      </g>
      <text x="115" y="112" fill="#1E293B" fontSize="11" fontWeight="700" textAnchor="middle">TUE</text>

      {/* Day 3 - Gold Vitamin */}
      <circle cx="165" cy="75" r="10" fill="#D9A441" />
      <text x="165" y="112" fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">WED</text>

      {/* Day 4 - Upcoming */}
      <circle cx="215" cy="75" r="10" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
      <text x="215" y="112" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle">THU</text>
    </svg>
  );
}

// 4. RAG / Grounded AI Assistant Illustration
export function GroundedAiIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="280" height="180" rx="16" fill="#F8FAF7" stroke="#E2E8F0" strokeWidth="1" />
      
      {/* Document Source Card */}
      <rect x="35" y="35" width="100" height="110" rx="10" fill="#FFFFFF" stroke="#6B8E7B" strokeWidth="1.5" />
      <line x1="50" y1="55" x2="115" y2="55" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="70" x2="105" y2="70" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="82" x2="110" y2="82" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="94" x2="95" y2="94" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      
      {/* Verified Citation Shield */}
      <g transform="translate(100, 105)">
        <circle cx="16" cy="16" r="16" fill="#6B8E7B" />
        <path d="M10,16 L14,20 L22,12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Connecting Arrow */}
      <path d="M145,90 Q165,90 175,90" stroke="#D9A441" strokeWidth="2" strokeDasharray="4 4" />
      <polygon points="175,86 183,90 175,94" fill="#D9A441" />

      {/* Answer Output Bubble */}
      <g transform="translate(170, 45)">
        <rect width="85" height="90" rx="10" fill="#1E293B" />
        <rect x="12" y="20" width="60" height="6" rx="3" fill="#D9A441" />
        <rect x="12" y="34" width="50" height="5" rx="2.5" fill="#E2E8F0" />
        <rect x="12" y="45" width="55" height="5" rx="2.5" fill="#E2E8F0" />
        <rect x="12" y="56" width="40" height="5" rx="2.5" fill="#6B8E7B" />
      </g>
    </svg>
  );
}
