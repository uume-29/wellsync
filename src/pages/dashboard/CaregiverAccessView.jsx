import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, ShieldCheck, Plus, AlertCircle, 
  ArrowLeft, Lock, Clock, X, KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const INITIAL_CAREGIVERS = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    relationship: 'Family Member (Daughter)',
    status: 'active',
    invitedDate: 'Oct 10, 2026',
    permissions: {
      medications: true,
      meals: true,
      emergencyAlerts: true,
    },
  },
  {
    id: 2,
    name: 'Dr. Michael Hayes, RN',
    email: 'm.hayes@eldercare-network.org',
    relationship: 'Registered Nurse',
    status: 'pending',
    invitedDate: 'Oct 15, 2026',
    permissions: {
      medications: true,
      meals: false,
      emergencyAlerts: false,
    },
  },
];

export default function CaregiverAccessView() {
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState(INITIAL_CAREGIVERS);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [revokeConfirmId, setRevokeConfirmId] = useState(null);

  // Invite Form State
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [relationship, setRelationship] = useState('Family Member');
  const [permMeds, setPermMeds] = useState(true);
  const [permMeals, setPermMeals] = useState(true);
  const [permAlerts, setPermAlerts] = useState(false);

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteeName.trim() || !inviteeEmail.trim()) return;

    const newCaregiver = {
      id: Date.now(),
      name: inviteeName.trim(),
      email: inviteeEmail.toLowerCase().trim(),
      relationship,
      status: 'pending',
      invitedDate: 'Today',
      permissions: {
        medications: permMeds,
        meals: permMeals,
        emergencyAlerts: permAlerts,
      },
    };

    setCaregivers(prev => [...prev, newCaregiver]);
    setIsInviteModalOpen(false);
    setInviteeName('');
    setInviteeEmail('');
  };

  const handleTogglePermission = (caregiverId, permKey) => {
    setCaregivers(prev => prev.map(c => {
      if (c.id === caregiverId) {
        return {
          ...c,
          permissions: {
            ...c.permissions,
            [permKey]: !c.permissions[permKey],
          },
        };
      }
      return c;
    }));
  };

  const handleRevokeConfirm = () => {
    if (!revokeConfirmId) return;
    setCaregivers(prev => prev.filter(c => c.id !== revokeConfirmId));
    setRevokeConfirmId(null);
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
      {/* 1. PRIVACY-FIRST HEADER BANNER                               */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-[#1E293B] mb-3">
            <Lock className="w-3.5 h-3.5 text-[#6B8E7B]" />
            <span>HIPAA-Aligned Privacy Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Caregiver Access & Sharing Controls
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Grant secure view-only permissions to a trusted family member or medical provider. You retain 100% control over which modules are visible, with instantaneous access revocation at any time.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Trusted Caregiver</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. PRIVACY GUARANTEE PILLARS                                 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-[#1E293B]">Zero Data Selling</h3>
          <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
            Your dietary and health records are never monetized or shared with third-party advertisers.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#D9A441] flex items-center justify-center mb-3">
            <KeyRound className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-[#1E293B]">Granular Permissions</h3>
          <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
            Independently toggle medication adherence, weekly meal plans, and emergency alerts.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#1E293B] flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-[#1E293B]">Instant Revocation</h3>
          <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
            One tap immediately terminates external session tokens and disables remote viewing.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CAREGIVER ACCESS LIST                                     */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#1E293B]">Authorized Trusted Caregivers</h2>

        <div className="grid grid-cols-1 gap-4">
          {caregivers.map((cg) => (
            <div
              key={cg.id}
              className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center text-base font-bold shrink-0">
                  {cg.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-extrabold text-[#1E293B]">{cg.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cg.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {cg.status === 'active' ? 'Active Access' : 'Invitation Pending'}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] mt-0.5">{cg.relationship} • {cg.email}</p>
                  <span className="text-[10px] text-gray-400 block mt-1">Invited {cg.invitedDate}</span>
                </div>
              </div>

              {/* Granular Permissions Toggle Bar */}
              <div className="flex flex-wrap items-center gap-4 bg-[#F8FAF7] p-3 rounded-2xl border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={cg.permissions.medications}
                    onChange={() => handleTogglePermission(cg.id, 'medications')}
                    className="rounded text-[#6B8E7B] focus:ring-[#6B8E7B]"
                  />
                  <span className="text-[#1E293B] font-semibold">Medicine Logs</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={cg.permissions.meals}
                    onChange={() => handleTogglePermission(cg.id, 'meals')}
                    className="rounded text-[#6B8E7B] focus:ring-[#6B8E7B]"
                  />
                  <span className="text-[#1E293B] font-semibold">Meal Plans</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={cg.permissions.emergencyAlerts}
                    onChange={() => handleTogglePermission(cg.id, 'emergencyAlerts')}
                    className="rounded text-[#6B8E7B] focus:ring-[#6B8E7B]"
                  />
                  <span className="text-[#1E293B] font-semibold">Adherence Alerts</span>
                </label>
              </div>

              {/* Revoke Action */}
              <div className="shrink-0 flex justify-end">
                <button
                  onClick={() => setRevokeConfirmId(cg.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                >
                  Revoke Access
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. INVITE CAREGIVER MODAL                                    */}
      {/* ============================================================ */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up">
            
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">Invite Trusted Caregiver</h3>
                <p className="text-xs text-[#64748B]">They will receive a secure authorization link</p>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Chen"
                  value={inviteeName}
                  onChange={(e) => setInviteeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6B8E7B]/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah.chen@example.com"
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6B8E7B]/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                >
                  <option value="Family Member (Daughter/Son)">Family Member (Daughter/Son)</option>
                  <option value="Spouse / Partner">Spouse / Partner</option>
                  <option value="Registered Nurse">Registered Nurse</option>
                  <option value="Primary Care Physician">Primary Care Physician</option>
                  <option value="Trusted Friend">Trusted Friend</option>
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-[#1E293B] block mb-2">Granted Permissions:</span>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permMeds}
                      onChange={(e) => setPermMeds(e.target.checked)}
                      className="rounded text-[#6B8E7B]"
                    />
                    <span>View Daily Medication Adherence Logs</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permMeals}
                      onChange={(e) => setPermMeals(e.target.checked)}
                      className="rounded text-[#6B8E7B]"
                    />
                    <span>View Confirmed Weekly Meal Plans</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permAlerts}
                      onChange={(e) => setPermAlerts(e.target.checked)}
                      className="rounded text-[#6B8E7B]"
                    />
                    <span>Receive Missed Medication Notifications</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold transition-colors cursor-pointer mt-2"
              >
                Send Secure Invitation
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. REVOKE CONFIRMATION DIALOG                                */}
      {/* ============================================================ */}
      {revokeConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 animate-fade-slide-up text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#1E293B]">Revoke Caregiver Access?</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                This will immediately invalidate their viewing link and disconnect real-time adherence updates.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRevokeConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1E293B] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
