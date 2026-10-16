import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Utensils, BookOpen, ShoppingCart, Pill, Users, 
  Sparkles, Activity, ArrowLeft, Clock, CheckCircle2 
} from 'lucide-react';

const moduleConfigs = {
  meals: {
    title: 'AI Meal Planner',
    subtitle: 'Personalized meal plans aligned with your preferences, allergies, and weekly budget.',
    icon: Utensils,
    phase: 'Phase 2',
    overview: 'The WellSync Meal Planner will generate weekly meal schedules using the Gemini API. It will dynamically calculate caloric targets, filter allergens, and balance macros based on your profile.',
    plannedFeatures: [
      'Dietary restriction filters (Gluten-Free, Vegetarian, Vegan, Low Carb, Nut-Free)',
      'Allergy checking and automated ingredient substitutions',
      'Weekly grocery budget constraints with portion scaling',
      'One-click synchronization with your Grocery List',
    ],
  },
  'food-diary': {
    title: 'Food Diary & Vision Nutrition',
    subtitle: 'Track your daily food intake and analyze meal photos with Gemini Vision.',
    icon: BookOpen,
    phase: 'Phase 3',
    overview: 'The Food Diary will allow you to log daily meals manually or by uploading plate photos. Our Vision model will estimate calories, macronutrients, and key micronutrients without tedious manual entry.',
    plannedFeatures: [
      'Photo upload with instant ingredient and nutrition estimation',
      'Daily macronutrient breakdown (Protein, Carbohydrates, Healthy Fats, Fiber)',
      'Meal timeline logging (Breakfast, Lunch, Dinner, Snacks)',
      'Historical nutrition logging synced with your Profile goals',
    ],
  },
  groceries: {
    title: 'Grocery List & Cost Optimizer',
    subtitle: 'Auto-compiled shopping lists with intelligent ingredient budgeting.',
    icon: ShoppingCart,
    phase: 'Phase 2',
    overview: 'The Grocery List module will aggregate all raw ingredients required by your weekly Meal Plan, categorize them by market aisle, and suggest cost-effective alternatives to keep you within budget.',
    plannedFeatures: [
      'Automated ingredient extraction directly from confirmed meal plans',
      'Checklist interface with category grouping (Produce, Pantry, Dairy, Proteins)',
      'Weekly budget tracker with remaining funds estimation',
      'Cost optimization suggestions for expensive ingredients',
    ],
  },
  medicines: {
    title: 'Medicine Tracker & Schedule',
    subtitle: 'Track medication adherence, schedule dosages, and avoid missed treatments.',
    icon: Pill,
    phase: 'Phase 2',
    overview: 'The Medicine Tracker will provide a clean schedule for your vitamins, supplements, and prescription medications with daily taken/pending/missed status and reminder notifications.',
    plannedFeatures: [
      'Medication entry with dosage, timing (AM/PM), and meal timing instructions',
      'Daily dose checklist with one-tap status toggling (Taken / Pending)',
      'Weekly adherence score calculation without confusing medical jargon',
      'Optional caregiver synchronization for family peace of mind',
    ],
  },
  caregiver: {
    title: 'Caregiver Access & Sharing',
    subtitle: 'Allow trusted family members or caregivers to view your adherence and status.',
    icon: Users,
    phase: 'Phase 2',
    overview: 'Caregiver Access enables sharing a read-only wellness summary with an authorized family member or healthcare companion, keeping loved ones aligned without violating your privacy.',
    plannedFeatures: [
      'Invite trusted family members via email invitation',
      'Granular sharing permissions (Medicine adherence, meal logs, check-ins)',
      'Real-time alerts for missed critical dosages',
      'One-click access revocation at any time',
    ],
  },
  assistant: {
    title: 'AI Wellness Assistant (Gemini + RAG)',
    subtitle: 'Ask wellness and nutrition questions grounded in peer-reviewed clinical literature.',
    icon: Sparkles,
    phase: 'Phase 3',
    overview: 'Our RAG-powered wellness assistant will combine Gemini with indexed medical and nutritional knowledge bases (USDA, NIH, WHO) to provide cited, grounded answers with built-in safety guardrails.',
    plannedFeatures: [
      'Natural language conversation about diet, supplements, and habit building',
      'Retrieval-Augmented Generation with transparent source citations and footnotes',
      'Automated AI safety guardrails that suppress unsubstantiated health claims',
      'Contextual awareness of your dietary restrictions and allergies',
    ],
  },
  insights: {
    title: 'My Insights & Progress',
    subtitle: 'Cross-module wellness intelligence and long-term consistency trends.',
    icon: Activity,
    phase: 'Phase 4',
    overview: 'My Insights will correlate your logged meals, medication adherence, and habit consistency to provide gentle, actionable reflections to help you build sustainable daily wellness habits.',
    plannedFeatures: [
      'Adherence vs. energy correlations based on logged meals and sleep',
      'Weekly consistency score focusing on positive habit formation',
      'Digestible weekly wellness summaries without overwhelming charts',
      'Actionable recommendations grounded in your recent logs',
    ],
  },
};

export default function ModulePlaceholder({ module }) {
  const location = useLocation();

  // If no explicit module prop passed, infer from URL
  const moduleKey = module || location.pathname.split('/').pop() || 'meals';
  const config = moduleConfigs[moduleKey] || moduleConfigs.meals;
  const IconComp = config.icon;

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      {/* Top Breadcrumb Back Link */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Home</span>
        </Link>
      </div>

      {/* Main Module Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center shrink-0">
              <IconComp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight">
                {config.title}
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">{config.subtitle}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF4E8] text-[#D9A441] border border-[#D9A441]/30 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled for {config.phase}</span>
          </div>
        </div>

        {/* Honest Module Notice */}
        <div className="my-6 p-4 rounded-2xl bg-[#F8FAF7] border border-gray-200 text-xs text-[#17201B]">
          <span className="font-bold block text-[#1E293B] mb-1">
            Status: Foundation in Progress
          </span>
          <p className="text-[#64748B] leading-relaxed">
            {config.overview}
          </p>
        </div>

        {/* Planned Capabilities */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] mb-3">
            What to expect in this module:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.plannedFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-gray-200/80 text-xs text-[#64748B]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#6B8E7B] shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-[#64748B]">
            Phase 1 provides authenticated routing for this section.
          </span>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
