const MealPlan = require('../models/MealPlan');
const Profile = require('../models/Profile');
const User = require('../models/User');
const PantryItem = require('../models/PantryItem');
const MonthlyGroceryPlan = require('../models/MonthlyGroceryPlan');
const { syncGroceryPlanInternal } = require('./groceryController');
const {
  generateMealPlan,
  swapSingleMeal,
  enrichRecipeDetails,
} = require('../services/aiMealService');

const getCurrentMonthStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Helper to assemble active user profile snapshot including available pantry stock
const getUserProfileSnapshot = async (userId) => {
  let profile = await Profile.findOne({ user: userId });
  const user = await User.findById(userId);

  if (!profile && user) {
    profile = {
      dietaryPreference: user.preferences?.dietaryRestrictions?.[0] || 'Vegetarian',
      foodAllergies: user.preferences?.allergies || [],
      wellnessGoals: user.preferences?.wellnessGoals || ['clean_eating', 'sustained_energy'],
      calorieTarget: user.preferences?.calorieTarget || 2000,
      monthlyFoodBudget: user.preferences?.weeklyBudget ? user.preferences.weeklyBudget * 4 : 10000,
      preferredDietType: 'Balanced / Whole Food',
      activityLevel: 'moderately_active',
      foodCulture: user.preferences?.foodCulture || 'Indian',
      preferredCuisines: user.preferences?.preferredCuisines || ['North Indian', 'South Indian'],
      dislikedIngredients: user.preferences?.dislikedIngredients || [],
      householdSize: user.preferences?.householdSize || 1,
    };
  }

  const defaultCuisines =
    (profile?.foodCulture || user?.preferences?.foodCulture) === 'Western / International'
      ? ['Italian', 'Mediterranean']
      : ['North Indian', 'South Indian'];

  // Fetch available pantry items
  let availablePantry = [];
  try {
    const pantryDocs = await PantryItem.find({
      user: userId,
      status: { $in: ['available', 'low_stock'] },
      quantity: { $gt: 0 },
    }).select('name quantity unit category');

    availablePantry = pantryDocs.map((p) => ({
      name: p.name,
      quantity: p.quantity,
      unit: p.unit,
      category: p.category,
    }));
  } catch (err) {
    console.warn('[Pantry Snapshot Warning]: Could not fetch pantry items:', err.message);
  }

  return {
    dietaryPreference:
      profile?.dietaryPreference || user?.preferences?.dietaryRestrictions?.[0] || 'Vegetarian',
    preferredDietType: profile?.preferredDietType || 'Balanced / Whole Food',
    foodAllergies: Array.isArray(profile?.foodAllergies)
      ? profile.foodAllergies
      : user?.preferences?.allergies || [],
    wellnessGoals: Array.isArray(profile?.wellnessGoals)
      ? profile.wellnessGoals
      : user?.preferences?.wellnessGoals || ['clean_eating', 'sustained_energy'],
    calorieTarget: Number(profile?.calorieTarget) || user?.preferences?.calorieTarget || 2000,
    monthlyFoodBudget:
      Number(profile?.monthlyFoodBudget) ||
      (user?.preferences?.weeklyBudget ? user.preferences.weeklyBudget * 4 : 10000),
    activityLevel: profile?.activityLevel || 'moderately_active',
    foodCulture: profile?.foodCulture || user?.preferences?.foodCulture || 'Indian',
    preferredCuisines:
      Array.isArray(profile?.preferredCuisines) && profile.preferredCuisines.length > 0
        ? profile.preferredCuisines
        : Array.isArray(user?.preferences?.preferredCuisines) &&
          user.preferences.preferredCuisines.length > 0
        ? user.preferences.preferredCuisines
        : defaultCuisines,
    dislikedIngredients: Array.isArray(profile?.dislikedIngredients)
      ? profile.dislikedIngredients
      : Array.isArray(user?.preferences?.dislikedIngredients)
      ? user.preferences.dislikedIngredients
      : [],
    householdSize: Math.max(
      1,
      Math.min(
        12,
        Number(profile?.householdSize) || Number(user?.preferences?.householdSize) || 1
      )
    ),
    availablePantry,
  };
};

// @desc    Get current active meal plan for authenticated user
// @route   GET /api/meals/current
// @access  Private (JWT protected)
exports.getCurrentMealPlan = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    let plan = await MealPlan.findOne({ user: userId, isActive: true }).sort({ createdAt: -1 });

    // If no active plan found, check if user has an existing plan that just needs to be reactivated
    if (!plan) {
      plan = await MealPlan.findOne({ user: userId }).sort({ createdAt: -1 });
      if (plan) {
        plan.isActive = true;
        await plan.save();
      }
    }

    // If no plan exists yet, automatically generate an initial personalized plan
    if (!plan) {
      const profileSnapshot = await getUserProfileSnapshot(userId);
      const generatedData = await generateMealPlan(profileSnapshot);

      plan = await MealPlan.create({
        user: userId,
        ...generatedData,
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error('[Get Current Meal Plan Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving meal plan.',
    });
  }
};

// @desc    Generate a fresh 7-day personalized meal plan
// @route   POST /api/meals/generate
// @access  Private (JWT protected)
exports.generateNewMealPlan = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const profileSnapshot = await getUserProfileSnapshot(userId);

    // Optional override params passed from client
    const { dietaryPreference, preferredDietType, calorieTarget, monthlyFoodBudget } =
      req.body || {};
    if (dietaryPreference) profileSnapshot.dietaryPreference = dietaryPreference;
    if (preferredDietType) profileSnapshot.preferredDietType = preferredDietType;
    if (calorieTarget) profileSnapshot.calorieTarget = Number(calorieTarget);
    if (monthlyFoodBudget) profileSnapshot.monthlyFoodBudget = Number(monthlyFoodBudget);

    const generatedData = await generateMealPlan(profileSnapshot);

    // Deactivate prior plans for this user
    await MealPlan.updateMany({ user: userId }, { $set: { isActive: false } });

    // Save fresh plan in Atlas
    const newPlan = await MealPlan.create({
      user: userId,
      ...generatedData,
      isActive: true,
    });

    // Auto-sync current month's grocery plan if one already exists
    try {
      const currentMonth = getCurrentMonthStr();
      const existingGrocery = await MonthlyGroceryPlan.findOne({
        user: userId,
        month: currentMonth,
      });
      if (existingGrocery) {
        await syncGroceryPlanInternal(userId, currentMonth);
      }
    } catch (grocerySyncErr) {
      console.warn('[MealPlan -> Grocery AutoSync Warning]:', grocerySyncErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Fresh personalized weekly meal plan generated successfully.',
      plan: newPlan,
    });
  } catch (error) {
    console.error('[Generate Meal Plan Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error generating meal plan.',
    });
  }
};

// @desc    Swap a single meal slot in current plan
// @route   POST /api/meals/swap
// @access  Private (JWT protected)
exports.swapMealSlot = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { dayId, mealType } = req.body;

    const validDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    if (!validDays.includes(dayId) || !validMealTypes.includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dayId or mealType specified for swap.',
      });
    }

    let plan = await MealPlan.findOne({ user: userId, isActive: true }).sort({ createdAt: -1 });

    if (!plan) {
      plan = await MealPlan.findOne({ user: userId }).sort({ createdAt: -1 });
      if (plan) {
        plan.isActive = true;
        await plan.save();
      }
    }

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'No active meal plan found to swap.',
      });
    }

    const profileSnapshot = await getUserProfileSnapshot(userId);
    const planObject = plan.toObject();

    const { updatedPlan, replacedMeal } = await swapSingleMeal(
      planObject,
      dayId,
      mealType,
      profileSnapshot
    );

    // Persist updated plan to MongoDB Atlas
    plan.days = updatedPlan.days;
    plan.summary = updatedPlan.summary;
    plan.markModified('days');
    await plan.save();

    // Auto-sync current month's grocery plan if one already exists
    try {
      const currentMonth = getCurrentMonthStr();
      const existingGrocery = await MonthlyGroceryPlan.findOne({
        user: userId,
        month: currentMonth,
      });
      if (existingGrocery) {
        await syncGroceryPlanInternal(userId, currentMonth);
      }
    } catch (grocerySyncErr) {
      console.warn('[MealPlan -> Grocery AutoSync Warning]:', grocerySyncErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Successfully swapped ${mealType} for ${dayId.toUpperCase()}.`,
      plan,
      replacedMeal,
    });
  } catch (error) {
    console.error('[Swap Meal Slot Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error swapping meal.',
    });
  }
};

// @desc    Get recipe details (and enrich if missing step-by-step instructions)
// @route   GET /api/meals/recipe/:dayId/:mealType
// @access  Private (JWT protected)
exports.getRecipeDetails = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { dayId, mealType } = req.params;

    const plan = await MealPlan.findOne({ user: userId, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Active meal plan not found.' });
    }

    const day = plan.days.find((d) => d.dayId === dayId);
    if (!day || !day.meals || !day.meals[mealType]) {
      return res.status(404).json({ success: false, message: 'Recipe slot not found in meal plan.' });
    }

    const meal = day.meals[mealType];

    // If recipe is missing step-by-step instructions or cook time, enrich it
    if (
      !Array.isArray(meal.stepByStepInstructions) ||
      meal.stepByStepInstructions.length < 2 ||
      !meal.cookTime ||
      !meal.description
    ) {
      const profileSnapshot = await getUserProfileSnapshot(userId);
      const enriched = await enrichRecipeDetails(meal, profileSnapshot);

      day.meals[mealType] = enriched;
      plan.markModified('days');
      await plan.save();

      return res.status(200).json({ success: true, recipe: enriched, enriched: true });
    }

    res.status(200).json({ success: true, recipe: meal, enriched: false });
  } catch (error) {
    console.error('[Get Recipe Details Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error loading recipe.' });
  }
};

// @desc    Explicitly enrich recipe with AI cooking directions
// @route   POST /api/meals/recipe/enrich
// @access  Private (JWT protected)
exports.enrichRecipe = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { dayId, mealType } = req.body;

    const plan = await MealPlan.findOne({ user: userId, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Active meal plan not found.' });
    }

    const day = plan.days.find((d) => d.dayId === dayId);
    if (!day || !day.meals || !day.meals[mealType]) {
      return res.status(404).json({ success: false, message: 'Recipe slot not found in meal plan.' });
    }

    const meal = day.meals[mealType];
    const profileSnapshot = await getUserProfileSnapshot(userId);
    const enriched = await enrichRecipeDetails(meal, profileSnapshot);

    day.meals[mealType] = enriched;
    plan.markModified('days');
    await plan.save();

    res.status(200).json({
      success: true,
      recipe: enriched,
      message: 'Recipe instructions successfully enriched with AI.',
    });
  } catch (error) {
    console.error('[Enrich Recipe Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error enriching recipe.' });
  }
};
