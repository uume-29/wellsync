import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Pill, Plus, ArrowLeft, Check, X, ShieldAlert, Bell, Trash2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import medicineHeaderImg from '../../assets/dashboard/medicine-tracker.jpg';

const INITIAL_MEDICATIONS = [
  {
    id: 1,
    name: 'Vitamin D3 & K2 Drop Blend',
    type: 'Supplement',
    dosage: '2,000 IU',
    timing: 'Morning',
    instructions: 'Take with morning meal containing healthy fats',
    status: 'taken', // 'taken', 'pending'
    recordedTime: '8:15 AM',
    remindersEnabled: true,
  },
  {
    id: 2,
    name: 'Wild Alaskan Omega-3 Fish Oil',
    type: 'Supplement',
    dosage: '1,200 mg',
    timing: 'Morning',
    instructions: 'Take with food and full glass of water',
    status: 'taken',
    recordedTime: '8:15 AM',
    remindersEnabled: true,
  },
  {
    id: 3,
    name: 'Live Probiotic Complex 50B',
    type: 'Supplement',
    dosage: '1 capsule',
    timing: 'Afternoon',
    instructions: 'Take 30 mins before lunch on relatively empty stomach',
    status: 'pending',
    recordedTime: null,
    remindersEnabled: true,
  },
  {
    id: 4,
    name: 'Pure Magnesium Glycinate',
    type: 'Supplement',
    dosage: '300 mg',
    timing: 'Bedtime',
    instructions: 'Take 45 mins before bedtime to support rest and recovery',
    status: 'pending',
    recordedTime: null,
    remindersEnabled: true,
  },
];

const TIMING_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];

export default function MedicineTrackerView() {
  const { user } = useAuth();
  const [meds, setMeds] = useState(INITIAL_MEDICATIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // New Medication Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Supplement');
  const [newDosage, setNewDosage] = useState('');
  const [newTiming, setNewTiming] = useState('Morning');
  const [newInstructions, setNewInstructions] = useState('');

  // Adherence Calculations
  const totalMeds = meds.length;
  const takenMeds = meds.filter(m => m.status === 'taken').length;
  const adherenceRate = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;

  const toggleMedStatus = (id) => {
    setMeds(prev => prev.map(m => {
      if (m.id === id) {
        const isCurrentlyTaken = m.status === 'taken';
        return {
          ...m,
          status: isCurrentlyTaken ? 'pending' : 'taken',
          recordedTime: isCurrentlyTaken 
            ? null 
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return m;
    }));
  };

  const toggleReminder = (id) => {
    setMeds(prev => prev.map(m => 
      m.id === id ? { ...m, remindersEnabled: !m.remindersEnabled } : m
    ));
  };

  const handleDeleteMed = (id) => {
    setMeds(prev => prev.filter(m => m.id !== id));
  };

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newDosage.trim()) return;

    const newMed = {
      id: Date.now(),
      name: newName.trim(),
      type: newType,
      dosage: newDosage.trim(),
      timing: newTiming,
      instructions: newInstructions.trim() || 'Take as directed with water',
      status: 'pending',
      recordedTime: null,
      remindersEnabled: true,
    };

    setMeds(prev => [...prev, newMed]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewDosage('');
    setNewInstructions('');
  };

  return (
    <div className="space-y-8 animate-fade-slide-up pb-16">
      
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50 rounded-lg px-1.5 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Home</span>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 1. VISUAL HEADER WITH DEDICATED AI MEDICINE SETUP            */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF4E8] text-[11px] font-bold text-[#D9A441]">
              <Pill className="w-3.5 h-3.5" />
              <span>Routine & Adherence Tracking</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Medicine & Supplement Tracker
            </h1>
            
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl">
              Hello {user?.name ? user.name.split(' ')[0] : 'there'}, effortlessly track your daily vitamins, supplements, and prescriptions. Receive quiet reminders and keep your trusted family caregivers updated on adherence.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medication or Supplement</span>
              </button>

              <Link
                to="/dashboard/caregiver"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#F8FAF7] hover:bg-[#EBF1ED] text-[#1E293B] text-xs font-bold border border-gray-200/90 transition-all"
              >
                <ShieldAlert className="w-4 h-4 text-[#D9A441]" />
                <span>Caregiver Notification Status</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-[#FAF4E8] group">
              {!imgError ? (
                <img
                  src={medicineHeaderImg}
                  alt="Minimalist wooden pill organizer, amber glass bottles, lemon water glass, and jade succulent on bedside table"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-[#FAF4E8] to-white text-center">
                  <Pill className="w-8 h-8 text-[#D9A441] mb-2" />
                  <span className="text-xs font-bold text-[#1E293B]">Mindful Supplement Routine</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-bold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px]">
                  Daily Habit Station
                </span>
                <span className="text-[10px] text-[#FAF4E8] font-semibold">
                  Safe & Non-Alarming
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. ADHERENCE METER PROGRESS CARD                             */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8E7B]">Daily Adherence Status</span>
            <h2 className="text-lg font-extrabold text-[#1E293B] mt-0.5">Today's Schedule Progress</h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              {takenMeds} of {totalMeds} doses confirmed
            </span>
            <span className="text-[#1E293B] bg-[#F8FAF7] px-3 py-1.5 rounded-xl border border-gray-200">
              {adherenceRate}% Complete
            </span>
          </div>
        </div>

        <div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6B8E7B] to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${adherenceRate}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#64748B] mt-1.5 font-semibold">
            <span>{adherenceRate >= 100 ? 'All doses completed for today! 🎉' : `${totalMeds - takenMeds} doses remaining`}</span>
            <span>Caregiver sync enabled</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MEDICINE SCHEDULE BY TIMING SLOTS                         */}
      {/* ============================================================ */}
      <div className="space-y-6">
        {TIMING_SLOTS.map((slot) => {
          const slotMeds = meds.filter(m => m.timing === slot);
          if (slotMeds.length === 0) return null;

          return (
            <div key={slot} className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {slot === 'Morning' ? '🌅' : slot === 'Afternoon' ? '☀️' : slot === 'Evening' ? '🌇' : '🌙'}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#1E293B] uppercase tracking-wider">{slot} Schedule</h3>
                </div>
                <span className="text-xs font-semibold text-[#64748B]">
                  {slotMeds.filter(m => m.status === 'taken').length}/{slotMeds.length} Taken
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slotMeds.map((med) => {
                  const isTaken = med.status === 'taken';

                  return (
                    <div
                      key={med.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                        isTaken
                          ? 'bg-[#F8FAF7] border-gray-200 opacity-90'
                          : 'bg-white border-[#6B8E7B]/30 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            med.type === 'Prescription' 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'bg-[#FAF4E8] text-[#D9A441]'
                          }`}>
                            {med.type} • {med.dosage}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleReminder(med.id)}
                              className={`p-1 rounded-lg transition-colors ${
                                med.remindersEnabled ? 'text-[#6B8E7B]' : 'text-gray-300'
                              }`}
                              title={med.remindersEnabled ? 'Reminders active' : 'Reminders muted'}
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMed(med.id)}
                              className="text-gray-300 hover:text-red-600 p-1 rounded-lg transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-sm font-extrabold text-[#1E293B]">{med.name}</h4>
                        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                          {med.instructions}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-[#64748B]">
                          {isTaken ? `Taken at ${med.recordedTime}` : 'Pending dose'}
                        </span>

                        <button
                          onClick={() => toggleMedStatus(med.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isTaken
                              ? 'bg-gray-100 text-[#64748B] hover:bg-gray-200'
                              : 'bg-[#6B8E7B] text-white hover:bg-[#567564] shadow-2xs'
                          }`}
                        >
                          {isTaken ? (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              <span>Undo</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Mark Taken</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 4. ADD MEDICATION MODAL                                      */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up">
            
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-[#1E293B]">Add New Medication or Vitamin</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMed} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zinc Picolinate"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6B8E7B]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  >
                    <option value="Supplement">Supplement</option>
                    <option value="Vitamin">Vitamin</option>
                    <option value="Prescription">Prescription</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50 mg"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Timing Slot</label>
                <select
                  value={newTiming}
                  onChange={(e) => setNewTiming(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                >
                  {TIMING_SLOTS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Instructions / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Take with dinner"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold transition-colors cursor-pointer mt-2"
              >
                Save Schedule Record
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
