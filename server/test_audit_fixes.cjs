const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const User = require('./models/User');
const Profile = require('./models/Profile');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'wellsync_super_secret_jwt_key_2026_production';

async function validateAuditFixes() {
  console.log('================================================================');
  console.log('🧪 VERIFYING TARGETED AUDIT FIXES');
  console.log('================================================================\n');

  try {
    // -----------------------------------------------------------------
    // CHECK 1: GroceryListView.jsx Navigation Route Verification
    // -----------------------------------------------------------------
    console.log('--- CHECK 1: GroceryListView.jsx Navigation Link ---');
    const groceryViewContent = fs.readFileSync(
      path.join(__dirname, '../src/pages/dashboard/GroceryListView.jsx'),
      'utf-8'
    );
    if (groceryViewContent.includes('to="/dashboard/meal-planner"')) {
      throw new Error('FAILED: GroceryListView.jsx still contains legacy to="/dashboard/meal-planner" link.');
    }
    if (!groceryViewContent.includes('to="/dashboard/meals"')) {
      throw new Error('FAILED: GroceryListView.jsx does not contain corrected to="/dashboard/meals" link.');
    }
    console.log('✓ CHECK 1 Passed: GroceryListView.jsx "Go to Meal Planner" link successfully points to "/dashboard/meals".\n');

    // -----------------------------------------------------------------
    // CHECK 2: App.jsx Backward-Compatible Legacy Redirects
    // -----------------------------------------------------------------
    console.log('--- CHECK 2: App.jsx Legacy Redirects ---');
    const appContent = fs.readFileSync(
      path.join(__dirname, '../src/App.jsx'),
      'utf-8'
    );
    const hasMealPlannerRedirect = appContent.includes(
      '<Route path="meal-planner" element={<Navigate to="/dashboard/meals" replace />} />'
    );
    const hasGroceryListRedirect = appContent.includes(
      '<Route path="grocery-list" element={<Navigate to="/dashboard/groceries" replace />} />'
    );

    if (!hasMealPlannerRedirect || !hasGroceryListRedirect) {
      throw new Error('FAILED: App.jsx missing one or both legacy redirect routes.');
    }
    console.log('✓ CHECK 2 Passed: App.jsx contains both legacy redirects:');
    console.log('    • /dashboard/meal-planner -> /dashboard/meals');
    console.log('    • /dashboard/grocery-list -> /dashboard/groceries\n');

    // -----------------------------------------------------------------
    // CHECK 3: Profile Controller Mongoose returnDocument Option & Persistence
    // -----------------------------------------------------------------
    console.log('--- CHECK 3: Profile Update returnDocument: after Verification ---');
    const profileCtrlContent = fs.readFileSync(
      path.join(__dirname, 'controllers/profileController.js'),
      'utf-8'
    );
    if (profileCtrlContent.includes('new: true')) {
      throw new Error('FAILED: profileController.js still contains deprecated { new: true } option.');
    }
    if (!profileCtrlContent.includes("returnDocument: 'after'")) {
      throw new Error("FAILED: profileController.js missing returnDocument: 'after'.");
    }

    // Connect to Atlas and perform live API update
    await connectDB();
    const user = await User.findOne({ email: '2403031460435@paruluniversity.ac.in' });
    if (!user) throw new Error('Test user not found.');

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const testUpdatePayload = {
      householdSize: 4,
      monthlyFoodBudget: 16000,
      foodCulture: 'Mixed',
      preferredCuisines: ['North Indian', 'Mediterranean', 'Italian'],
      dislikedIngredients: ['Bitter Gourd'],
      foodAllergies: ['Peanuts'],
      activityLevel: 'moderately_active',
      wellnessGoals: ['clean_eating', 'sustained_energy'],
    };

    const updateRes = await axios.put(`${API_BASE}/profile`, testUpdatePayload, authHeaders);
    if (!updateRes.data.success || !updateRes.data.profile) {
      throw new Error(`Profile update API failed: ${JSON.stringify(updateRes.data)}`);
    }

    const updatedProfile = updateRes.data.profile;
    console.log('API Response Profile Data:');
    console.log(`  Monthly Budget: ₹${updatedProfile.monthlyFoodBudget}`);
    console.log(`  Household Size: ${updatedProfile.householdSize}`);
    console.log(`  Food Culture: ${updatedProfile.foodCulture}`);
    console.log(`  Preferred Cuisines: ${updatedProfile.preferredCuisines.join(', ')}`);

    if (updatedProfile.monthlyFoodBudget !== 16000) {
      throw new Error(`Expected updated budget 16000, got ${updatedProfile.monthlyFoodBudget}`);
    }
    if (updatedProfile.foodCulture !== 'Mixed') {
      throw new Error(`Expected updated foodCulture 'Mixed', got ${updatedProfile.foodCulture}`);
    }

    // Verify document directly in MongoDB Atlas
    const dbDoc = await Profile.findOne({ user: user._id });
    if (dbDoc.monthlyFoodBudget !== 16000 || dbDoc.foodCulture !== 'Mixed') {
      throw new Error('Database assertion failed: Atlas does not reflect updated values.');
    }
    console.log('✓ CHECK 3 Passed: Profile update returned updated document and persisted to MongoDB Atlas with zero deprecation warnings.\n');

    console.log('================================================================');
    console.log('🎉 ALL 3 AUDIT FIXES VERIFIED SUCCESSFULLY WITH ZERO ERRORS!');
    console.log('================================================================\n');

  } catch (err) {
    console.error(`\n❌ Validation Error: ${err.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

validateAuditFixes();
