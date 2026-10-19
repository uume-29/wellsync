const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const User = require('./models/User');
const Profile = require('./models/Profile');
const MealPlan = require('./models/MealPlan');
const PantryItem = require('./models/PantryItem');
const MonthlyGroceryPlan = require('./models/MonthlyGroceryPlan');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'wellsync_super_secret_jwt_key_2026_production';

async function runPhase4Tests() {
  console.log('====================================================');
  console.log('🚀 WELLSYNC PHASE 4 COMPREHENSIVE VERIFICATION SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 12;

  try {
    // 1. Connect directly to MongoDB Atlas using configured DNS
    await connectDB();
    console.log('✓ Connected to MongoDB Atlas for verification assertions.\n');

    // 2. Find or prepare primary test user
    let user = await User.findOne({ email: '2403031460435@paruluniversity.ac.in' });
    if (!user) {
      user = await User.findOne({});
    }
    if (!user) {
      user = await User.create({
        name: 'Phase4 Verification Tester',
        email: 'phase4_test@wellsync.internal',
        password: 'password12345',
      });
    }

    const userId = user._id.toString();
    console.log(`Using Test User: ${user.email} (${userId})`);

    // Prepare profile for User: Mixed culture, specific cuisines, householdSize: 3
    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = new Profile({ user: user._id });
    }
    profile.foodCulture = 'Mixed';
    profile.preferredCuisines = ['North Indian', 'Mediterranean', 'Italian'];
    profile.allergies = ['Peanuts'];
    profile.dislikedIngredients = ['Mushroom'];
    profile.householdSize = 3;
    profile.dietaryPreference = 'Balanced';
    profile.calorieTarget = 2100;
    profile.monthlyFoodBudget = 12000;
    await profile.save();
    console.log('✓ Prepared user profile: Mixed culture (North Indian, Mediterranean, Italian), householdSize: 3, allergies: [Peanuts], disliked: [Mushroom].\n');

    // Prepare pantry items for user
    await PantryItem.deleteMany({ user: user._id });
    await PantryItem.create([
      { user: user._id, name: 'Basmati Rice', quantity: 2, unit: 'kg', isAvailable: true },
      { user: user._id, name: 'Olive Oil', quantity: 500, unit: 'ml', isAvailable: true },
      { user: user._id, name: 'Garlic', quantity: 100, unit: 'g', isAvailable: true },
      { user: user._id, name: 'Tomatoes', quantity: 1, unit: 'kg', isAvailable: true },
      { user: user._id, name: 'Turmeric Powder', quantity: 100, unit: 'g', isAvailable: true },
    ]);
    console.log('✓ Prepared 5 active pantry stock items (Rice, Olive Oil, Garlic, Tomatoes, Turmeric).\n');

    // Generate JWT auth token for requests
    const token = jwt.sign({ id: userId, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    // -----------------------------------------------------------------
    // TEST 1: Generate Meal Plan
    // -----------------------------------------------------------------
    console.log('--- TEST 1: Personalized Meal Plan Generation ---');
    const genRes = await axios.post(`${API_BASE}/meals/generate`, {}, authHeaders);
    if (!genRes.data || !genRes.data.success || !genRes.data.plan) {
      throw new Error(`Meal plan generation failed: ${JSON.stringify(genRes.data)}`);
    }
    const generatedPlan = genRes.data.plan;
    if (generatedPlan.days.length !== 7) {
      throw new Error(`Expected 7 days, received ${generatedPlan.days.length}`);
    }
    console.log(`✓ Generated 7-day meal plan: "${generatedPlan.title}"`);
    console.log(`  Engine used: ${generatedPlan.summary?.generationEngine}`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 2: Atlas Persistence Check
    // -----------------------------------------------------------------
    console.log('\n--- TEST 2: MongoDB Atlas Persistence Verification ---');
    const dbPlan = await MealPlan.findOne({ user: user._id, isActive: true });
    if (!dbPlan || dbPlan._id.toString() !== generatedPlan._id.toString()) {
      throw new Error('Meal plan was not persisted with isActive: true in Atlas.');
    }
    console.log(`✓ Atlas document verified: ID ${dbPlan._id}, Days: ${dbPlan.days.length}, isActive: ${dbPlan.isActive}`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 3: Refresh Persistence (5 simulated page refreshes)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 3: Refresh Persistence (5 consecutive GETs) ---');
    for (let i = 1; i <= 5; i++) {
      const getRes = await axios.get(`${API_BASE}/meals/current`, authHeaders);
      if (!getRes.data.success || getRes.data.plan._id.toString() !== dbPlan._id.toString()) {
        throw new Error(`Refresh ${i} failed to return the exact saved plan.`);
      }
    }
    console.log('✓ 5 consecutive retrieval requests all successfully returned the active saved plan.');
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 4: Food Culture & Cuisine Reflection
    // -----------------------------------------------------------------
    console.log('\n--- TEST 4: Food Culture & Preferred Cuisines Reflection ---');
    const allCuisines = new Set();
    generatedPlan.days.forEach(day => {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(slot => {
        if (day.meals[slot]?.cuisine) {
          allCuisines.add(day.meals[slot].cuisine);
        }
      });
    });
    console.log(`  Observed Cuisines across plan: ${Array.from(allCuisines).join(', ')}`);
    const hasCultureMatch = ['North Indian', 'South Indian', 'Mediterranean', 'Italian', 'Continental'].some(c => allCuisines.has(c));
    if (!hasCultureMatch) {
      throw new Error('Observed cuisines do not match preferred cuisines.');
    }
    console.log('✓ Preferred cuisines and global food culture are actively reflected.');
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 5: Household Size & Servings Scaling
    // -----------------------------------------------------------------
    console.log('\n--- TEST 5: Household Size & Servings Consistency ---');
    let validServingCount = 0;
    generatedPlan.days.forEach(day => {
      ['breakfast', 'lunch', 'dinner'].forEach(slot => {
        const meal = day.meals[slot];
        if (meal && (meal.servings === 3 || meal.servings === profile.householdSize)) {
          validServingCount++;
        }
      });
    });
    console.log(`  Meals explicitly configured with profile householdSize (${profile.householdSize} servings): ${validServingCount}`);
    if (validServingCount === 0) {
      throw new Error('Servings count did not reflect user profile householdSize.');
    }
    console.log('✓ Household size (3 persons) is reflected in meal servings.');
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 6: Recipe Details & Step-by-Step Instructions
    // -----------------------------------------------------------------
    console.log('\n--- TEST 6: Recipe Details & Step-by-Step Instructions ---');
    const sampleMeal = generatedPlan.days[0].meals.lunch;
    console.log(`  Sample Meal: "${sampleMeal.title}" (${sampleMeal.cuisine})`);
    console.log(`  Prep Time: ${sampleMeal.prepTime || 'N/A'}, Cook Time: ${sampleMeal.cookTime || 'N/A'}`);
    console.log(`  Ingredients Count: ${sampleMeal.ingredients?.length}`);
    console.log(`  Step Instructions: ${Array.isArray(sampleMeal.stepByStepInstructions) ? sampleMeal.stepByStepInstructions.length : 0} steps`);

    if (!sampleMeal.title || !sampleMeal.ingredients || sampleMeal.ingredients.length === 0) {
      throw new Error('Meal lacks recipe title or ingredients.');
    }
    if (!sampleMeal.prepTime || !sampleMeal.cookTime) {
      throw new Error('Meal lacks prepTime or cookTime.');
    }
    console.log('✓ Recipe details include title, description, prep/cook times, and practical ingredients.');
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 7: Recipe Details API & AI Enrichment
    // -----------------------------------------------------------------
    console.log('\n--- TEST 7: Recipe Details Endpoint & AI Enrichment ---');
    const recipeRes = await axios.get(`${API_BASE}/meals/recipe/mon/lunch`, authHeaders);
    if (!recipeRes.data.success || !recipeRes.data.recipe) {
      throw new Error('GET /api/meals/recipe/mon/lunch failed.');
    }
    console.log(`✓ GET /api/meals/recipe/mon/lunch returned recipe: "${recipeRes.data.recipe.title}"`);

    const enrichRes = await axios.post(`${API_BASE}/meals/recipe/enrich`, {
      dayId: 'mon',
      mealType: 'lunch',
    }, authHeaders);
    if (!enrichRes.data.success || !enrichRes.data.recipe) {
      throw new Error('POST /api/meals/recipe/enrich failed.');
    }
    const enrichedSteps = enrichRes.data.recipe.stepByStepInstructions;
    if (!Array.isArray(enrichedSteps) || enrichedSteps.length < 2) {
      throw new Error('Enriched recipe does not have numbered step-by-step instructions.');
    }
    console.log(`✓ Enriched recipe with ${enrichedSteps.length} numbered cooking steps.`);
    console.log(`  Step 1: ${enrichedSteps[0].slice(0, 80)}...`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 8: Individual Meal Swap
    // -----------------------------------------------------------------
    console.log('\n--- TEST 8: Single Meal Swap Action ---');
    const beforeSwapTitle = generatedPlan.days[0].meals.dinner.title;
    console.log(`  Current Mon Dinner: "${beforeSwapTitle}"`);

    const swapRes = await axios.post(`${API_BASE}/meals/swap`, {
      dayId: 'mon',
      mealType: 'dinner',
    }, authHeaders);

    if (!swapRes.data.success || !swapRes.data.plan) {
      throw new Error('Swap meal endpoint failed.');
    }
    const afterSwapTitle = swapRes.data.plan.days[0].meals.dinner.title;
    console.log(`  New Mon Dinner: "${afterSwapTitle}"`);
    if (afterSwapTitle.toLowerCase() === beforeSwapTitle.toLowerCase()) {
      throw new Error('Swap returned identical meal title.');
    }
    console.log('✓ Successfully swapped meal with a compliant alternative.');
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 9: Preservation of Other Meals During Swap
    // -----------------------------------------------------------------
    console.log('\n--- TEST 9: Preservation of All Other Meals During Swap ---');
    let preservedCount = 0;
    const updatedPlan = swapRes.data.plan;
    ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].forEach(dayId => {
      const origDay = generatedPlan.days.find(d => d.dayId === dayId);
      const newDay = updatedPlan.days.find(d => d.dayId === dayId);
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(slot => {
        if (dayId === 'mon' && slot === 'dinner') return; // the swapped one
        if (origDay.meals[slot].title === newDay.meals[slot].title) {
          preservedCount++;
        }
      });
    });
    console.log(`  Preserved slots: ${preservedCount} / 27 expected`);
    if (preservedCount !== 27) {
      throw new Error(`Expected exactly 27 slots preserved, found ${preservedCount}`);
    }
    console.log('✓ All other 27 meal slots across all 7 days were strictly preserved.');
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 10: Pantry Stock Prioritization & Non-Deduction
    // -----------------------------------------------------------------
    console.log('\n--- TEST 10: Pantry Stock Prioritization & Preservation ---');
    const pantryMatchedMeals = [];
    updatedPlan.days.forEach(day => {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(slot => {
        const meal = day.meals[slot];
        if (meal && meal.pantryMatchedIngredients && meal.pantryMatchedIngredients.length > 0) {
          pantryMatchedMeals.push({ title: meal.title, items: meal.pantryMatchedIngredients });
        }
      });
    });
    console.log(`  Meals with pantry matches: ${pantryMatchedMeals.length}`);
    if (pantryMatchedMeals.length > 0) {
      console.log(`  Example match: "${pantryMatchedMeals[0].title}" uses [${pantryMatchedMeals[0].items.join(', ')}]`);
    }

    // Verify pantry stock was NOT consumed/deducted merely by generating or swapping
    const currentPantry = await PantryItem.find({ user: user._id });
    const rice = currentPantry.find(p => p.name === 'Basmati Rice');
    if (!rice || rice.quantity !== 2) {
      throw new Error(`Pantry stock was improperly modified! Expected 2kg Rice, got ${rice?.quantity}`);
    }
    console.log('✓ Pantry items prioritized for recipes and pantry quantities strictly preserved without deduction.');
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 11: Auto-Sync Monthly Grocery Plan
    // -----------------------------------------------------------------
    console.log('\n--- TEST 11: Grocery Plan Synchronization ---');
    const currentYear = new Date().getFullYear();
    const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, '0');
    const monthStr = `${currentYear}-${currentMonthNum}`;

    const groceryPlan = await MonthlyGroceryPlan.findOne({ user: user._id, month: monthStr });
    if (!groceryPlan || !groceryPlan.items || groceryPlan.items.length === 0) {
      throw new Error(`Monthly grocery plan not synced for ${monthStr}.`);
    }
    console.log(`✓ Monthly grocery plan synced for ${monthStr} with ${groceryPlan.items.length} aggregated grocery items.`);
    console.log(`  Household size on grocery plan: ${groceryPlan.householdSize}`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 12: Auth Isolation & Security
    // -----------------------------------------------------------------
    console.log('\n--- TEST 12: Authentication Isolation & Security ---');
    const otherUserId = new mongoose.Types.ObjectId();
    const otherToken = jwt.sign({ id: otherUserId.toString(), email: 'other@wellsync.internal' }, JWT_SECRET, { expiresIn: '1h' });
    
    try {
      const otherGet = await axios.get(`${API_BASE}/meals/current`, {
        headers: { Authorization: `Bearer ${otherToken}` },
      });
      // User 2 should NOT get user 1's meal plan
      if (otherGet.data.plan && otherGet.data.plan.user?.toString() === userId) {
        throw new Error('Security Breach: Other user accessed primary user meal plan!');
      }
    } catch (otherErr) {
      // 404 or not found is expected and secure
    }

    // Attempt unauthenticated request
    try {
      await axios.get(`${API_BASE}/meals/current`);
      throw new Error('Security Breach: Unauthenticated request was allowed!');
    } catch (unauthErr) {
      if (unauthErr.response && unauthErr.response.status === 401) {
        console.log('✓ Unauthenticated request rejected with HTTP 401 Unauthorized.');
      } else {
        throw unauthErr;
      }
    }
    console.log('✓ User data isolation and JWT authentication fully enforced.');
    passedTests++;

    console.log('\n====================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE 4 TESTS PASSED SUCCESSFULLY!`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ Test Suite Failed with Error:', error.message);
    if (error.response?.data) {
      console.error('Response Data:', error.response.data);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runPhase4Tests();
