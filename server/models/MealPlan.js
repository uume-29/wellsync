const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
      default: 'Global Wellness',
    },
    time: {
      type: String,
      default: '15 mins',
    },
    portion: {
      type: String,
      default: '1 standard serving',
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    macros: {
      protein: { type: String, default: '15g' },
      proteinGrams: { type: Number, default: 15 },
      carbs: { type: String, default: '45g' },
      carbsGrams: { type: Number, default: 45 },
      fats: { type: String, default: '12g' },
      fatsGrams: { type: Number, default: 12 },
      fiber: { type: String, default: '6g' },
      fiberGrams: { type: Number, default: 6 },
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    allergens: {
      type: [String],
      default: [],
    },
    allergyFlags: {
      isSafe: { type: Boolean, default: true },
      checkedAgainst: { type: [String], default: [] },
      warnings: { type: [String], default: [] },
      crossContaminationRisk: {
        type: String,
        enum: ['None', 'Low', 'Moderate', 'High'],
        default: 'None',
      },
    },
    dietaryTags: {
      type: [String],
      default: [],
    },
    ingredients: [
      {
        name: { type: String, required: true },
        quantity: { type: String, default: '1 portion' },
        cost: { type: Number, default: 0 },
        isAllergen: { type: Boolean, default: false },
      },
    ],
    description: {
      type: String,
      default: '',
    },
    prepTime: {
      type: String,
      default: '10 mins',
    },
    cookTime: {
      type: String,
      default: '15 mins',
    },
    servings: {
      type: Number,
      default: 1,
      min: 1,
    },
    instructions: {
      type: String,
      required: true,
    },
    stepByStepInstructions: {
      type: [String],
      default: [],
    },
    pantryMatchedIngredients: {
      type: [String],
      default: [],
    },
    healthBenefits: {
      type: String,
      default: 'Nutrient-dense whole food preparation.',
    },
  },
  { _id: false }
);

const dayPlanSchema = new mongoose.Schema(
  {
    dayId: {
      type: String,
      enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      required: true,
    },
    dayName: {
      type: String,
      required: true,
    },
    dateLabel: {
      type: String,
      default: '',
    },
    totalCalories: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    macros: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
    },
    meals: {
      breakfast: { type: mealItemSchema, required: true },
      lunch: { type: mealItemSchema, required: true },
      dinner: { type: mealItemSchema, required: true },
      snack: { type: mealItemSchema, required: true },
    },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Personalized Clinical Wellness Plan',
    },
    planType: {
      type: String,
      enum: ['weekly', 'daily'],
      default: 'weekly',
    },
    preferencesSnapshot: {
      dietaryPreference: { type: String, default: 'Vegetarian' },
      preferredDietType: { type: String, default: 'Balanced / Whole Food' },
      foodAllergies: { type: [String], default: [] },
      wellnessGoals: { type: [String], default: [] },
      calorieTarget: { type: Number, default: 2000 },
      monthlyFoodBudget: { type: Number, default: 10000 },
      activityLevel: { type: String, default: 'moderately_active' },
      foodCulture: { type: String, default: 'Indian' },
      preferredCuisines: { type: [String], default: [] },
      dislikedIngredients: { type: [String], default: [] },
      householdSize: { type: Number, default: 1 },
    },
    summary: {
      weeklyEstimatedCost: { type: Number, default: 0 },
      averageDailyCalories: { type: Number, default: 0 },
      averageProtein: { type: Number, default: 0 },
      averageCarbs: { type: Number, default: 0 },
      averageFats: { type: Number, default: 0 },
      totalMealsCount: { type: Number, default: 28 },
      allergySafetyStatus: {
        type: String,
        enum: ['verified_safe', 'caution_flags', 'unverified'],
        default: 'verified_safe',
      },
      generationEngine: {
        type: String,
        enum: ['gemini-ai', 'clinical-nutrition-engine'],
        default: 'clinical-nutrition-engine',
      },
      geminiModelUsed: {
        type: String,
        default: null,
      },
      fallbackNotice: {
        type: String,
        default: null,
      },
      nutritionSource: {
        type: String,
        default: 'USDA FoodData Central & Indian Food Composition Tables (IFCT)',
      },
      disclaimer: {
        type: String,
        default:
          'Nutritional calculations & ingredient costs in INR are approximations. Actual market prices and nutritional values may vary by vendor, season, and preparation.',
      },
    },
    days: {
      type: [dayPlanSchema],
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length === 7,
        'Meal plan must contain exactly 7 days (Monday through Sunday)',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on user and weekId
mealPlanSchema.index({ user: 1, weekId: 1, isActive: 1 });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
