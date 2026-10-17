const User = require('../models/User');
const Profile = require('../models/Profile');

const VALID_ACTIVITY_LEVELS = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extremely_active',
];

// @desc    Get current user's profile
// @route   GET /api/profile
// @access  Private (JWT protected)
exports.getProfile = async (req, res) => {
  try {
    // Authenticated user ID extracted strictly from JWT middleware
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Find profile or create initial profile linked to user
    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      const defaultMonthly = user.preferences?.weeklyBudget
        ? user.preferences.weeklyBudget * 4
        : 10000;

      profile = await Profile.create({
        user: userId,
        foodAllergies: user.preferences?.allergies || [],
        wellnessGoals: user.preferences?.wellnessGoals || ['clean_eating', 'sustained_energy'],
        monthlyFoodBudget: defaultMonthly,
        calorieTarget: user.preferences?.calorieTarget || 2000,
        dietaryPreference: user.preferences?.dietaryRestrictions?.[0] || 'Vegetarian',
        preferredDietType: 'Balanced / Whole Food',
        activityLevel: 'moderately_active',
      });
    }

    const profileData = profile.toObject();

    res.status(200).json({
      success: true,
      profile: {
        ...profileData,
        name: user.name,
        email: user.email,
        memberSince: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Get Profile Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving profile.',
    });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/profile
// @access  Private (JWT protected)
exports.updateProfile = async (req, res) => {
  try {
    // Authenticated user ID extracted strictly from JWT middleware
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const {
      name,
      age,
      dietaryPreference,
      foodAllergies,
      allergies,
      wellnessGoals,
      activityLevel,
      preferredDietType,
      monthlyFoodBudget,
      weeklyBudget,
      calorieTarget,
      preferences,
    } = req.body;

    const profileUpdates = {};
    const validationErrors = [];

    // 1. Full name validation & update on User model
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        validationErrors.push('Full name must be a non-empty string.');
      } else if (name.trim().length > 100) {
        validationErrors.push('Full name cannot exceed 100 characters.');
      } else {
        user.name = name.trim();
      }
    }

    // 2. Age validation
    if (age !== undefined) {
      if (age === null || age === '') {
        profileUpdates.age = null;
      } else {
        const numAge = Number(age);
        if (isNaN(numAge) || !Number.isInteger(numAge) || numAge < 1 || numAge > 120) {
          validationErrors.push('Age must be an integer between 1 and 120.');
        } else {
          profileUpdates.age = numAge;
        }
      }
    }

    // 3. Dietary preference
    if (dietaryPreference !== undefined) {
      if (typeof dietaryPreference === 'string') {
        profileUpdates.dietaryPreference = dietaryPreference.trim();
      }
    }

    // 4. Food allergies (handle both foodAllergies and legacy allergies array)
    const rawAllergies = foodAllergies !== undefined ? foodAllergies : (allergies !== undefined ? allergies : preferences?.allergies);
    if (rawAllergies !== undefined) {
      if (!Array.isArray(rawAllergies)) {
        validationErrors.push('Food allergies must be an array of items.');
      } else {
        // Sanitize allergy strings: trim, remove empty, deduplicate
        const sanitizedAllergies = Array.from(
          new Set(
            rawAllergies
              .map((item) => (typeof item === 'string' ? item.trim() : ''))
              .filter(Boolean)
          )
        );
        profileUpdates.foodAllergies = sanitizedAllergies;
      }
    }

    // 5. Health and wellness goals
    const rawGoals = wellnessGoals !== undefined ? wellnessGoals : preferences?.wellnessGoals;
    if (rawGoals !== undefined) {
      if (!Array.isArray(rawGoals)) {
        validationErrors.push('Wellness goals must be an array of goals.');
      } else {
        profileUpdates.wellnessGoals = Array.from(
          new Set(
            rawGoals
              .map((goal) => (typeof goal === 'string' ? goal.trim() : ''))
              .filter(Boolean)
          )
        );
      }
    }

    // 6. Daily activity level
    if (activityLevel !== undefined) {
      if (!VALID_ACTIVITY_LEVELS.includes(activityLevel)) {
        validationErrors.push(`Activity level must be one of: ${VALID_ACTIVITY_LEVELS.join(', ')}.`);
      } else {
        profileUpdates.activityLevel = activityLevel;
      }
    }

    // 7. Preferred diet type
    if (preferredDietType !== undefined) {
      if (typeof preferredDietType === 'string') {
        profileUpdates.preferredDietType = preferredDietType.trim();
      }
    }

    // 8. Monthly food budget (and sync weekly budget)
    let calculatedWeekly = null;
    if (monthlyFoodBudget !== undefined) {
      const numBudget = Number(monthlyFoodBudget);
      if (isNaN(numBudget) || numBudget < 0) {
        validationErrors.push('Monthly food budget must be a positive number.');
      } else {
        profileUpdates.monthlyFoodBudget = Math.round(numBudget);
        calculatedWeekly = Math.max(100, Math.round(numBudget / 4));
      }
    } else if (weeklyBudget !== undefined || preferences?.weeklyBudget !== undefined) {
      const rawWeekly = weeklyBudget !== undefined ? weeklyBudget : preferences.weeklyBudget;
      const numWeekly = Number(rawWeekly);
      if (!isNaN(numWeekly) && numWeekly >= 0) {
        profileUpdates.monthlyFoodBudget = Math.round(numWeekly * 4);
        calculatedWeekly = Math.round(numWeekly);
      }
    }

    // 9. Calorie target
    const rawCalories = calorieTarget !== undefined ? calorieTarget : preferences?.calorieTarget;
    if (rawCalories !== undefined) {
      const numCalories = Number(rawCalories);
      if (isNaN(numCalories) || numCalories < 500 || numCalories > 10000) {
        validationErrors.push('Daily calorie target must be between 500 and 10,000 kcal.');
      } else {
        profileUpdates.calorieTarget = Math.round(numCalories);
      }
    }

    // Return 400 if validation failed
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(' '),
        errors: validationErrors,
      });
    }

    // Update or create Profile document in MongoDB
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileUpdates },
      { returnDocument: 'after', new: true, upsert: true, runValidators: true }
    );

    // Keep User model preferences synchronized for backward compatibility with other views
    const userPrefs = user.preferences ? (user.preferences.toObject ? user.preferences.toObject() : user.preferences) : {};
    
    if (profileUpdates.foodAllergies) {
      userPrefs.allergies = profileUpdates.foodAllergies;
    }
    if (profileUpdates.dietaryPreference) {
      userPrefs.dietaryRestrictions = [profileUpdates.dietaryPreference];
    }
    if (profileUpdates.wellnessGoals) {
      userPrefs.wellnessGoals = profileUpdates.wellnessGoals;
    }
    if (profileUpdates.calorieTarget) {
      userPrefs.calorieTarget = profileUpdates.calorieTarget;
    }
    if (calculatedWeekly !== null) {
      userPrefs.weeklyBudget = calculatedWeekly;
    }

    user.preferences = userPrefs;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: {
        ...updatedProfile.toObject(),
        name: user.name,
        email: user.email,
        memberSince: user.createdAt,
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile.',
    });
  }
};
