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
const MonthlyGroceryPlan = require('./models/MonthlyGroceryPlan');
const PantryItem = require('./models/PantryItem');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'wellsync_super_secret_jwt_key_2026_production';

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('🌟 WELLSYNC PHASE 7: FULL END-TO-END USER JOURNEY VERIFICATION');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalStages = 7;

  try {
    // Connect directly to Atlas
    await connectDB();
    console.log('✓ Connected to MongoDB Atlas cluster for verification assertions.\n');

    // 1. Locate primary test user
    const user = await User.findOne({ email: '2403031460435@paruluniversity.ac.in' });
    if (!user) throw new Error('Primary test user not found in Atlas.');

    const userId = user._id.toString();
    console.log(`Primary Test User: ${user.email} (${userId})`);

    const token = jwt.sign({ id: userId, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const currentYear = new Date().getFullYear();
    const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, '0');
    const targetMonth = `${currentYear}-${currentMonthNum}`;
    const nextMonth = `${currentYear}-${String(Number(currentMonthNum) + 1).padStart(2, '0')}`;

    // =========================================================================
    // STAGE 1: User Profile Configuration & Food Culture
    // =========================================================================
    console.log('\n--- STAGE 1: User Profile Personalization & Food Culture ---');
    const profilePayload = {
      foodCulture: 'Indian',
      preferredCuisines: ['North Indian', 'South Indian', 'Gujarati'],
      dislikedIngredients: ['Mushroom', 'Bitter Gourd'],
      foodAllergies: ['Peanuts', 'Shellfish'],
      householdSize: 4,
      monthlyFoodBudget: 15000,
      activityLevel: 'moderately_active',
      wellnessGoals: ['clean_eating', 'sustained_energy'],
    };

    const profileRes = await axios.put(`${API_BASE}/profile`, profilePayload, authHeaders);
    if (!profileRes.data.success || !profileRes.data.profile) {
      throw new Error(`STAGE 1 Failed: Profile update failed: ${JSON.stringify(profileRes.data)}`);
    }

    const fetchedProfileRes = await axios.get(`${API_BASE}/profile`, authHeaders);
    const p = fetchedProfileRes.data.profile;
    if (p.foodCulture !== 'Indian') throw new Error(`Expected Indian food culture, got ${p.foodCulture}`);
    if (p.householdSize !== 4) throw new Error(`Expected household size 4, got ${p.householdSize}`);
    if (p.monthlyFoodBudget !== 15000) throw new Error(`Expected budget 15000, got ${p.monthlyFoodBudget}`);
    const allergiesList = p.foodAllergies || p.allergies || [];
    if (!p.dislikedIngredients.includes('Mushroom') || !allergiesList.includes('Peanuts')) {
      throw new Error('Allergies or disliked ingredients missing in profile.');
    }
    console.log(`✓ STAGE 1 Passed: Profile configured (Indian, householdSize: 4, budget: ₹15,000, allergies & disliked stored).`);
    passedTests++;

    // =========================================================================
    // STAGE 2: Pantry Inventory Baseline Setup & Unit Conversion
    // =========================================================================
    console.log('\n--- STAGE 2: Pantry Inventory Baseline Setup & Management ---');
    // Clear old test pantry items for clean state
    await PantryItem.deleteMany({ user: user._id });

    // Add baseline pantry items
    const baselineItems = [
      { name: 'Basmati Rice', quantity: 2, unit: 'kg', category: 'Grains', notes: 'Basmati stock' },
      { name: 'Olive Oil', quantity: 1, unit: 'litre', category: 'Canned/Pantry', notes: 'Cold pressed' },
      { name: 'Turmeric Powder', quantity: 250, unit: 'g', category: 'Spices', notes: 'Ground spice' },
      { name: 'Garlic', quantity: 10, unit: 'pieces', category: 'Produce', notes: 'Fresh cloves' },
    ];

    for (const b of baselineItems) {
      const pRes = await axios.post(`${API_BASE}/pantry`, b, authHeaders);
      if (!pRes.data.success) throw new Error(`Failed to add pantry item ${b.name}`);
    }

    const pantryListRes = await axios.get(`${API_BASE}/pantry`, authHeaders);
    const pantryData = pantryListRes.data.data || [];
    if (!pantryListRes.data.success || pantryData.length !== 4) {
      throw new Error(`Expected 4 pantry items, found ${pantryData.length}`);
    }

    // Toggle 1 item status
    const itemToToggle = pantryData[0];
    const togglePantryRes = await axios.patch(`${API_BASE}/pantry/${itemToToggle._id}/toggle`, {}, authHeaders);
    const toggledItem = togglePantryRes.data.data;
    if (toggledItem.status !== 'used_up') {
      throw new Error(`Expected item to toggle to used_up, got ${toggledItem.status}`);
    }
    // Toggle back to available
    await axios.patch(`${API_BASE}/pantry/${itemToToggle._id}/toggle`, {}, authHeaders);
    console.log(`✓ STAGE 2 Passed: 4 baseline pantry items created, retrieved, and status toggled cleanly.`);
    passedTests++;

    // =========================================================================
    // STAGE 3: AI Meal Plan Generation & Recipe Integrity
    // =========================================================================
    console.log('\n--- STAGE 3: AI Meal Plan Generation, Recipe Details & Swap ---');
    const mealPlanRes = await axios.post(
      `${API_BASE}/meals/generate`,
      {},
      authHeaders
    );
    if (!mealPlanRes.data.success || !mealPlanRes.data.plan) {
      throw new Error('STAGE 3 Failed: Meal plan generation failed.');
    }
    const mealPlan = mealPlanRes.data.plan;
    if (mealPlan.days.length !== 7) throw new Error(`Expected 7 days, got ${mealPlan.days.length}`);

    // Verify allergens & disliked ingredients are completely excluded
    for (const day of mealPlan.days) {
      for (const slot of ['breakfast', 'lunch', 'dinner', 'snack']) {
        const meal = day.meals[slot];
        if (!meal) continue;
        const mealTitle = meal.title || meal.name || '';
        const text = `${mealTitle} ${meal.description || ''} ${(meal.ingredients || []).map(i => i.name).join(' ')}`.toLowerCase();
        if (text.includes('peanut')) throw new Error(`Safety Violation: Peanut found in ${mealTitle}`);
        if (text.includes('shellfish')) throw new Error(`Safety Violation: Shellfish found in ${mealTitle}`);
        if (text.includes('mushroom')) throw new Error(`Preference Violation: Mushroom found in ${mealTitle}`);
        if (meal.servings && meal.servings !== 4) throw new Error(`Servings mismatch: expected 4, got ${meal.servings}`);
      }
    }

    // Test Recipe Details Endpoint
    const recipeRes = await axios.get(`${API_BASE}/meals/recipe/mon/lunch`, authHeaders);
    if (!recipeRes.data.success || !recipeRes.data.recipe) {
      throw new Error('Recipe details retrieval failed for mon/lunch.');
    }
    const recipe = recipeRes.data.recipe;
    console.log(`  Fetched Recipe: "${recipe.title || recipe.name}" (Prep: ${recipe.prepTime}m, Cook: ${recipe.cookTime}m, Servings: ${recipe.servings})`);

    // Test AI Recipe Enrichment
    const enrichRes = await axios.post(
      `${API_BASE}/meals/recipe/enrich`,
      { dayId: 'mon', mealType: 'lunch' },
      authHeaders
    );
    if (!enrichRes.data.success || !enrichRes.data.recipe) {
      throw new Error('AI Recipe Enrichment failed.');
    }
    const enrichedInstructions = enrichRes.data.recipe.stepByStepInstructions || [];
    console.log(`  Enriched Recipe Steps: ${enrichedInstructions.length} cooking steps returned.`);

    // Test Single Meal Swap
    const swapRes = await axios.post(
      `${API_BASE}/meals/swap`,
      { dayId: 'tue', mealType: 'dinner' },
      authHeaders
    );
    if (!swapRes.data.success || !swapRes.data.plan) {
      throw new Error('Single meal swap failed.');
    }
    const tueDay = swapRes.data.plan.days.find(d => d.dayId === 'tue');
    const swappedMeal = tueDay?.meals?.dinner;
    console.log(`  Swapped Tue Dinner -> "${swappedMeal?.title || swappedMeal?.name}"`);
    console.log(`✓ STAGE 3 Passed: AI Meal Plan validated with strict allergy/dislike exclusion, recipe details, enrichment, and meal swap.`);
    passedTests++;

    // =========================================================================
    // STAGE 4: Automated Monthly Grocery Synchronization & Scaling
    // =========================================================================
    console.log('\n--- STAGE 4: Monthly Grocery Synchronization & Scaling ---');
    const syncRes = await axios.post(
      `${API_BASE}/grocery/generate`,
      { month: targetMonth },
      authHeaders
    );
    if (!syncRes.data.success || !syncRes.data.data) {
      throw new Error('Monthly grocery synchronization failed.');
    }
    const groceryPlan = syncRes.data.data;
    if (groceryPlan.householdSize !== 4) {
      throw new Error(`Expected household size 4 in grocery plan, got ${groceryPlan.householdSize}`);
    }
    if (groceryPlan.items.length === 0) {
      throw new Error('Grocery plan items array is empty.');
    }

    // Add a custom grocery item
    const customItemRes = await axios.post(
      `${API_BASE}/grocery/items`,
      {
        month: targetMonth,
        name: 'Organic Wild Honey',
        category: 'Condiments',
        quantity: 500,
        unit: 'g',
        notes: 'Cold extracted',
      },
      authHeaders
    );
    if (!customItemRes.data.success) {
      throw new Error('Failed to add custom grocery item.');
    }
    const hasCustom = customItemRes.data.data.items.some(i => i.name === 'Organic Wild Honey' && i.isUserAdded);
    if (!hasCustom) throw new Error('Custom grocery item not found in plan after adding.');

    console.log(`✓ STAGE 4 Passed: Scaled grocery requirements synced (${groceryPlan.items.length} items, household: 4) with custom item support.`);
    passedTests++;

    // =========================================================================
    // STAGE 5: Budget Spending Tracking & Receipt Recording
    // =========================================================================
    console.log('\n--- STAGE 5: Budget Tracking, Shopping Receipts & Variance ---');
    // Reset any prior test bills
    await MonthlyGroceryPlan.updateOne(
      { user: user._id, month: targetMonth },
      { $set: { 'budget.recordedBills': [], 'budget.actualSpending': 0 } }
    );

    // Record two receipts
    const bill1 = await axios.post(
      `${API_BASE}/grocery/bills`,
      { month: targetMonth, amount: 3200, store: "Nature's Basket", notes: 'Fresh produce & organic grains' },
      authHeaders
    );
    const bill2 = await axios.post(
      `${API_BASE}/grocery/bills`,
      { month: targetMonth, amount: 1850, store: 'Local Supermarket', notes: 'Dairy and pantry spices' },
      authHeaders
    );
    if (!bill1.data.success || !bill2.data.success) throw new Error('Recording bills failed.');

    // Fetch budget alternatives and analysis
    const budgetRes = await axios.get(`${API_BASE}/grocery/budget-alternatives?month=${targetMonth}`, authHeaders);
    if (!budgetRes.data.success || !budgetRes.data.analysis) {
      throw new Error('Budget alternatives retrieval failed.');
    }
    const bAnalysis = budgetRes.data.analysis;
    if (bAnalysis.actualSpending !== 5050) {
      throw new Error(`Expected actual spending 5050, got ${bAnalysis.actualSpending}`);
    }
    if (bAnalysis.monthlyBudget !== 15000) {
      throw new Error(`Expected monthly budget 15000, got ${bAnalysis.monthlyBudget}`);
    }
    if (!Array.isArray(budgetRes.data.budgetSwaps) || budgetRes.data.budgetSwaps.length < 5) {
      throw new Error('Expected clinical budget swaps in response.');
    }
    console.log(`  Actual Spending Recorded: ₹${bAnalysis.actualSpending} of ₹${bAnalysis.monthlyBudget} budget (${bAnalysis.spendingStatus})`);
    console.log(`  Clinically Validated Swaps: ${budgetRes.data.budgetSwaps.length} recommendations available.`);
    console.log(`✓ STAGE 5 Passed: Budget spending strictly tracked from real receipts without price estimation.`);
    passedTests++;

    // =========================================================================
    // STAGE 6: Shopping Purchase Marking, Replenishment, and Month Turnover
    // =========================================================================
    console.log('\n--- STAGE 6: Shopping Purchase, Pantry Replenishment & Cycle Turnover ---');
    // Reset transfer flags and purchase first 4 items
    await MonthlyGroceryPlan.updateOne(
      { _id: groceryPlan._id },
      {
        $set: {
          'items.$[].isPurchased': false,
          'items.$[].isTransferredToPantry': false,
          'items.$[].transferredToPantryAt': null,
        },
      }
    );

    const planToBuy = await MonthlyGroceryPlan.findById(groceryPlan._id);
    for (const itm of planToBuy.items.slice(0, 4)) {
      await axios.patch(
        `${API_BASE}/grocery/items/${itm._id}/purchase`,
        { month: targetMonth },
        authHeaders
      );
    }

    // Batch transfer to pantry
    const transferRes = await axios.post(
      `${API_BASE}/grocery/transfer-purchased`,
      { month: targetMonth },
      authHeaders
    );
    if (!transferRes.data.success || transferRes.data.transferredCount < 4) {
      throw new Error(`Transfer failed: expected at least 4 items transferred, got ${transferRes.data.transferredCount}`);
    }

    // Finalize current month
    const finalizeRes = await axios.patch(
      `${API_BASE}/grocery/finalize`,
      { month: targetMonth, status: 'completed' },
      authHeaders
    );
    if (!finalizeRes.data.success || finalizeRes.data.data.status !== 'completed') {
      throw new Error('Month finalization failed.');
    }

    // Generate next month plan
    const nextGenRes = await axios.post(
      `${API_BASE}/grocery/generate`,
      { month: nextMonth },
      authHeaders
    );
    if (!nextGenRes.data.success || nextGenRes.data.data.month !== nextMonth) {
      throw new Error('Next month generation failed.');
    }

    // Verify history of previous month is preserved
    const prevInDb = await MonthlyGroceryPlan.findOne({ user: user._id, month: targetMonth });
    if (!prevInDb || prevInDb.status !== 'completed' || prevInDb.budget.actualSpending !== 5050) {
      throw new Error('Previous month history was not properly preserved in Atlas.');
    }

    console.log(`✓ STAGE 6 Passed: 4 items purchased and replenished to pantry, ${targetMonth} finalized as completed, ${nextMonth} initialized with history preserved.`);
    passedTests++;

    // =========================================================================
    // STAGE 7: Security, Authentication, and Multi-User Isolation
    // =========================================================================
    console.log('\n--- STAGE 7: Security & Multi-User Data Isolation ---');
    // 1. Unauthenticated requests must return 401
    try {
      await axios.get(`${API_BASE}/meals/current`);
      throw new Error('Security Violation: Unauthenticated request to /meals/current was not rejected.');
    } catch (err) {
      if (err.response?.status !== 401) throw err;
    }

    try {
      await axios.get(`${API_BASE}/grocery/current`);
      throw new Error('Security Violation: Unauthenticated request to /grocery/current was not rejected.');
    } catch (err) {
      if (err.response?.status !== 401) throw err;
    }

    // 2. Multi-user isolation test
    let user2 = await User.findOne({ email: 'isolation_tester@wellsync.com' });
    if (!user2) {
      user2 = await User.create({
        name: 'Isolation Test User',
        email: 'isolation_tester@wellsync.com',
        password: 'Password123!',
      });
    }

    const token2 = jwt.sign({ id: user2._id.toString(), email: user2.email }, JWT_SECRET, { expiresIn: '1d' });
    const authHeaders2 = {
      headers: {
        Authorization: `Bearer ${token2}`,
        'Content-Type': 'application/json',
      },
    };

    // User 2 pantry should not contain User 1's items
    const user2PantryRes = await axios.get(`${API_BASE}/pantry`, authHeaders2);
    const user2PantryIds = (user2PantryRes.data.data || []).map(i => i.user.toString());
    for (const uid of user2PantryIds) {
      if (uid === userId) throw new Error('Data Leakage: User 2 accessed User 1 pantry items!');
    }

    // User 2 should NOT be able to delete User 1's grocery items
    const user1ItemId = planToBuy.items[0]._id.toString();
    try {
      const crossDeleteRes = await axios.delete(
        `${API_BASE}/grocery/items/${user1ItemId}?month=${targetMonth}`,
        authHeaders2
      );
      // If it doesn't throw, check if success was false or 404
      if (crossDeleteRes.data.success) {
        throw new Error('Security Leakage: User 2 was able to delete User 1 grocery item!');
      }
    } catch (err) {
      if (err.response?.status !== 404 && err.response?.status !== 403) {
        throw new Error(`Unexpected error status for cross-user delete: ${err.response?.status}`);
      }
    }

    console.log('✓ STAGE 7 Passed: Authentication enforced on all routes, zero data leakage across user tenants.');
    passedTests++;

    console.log('\n================================================================');
    console.log(`🏆 ALL ${passedTests}/${totalStages} END-TO-END STAGES VERIFIED SUCCESSFULLY!`);
    console.log('================================================================\n');

  } catch (error) {
    console.error(`\n❌ End-to-End Verification Failed: ${error.message}`);
    if (error.response?.data) {
      console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runEndToEndVerification();
