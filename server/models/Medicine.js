const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide medicine or supplement name'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    type: {
      type: String,
      enum: ['Prescription', 'Supplement', 'Over-the-Counter', 'Vitamin', 'Other'],
      default: 'Supplement',
    },
    dosage: {
      type: String,
      required: [true, 'Please provide dosage as prescribed or directed'],
      trim: true,
      maxlength: [80, 'Dosage cannot exceed 80 characters'],
    },
    timing: {
      type: String,
      required: [true, 'Please select a timing slot'],
      enum: ['Morning', 'Afternoon', 'Evening', 'Bedtime', 'As Needed'],
      default: 'Morning',
      index: true,
    },
    scheduleTime: {
      type: String,
      trim: true,
      default: '08:00 AM',
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Twice Daily', 'Weekly', 'As Needed'],
      default: 'Daily',
    },
    startDate: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    endDate: {
      type: String,
      default: null,
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [300, 'Instructions cannot exceed 300 characters'],
      default: 'Take as directed with water',
    },
    remindersEnabled: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

medicineSchema.index({ user: 1, isActive: 1, timing: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
