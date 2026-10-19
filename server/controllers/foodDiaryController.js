const FoodDiaryEntry = require('../models/FoodDiaryEntry');
const User = require('../models/User');
const { analyzeFoodImage } = require('../services/foodVisionService');

/**
 * Helper to get today's date in YYYY-MM-DD
 */
const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

/**
 * @desc    Get food diary entries for a specific date with nutritional summary
 * @route   GET /api/food-diary
 * @access  Private
 */
const getDiaryByDate = async (req, res) => {
  try {
    const userId = req.user._id;
    const date = req.query.date || getTodayDateStr();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD.',
      });
    }

    const entries = await FoodDiaryEntry.find({
      user: userId,
      date: date,
    }).sort({ createdAt: 1 });

    const totalCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0);
    const totalProtein = entries.reduce((sum, e) => sum + (e.macros?.protein || 0), 0);
    const totalCarbs = entries.reduce((sum, e) => sum + (e.macros?.carbs || 0), 0);
    const totalFats = entries.reduce((sum, e) => sum + (e.macros?.fats || 0), 0);
    const totalFiber = entries.reduce((sum, e) => sum + (e.macros?.fiber || 0), 0);

    const user = await User.findById(userId).select('preferences');
    const calorieTarget = user?.preferences?.calorieTarget || 2000;

    res.status(200).json({
      success: true,
      date,
      entries,
      summary: {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
        totalFiber,
        entryCount: entries.length,
        calorieTarget,
        caloriePercentage: Math.min(100, Math.round((totalCalories / calorieTarget) * 100)),
      },
    });
  } catch (error) {
    console.error('[Food Diary Controller Error - getDiaryByDate]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve food diary records.',
    });
  }
};

/**
 * @desc    Get dates where the user logged food (for navigation & history)
 * @route   GET /api/food-diary/history
 * @access  Private
 */
const getDiaryHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Math.max(1, Math.min(60, parseInt(req.query.limit, 10) || 14));

    const history = await FoodDiaryEntry.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$date',
          totalCalories: { $sum: '$calories' },
          entryCount: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limit },
    ]);

    res.status(200).json({
      success: true,
      history: history.map((h) => ({
        date: h._id,
        totalCalories: h.totalCalories,
        entryCount: h.entryCount,
      })),
    });
  } catch (error) {
    console.error('[Food Diary Controller Error - getDiaryHistory]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve food diary history.',
    });
  }
};

/**
 * @desc    Create a new food diary entry
 * @route   POST /api/food-diary
 * @access  Private
 */
const createDiaryEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      foodName,
      mealType,
      date,
      time,
      servingSize,
      calories,
      macros,
      notes,
      ingredients,
      source,
      confidence,
    } = req.body;

    if (!foodName || !foodName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a food name.',
      });
    }

    if (!mealType || !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Meal type must be breakfast, lunch, dinner, or snack.',
      });
    }

    const entryDate = date || getTodayDateStr();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD.',
      });
    }

    const parsedCalories = Number(calories);
    if (isNaN(parsedCalories) || parsedCalories < 0 || parsedCalories > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Calories must be a valid number between 0 and 5000.',
      });
    }

    const newEntry = await FoodDiaryEntry.create({
      user: userId,
      foodName: foodName.trim(),
      mealType: mealType.toLowerCase(),
      date: entryDate,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      servingSize: servingSize ? servingSize.trim() : '1 serving',
      calories: parsedCalories,
      macros: {
        protein: Math.max(0, Number(macros?.protein) || 0),
        carbs: Math.max(0, Number(macros?.carbs) || 0),
        fats: Math.max(0, Number(macros?.fats) || 0),
        fiber: Math.max(0, Number(macros?.fiber) || 0),
      },
      notes: notes ? notes.trim() : '',
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      source: source === 'ai_vision' ? 'ai_vision' : 'manual',
      confidence: confidence ? Number(confidence) : null,
    });

    res.status(201).json({
      success: true,
      message: 'Meal logged successfully in your food diary.',
      entry: newEntry,
    });
  } catch (error) {
    console.error('[Food Diary Controller Error - createDiaryEntry]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create food diary entry.',
    });
  }
};

/**
 * @desc    Update a food diary entry
 * @route   PUT /api/food-diary/:id
 * @access  Private
 */
const updateDiaryEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const entryId = req.params.id;

    const entry = await FoodDiaryEntry.findOne({ _id: entryId, user: userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Food diary entry not found or unauthorized.',
      });
    }

    const {
      foodName,
      mealType,
      date,
      time,
      servingSize,
      calories,
      macros,
      notes,
      ingredients,
    } = req.body;

    if (foodName) entry.foodName = foodName.trim();
    if (mealType && ['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType.toLowerCase())) {
      entry.mealType = mealType.toLowerCase();
    }
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      entry.date = date;
    }
    if (time) entry.time = time;
    if (servingSize) entry.servingSize = servingSize.trim();
    if (calories !== undefined) {
      const parsed = Number(calories);
      if (!isNaN(parsed) && parsed >= 0) entry.calories = parsed;
    }
    if (macros) {
      entry.macros = {
        protein: macros.protein !== undefined ? Math.max(0, Number(macros.protein) || 0) : entry.macros.protein,
        carbs: macros.carbs !== undefined ? Math.max(0, Number(macros.carbs) || 0) : entry.macros.carbs,
        fats: macros.fats !== undefined ? Math.max(0, Number(macros.fats) || 0) : entry.macros.fats,
        fiber: macros.fiber !== undefined ? Math.max(0, Number(macros.fiber) || 0) : entry.macros.fiber,
      };
    }
    if (notes !== undefined) entry.notes = notes.trim();
    if (Array.isArray(ingredients)) entry.ingredients = ingredients;

    await entry.save();

    res.status(200).json({
      success: true,
      message: 'Food diary entry updated successfully.',
      entry,
    });
  } catch (error) {
    console.error('[Food Diary Controller Error - updateDiaryEntry]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update food diary entry.',
    });
  }
};

/**
 * @desc    Delete a food diary entry
 * @route   DELETE /api/food-diary/:id
 * @access  Private
 */
const deleteDiaryEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const entryId = req.params.id;

    const entry = await FoodDiaryEntry.findOneAndDelete({ _id: entryId, user: userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Food diary entry not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Food diary entry deleted successfully.',
      deletedId: entryId,
    });
  } catch (error) {
    console.error('[Food Diary Controller Error - deleteDiaryEntry]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete food diary entry.',
    });
  }
};

/**
 * @desc    Analyze uploaded food photo with Gemini Vision AI
 * @route   POST /api/food-diary/analyze-image
 * @access  Private
 */
const analyzeFoodPhoto = async (req, res) => {
  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image payload for analysis.',
      });
    }

    const analysisResult = await analyzeFoodImage(image, mimeType);

    if (!analysisResult.success) {
      return res.status(400).json(analysisResult);
    }

    res.status(200).json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    console.error('[Food Diary Controller Error - analyzeFoodPhoto]:', error.message);
    const isValidationError =
      error.message?.includes('Unsupported image format') ||
      error.message?.includes('Image exceeds') ||
      error.message?.includes('Image data is') ||
      error.message?.includes('corrupted') ||
      error.message?.includes('required');

    const statusCode = isValidationError ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'AI food image analysis service temporarily unavailable.',
    });
  }
};

module.exports = {
  getDiaryByDate,
  getDiaryHistory,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  analyzeFoodPhoto,
};
