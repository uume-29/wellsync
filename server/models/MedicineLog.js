const mongoose = require('mongoose');

const medicineLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Log date in YYYY-MM-DD format is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
      index: true,
    },
    timingSlot: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Bedtime', 'As Needed'],
      default: 'Morning',
    },
    status: {
      type: String,
      enum: ['taken', 'skipped', 'missed', 'pending'],
      default: 'taken',
      index: true,
    },
    recordedTime: {
      type: String,
      default: () =>
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate logs for the same medicine on the same day and timing slot
medicineLogSchema.index(
  { user: 1, medicine: 1, date: 1, timingSlot: 1 },
  { unique: true }
);

module.exports = mongoose.model('MedicineLog', medicineLogSchema);
