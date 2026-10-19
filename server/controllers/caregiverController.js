const crypto = require('crypto');
const CaregiverInvitation = require('../models/CaregiverInvitation');
const CaregiverGrant = require('../models/CaregiverGrant');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');
const MealPlan = require('../models/MealPlan');
const FoodDiaryEntry = require('../models/FoodDiaryEntry');

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * @desc    Get owner's active caregivers and pending invitations
 * @route   GET /api/caregiver
 * @access  Private
 */
const getCaregivers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Active grants
    const activeGrants = await CaregiverGrant.find({
      owner: userId,
      status: 'active',
    }).populate('caregiver', 'name email');

    // Pending invitations
    const pendingInvites = await CaregiverInvitation.find({
      owner: userId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      activeCaregivers: activeGrants.map((g) => ({
        id: g._id,
        grantId: g._id,
        name: g.caregiverName || g.caregiver?.name || 'Authorized Caregiver',
        email: g.caregiverEmail || g.caregiver?.email || '',
        relationship: g.relationship,
        status: g.status,
        permissions: g.permissions,
        createdAt: g.createdAt,
      })),
      pendingInvitations: pendingInvites.map((inv) => ({
        id: inv._id,
        invitationId: inv._id,
        name: inv.inviteeName,
        email: inv.inviteeEmail,
        relationship: inv.relationship,
        status: inv.status,
        permissions: inv.permissions,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
    });
  } catch (error) {
    console.error('[Caregiver Controller Error - getCaregivers]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve caregiver relationships.',
    });
  }
};

/**
 * @desc    Send / create an invitation for a trusted caregiver
 * @route   POST /api/caregiver/invite
 * @access  Private
 */
const inviteCaregiver = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { name, email, relationship, permissions } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the caregiver full name.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid caregiver email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot invite yourself as your own caregiver.',
      });
    }

    // Check if an active grant already exists for this email
    const existingGrant = await CaregiverGrant.findOne({
      owner: ownerId,
      caregiverEmail: normalizedEmail,
      status: 'active',
    });

    if (existingGrant) {
      return res.status(400).json({
        success: false,
        message: 'An active caregiver access grant already exists for this email address.',
      });
    }

    // Generate secure single-use invitation token (expires in 7 days)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Revoke any previous pending invitations for this email from this owner
    await CaregiverInvitation.updateMany(
      { owner: ownerId, inviteeEmail: normalizedEmail, status: 'pending' },
      { $set: { status: 'revoked', revokedAt: new Date() } }
    );

    const invitation = await CaregiverInvitation.create({
      owner: ownerId,
      inviteeName: name.trim(),
      inviteeEmail: normalizedEmail,
      relationship: relationship || 'Family Member',
      tokenHash,
      permissions: {
        medications: permissions?.medications !== undefined ? Boolean(permissions.medications) : true,
        meals: permissions?.meals !== undefined ? Boolean(permissions.meals) : true,
        emergencyAlerts: permissions?.emergencyAlerts !== undefined ? Boolean(permissions.emergencyAlerts) : false,
        foodDiary: permissions?.foodDiary !== undefined ? Boolean(permissions.foodDiary) : true,
      },
      status: 'pending',
      expiresAt,
    });

    // Development/testing workflow: Since automated SMTP/email service is not configured,
    // do not claim email was sent. Supply the secure one-time invite token for testing.
    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteUrl = `${clientBaseUrl}/dashboard/caregiver?inviteToken=${rawToken}`;

    res.status(201).json({
      success: true,
      message: 'Caregiver invitation created and ready for sharing.',
      emailSent: false,
      deliveryNotice:
        'Automated email delivery service is not configured. Please copy the secure invitation link below and share it directly with your caregiver.',
      inviteToken: rawToken,
      inviteUrl,
      invitation: {
        id: invitation._id,
        name: invitation.inviteeName,
        email: invitation.inviteeEmail,
        relationship: invitation.relationship,
        status: invitation.status,
        permissions: invitation.permissions,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('[Caregiver Controller Error - inviteCaregiver]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create caregiver invitation.',
    });
  }
};

/**
 * @desc    Verify invitation token details before accepting
 * @route   GET /api/caregiver/invitations/verify/:token
 * @access  Public or Authenticated
 */
const verifyInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Invitation token is required.' });
    }

    const tokenHash = hashToken(token);
    const invitation = await CaregiverInvitation.findOne({
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).populate('owner', 'name');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation is invalid, has expired, or was already revoked.',
      });
    }

    res.status(200).json({
      success: true,
      invitation: {
        id: invitation._id,
        ownerName: invitation.owner?.name || 'A WellSync Member',
        inviteeName: invitation.inviteeName,
        inviteeEmail: invitation.inviteeEmail,
        relationship: invitation.relationship,
        permissions: invitation.permissions,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('[Caregiver Controller Error - verifyInvitation]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify invitation.',
    });
  }
};

/**
 * @desc    Accept caregiver invitation with explicit consent
 * @route   POST /api/caregiver/invitations/accept
 * @access  Private (Invited caregiver must be logged in)
 */
const acceptInvitation = async (req, res) => {
  try {
    const caregiverUser = req.user;
    const { token, consent } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Invitation token is required.' });
    }

    if (!consent) {
      return res.status(400).json({
        success: false,
        message: 'Explicit consent is required to accept caregiver access and responsibilities.',
      });
    }

    const tokenHash = hashToken(token);
    const invitation = await CaregiverInvitation.findOne({
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation is invalid, expired, revoked, or already used.',
      });
    }

    if (invitation.owner.toString() === caregiverUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot accept an invitation for your own account.',
      });
    }

    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = caregiverUser._id;
    await invitation.save();

    // Create or reactivate CaregiverGrant
    const grant = await CaregiverGrant.findOneAndUpdate(
      {
        owner: invitation.owner,
        caregiver: caregiverUser._id,
      },
      {
        $set: {
          caregiverEmail: caregiverUser.email,
          caregiverName: caregiverUser.name,
          relationship: invitation.relationship,
          permissions: invitation.permissions,
          status: 'active',
          invitation: invitation._id,
          revokedAt: null,
        },
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Caregiver access confirmed. You can now view authorized wellness records.',
      grant,
    });
  } catch (error) {
    console.error('[Caregiver Controller Error - acceptInvitation]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept invitation.',
    });
  }
};

/**
 * @desc    Update permissions on an existing caregiver grant or pending invite
 * @route   PATCH /api/caregiver/:id/permissions
 * @access  Private (Owner only)
 */
const updatePermissions = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const targetId = req.params.id;
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Permissions object is required.',
      });
    }

    // Try grant first
    let grant = await CaregiverGrant.findOne({ _id: targetId, owner: ownerId, status: 'active' });
    if (grant) {
      if (permissions.medications !== undefined) grant.permissions.medications = Boolean(permissions.medications);
      if (permissions.meals !== undefined) grant.permissions.meals = Boolean(permissions.meals);
      if (permissions.emergencyAlerts !== undefined) grant.permissions.emergencyAlerts = Boolean(permissions.emergencyAlerts);
      if (permissions.foodDiary !== undefined) grant.permissions.foodDiary = Boolean(permissions.foodDiary);
      await grant.save();
      return res.status(200).json({
        success: true,
        message: 'Caregiver permissions updated successfully.',
        permissions: grant.permissions,
      });
    }

    // Try pending invitation
    let invitation = await CaregiverInvitation.findOne({ _id: targetId, owner: ownerId, status: 'pending' });
    if (invitation) {
      if (permissions.medications !== undefined) invitation.permissions.medications = Boolean(permissions.medications);
      if (permissions.meals !== undefined) invitation.permissions.meals = Boolean(permissions.meals);
      if (permissions.emergencyAlerts !== undefined) invitation.permissions.emergencyAlerts = Boolean(permissions.emergencyAlerts);
      if (permissions.foodDiary !== undefined) invitation.permissions.foodDiary = Boolean(permissions.foodDiary);
      await invitation.save();
      return res.status(200).json({
        success: true,
        message: 'Pending invitation permissions updated successfully.',
        permissions: invitation.permissions,
      });
    }

    res.status(404).json({
      success: false,
      message: 'Caregiver grant or invitation not found.',
    });
  } catch (error) {
    console.error('[Caregiver Controller Error - updatePermissions]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permissions.',
    });
  }
};

/**
 * @desc    Revoke caregiver access immediately
 * @route   DELETE /api/caregiver/:id
 * @access  Private (Owner only)
 */
const revokeCaregiver = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const targetId = req.params.id;

    // Check if it's an active grant
    const grant = await CaregiverGrant.findOne({ _id: targetId, owner: ownerId });
    if (grant) {
      grant.status = 'revoked';
      grant.revokedAt = new Date();
      await grant.save();

      return res.status(200).json({
        success: true,
        message: 'Caregiver access revoked immediately. External sessions invalidated.',
        revokedId: targetId,
      });
    }

    // Check if it's a pending invitation
    const invitation = await CaregiverInvitation.findOne({ _id: targetId, owner: ownerId });
    if (invitation) {
      invitation.status = 'revoked';
      invitation.revokedAt = new Date();
      await invitation.save();

      return res.status(200).json({
        success: true,
        message: 'Pending invitation revoked successfully.',
        revokedId: targetId,
      });
    }

    res.status(404).json({
      success: false,
      message: 'Caregiver record not found.',
    });
  } catch (error) {
    console.error('[Caregiver Controller Error - revokeCaregiver]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke caregiver access.',
    });
  }
};

/**
 * @desc    List patients who have granted access to the logged-in user (Caregiver view)
 * @route   GET /api/caregiver/patients
 * @access  Private
 */
const getMyPatients = async (req, res) => {
  try {
    const caregiverId = req.user._id;

    const grants = await CaregiverGrant.find({
      caregiver: caregiverId,
      status: 'active',
    }).populate('owner', 'name email');

    res.status(200).json({
      success: true,
      patients: grants.map((g) => ({
        grantId: g._id,
        patientId: g.owner?._id,
        patientName: g.owner?.name || 'Patient',
        patientEmail: g.owner?.email || '',
        relationship: g.relationship,
        permissions: g.permissions,
        connectedSince: g.createdAt,
      })),
    });
  } catch (error) {
    console.error('[Caregiver Controller Error - getMyPatients]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient list.',
    });
  }
};

/**
 * @desc    Caregiver view: Read-only patient data (meals, medications, diary) strictly gated by permissions
 * @route   GET /api/caregiver/patient/:grantId/:module
 * @access  Private (Caregiver only)
 */
const getPatientModuleData = async (req, res) => {
  try {
    const caregiverId = req.user._id;
    const { grantId, module: moduleName } = req.params;

    const grant = await CaregiverGrant.findOne({
      _id: grantId,
      caregiver: caregiverId,
      status: 'active',
    }).populate('owner', 'name');

    if (!grant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not hold an active caregiver authorization for this patient.',
      });
    }

    const patientId = grant.owner._id;
    const patientName = grant.owner.name;

    if (moduleName === 'medications') {
      if (!grant.permissions.medications) {
        return res.status(403).json({
          success: false,
          message: 'Medication tracking access has not been granted by patient.',
        });
      }

      const today = new Date().toISOString().slice(0, 10);
      const meds = await Medicine.find({ user: patientId, isActive: true }).select('name type dosage timing instructions');
      const logs = await MedicineLog.find({ user: patientId, date: today });
      const logsMap = {};
      logs.forEach((l) => { logsMap[l.medicine.toString()] = l.status; });

      return res.status(200).json({
        success: true,
        patientName,
        module: 'medications',
        data: meds.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          timing: m.timing,
          status: logsMap[m._id.toString()] || 'pending',
        })),
      });
    }

    if (moduleName === 'meals') {
      if (!grant.permissions.meals) {
        return res.status(403).json({
          success: false,
          message: 'Meal plan access has not been granted by patient.',
        });
      }

      const plan = await MealPlan.findOne({ user: patientId, isActive: true }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        patientName,
        module: 'meals',
        data: plan ? { title: plan.title, days: plan.days, summary: plan.summary } : null,
      });
    }

    if (moduleName === 'food-diary') {
      if (!grant.permissions.foodDiary) {
        return res.status(403).json({
          success: false,
          message: 'Food diary access has not been granted by patient.',
        });
      }

      const today = new Date().toISOString().slice(0, 10);
      const entries = await FoodDiaryEntry.find({ user: patientId, date: today }).sort({ createdAt: 1 });
      return res.status(200).json({
        success: true,
        patientName,
        module: 'food-diary',
        data: entries,
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid module requested. Allowed: medications, meals, food-diary.',
    });
  } catch (error) {
    console.error('[Caregiver Controller Error - getPatientModuleData]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shared patient information.',
    });
  }
};

module.exports = {
  getCaregivers,
  inviteCaregiver,
  verifyInvitation,
  acceptInvitation,
  updatePermissions,
  revokeCaregiver,
  getMyPatients,
  getPatientModuleData,
};
