const MealPlan = require('../models/MealPlan');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { generateMealPlan, swapSingleMeal } = require('../services/aiMealService');

// Helper to assemble active user profile snapshot
const getUserProfileSnapshot = async (userId) => {
  let profile = await Profile.findOne({ user: userId });
  const user = await User.findById(userId);

  if (!profile && user) {
    // Generate default profile structure from user preferences
    profile = {
      dietaryPreference: user.preferences?.dietaryRestrictions?.[0] || 'Vegetarian',
      foodAllergies: user.preferences?.allergies || [],
      wellnessGoals: user.preferences?.wellnessGoals || ['clean_eating', 'sustained_energy'],
      calorieTarget: user.preferences?.calorieTarget || 2000,
      monthlyFoodBudget: user.preferences?.weeklyBudget ? user.preferences.weeklyBudget * 4 : 10000,
      preferredDietType: 'Balanced / Whole Food',
      activityLevel: 'moderately_active',
    };
  }

  return {
    dietaryPreference: profile?.dietaryPreference || 'Vegetarian',
    preferredDietType: profile?.preferredDietType || 'Balanced / Whole Food',
    foodAllergies: Array.isArray(profile?.foodAllergies) ? profile.foodAllergies : [],
    wellnessGoals: Array.isArray(profile?.wellnessGoals) ? profile.wellnessGoals : ['clean_eating', 'sustained_energy'],
    calorieTarget: Number(profile?.calorieTarget) || 2000,
    monthlyFoodBudget: Number(profile?.monthlyFoodBudget) || 10000,
    activityLevel: profile?.activityLevel || 'moderately_active',
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
    const { dietaryPreference, preferredDietType, calorieTarget, monthlyFoodBudget } = req.body || {};
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

    const { updatedPlan, replacedMeal } = await swapSingleMeal(planObject, dayId, mealType, profileSnapshot);

    // Persist updated plan to MongoDB Atlas
    plan.days = updatedPlan.days;
    plan.summary = updatedPlan.summary;
    await plan.save();

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
