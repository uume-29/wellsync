const mongoose = require('mongoose');

const caregiverGrantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caregiverEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    caregiverName: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      default: 'Caregiver',
    },
    permissions: {
      medications: { type: Boolean, default: true },
      meals: { type: Boolean, default: true },
      emergencyAlerts: { type: Boolean, default: false },
      foodDiary: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
      index: true,
    },
    invitation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CaregiverInvitation',
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

caregiverGrantSchema.index({ owner: 1, caregiver: 1 });
caregiverGrantSchema.index({ caregiver: 1, status: 1 });

module.exports = mongoose.model('CaregiverGrant', caregiverGrantSchema);
