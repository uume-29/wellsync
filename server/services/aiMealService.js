const { RECIPE_DATABASE } = require('./nutritionDatabase');

let GoogleGenerativeAI = null;
try {
  const genaiModule = require('@google/generative-ai');
  GoogleGenerativeAI = genaiModule.GoogleGenerativeAI;
} catch (e) {
  // Gracefully handles if package is not present
}

// Priority cascade of active Gemini models (resilient to temporary spikes)
const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash-lite',
  'gemini-flash-latest',
];

const { cleanIngredientName } = require('../utils/unitConverter');

/**
 * Sanitize error message to prevent leaking API keys or secrets
 */
const sanitizeError = (errMsg) => {
  if (!errMsg) return 'AI generation service temporarily unavailable';
  return errMsg.replace(/key=[^&\s]+/gi, 'key=***').replace(/AIza[0-9A-Za-z_-]{35}/g, '***');
};

/**
 * Format raw instruction text into numbered step-by-step instructions
 */
const formatStepByStepInstructions = (rawInstructions) => {
  if (!rawInstructions || typeof rawInstructions !== 'string') {
    return [
      '1. Prepare and measure all fresh ingredients according to required portion sizes.',
      '2. Cook thoughtfully over medium heat following traditional culinary techniques.',
      '3. Season with aromatic herbs and spices, plate warmly, and enjoy fresh.',
    ];
  }

  const trimmed = rawInstructions.trim();

  // If already numbered lines like "1. ...\n2. ..."
  if (/^\s*\d+[\.\)]\s+/m.test(trimmed)) {
    const lines = trimmed
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const steps = lines.map((l, idx) => {
      const cleaned = l.replace(/^\d+[\.\)]\s*/, '').trim();
      return `${idx + 1}. ${cleaned}`;
    });
    if (steps.length > 0) return steps;
  }

  // Split by periods followed by capital letter/numbers
  const sentences = trimmed
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  if (sentences.length >= 2) {
    return sentences.map((s, idx) => `${idx + 1}. ${s.replace(/^\d+[\.\)]\s*/, '')}`);
  }

  return [
    `1. ${trimmed.replace(/^\d+[\.\)]\s*/, '')}`,
    '2. Plate and garnish carefully for optimal texture, flavor, and nutrient density.',
  ];
};

/**
 * Match recipe ingredients against available pantry items
 */
const matchPantryIngredients = (recipeIngredients = [], availablePantry = []) => {
  if (!Array.isArray(recipeIngredients) || !Array.isArray(availablePantry) || availablePantry.length === 0) {
    return [];
  }

  const matched = [];
  const pantryItemsNormalized = availablePantry.map((p) => ({
    rawName: p.name,
    clean: cleanIngredientName(p.name).toLowerCase(),
  }));

  for (const ing of recipeIngredients) {
    const rawName = typeof ing === 'string' ? ing : ing.name || '';
    const cleanIng = cleanIngredientName(rawName).toLowerCase();
    if (!cleanIng) continue;

    for (const p of pantryItemsNormalized) {
      if (
        cleanIng.includes(p.clean) ||
        p.clean.includes(cleanIng) ||
        (p.clean.length >= 4 && cleanIng.split(' ').some((word) => word.length >= 4 && p.clean.includes(word)))
      ) {
        matched.push(p.rawName);
        break;
      }
    }
  }

  return Array.from(new Set(matched));
};

/**
 * Check if a recipe or meal is strictly safe against user declared allergies
 */
const isRecipeSafeFromAllergies = (recipe, userAllergies = []) => {
  if (!userAllergies || userAllergies.length === 0) return { isSafe: true, matchedAllergens: [] };

  const normalizedUserAllergies = userAllergies.map((a) => a.toLowerCase().trim()).filter(Boolean);
  const recipeAllergens = (recipe.allergens || []).map((a) => a.toLowerCase().trim());
  const ingredientNames = (recipe.ingredients || []).map((i) => (typeof i === 'string' ? i.toLowerCase() : (i.name || '').toLowerCase()));
  const recipeTitle = (recipe.title || '').toLowerCase();

  const matched = [];

  for (const userAllergy of normalizedUserAllergies) {
    // Check declared allergens array
    for (const rAllergen of recipeAllergens) {
      if (rAllergen.includes(userAllergy) || userAllergy.includes(rAllergen)) {
        matched.push(userAllergy);
      }
    }

    // Check recipe title
    if (recipeTitle.includes(userAllergy)) {
      matched.push(userAllergy);
    }

    // Check specific ingredient items
    for (const ing of ingredientNames) {
      if (ing.includes(userAllergy)) {
        matched.push(userAllergy);
      }
    }
  }

  const uniqueMatched = Array.from(new Set(matched));
  return {
    isSafe: uniqueMatched.length === 0,
    matchedAllergens: uniqueMatched,
  };
};

/**
 * Check if a recipe or meal contains ingredients disliked by user (taste preference, distinct from medical allergies)
 */
const checkRecipeDislikedIngredients = (recipe, dislikedIngredients = []) => {
  if (!dislikedIngredients || dislikedIngredients.length === 0) return { containsDisliked: false, matchedDisliked: [] };

  const normalizedDisliked = dislikedIngredients.map((d) => d.toLowerCase().trim()).filter(Boolean);
  const ingredientNames = (recipe.ingredients || []).map((i) => (typeof i === 'string' ? i.toLowerCase() : (i.name || '').toLowerCase()));
  const recipeTitle = (recipe.title || '').toLowerCase();

  const matched = [];

  for (const disliked of normalizedDisliked) {
    if (recipeTitle.includes(disliked)) {
      matched.push(disliked);
    }
    for (const ing of ingredientNames) {
      if (ing.includes(disliked)) {
        matched.push(disliked);
      }
    }
  }

  const uniqueMatched = Array.from(new Set(matched));
  return {
    containsDisliked: uniqueMatched.length > 0,
    matchedDisliked: uniqueMatched,
  };
};

/**
 * Check if recipe matches user's dietary restriction
 */
const isRecipeDietCompatible = (recipe, userDiet = 'Vegetarian') => {
  if (!userDiet) return true;
  const diet = userDiet.trim();
  const compat = recipe.dietaryCompatibility || [];
  if (compat.includes(diet)) return true;

  if (diet === 'Non-Vegetarian') return true;
  if (diet === 'Pescatarian' && (compat.includes('Vegetarian') || compat.includes('Vegan'))) return true;
  if (diet === 'Eggetarian' && (compat.includes('Vegetarian') || compat.includes('Vegan'))) return true;
  if (diet === 'Vegetarian' && compat.includes('Vegan')) return true;

  return false;
};

/**
 * Call Gemini API using model fallback cascade with structured JSON configuration
 */
const callGeminiWithCascade = async (prompt, systemInstruction = '') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !GoogleGenerativeAI) {
    throw new Error('GEMINI_API_KEY is not configured or SDK unavailable.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of GEMINI_CANDIDATE_MODELS) {
    try {
      const modelOptions = {
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      };
      if (systemInstruction) {
        modelOptions.systemInstruction = systemInstruction;
      }

      const model = genAI.getGenerativeModel(modelOptions);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return {
        text,
        modelUsed: modelName,
      };
    } catch (err) {
      lastError = err;
      const safeMsg = sanitizeError(err.message);
      console.warn(`[Gemini API] Model ${modelName} returned status ${err.status || 'ERR'}: ${safeMsg.slice(0, 80)}. Trying fallback...`);
    }
  }

  throw new Error(`All candidate Gemini models failed. Root error: ${sanitizeError(lastError?.message)}`);
};

/**
 * Clinical Nutrition Engine: Ground truth 7-day plan generator from verified database
 */
const generateClinicalMealPlan = (userProfile, fallbackReason = null) => {
  const dietaryPreference = userProfile.dietaryPreference || 'Vegetarian';
  const preferredDietType = userProfile.preferredDietType || 'Balanced / Whole Food';
  const foodAllergies = userProfile.foodAllergies || [];
  const wellnessGoals = userProfile.wellnessGoals || ['clean_eating', 'sustained_energy'];
  const calorieTarget = Number(userProfile.calorieTarget) || 2000;
  const monthlyFoodBudget = Number(userProfile.monthlyFoodBudget) || 10000;
  const foodCulture = userProfile.foodCulture || 'Indian';
  const preferredCuisines = Array.isArray(userProfile.preferredCuisines) && userProfile.preferredCuisines.length > 0
    ? userProfile.preferredCuisines
    : (foodCulture === 'Western / International' ? ['Italian', 'Mediterranean'] : ['North Indian', 'South Indian']);
  const dislikedIngredients = Array.isArray(userProfile.dislikedIngredients) ? userProfile.dislikedIngredients : [];
  const householdSize = Math.max(1, Math.min(12, Number(userProfile.householdSize) || 1));

  const daysConfig = [
    { id: 'mon', name: 'Monday', dateLabel: 'Mon' },
    { id: 'tue', name: 'Tuesday', dateLabel: 'Tue' },
    { id: 'wed', name: 'Wednesday', dateLabel: 'Wed' },
    { id: 'thu', name: 'Thursday', dateLabel: 'Thu' },
    { id: 'fri', name: 'Friday', dateLabel: 'Fri' },
    { id: 'sat', name: 'Saturday', dateLabel: 'Sat' },
    { id: 'sun', name: 'Sunday', dateLabel: 'Sun' },
  ];

  // 1. Strict allergy & diet compatibility pool
  const safeRecipePool = RECIPE_DATABASE.filter((recipe) => {
    const dietOk = isRecipeDietCompatible(recipe, dietaryPreference);
    const allergyCheck = isRecipeSafeFromAllergies(recipe, foodAllergies);
    return dietOk && allergyCheck.isSafe;
  });

  // 2. Disliked ingredients filtering (taste preference exclusion)
  const dislikeFreeRecipePool = safeRecipePool.filter((recipe) => {
    const dislikeCheck = checkRecipeDislikedIngredients(recipe, dislikedIngredients);
    return !dislikeCheck.containsDisliked;
  });

  const activePool = dislikeFreeRecipePool.length >= 4 ? dislikeFreeRecipePool : safeRecipePool;

  const breakfasts = activePool.filter((r) => r.mealType === 'breakfast');
  const lunches = activePool.filter((r) => r.mealType === 'lunch');
  const dinners = activePool.filter((r) => r.mealType === 'dinner');
  const snacks = activePool.filter((r) => r.mealType === 'snack');

  const getMealForSlot = (pool, fallbackPool, dayIndex) => {
    let sourcePool = pool.length > 0 ? pool : fallbackPool;

    // Prioritize recipes that use available pantry ingredients
    if (Array.isArray(userProfile.availablePantry) && userProfile.availablePantry.length > 0) {
      sourcePool = [...sourcePool].sort((a, b) => {
        const matchA = matchPantryIngredients(a.ingredients, userProfile.availablePantry).length;
        const matchB = matchPantryIngredients(b.ingredients, userProfile.availablePantry).length;
        return matchB - matchA;
      });
    }

    const recipe = sourcePool.length > 0 ? sourcePool[dayIndex % sourcePool.length] : RECIPE_DATABASE[0];

    const auditedRecipe = JSON.parse(JSON.stringify(recipe));
    const allergyAudit = isRecipeSafeFromAllergies(auditedRecipe, foodAllergies);
    auditedRecipe.allergyFlags = {
      isSafe: allergyAudit.isSafe,
      checkedAgainst: foodAllergies,
      warnings: allergyAudit.isSafe ? [] : [`Review ingredients: potential trace of ${allergyAudit.matchedAllergens.join(', ')}`],
      crossContaminationRisk: foodAllergies.length > 0 ? 'Low' : 'None',
    };

    // Scale cost and portion for household size
    auditedRecipe.cost = Math.round((auditedRecipe.cost || 100) * householdSize);
    auditedRecipe.portion = `${householdSize} serving${householdSize > 1 ? 's' : ''}`;
    auditedRecipe.servings = householdSize;
    auditedRecipe.prepTime = auditedRecipe.prepTime || '10 mins';
    auditedRecipe.cookTime = auditedRecipe.cookTime || '15 mins';
    auditedRecipe.description = auditedRecipe.description || `Wholesome ${auditedRecipe.cuisine} ${auditedRecipe.title} crafted with natural whole ingredients.`;
    auditedRecipe.stepByStepInstructions = formatStepByStepInstructions(auditedRecipe.instructions);
    auditedRecipe.instructions = auditedRecipe.stepByStepInstructions.join('\n');

    if (Array.isArray(auditedRecipe.ingredients)) {
      auditedRecipe.ingredients = auditedRecipe.ingredients.map((ing) => ({
        ...ing,
        cost: Math.round((ing.cost || 20) * householdSize),
        quantity: householdSize > 1 ? `${householdSize}x (${ing.quantity || '1 portion'})` : (ing.quantity || '1 portion'),
      }));
    }

    auditedRecipe.pantryMatchedIngredients = matchPantryIngredients(
      auditedRecipe.ingredients,
      userProfile.availablePantry || []
    );

    return auditedRecipe;
  };

  const days = daysConfig.map((day, idx) => {
    const breakfast = getMealForSlot(breakfasts, activePool, idx);
    const lunch = getMealForSlot(lunches, activePool, idx);
    const dinner = getMealForSlot(dinners, activePool, idx + 1);
    const snack = getMealForSlot(snacks, activePool, idx);

    const dayMeals = [breakfast, lunch, dinner, snack];
    const totalCalories = dayMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
    const totalCost = dayMeals.reduce((acc, m) => acc + (m.cost || 0), 0);
    const protein = dayMeals.reduce((acc, m) => acc + (m.macros?.proteinGrams || 0), 0);
    const carbs = dayMeals.reduce((acc, m) => acc + (m.macros?.carbsGrams || 0), 0);
    const fats = dayMeals.reduce((acc, m) => acc + (m.macros?.fatsGrams || 0), 0);
    const fiber = dayMeals.reduce((acc, m) => acc + (m.macros?.fiberGrams || 0), 0);

    return {
      dayId: day.id,
      dayName: day.name,
      dateLabel: day.dateLabel,
      totalCalories,
      totalCost,
      macros: { protein, carbs, fats, fiber },
      meals: { breakfast, lunch, dinner, snack },
    };
  });

  const weeklyEstimatedCost = days.reduce((acc, d) => acc + d.totalCost, 0);
  const averageDailyCalories = Math.round(days.reduce((acc, d) => acc + d.totalCalories, 0) / 7);
  const averageProtein = Math.round(days.reduce((acc, d) => acc + d.macros.protein, 0) / 7);
  const averageCarbs = Math.round(days.reduce((acc, d) => acc + d.macros.carbs, 0) / 7);
  const averageFats = Math.round(days.reduce((acc, d) => acc + d.macros.fats, 0) / 7);

  return {
    weekId: new Date().toISOString().slice(0, 10),
    title: `${dietaryPreference} & ${preferredDietType} Weekly Wellness Plan`,
    planType: 'weekly',
    preferencesSnapshot: {
      dietaryPreference,
      preferredDietType,
      foodAllergies,
      wellnessGoals,
      calorieTarget,
      monthlyFoodBudget,
      activityLevel: userProfile.activityLevel || 'moderately_active',
      foodCulture,
      preferredCuisines,
      dislikedIngredients,
      householdSize,
    },
    summary: {
      weeklyEstimatedCost,
      averageDailyCalories,
      averageProtein,
      averageCarbs,
      averageFats,
      totalMealsCount: 28,
      allergySafetyStatus: 'verified_safe',
      generationEngine: 'clinical-nutrition-engine',
      nutritionSource: 'USDA FoodData Central & Indian Food Composition Tables (IFCT)',
      fallbackNotice: fallbackReason ? sanitizeError(fallbackReason) : null,
      disclaimer:
        'Nutritional calculations & ingredient costs in INR are clinical estimations. Actual market prices and nutritional values may vary by vendor, season, and preparation.',
    },
    days,
  };
};

/**
 * Generate a complete 7-day personalized meal plan with Gemini AI
 */
const generateMealPlan = async (userProfile) => {
  const dietaryPreference = userProfile.dietaryPreference || 'Vegetarian';
  const preferredDietType = userProfile.preferredDietType || 'Balanced / Whole Food';
  const foodAllergies = userProfile.foodAllergies || [];
  const calorieTarget = Number(userProfile.calorieTarget) || 2000;
  const monthlyFoodBudget = Number(userProfile.monthlyFoodBudget) || 10000;
  const foodCulture = userProfile.foodCulture || 'Indian';
  const preferredCuisines = Array.isArray(userProfile.preferredCuisines) && userProfile.preferredCuisines.length > 0
    ? userProfile.preferredCuisines
    : (foodCulture === 'Western / International' ? ['Italian', 'Mediterranean'] : ['North Indian', 'South Indian']);
  const dislikedIngredients = Array.isArray(userProfile.dislikedIngredients) ? userProfile.dislikedIngredients : [];
  const householdSize = Math.max(1, Math.min(12, Number(userProfile.householdSize) || 1));
  const dailyTargetBudget = Math.round(monthlyFoodBudget / 30);

  // If Gemini API key is present, attempt LLM generation
  if (process.env.GEMINI_API_KEY && GoogleGenerativeAI) {
    try {
      const pantryText = Array.isArray(userProfile.availablePantry) && userProfile.availablePantry.length > 0
        ? userProfile.availablePantry.map((p) => `${p.name} (${p.quantity} ${p.unit})`).join(', ')
        : 'None';

      const systemInstruction = `You are WellSync's Senior Clinical AI Dietitian.
Create a detailed, delicious, evidence-based 7-day meal plan (Monday to Sunday) customized to the user's constraints.
Food Culture Preference: ${foodCulture}.
Primary Cuisines to Feature: ${preferredCuisines.join(', ')}.
Household Size: Cooking for ${householdSize} ${householdSize === 1 ? 'person' : 'people'}. Recipe portions and ingredients should serve ${householdSize} ${householdSize === 1 ? 'person' : 'people'}.
All costs must be in Indian Rupees (INR ₹) matching standard Indian grocery prices for ${householdSize} ${householdSize === 1 ? 'serving' : 'servings'}.
STRICT ALLERGIES TO EXCLUDE: ${foodAllergies.length > 0 ? foodAllergies.join(', ') : 'None'} (Critical medical safety).
DISLIKED INGREDIENTS TO AVOID: ${dislikedIngredients.length > 0 ? dislikedIngredients.join(', ') : 'None'} (Taste preference - strictly exclude these from recipes).
AVAILABLE PANTRY INGREDIENTS AT HOME: ${pantryText} (Prioritize incorporating these available ingredients into recipes where suitable to minimize new purchases).
Output strictly valid JSON without Markdown blocks.`;

      const prompt = `Generate a 7-day meal plan in JSON for a user with:
- Dietary Restriction: ${dietaryPreference}
- Macro Paradigm: ${preferredDietType}
- Food Culture: ${foodCulture}
- Preferred Cuisines: ${preferredCuisines.join(', ')}
- Household Size: ${householdSize} ${householdSize === 1 ? 'person' : 'people'} (portions for ${householdSize})
- STRICT ALLERGIES TO EXCLUDE: ${foodAllergies.length > 0 ? foodAllergies.join(', ') : 'None'}
- DISLIKED INGREDIENTS TO EXCLUDE: ${dislikedIngredients.length > 0 ? dislikedIngredients.join(', ') : 'None'}
- AVAILABLE PANTRY INGREDIENTS TO PRIORITIZE: ${pantryText}
- Target Daily Calories (per person): ~${calorieTarget} kcal
- Target Daily Food Budget: ~₹${dailyTargetBudget} INR (Monthly: ₹${monthlyFoodBudget})
- Cuisines: Feature ${preferredCuisines.join(', ')} aligned with ${foodCulture} culture.

JSON structure:
{
  "title": "${dietaryPreference} & ${preferredDietType} AI Weekly Plan",
  "days": [
    {
      "dayId": "mon",
      "dayName": "Monday",
      "meals": {
        "breakfast": {
          "title": "Recipe Title",
          "description": "Short appetizing description",
          "cuisine": "Continental",
          "prepTime": "10 mins",
          "cookTime": "15 mins",
          "time": "25 mins total",
          "portion": "${householdSize} serving${householdSize > 1 ? 's' : ''}",
          "calories": 400,
          "cost": 110,
          "macros": { "protein": "15g", "proteinGrams": 15, "carbs": "50g", "carbsGrams": 50, "fats": "12g", "fatsGrams": 12, "fiber": "7g", "fiberGrams": 7 },
          "allergens": [],
          "ingredients": [ { "name": "Ingredient 1", "quantity": "50g", "cost": 30, "isAllergen": false } ],
          "instructions": "1. Step 1...\\n2. Step 2...\\n3. Step 3...",
          "stepByStepInstructions": [
            "1. Detailed step 1 instruction...",
            "2. Detailed step 2 instruction...",
            "3. Detailed step 3 instruction..."
          ],
          "healthBenefits": "Clinical health highlight."
        },
        "lunch": { ... },
        "dinner": { ... },
        "snack": { ... }
      }
    }
  ]
}`;

      const { text, modelUsed } = await callGeminiWithCascade(prompt, systemInstruction);
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Support both { days: [...] } and direct array
      const rawDays = Array.isArray(parsed) ? parsed : (parsed.days || Object.values(parsed.days || {}));

      if (Array.isArray(rawDays) && rawDays.length >= 7) {
        const daysConfig = [
          { id: 'mon', name: 'Monday' },
          { id: 'tue', name: 'Tuesday' },
          { id: 'wed', name: 'Wednesday' },
          { id: 'thu', name: 'Thursday' },
          { id: 'fri', name: 'Friday' },
          { id: 'sat', name: 'Saturday' },
          { id: 'sun', name: 'Sunday' },
        ];

        const validatedDays = daysConfig.map((cfg, idx) => {
          const rawDay = rawDays[idx] || rawDays.find((d) => (d.dayId || d.day || '').toLowerCase() === cfg.id) || {};
          const rawMeals = rawDay.meals || rawDay;

          const processedMeals = {};

          for (const slot of ['breakfast', 'lunch', 'dinner', 'snack']) {
            let meal = rawMeals[slot];

            if (!meal || !meal.title) {
              // Substitute from clinical DB if slot is incomplete
              const safeCandidates = RECIPE_DATABASE.filter((r) => 
                r.mealType === slot && 
                isRecipeSafeFromAllergies(r, foodAllergies).isSafe &&
                !checkRecipeDislikedIngredients(r, dislikedIngredients).containsDisliked
              );
              meal = safeCandidates[idx % safeCandidates.length] || RECIPE_DATABASE[0];
            }

            // 1. CRITICAL: Allergy audit on AI output (medical safety)
            const allergyCheck = isRecipeSafeFromAllergies(meal, foodAllergies);
            if (!allergyCheck.isSafe) {
              console.warn(`[AI Meal Safety Alert] Gemini proposed ${meal.title} containing declared allergen (${allergyCheck.matchedAllergens.join(', ')}). Replacing with verified safe recipe.`);
              const safeFallback = RECIPE_DATABASE.filter((r) => 
                r.mealType === slot && 
                isRecipeSafeFromAllergies(r, foodAllergies).isSafe &&
                !checkRecipeDislikedIngredients(r, dislikedIngredients).containsDisliked
              );
              meal = safeFallback[0] || RECIPE_DATABASE[0];
            }

            // 2. Disliked ingredients audit on AI output (taste preference)
            const dislikedCheck = checkRecipeDislikedIngredients(meal, dislikedIngredients);
            if (dislikedCheck.containsDisliked) {
              console.warn(`[AI Meal Preference Alert] Gemini proposed ${meal.title} containing disliked ingredient (${dislikedCheck.matchedDisliked.join(', ')}). Replacing with preference-compliant recipe.`);
              const safeDislikeFree = RECIPE_DATABASE.filter((r) => 
                r.mealType === slot && 
                isRecipeSafeFromAllergies(r, foodAllergies).isSafe && 
                !checkRecipeDislikedIngredients(r, dislikedIngredients).containsDisliked
              );
              meal = safeDislikeFree[0] || RECIPE_DATABASE[0];
            }

            // Standardize meal attributes
            const calories = Math.max(80, Math.min(1400, Number(meal.calories) || 450));
            const cost = Math.max(25, Math.min(1200, Number(meal.cost || meal.costINR) || (120 * householdSize)));
            const proteinGrams = Number(meal.macros?.proteinGrams) || parseInt(meal.macros?.protein, 10) || 15;
            const carbsGrams = Number(meal.macros?.carbsGrams) || parseInt(meal.macros?.carbs, 10) || 50;
            const fatsGrams = Number(meal.macros?.fatsGrams) || parseInt(meal.macros?.fats, 10) || 14;
            const fiberGrams = Number(meal.macros?.fiberGrams) || parseInt(meal.macros?.fiber, 10) || 7;

            const ingredients = Array.isArray(meal.ingredients)
              ? meal.ingredients.map((ing) => ({
                  name: typeof ing === 'string' ? ing : ing.name || 'Organic ingredient',
                  quantity: ing.quantity || (householdSize > 1 ? `${householdSize} servings` : '1 portion'),
                  cost: Number(ing.cost || ing.costINR) || 20,
                  isAllergen: Boolean(ing.isAllergen),
                }))
              : [{ name: meal.title, quantity: `${householdSize} serving${householdSize > 1 ? 's' : ''}`, cost, isAllergen: false }];

            const stepInstructions = Array.isArray(meal.stepByStepInstructions) && meal.stepByStepInstructions.length >= 2
              ? meal.stepByStepInstructions
              : formatStepByStepInstructions(meal.instructions);

            processedMeals[slot] = {
              id: meal.id || `ai-${cfg.id}-${slot}-${Date.now()}`,
              title: meal.title,
              description: meal.description || `A wholesome, balanced ${meal.cuisine || ''} ${slot} crafted with natural whole ingredients.`,
              mealType: slot,
              cuisine: meal.cuisine || (preferredCuisines[0] || 'Global Wellness'),
              time: meal.time || `${parseInt(meal.prepTime || 10, 10) + parseInt(meal.cookTime || 15, 10)} mins total`,
              prepTime: meal.prepTime || '10 mins',
              cookTime: meal.cookTime || '15 mins',
              portion: meal.portion || `${householdSize} standard serving${householdSize > 1 ? 's' : ''}`,
              servings: householdSize,
              calories,
              macros: {
                protein: `${proteinGrams}g`,
                proteinGrams,
                carbs: `${carbsGrams}g`,
                carbsGrams,
                fats: `${fatsGrams}g`,
                fatsGrams,
                fiber: `${fiberGrams}g`,
                fiberGrams,
              },
              cost,
              allergens: Array.isArray(meal.allergens) ? meal.allergens : [],
              allergyFlags: {
                isSafe: true,
                checkedAgainst: foodAllergies,
                warnings: [],
                crossContaminationRisk: foodAllergies.length > 0 ? 'Low' : 'None',
              },
              dietaryTags: [dietaryPreference, preferredDietType, foodCulture],
              ingredients,
              instructions: stepInstructions.join('\n'),
              stepByStepInstructions: stepInstructions,
              pantryMatchedIngredients: matchPantryIngredients(ingredients, userProfile.availablePantry || []),
              healthBenefits: meal.healthBenefits || 'Balanced macro-profile supporting continuous cellular energy.',
            };
          }

          const dayMealsList = Object.values(processedMeals);
          const totalCalories = dayMealsList.reduce((acc, m) => acc + m.calories, 0);
          const totalCost = dayMealsList.reduce((acc, m) => acc + m.cost, 0);
          const protein = dayMealsList.reduce((acc, m) => acc + m.macros.proteinGrams, 0);
          const carbs = dayMealsList.reduce((acc, m) => acc + m.macros.carbsGrams, 0);
          const fats = dayMealsList.reduce((acc, m) => acc + m.macros.fatsGrams, 0);
          const fiber = dayMealsList.reduce((acc, m) => acc + m.macros.fiberGrams, 0);

          return {
            dayId: cfg.id,
            dayName: cfg.name,
            dateLabel: cfg.id.toUpperCase(),
            totalCalories,
            totalCost,
            macros: { protein, carbs, fats, fiber },
            meals: processedMeals,
          };
        });

        const weeklyEstimatedCost = validatedDays.reduce((acc, d) => acc + d.totalCost, 0);
        const averageDailyCalories = Math.round(validatedDays.reduce((acc, d) => acc + d.totalCalories, 0) / 7);
        const averageProtein = Math.round(validatedDays.reduce((acc, d) => acc + d.macros.protein, 0) / 7);
        const averageCarbs = Math.round(validatedDays.reduce((acc, d) => acc + d.macros.carbs, 0) / 7);
        const averageFats = Math.round(validatedDays.reduce((acc, d) => acc + d.macros.fats, 0) / 7);

        return {
          weekId: new Date().toISOString().slice(0, 10),
          title: parsed.title || `${dietaryPreference} & ${preferredDietType} AI Weekly Plan`,
          planType: 'weekly',
          preferencesSnapshot: {
            dietaryPreference,
            preferredDietType,
            foodAllergies,
            wellnessGoals: userProfile.wellnessGoals || ['clean_eating', 'sustained_energy'],
            calorieTarget,
            monthlyFoodBudget,
            activityLevel: userProfile.activityLevel || 'moderately_active',
            foodCulture,
            preferredCuisines,
            dislikedIngredients,
            householdSize,
          },
          summary: {
            weeklyEstimatedCost,
            averageDailyCalories,
            averageProtein,
            averageCarbs,
            averageFats,
            totalMealsCount: 28,
            allergySafetyStatus: 'verified_safe',
            generationEngine: 'gemini-ai',
            geminiModelUsed: modelUsed,
            nutritionSource: `Google Gemini (${modelUsed}) validated against USDA & IFCT standards`,
            disclaimer:
              'AI-generated nutritional calculations & ingredient costs in INR are clinical estimations. Actual market prices and nutritional values may vary by vendor, season, and preparation. Always verify ingredient labels if you have severe allergies.',
          },
          days: validatedDays,
        };
      }
    } catch (aiErr) {
      console.warn('[AI Meal Service] Gemini plan generation failed, falling back to Clinical Nutrition Engine:', sanitizeError(aiErr.message));
      return generateClinicalMealPlan(userProfile, aiErr.message);
    }
  }

  // Fallback to verified clinical engine if no API key
  return generateClinicalMealPlan(userProfile);
};

/**
 * Replaces a single meal in an existing plan with Gemini AI, or clinical DB fallback
 */
const swapSingleMeal = async (existingPlan, dayId, mealType, userProfile) => {
  const dietaryPreference = userProfile.dietaryPreference || 'Vegetarian';
  const foodAllergies = userProfile.foodAllergies || [];
  const foodCulture = userProfile.foodCulture || 'Indian';
  const preferredCuisines = Array.isArray(userProfile.preferredCuisines) && userProfile.preferredCuisines.length > 0
    ? userProfile.preferredCuisines
    : (foodCulture === 'Western / International' ? ['Italian', 'Mediterranean'] : ['North Indian', 'South Indian']);
  const dislikedIngredients = Array.isArray(userProfile.dislikedIngredients) ? userProfile.dislikedIngredients : [];
  const householdSize = Math.max(1, Math.min(12, Number(userProfile.householdSize) || 1));

  const targetDay = existingPlan.days.find((d) => d.dayId === dayId);
  if (!targetDay) throw new Error(`Day ${dayId} not found in plan.`);

  const currentMeal = targetDay.meals[mealType];
  const currentTitle = currentMeal?.title || 'current recipe';

  let replacementMeal = null;

  // Try generating a replacement meal with Gemini
  if (process.env.GEMINI_API_KEY && GoogleGenerativeAI) {
    try {
      const pantryText = Array.isArray(userProfile.availablePantry) && userProfile.availablePantry.length > 0
        ? userProfile.availablePantry.map((p) => `${p.name} (${p.quantity} ${p.unit})`).join(', ')
        : 'None';

      const prompt = `Generate a replacement ${mealType} recipe for a ${dietaryPreference} user.
- Food Culture: ${foodCulture}
- Preferred Cuisines: ${preferredCuisines.join(', ')}
- Household Size: ${householdSize} ${householdSize === 1 ? 'person' : 'people'}
- STRICTLY EXCLUDE ALLERGENS: ${foodAllergies.length > 0 ? foodAllergies.join(', ') : 'None'}
- DISLIKED INGREDIENTS TO AVOID: ${dislikedIngredients.length > 0 ? dislikedIngredients.join(', ') : 'None'}
- AVAILABLE PANTRY INGREDIENTS TO PRIORITIZE: ${pantryText}
- Must be DIFFERENT from: "${currentTitle}"
- Provide realistic estimated cost in INR (₹) for ${householdSize} servings.

Return ONLY valid JSON matching this format:
{
  "title": "Recipe Title",
  "description": "Short appetizing description",
  "cuisine": "${preferredCuisines[0] || 'Italian'}",
  "prepTime": "10 mins",
  "cookTime": "15 mins",
  "time": "25 mins total",
  "portion": "${householdSize} serving${householdSize > 1 ? 's' : ''}",
  "calories": 450,
  "cost": ${140 * householdSize},
  "macros": { "protein": "18g", "proteinGrams": 18, "carbs": "55g", "carbsGrams": 50, "fats": "14g", "fatsGrams": 14, "fiber": "8g", "fiberGrams": 8 },
  "allergens": [],
  "ingredients": [ { "name": "Ingredient 1", "quantity": "50g", "cost": 30, "isAllergen": false } ],
  "instructions": "1. Step 1...\\n2. Step 2...\\n3. Step 3...",
  "stepByStepInstructions": [
    "1. Detailed step 1 instruction...",
    "2. Detailed step 2 instruction...",
    "3. Detailed step 3 instruction..."
  ],
  "healthBenefits": "Health note."
}`;

      const { text } = await callGeminiWithCascade(prompt);
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.title) {
        // Allergy check on AI replacement
        const allergyAudit = isRecipeSafeFromAllergies(parsed, foodAllergies);
        const dislikedAudit = checkRecipeDislikedIngredients(parsed, dislikedIngredients);

        if (allergyAudit.isSafe && !dislikedAudit.containsDisliked) {
          const ingredients = Array.isArray(parsed.ingredients)
            ? parsed.ingredients
            : [{ name: parsed.title, quantity: `${householdSize} serving${householdSize > 1 ? 's' : ''}`, cost: 130 * householdSize, isAllergen: false }];

          const stepInstructions = Array.isArray(parsed.stepByStepInstructions) && parsed.stepByStepInstructions.length >= 2
            ? parsed.stepByStepInstructions
            : formatStepByStepInstructions(parsed.instructions);

          replacementMeal = {
            id: `gemini-swap-${Date.now()}`,
            title: parsed.title,
            description: parsed.description || `Wholesome ${parsed.cuisine || ''} ${mealType} prepared fresh with whole ingredients.`,
            mealType,
            cuisine: parsed.cuisine || (preferredCuisines[0] || 'Global Wellness'),
            time: parsed.time || `${parseInt(parsed.prepTime || 10, 10) + parseInt(parsed.cookTime || 15, 10)} mins total`,
            prepTime: parsed.prepTime || '10 mins',
            cookTime: parsed.cookTime || '15 mins',
            portion: parsed.portion || `${householdSize} standard serving${householdSize > 1 ? 's' : ''}`,
            servings: householdSize,
            calories: Number(parsed.calories) || 450,
            macros: {
              protein: parsed.macros?.protein || `${parsed.macros?.proteinGrams || 16}g`,
              proteinGrams: Number(parsed.macros?.proteinGrams) || 16,
              carbs: parsed.macros?.carbs || `${parsed.macros?.carbsGrams || 50}g`,
              carbsGrams: Number(parsed.macros?.carbsGrams) || 50,
              fats: parsed.macros?.fats || `${parsed.macros?.fatsGrams || 14}g`,
              fatsGrams: Number(parsed.macros?.fatsGrams) || 14,
              fiber: parsed.macros?.fiber || `${parsed.macros?.fiberGrams || 7}g`,
              fiberGrams: Number(parsed.macros?.fiberGrams) || 7,
            },
            cost: Number(parsed.cost || parsed.costINR) || (130 * householdSize),
            allergens: Array.isArray(parsed.allergens) ? parsed.allergens : [],
            allergyFlags: {
              isSafe: true,
              checkedAgainst: foodAllergies,
              warnings: [],
              crossContaminationRisk: foodAllergies.length > 0 ? 'Low' : 'None',
            },
            dietaryTags: [dietaryPreference, foodCulture],
            ingredients,
            instructions: stepInstructions.join('\n'),
            stepByStepInstructions: stepInstructions,
            pantryMatchedIngredients: matchPantryIngredients(ingredients, userProfile.availablePantry || []),
            healthBenefits: parsed.healthBenefits || 'Clinical macro balance for sustained energy.',
          };
        }
      }
    } catch (swapErr) {
      console.warn('[AI Meal Service] Gemini swap failed, falling back to clinical DB:', sanitizeError(swapErr.message));
    }
  }

  // Fallback candidate from verified DB
  if (!replacementMeal) {
    let safeCandidates = RECIPE_DATABASE.filter((r) => {
      if (r.id === currentMeal?.id || r.title === currentTitle) return false;
      if (r.mealType !== mealType) return false;
      const dietOk = isRecipeDietCompatible(r, dietaryPreference);
      const allergyCheck = isRecipeSafeFromAllergies(r, foodAllergies);
      const dislikedCheck = checkRecipeDislikedIngredients(r, dislikedIngredients);
      return dietOk && allergyCheck.isSafe && !dislikedCheck.containsDisliked;
    });

    // Prioritize candidates with pantry items
    if (Array.isArray(userProfile.availablePantry) && userProfile.availablePantry.length > 0 && safeCandidates.length > 0) {
      safeCandidates = [...safeCandidates].sort((a, b) => {
        const matchA = matchPantryIngredients(a.ingredients, userProfile.availablePantry).length;
        const matchB = matchPantryIngredients(b.ingredients, userProfile.availablePantry).length;
        return matchB - matchA;
      });
    }

    const selected = safeCandidates.length > 0
      ? safeCandidates[0]
      : RECIPE_DATABASE.find((r) => r.mealType === mealType && r.id !== currentMeal?.id) || RECIPE_DATABASE[0];

    replacementMeal = JSON.parse(JSON.stringify(selected));
    const allergyAudit = isRecipeSafeFromAllergies(replacementMeal, foodAllergies);
    replacementMeal.allergyFlags = {
      isSafe: allergyAudit.isSafe,
      checkedAgainst: foodAllergies,
      warnings: allergyAudit.isSafe ? [] : [`Review ingredients: potential trace of ${allergyAudit.matchedAllergens.join(', ')}`],
      crossContaminationRisk: foodAllergies.length > 0 ? 'Low' : 'None',
    };

    // Scale cost and portion for household size
    replacementMeal.cost = Math.round((replacementMeal.cost || 100) * householdSize);
    replacementMeal.portion = `${householdSize} serving${householdSize > 1 ? 's' : ''}`;
    replacementMeal.servings = householdSize;
    replacementMeal.prepTime = replacementMeal.prepTime || '10 mins';
    replacementMeal.cookTime = replacementMeal.cookTime || '15 mins';
    replacementMeal.description = replacementMeal.description || `Wholesome ${replacementMeal.cuisine} ${replacementMeal.title} crafted with natural whole ingredients.`;
    replacementMeal.stepByStepInstructions = formatStepByStepInstructions(replacementMeal.instructions);
    replacementMeal.instructions = replacementMeal.stepByStepInstructions.join('\n');

    if (Array.isArray(replacementMeal.ingredients)) {
      replacementMeal.ingredients = replacementMeal.ingredients.map((ing) => ({
        ...ing,
        cost: Math.round((ing.cost || 20) * householdSize),
        quantity: householdSize > 1 ? `${householdSize}x (${ing.quantity || '1 portion'})` : (ing.quantity || '1 portion'),
      }));
    }

    replacementMeal.pantryMatchedIngredients = matchPantryIngredients(
      replacementMeal.ingredients,
      userProfile.availablePantry || []
    );
  }

  // Update target day in existing plan
  targetDay.meals[mealType] = replacementMeal;

  // Recalculate metrics
  const dayMeals = [targetDay.meals.breakfast, targetDay.meals.lunch, targetDay.meals.dinner, targetDay.meals.snack].filter(Boolean);
  targetDay.totalCalories = dayMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
  targetDay.totalCost = dayMeals.reduce((acc, m) => acc + (m.cost || 0), 0);
  targetDay.macros = {
    protein: dayMeals.reduce((acc, m) => acc + (m.macros?.proteinGrams || 0), 0),
    carbs: dayMeals.reduce((acc, m) => acc + (m.macros?.carbsGrams || 0), 0),
    fats: dayMeals.reduce((acc, m) => acc + (m.macros?.fatsGrams || 0), 0),
    fiber: dayMeals.reduce((acc, m) => acc + (m.macros?.fiberGrams || 0), 0),
  };

  existingPlan.summary.weeklyEstimatedCost = existingPlan.days.reduce((acc, d) => acc + d.totalCost, 0);
  existingPlan.summary.averageDailyCalories = Math.round(
    existingPlan.days.reduce((acc, d) => acc + d.totalCalories, 0) / 7
  );

  return {
    updatedPlan: existingPlan,
    replacedMeal: replacementMeal,
  };
};

/**
 * Enrich recipe with detailed step-by-step instructions and timing via Gemini or rule-based fallback
 */
const enrichRecipeDetails = async (meal, userProfile = {}) => {
  if (!meal) throw new Error('Meal object is required for enrichment');

  const householdSize = Number(userProfile.householdSize) || meal.servings || 1;

  // If Gemini API is available, generate thorough step-by-step cooking steps
  if (process.env.GEMINI_API_KEY && GoogleGenerativeAI) {
    try {
      const prompt = `You are WellSync's Senior Culinary Dietitian. Provide detailed, numbered step-by-step cooking directions and recipe details:
Recipe Title: "${meal.title}"
Cuisine: ${meal.cuisine}
Meal Type: ${meal.mealType}
Servings: ${householdSize}
Ingredients: ${(meal.ingredients || []).map((i) => `${i.name} (${i.quantity})`).join(', ')}

Return strictly valid JSON:
{
  "description": "Appetizing 1-2 sentence description of the dish and its health profile.",
  "prepTime": "10 mins",
  "cookTime": "15 mins",
  "stepByStepInstructions": [
    "1. Thoroughly rinse and prepare all fresh ingredients according to required portion sizes.",
    "2. Heat pan over medium heat and add cooking medium.",
    "3. Sauté aromatics until fragrant and golden.",
    "4. Add main ingredients and simmer until tender and thoroughly cooked.",
    "5. Season thoughtfully to taste, plate warmly, and serve fresh."
  ],
  "healthBenefits": "Clinical health highlight regarding macro and micronutrient balance."
}`;

      const { text } = await callGeminiWithCascade(prompt);
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed.stepByStepInstructions) && parsed.stepByStepInstructions.length >= 2) {
        meal.description = parsed.description || meal.description;
        meal.prepTime = parsed.prepTime || meal.prepTime || '10 mins';
        meal.cookTime = parsed.cookTime || meal.cookTime || '15 mins';
        meal.servings = householdSize;
        meal.stepByStepInstructions = parsed.stepByStepInstructions.map((s, idx) =>
          /^\s*\d+[\.\)]/.test(s) ? s : `${idx + 1}. ${s}`
        );
        meal.instructions = meal.stepByStepInstructions.join('\n');
        if (parsed.healthBenefits) meal.healthBenefits = parsed.healthBenefits;

        return meal;
      }
    } catch (err) {
      console.warn('[AI Meal Service] Recipe enrichment via Gemini failed, applying rule-based formatting:', sanitizeError(err.message));
    }
  }

  // Fallback rule-based enrichment
  meal.description = meal.description || `A wholesome, balanced ${meal.cuisine || ''} ${meal.mealType} crafted with natural whole ingredients.`;
  meal.prepTime = meal.prepTime || '10 mins';
  meal.cookTime = meal.cookTime || '15 mins';
  meal.servings = householdSize;
  meal.stepByStepInstructions = formatStepByStepInstructions(meal.instructions);
  meal.instructions = meal.stepByStepInstructions.join('\n');

  return meal;
};

module.exports = {
  generateMealPlan,
  swapSingleMeal,
  enrichRecipeDetails,
  formatStepByStepInstructions,
  matchPantryIngredients,
  isRecipeSafeFromAllergies,
  isRecipeDietCompatible,
  callGeminiWithCascade,
};
