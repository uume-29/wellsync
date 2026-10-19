const mongoose = require('mongoose');

const foodDiaryEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    foodName: {
      type: String,
      required: [true, 'Please provide the food name'],
      trim: true,
      maxlength: [160, 'Food name cannot exceed 160 characters'],
    },
    mealType: {
      type: String,
      required: [true, 'Please specify meal type'],
      enum: {
        values: ['breakfast', 'lunch', 'dinner', 'snack'],
        message: 'Meal type must be breakfast, lunch, dinner, or snack',
      },
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Date in YYYY-MM-DD format is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
      index: true,
    },
    time: {
      type: String,
      default: () =>
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    servingSize: {
      type: String,
      trim: true,
      default: '1 serving',
    },
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
      min: [0, 'Calories cannot be negative'],
      max: [5000, 'Calories cannot exceed 5000 per entry'],
    },
    macros: {
      protein: { type: Number, default: 0, min: 0 },
      carbs: { type: Number, default: 0, min: 0 },
      fats: { type: Number, default: 0, min: 0 },
      fiber: { type: Number, default: 0, min: 0 },
    },
    ingredients: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    source: {
      type: String,
      enum: ['manual', 'ai_vision'],
      default: 'manual',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    disclaimer: {
      type: String,
      default:
        'Nutritional metrics are clinical estimations. Actual values may vary by preparation and ingredients.',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for high performance user date-based diary lookups
foodDiaryEntrySchema.index({ user: 1, date: -1, createdAt: -1 });

module.exports = mongoose.model('FoodDiaryEntry', foodDiaryEntrySchema);
