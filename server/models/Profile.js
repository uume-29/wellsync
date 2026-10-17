const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      min: [1, 'Age must be at least 1 year'],
      max: [120, 'Age cannot exceed 120 years'],
      default: null,
    },
    dietaryPreference: {
      type: String,
      trim: true,
      default: 'Vegetarian',
    },
    foodAllergies: {
      type: [String],
      default: [],
    },
    wellnessGoals: {
      type: [String],
      default: ['clean_eating', 'sustained_energy'],
    },
    activityLevel: {
      type: String,
      enum: {
        values: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
        message: '{VALUE} is not a valid activity level',
      },
      default: 'moderately_active',
    },
    preferredDietType: {
      type: String,
      trim: true,
      default: 'Balanced / Whole Food',
    },
    monthlyFoodBudget: {
      type: Number,
      min: [0, 'Monthly food budget cannot be negative'],
      default: 10000,
    },
    calorieTarget: {
      type: Number,
      min: [500, 'Calorie target must be at least 500 kcal'],
      max: [10000, 'Calorie target cannot exceed 10,000 kcal'],
      default: 2000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
