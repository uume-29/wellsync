import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Pill, Plus, ArrowLeft, Check, X, ShieldAlert, Bell, BellOff,
  Trash2, RefreshCw, Edit3, AlertCircle, Info, Calendar, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import medicineHeaderImg from '../../assets/dashboard/medicine-tracker.jpg';

const TIMING_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];

export default function MedicineTrackerView() {
  const { user } = useAuth();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [meds, setMeds] = useState([]);
  const [metrics, setMetrics] = useState({
    totalMeds: 0,
    takenMeds: 0,
    skippedMeds: 0,
    pendingMeds: 0,
    adherenceRate: 0,
  });
  const [reminderNotice, setReminderNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Add / Edit Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Supplement',
    dosage: '',
    timing: 'Morning',
    scheduleTime: '08:00 AM',
    frequency: 'Daily',
    instructions: '',
    remindersEnabled: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch medicines and today's status from server
  const fetchMedicines = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.medicines.getAll(date);
      setMeds(data.medicines || []);
      setMetrics(
        data.metrics || {
          totalMeds: 0,
          takenMeds: 0,
          skippedMeds: 0,
          pendingMeds: 0,
          adherenceRate: 0,
        }
      );
      setReminderNotice(data.reminderNotice || '');
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
      setError('Could not retrieve medication records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines(selectedDate);
  }, [selectedDate]);

  // Handle Status Toggle (taken, skipped, pending)
  const handleSetStatus = async (medId, nextStatus) => {
    try {
      await api.medicines.setStatus(medId, {
        date: selectedDate,
        status: nextStatus,
      });
      await fetchMedicines(selectedDate);
    } catch (err) {
      console.error('Failed to update dose status:', err);
      alert('Could not update medication dose status.');
    }
  };

  // Toggle Reminder
  const handleToggleReminder = async (medId) => {
    try {
      await api.medicines.toggleReminder(medId);
      await fetchMedicines(selectedDate);
    } catch (err) {
      console.error('Failed to toggle reminder:', err);
    }
  };

  // Add Medicine
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dosage.trim()) return;

    setSubmitting(true);
    try {
      await api.medicines.create({
        ...formData,
        startDate: selectedDate,
      });
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        type: 'Supplement',
        dosage: '',
        timing: 'Morning',
        scheduleTime: '08:00 AM',
        frequency: 'Daily',
        instructions: '',
        remindersEnabled: true,
      });
      await fetchMedicines(selectedDate);
    } catch (err) {
      console.error('Failed to create medicine:', err);
      alert(err.response?.data?.message || 'Failed to add medicine.');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Medicine
  const handleOpenEdit = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      type: med.type,
      dosage: med.dosage,
      timing: med.timing,
      scheduleTime: med.scheduleTime || '08:00 AM',
      frequency: med.frequency || 'Daily',
      instructions: med.instructions || '',
      remindersEnabled: med.remindersEnabled ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingMed || !formData.name.trim() || !formData.dosage.trim()) return;

    setSubmitting(true);
    try {
      await api.medicines.update(editingMed._id || editingMed.id, formData);
      setIsEditModalOpen(false);
      setEditingMed(null);
      await fetchMedicines(selectedDate);
    } catch (err) {
      console.error('Failed to update medicine:', err);
      alert('Failed to update medicine record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Medicine
  const handleDeleteMed = async (medId) => {
    if (!window.confirm('Are you sure you want to remove this medication from your active schedule?')) return;
    try {
      await api.medicines.delete(medId);
      await fetchMedicines(selectedDate);
    } catch (err) {
      console.error('Failed to delete medicine:', err);
      alert('Failed to delete medicine.');
    }
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
              <span>Full-Stack Adherence & Schedule Tracking</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Medicine & Supplement Tracker
            </h1>
            
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl">
              Hello {user?.name ? user.name.split(' ')[0] : 'there'}, manage your daily vitamins, supplements, and prescriptions. All schedules and compliance logs persist securely in MongoDB Atlas with caregiver visibility controls.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setFormData({
                    name: '',
                    type: 'Supplement',
                    dosage: '',
                    timing: 'Morning',
                    scheduleTime: '08:00 AM',
                    frequency: 'Daily',
                    instructions: '',
                    remindersEnabled: true,
                  });
                  setIsAddModalOpen(true);
                }}
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
                <span>Caregiver Access Controls</span>
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
                  MongoDB Persisted Logs
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. IN-APP REMINDER SYSTEM & BROWSER LIMITATION DISCLOSURE    */}
      {/* ============================================================ */}
      <div className="p-4 rounded-2xl bg-[#EBF1ED] border border-[#6B8E7B]/30 flex items-start gap-3 text-xs text-[#17201B]">
        <Info className="w-4 h-4 text-[#6B8E7B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">In-App Reminder Mechanism</p>
          <p className="text-[#36493E] text-[11px] leading-relaxed">
            {reminderNotice ||
              'In-app reminders are active while WellSync is open in your browser tab. Since native operating system background push notifications are not configured, please keep your dashboard active or check daily to confirm scheduled doses.'}
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ADHERENCE METER PROGRESS CARD                             */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8E7B]">Daily Adherence Status</span>
            <h2 className="text-lg font-extrabold text-[#1E293B] mt-0.5">Today's Schedule Progress</h2>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              {metrics.takenMeds} of {metrics.totalMeds} doses confirmed
            </span>
            {metrics.skippedMeds > 0 && (
              <span className="text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                {metrics.skippedMeds} skipped
              </span>
            )}
            <span className="text-[#1E293B] bg-[#F8FAF7] px-3 py-1.5 rounded-xl border border-gray-200">
              {metrics.adherenceRate}% Complete
            </span>
          </div>
        </div>

        <div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6B8E7B] to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.adherenceRate}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#64748B] mt-1.5 font-semibold">
            <span>
              {metrics.adherenceRate >= 100 && metrics.totalMeds > 0
                ? 'All scheduled doses completed for today! 🎉'
                : `${metrics.pendingMeds} doses pending today`}
            </span>
            <span>Caregiver sync active</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MEDICINE SCHEDULE BY TIMING SLOTS                         */}
      {/* ============================================================ */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 space-y-3">
          <RefreshCw className="w-6 h-6 text-[#6B8E7B] animate-spin mx-auto" />
          <p className="text-xs text-[#64748B] font-semibold">Loading medication schedule from database...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="text-xs font-bold text-red-700">{error}</p>
          <button
            onClick={() => fetchMedicines(selectedDate)}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
          >
            Retry
          </button>
        </div>
      ) : meds.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-dashed border-gray-200 text-center space-y-3">
          <Pill className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-[#1E293B]">No medications or supplements added yet</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Build your personalized daily routine by adding your first vitamin, prescription, or supplement.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#6B8E7B] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Add Your First Medication
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {TIMING_SLOTS.map((slot) => {
            const slotMeds = meds.filter((m) => m.timing === slot);
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
                    {slotMeds.filter((m) => m.status === 'taken').length}/{slotMeds.length} Taken
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slotMeds.map((med) => {
                    const isTaken = med.status === 'taken';
                    const isSkipped = med.status === 'skipped';
                    const medId = med._id || med.id;

                    return (
                      <div
                        key={medId}
                        className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                          isTaken
                            ? 'bg-[#F8FAF7] border-emerald-200/60'
                            : isSkipped
                            ? 'bg-amber-50/40 border-amber-200/60'
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
                                onClick={() => handleToggleReminder(medId)}
                                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                  med.remindersEnabled ? 'text-[#6B8E7B]' : 'text-gray-300'
                                }`}
                                title={med.remindersEnabled ? 'In-app reminders active' : 'Reminders muted'}
                              >
                                {med.remindersEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleOpenEdit(med)}
                                className="text-gray-400 hover:text-[#6B8E7B] p-1 rounded-lg transition-colors cursor-pointer"
                                title="Edit medicine"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMed(medId)}
                                className="text-gray-300 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-extrabold text-[#1E293B]">{med.name}</h4>
                          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                            {med.instructions || 'Take as directed with water'}
                          </p>
                          {med.scheduleTime && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                              <Clock className="w-3 h-3" /> Scheduled: {med.scheduleTime}
                            </span>
                          )}
                        </div>

                        {/* Status Control Bar */}
                        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[11px] font-semibold text-[#64748B]">
                            {isTaken
                              ? `✓ Taken at ${med.recordedTime || 'scheduled time'}`
                              : isSkipped
                              ? '⊘ Dose Skipped'
                              : '⏳ Pending dose'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isTaken ? (
                              <button
                                onClick={() => handleSetStatus(medId, 'pending')}
                                className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#64748B] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Correct status / undo"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reset</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleSetStatus(medId, 'taken')}
                                  className="px-3 py-1.5 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Mark Taken</span>
                                </button>
                                <button
                                  onClick={() => handleSetStatus(medId, 'skipped')}
                                  className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-amber-100 text-[#64748B] hover:text-amber-800 text-xs font-semibold transition-all cursor-pointer"
                                >
                                  Skip
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. ADD MEDICATION MODAL                                      */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up">
            
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-[#1E293B]">Add Medication or Supplement</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zinc Picolinate"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6B8E7B]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Classification</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  >
                    <option value="Supplement">Supplement</option>
                    <option value="Vitamin">Vitamin</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Over-the-Counter">Over-the-Counter</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Dosage (as prescribed)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50 mg or 1 capsule"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Timing Slot</label>
                  <select
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  >
                    {TIMING_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:30 AM"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Instructions / Meal Timing</label>
                <input
                  type="text"
                  placeholder="e.g. Take with food and a full glass of water"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.remindersEnabled}
                    onChange={(e) => setFormData({ ...formData, remindersEnabled: e.target.checked })}
                    className="rounded text-[#6B8E7B] focus:ring-[#6B8E7B]"
                  />
                  <span className="text-[#1E293B] font-semibold">Enable in-app reminder alerts for this schedule</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold transition-colors cursor-pointer mt-2 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Medication to Database'}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. EDIT MEDICATION MODAL                                     */}
      {/* ============================================================ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#1E293B]">Edit Medication Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  >
                    <option value="Supplement">Supplement</option>
                    <option value="Vitamin">Vitamin</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Over-the-Counter">Over-the-Counter</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Timing Slot</label>
                  <select
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  >
                    {TIMING_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Instructions</label>
                <input
                  type="text"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1E293B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-xs font-bold text-white disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
