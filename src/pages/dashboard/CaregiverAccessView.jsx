import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Users, ShieldCheck, Plus, AlertCircle, 
  ArrowLeft, Lock, Clock, X, KeyRound, Copy, Check,
  ExternalLink, Eye, RefreshCw, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function CaregiverAccessView() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const inviteTokenFromUrl = searchParams.get('inviteToken');

  // Data states
  const [activeCaregivers, setActiveCaregivers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [myPatients, setMyPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Invite Form Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [relationship, setRelationship] = useState('Family Member');
  const [permMeds, setPermMeds] = useState(true);
  const [permMeals, setPermMeals] = useState(true);
  const [permFoodDiary, setPermFoodDiary] = useState(true);
  const [permAlerts, setPermAlerts] = useState(false);
  const [submittingInvite, setSubmittingInvite] = useState(false);

  // New Invite Result Modal (with copyable link & email delivery notice)
  const [inviteResult, setInviteResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Revoke modal
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  // Accept Invitation Modal (when user visits with token)
  const [acceptModalData, setAcceptModalData] = useState(null);
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState(null);

  // Patient Viewer Modal (Caregiver reading shared data)
  const [activePatientViewer, setActivePatientViewer] = useState(null);
  const [patientModuleData, setPatientModuleData] = useState(null);
  const [loadingPatientData, setLoadingPatientData] = useState(false);

  // Load Caregiver data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cgData, patientData] = await Promise.all([
        api.caregiver.getAll(),
        api.caregiver.getMyPatients().catch(() => ({ patients: [] })),
      ]);

      setActiveCaregivers(cgData.activeCaregivers || []);
      setPendingInvitations(cgData.pendingInvitations || []);
      setMyPatients(patientData.patients || []);
    } catch (err) {
      console.error('Failed to load caregiver relationships:', err);
      setError('Could not retrieve caregiver records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check URL token for incoming invitation
  useEffect(() => {
    if (inviteTokenFromUrl) {
      verifyIncomingToken(inviteTokenFromUrl);
    }
  }, [inviteTokenFromUrl]);

  const verifyIncomingToken = async (token) => {
    try {
      const res = await api.caregiver.verifyInvitation(token);
      if (res.success && res.invitation) {
        setAcceptModalData({
          token,
          ...res.invitation,
        });
      }
    } catch (err) {
      console.error('Failed to verify invitation token:', err);
      setAcceptError(err.response?.data?.message || 'Invitation is invalid or has expired.');
    }
  };

  // Send Caregiver Invite
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteeName.trim() || !inviteeEmail.trim()) return;

    setSubmittingInvite(true);
    try {
      const res = await api.caregiver.invite({
        name: inviteeName.trim(),
        email: inviteeEmail.trim(),
        relationship,
        permissions: {
          medications: permMeds,
          meals: permMeals,
          foodDiary: permFoodDiary,
          emergencyAlerts: permAlerts,
        },
      });

      setIsInviteModalOpen(false);
      setInviteeName('');
      setInviteeEmail('');
      setInviteResult(res);
      await fetchData();
    } catch (err) {
      console.error('Failed to send invite:', err);
      alert(err.response?.data?.message || 'Failed to send caregiver invitation.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  // Toggle Permissions
  const handleTogglePermission = async (targetId, currentPermissions, permKey) => {
    try {
      const updatedPerms = {
        ...currentPermissions,
        [permKey]: !currentPermissions[permKey],
      };
      await api.caregiver.updatePermissions(targetId, updatedPerms);
      await fetchData();
    } catch (err) {
      console.error('Failed to update permission:', err);
      alert('Could not update permission on server.');
    }
  };

  // Revoke Access
  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await api.caregiver.revoke(revokeTarget.id);
      setRevokeTarget(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to revoke access:', err);
      alert('Failed to revoke caregiver access.');
    } finally {
      setRevoking(false);
    }
  };

  // Accept Invitation
  const handleAcceptInvite = async () => {
    if (!acceptModalData || !acceptConsent) return;
    setAccepting(true);
    setAcceptError(null);
    try {
      await api.caregiver.acceptInvitation({
        token: acceptModalData.token,
        consent: true,
      });
      setAcceptModalData(null);
      setSearchParams({});
      alert('Caregiver invitation accepted successfully! You now have access.');
      await fetchData();
    } catch (err) {
      console.error('Failed to accept invitation:', err);
      setAcceptError(err.response?.data?.message || 'Could not accept invitation.');
    } finally {
      setAccepting(false);
    }
  };

  // View Patient Module Data
  const handleViewPatientModule = async (patient, moduleName) => {
    setActivePatientViewer({ patient, moduleName });
    setLoadingPatientData(true);
    setPatientModuleData(null);
    try {
      const res = await api.caregiver.getPatientModuleData(patient.grantId, moduleName);
      setPatientModuleData(res.data);
    } catch (err) {
      console.error('Failed to fetch patient data:', err);
      alert(err.response?.data?.message || 'Could not load patient records.');
    } finally {
      setLoadingPatientData(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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
            <span>HIPAA-Aligned Least-Privilege Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Caregiver Access & Sharing Controls
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Grant secure view-only permissions to a trusted family member or medical provider. You retain 100% control over which modules are visible, with instantaneous access revocation enforced at the database level.
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
            Your dietary and medication records are never monetized or shared with third-party advertisers.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#D9A441] flex items-center justify-center mb-3">
            <KeyRound className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-[#1E293B]">Granular Permissions</h3>
          <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
            Independently toggle medication adherence logs, confirmed meal plans, and food diary entries.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#1E293B] flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-[#1E293B]">Instant Revocation</h3>
          <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
            One tap immediately terminates external sessions and invalidates remote viewer authorization.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ACTIVE CAREGIVERS & PENDING INVITATIONS                   */}
      {/* ============================================================ */}
      <div className="space-y-6">
        
        {/* Active Caregivers Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#1E293B]">Authorized Trusted Caregivers</h2>
            <span className="text-xs text-[#64748B]">{activeCaregivers.length} active</span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 space-y-2">
              <RefreshCw className="w-5 h-5 text-[#6B8E7B] animate-spin mx-auto" />
              <p className="text-xs text-[#64748B]">Loading caregiver authorizations...</p>
            </div>
          ) : activeCaregivers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {activeCaregivers.map((cg) => (
                <div
                  key={cg.id}
                  className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center text-base font-bold shrink-0">
                      {cg.name?.charAt(0) || 'C'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-extrabold text-[#1E293B]">{cg.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Access
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">{cg.relationship} • {cg.email}</p>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        Connected {new Date(cg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Permissions Toggle Bar */}
                  <div className="flex flex-wrap items-center gap-4 bg-[#F8FAF7] p-3 rounded-2xl border border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(cg.permissions?.medications)}
                        onChange={() => handleTogglePermission(cg.id, cg.permissions, 'medications')}
                        className="rounded text-[#6B8E7B] focus:ring-[#6B8E7B]"
                      />
                      <span className="text-[#1E293B] font-semibold">Medicine Logs</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(cg.permissions?.meals)}
                        onChange={() => handleTogglePermission(cg.id, cg.permissions, 'meals')}
                        className="rounded text-[#6B8E7B] focus:ring-[#6B8E7B]"
                      />
                      <span className="text-[#1E293B] font-semibold">Meal Plans</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(cg.permissions?.foodDiary)}
                        onChange={() => handleTogglePermission(cg.id, cg.permissions, 'foodDiary')}
                        className="rounded text-[#6B8E7B] focus:ring-[#6B8E7B]"
                      />
                      <span className="text-[#1E293B] font-semibold">Food Diary</span>
                    </label>
                  </div>

                  {/* Revoke Button */}
                  <div className="shrink-0 flex justify-end">
                    <button
                      onClick={() => setRevokeTarget({ id: cg.id, name: cg.name })}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                    >
                      Revoke Access
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-gray-200 text-center space-y-2">
              <Users className="w-8 h-8 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-[#1E293B]">No active caregivers authorized</h3>
              <p className="text-xs text-[#64748B]">
                Invite a family member, doctor, or nurse to grant them secure read-only visibility into your routine.
              </p>
            </div>
          )}
        </div>

        {/* Pending Invitations Section */}
        {pendingInvitations.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h2 className="text-sm font-extrabold text-[#1E293B]">Pending Invitations</h2>

            <div className="grid grid-cols-1 gap-3">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-[#FAF4E8]/50 rounded-2xl p-4 border border-[#D9A441]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#1E293B]">{inv.name}</h4>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Pending Confirmation
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{inv.relationship} • {inv.email}</p>
                    <span className="text-[10px] text-gray-400">
                      Expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRevokeTarget({ id: inv.id, name: inv.name })}
                      className="px-3 py-1 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Cancel Invite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Patients (When logged in user is a Caregiver) */}
        {myPatients.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-[#1E293B]">
              <UserCheck className="w-5 h-5 text-[#6B8E7B]" />
              <h2 className="text-base font-extrabold">Members Who Granted You Caregiver Access</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPatients.map((p) => (
                <div key={p.grantId} className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1E293B]">{p.patientName}</h3>
                      <p className="text-xs text-[#64748B]">{p.relationship} • {p.patientEmail}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Connected
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                    {p.permissions?.medications && (
                      <button
                        onClick={() => handleViewPatientModule(p, 'medications')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EBF1ED] hover:bg-[#d8e6dc] text-[#6B8E7B] text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Medicines</span>
                      </button>
                    )}
                    {p.permissions?.meals && (
                      <button
                        onClick={() => handleViewPatientModule(p, 'meals')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF4E8] hover:bg-[#f3e7cf] text-[#D9A441] text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Meal Plan</span>
                      </button>
                    )}
                    {p.permissions?.foodDiary && (
                      <button
                        onClick={() => handleViewPatientModule(p, 'food-diary')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E293B] text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Food Diary</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Caregiver Full Name</label>
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permMeds}
                      onChange={(e) => setPermMeds(e.target.checked)}
                      className="rounded text-[#6B8E7B]"
                    />
                    <span>View Daily Medication Adherence Logs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permMeals}
                      onChange={(e) => setPermMeals(e.target.checked)}
                      className="rounded text-[#6B8E7B]"
                    />
                    <span>View Confirmed Weekly Meal Plans</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permFoodDiary}
                      onChange={(e) => setPermFoodDiary(e.target.checked)}
                      className="rounded text-[#6B8E7B]"
                    />
                    <span>View Daily Food Diary Records</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingInvite}
                className="w-full py-3 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold transition-colors cursor-pointer mt-2 disabled:opacity-50"
              >
                {submittingInvite ? 'Generating Secure Invitation...' : 'Create Secure Invitation'}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. INVITATION CREATED SUCCESS MODAL (WITH TEST LINK)         */}
      {/* ============================================================ */}
      {inviteResult && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-extrabold text-[#1E293B]">Caregiver Invitation Created</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                {inviteResult.deliveryNotice}
              </p>
            </div>

            <div className="p-3 bg-[#F8FAF7] rounded-xl border border-gray-200 space-y-2">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                Single-Use Authorization Link:
              </span>
              <p className="text-[11px] font-mono text-[#1E293B] break-all bg-white p-2 rounded border border-gray-100">
                {inviteResult.inviteUrl}
              </p>
              <button
                type="button"
                onClick={() => copyToClipboard(inviteResult.inviteUrl)}
                className="w-full py-2 bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Invitation Link'}</span>
              </button>
            </div>

            <button
              onClick={() => setInviteResult(null)}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1E293B] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. ACCEPT INVITATION DIALOG (IF TOKEN IN URL)                */}
      {/* ============================================================ */}
      {acceptModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-[#1E293B]">Accept Caregiver Access</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                <strong>{acceptModalData.ownerName}</strong> has invited you to connect as a trusted {acceptModalData.relationship}.
              </p>
            </div>

            {acceptError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {acceptError}
              </div>
            )}

            <div className="p-3 bg-[#F8FAF7] rounded-xl border border-gray-100 space-y-1.5 text-xs">
              <span className="font-bold text-[#1E293B] block">Requested Authorized Modules:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[#64748B] text-[11px]">
                {acceptModalData.permissions?.medications && <li>Medication Adherence Tracking</li>}
                {acceptModalData.permissions?.meals && <li>Weekly Meal Plans</li>}
                {acceptModalData.permissions?.foodDiary && <li>Daily Food Diary Entries</li>}
              </ul>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptConsent}
                  onChange={(e) => setAcceptConsent(e.target.checked)}
                  className="rounded text-[#6B8E7B] mt-0.5"
                />
                <span className="text-[#1E293B] font-semibold text-[11px] leading-snug">
                  I consent to view these authorized wellness records strictly for trusted caregiver support and understand access can be revoked by the patient at any time.
                </span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setAcceptModalData(null);
                  setSearchParams({});
                }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1E293B]"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptInvite}
                disabled={!acceptConsent || accepting}
                className="flex-1 py-2.5 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
              >
                {accepting ? 'Accepting...' : 'Confirm & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. REVOKE CONFIRMATION DIALOG                                */}
      {/* ============================================================ */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 animate-fade-slide-up text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#1E293B]">Revoke Caregiver Access?</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                This will immediately invalidate viewing permissions for <strong>{revokeTarget.name}</strong> and terminate external sessions.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRevokeTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1E293B]"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConfirm}
                disabled={revoking}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {revoking ? 'Revoking...' : 'Revoke Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. PATIENT VIEWER MODAL (CAREGIVER VIEWING AUTHORIZED DATA)  */}
      {/* ============================================================ */}
      {activePatientViewer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">
                  Shared Patient Records: {activePatientViewer.patient.patientName}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Viewing authorized {activePatientViewer.moduleName} module (Read-Only)
                </p>
              </div>
              <button
                onClick={() => setActivePatientViewer(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingPatientData ? (
              <div className="p-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-[#6B8E7B] animate-spin mx-auto" />
                <p className="text-xs text-[#64748B]">Loading patient records...</p>
              </div>
            ) : patientModuleData ? (
              <div className="space-y-3">
                {activePatientViewer.moduleName === 'medications' && (
                  <div className="space-y-2">
                    {Array.isArray(patientModuleData) && patientModuleData.length > 0 ? (
                      patientModuleData.map((m, idx) => (
                        <div key={idx} className="p-3 bg-[#F8FAF7] rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#1E293B] block">{m.name}</span>
                            <span className="text-[11px] text-[#64748B]">{m.dosage} • {m.timing}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            m.status === 'taken' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {m.status.toUpperCase()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No active medications scheduled.</p>
                    )}
                  </div>
                )}

                {activePatientViewer.moduleName === 'food-diary' && (
                  <div className="space-y-2">
                    {Array.isArray(patientModuleData) && patientModuleData.length > 0 ? (
                      patientModuleData.map((d, idx) => (
                        <div key={idx} className="p-3 bg-[#F8FAF7] rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#1E293B] block">{d.foodName}</span>
                            <span className="text-[11px] text-[#64748B]">{d.mealType} • {d.calories} kcal</span>
                          </div>
                          <span className="text-[11px] text-gray-400">{d.time}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No meals logged for today.</p>
                    )}
                  </div>
                )}

                {activePatientViewer.moduleName === 'meals' && (
                  <div className="p-4 bg-[#F8FAF7] rounded-xl text-xs space-y-2">
                    <span className="font-bold text-[#1E293B] block">{patientModuleData.title || 'Weekly Plan'}</span>
                    <p className="text-[11px] text-[#64748B]">
                      Average Daily Calories: {patientModuleData.summary?.averageDailyCalories || 'N/A'} kcal
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No data available for this module.</p>
            )}

            <button
              onClick={() => setActivePatientViewer(null)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1E293B] rounded-xl"
            >
              Close Viewer
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
