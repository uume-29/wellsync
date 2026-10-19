const mongoose = require('mongoose');

const caregiverInvitationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    inviteeName: {
      type: String,
      required: [true, 'Please provide invitee name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    inviteeEmail: {
      type: String,
      required: [true, 'Please provide invitee email'],
      lowercase: true,
      trim: true,
      index: true,
    },
    relationship: {
      type: String,
      required: [true, 'Please specify relationship'],
      trim: true,
      default: 'Family Member',
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    permissions: {
      medications: { type: Boolean, default: true },
      meals: { type: Boolean, default: true },
      emergencyAlerts: { type: Boolean, default: false },
      foodDiary: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'revoked'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

caregiverInvitationSchema.index({ owner: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('CaregiverInvitation', caregiverInvitationSchema);
