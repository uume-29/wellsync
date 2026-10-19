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

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'wellsync_super_secret_jwt_key_2026_production';

async function runPhase5Tests() {
  console.log('====================================================');
  console.log('🚀 WELLSYNC PHASE 5 BUDGET & SPENDING TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 9;

  try {
    // 1. Connect directly to Atlas
    await connectDB();
    console.log('✓ Connected to MongoDB Atlas for verification assertions.\n');

    // 2. Locate test user
    const user = await User.findOne({ email: '2403031460435@paruluniversity.ac.in' });
    if (!user) throw new Error('Test user not found in Atlas.');

    const userId = user._id.toString();
    console.log(`Using Test User: ${user.email} (${userId})`);

    // Ensure Profile has monthlyFoodBudget set
    let profile = await Profile.findOne({ user: user._id });
    if (!profile) profile = new Profile({ user: user._id });
    profile.monthlyFoodBudget = 12000;
    await profile.save();
    console.log(`✓ User Profile Monthly Food Budget set to ₹${profile.monthlyFoodBudget}.\n`);

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

    // Reset any prior test bills for a fresh test run
    await MonthlyGroceryPlan.updateOne(
      { user: user._id, month: targetMonth },
      { $set: { 'budget.recordedBills': [], 'budget.actualSpending': 0 } }
    );

    // -----------------------------------------------------------------
    // TEST 1: Sync Monthly Grocery Plan with Budget Structure
    // -----------------------------------------------------------------
    console.log('--- TEST 1: Plan Generation with Budget Object ---');
    const genRes = await axios.post(`${API_BASE}/grocery/generate`, { month: targetMonth }, authHeaders);
    if (!genRes.data.success || !genRes.data.data) {
      throw new Error(`Failed to generate monthly grocery plan: ${JSON.stringify(genRes.data)}`);
    }

    const planData = genRes.data.data;
    if (!planData.budget) {
      throw new Error('MonthlyGroceryPlan lacks budget object.');
    }
    console.log(`✓ Monthly plan generated for ${targetMonth}:`);
    console.log(`  Monthly Budget: ₹${planData.budget.monthlyBudget}`);
    console.log(`  Planned Spending: ₹${planData.budget.plannedSpending}`);
    console.log(`  Actual Spending: ₹${planData.budget.actualSpending}`);
    console.log(`  Recorded Bills Count: ${planData.budget.recordedBills?.length || 0}`);

    if (planData.budget.monthlyBudget !== 12000) {
      throw new Error(`Expected monthly budget 12000, got ${planData.budget.monthlyBudget}`);
    }
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 2: Record First Grocery Shopping Bill
    // -----------------------------------------------------------------
    console.log('\n--- TEST 2: Record First Shopping Bill ---');
    const bill1Res = await axios.post(
      `${API_BASE}/grocery/bills`,
      {
        month: targetMonth,
        amount: 2450,
        store: 'DMart Supermarket',
        date: new Date().toISOString(),
        notes: 'Monthly staples, pulses & cooking oil',
      },
      authHeaders
    );

    if (!bill1Res.data.success || !bill1Res.data.budget) {
      throw new Error('Failed to record first shopping bill.');
    }
    console.log(`✓ Bill recorded: ${bill1Res.data.message}`);
    console.log(`  New Actual Spending: ₹${bill1Res.data.budget.actualSpending}`);
    if (bill1Res.data.budget.actualSpending !== 2450) {
      throw new Error(`Expected actualSpending to be 2450, got ${bill1Res.data.budget.actualSpending}`);
    }
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 3: Record Second Shopping Bill & Verify Accumulation
    // -----------------------------------------------------------------
    console.log('\n--- TEST 3: Record Second Bill & Check Sum ---');
    const bill2Res = await axios.post(
      `${API_BASE}/grocery/bills`,
      {
        month: targetMonth,
        amount: 1200,
        store: 'Local Sabzi Mandi',
        date: new Date().toISOString(),
        notes: 'Fresh vegetables, coriander, tomatoes',
      },
      authHeaders
    );

    if (!bill2Res.data.success || !bill2Res.data.budget) {
      throw new Error('Failed to record second shopping bill.');
    }
    console.log(`✓ Second bill recorded. Actual Spending: ₹${bill2Res.data.budget.actualSpending}`);
    if (bill2Res.data.budget.actualSpending !== 3650) {
      throw new Error(`Expected actualSpending to be 3650 (2450 + 1200), got ${bill2Res.data.budget.actualSpending}`);
    }
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 4: MongoDB Atlas Persistence Verification
    // -----------------------------------------------------------------
    console.log('\n--- TEST 4: Verify Persistence in MongoDB Atlas ---');
    const atlasDoc = await MonthlyGroceryPlan.findOne({ user: user._id, month: targetMonth });
    if (!atlasDoc || !atlasDoc.budget) {
      throw new Error('MonthlyGroceryPlan document not found in Atlas.');
    }
    if (atlasDoc.budget.actualSpending !== 3650) {
      throw new Error(`Atlas actualSpending mismatch: expected 3650, got ${atlasDoc.budget.actualSpending}`);
    }
    if (atlasDoc.budget.recordedBills.length !== 2) {
      throw new Error(`Expected 2 recordedBills in Atlas, found ${atlasDoc.budget.recordedBills.length}`);
    }
    console.log(`✓ Atlas document verified: ${atlasDoc.budget.recordedBills.length} bills, actualSpending: ₹${atlasDoc.budget.actualSpending}`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 5: Budget Alternatives & Optimization Analytics
    // -----------------------------------------------------------------
    console.log('\n--- TEST 5: Budget Alternatives & Analytics ---');
    const altRes = await axios.get(`${API_BASE}/grocery/budget-alternatives?month=${targetMonth}`, authHeaders);
    if (!altRes.data.success || !altRes.data.analysis) {
      throw new Error('Failed to retrieve budget alternatives.');
    }

    const { analysis, budgetSwaps, actionableTips } = altRes.data;
    console.log(`✓ Budget Analytics Retrieved:`);
    console.log(`  Monthly Budget: ₹${analysis.monthlyBudget}`);
    console.log(`  Planned Spending: ₹${analysis.plannedSpending}`);
    console.log(`  Actual Spending: ₹${analysis.actualSpending}`);
    console.log(`  Remaining Budget: ₹${analysis.remainingBudget}`);
    console.log(`  Status: ${analysis.spendingStatus}`);
    console.log(`  Budget Swaps Count: ${budgetSwaps.length}`);
    console.log(`  Actionable Tips Count: ${actionableTips.length}`);

    if (analysis.remainingBudget !== 12000 - 3650) {
      throw new Error(`Expected remainingBudget to be 8350, got ${analysis.remainingBudget}`);
    }
    if (budgetSwaps.length === 0 || actionableTips.length === 0) {
      throw new Error('Expected non-empty budget swaps and actionable tips.');
    }
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 6: Delete a Shopping Bill & Recalculate
    // -----------------------------------------------------------------
    console.log('\n--- TEST 6: Delete Shopping Bill ---');
    const billToDelete = atlasDoc.budget.recordedBills[1]; // delete second bill (1200)
    const delRes = await axios.delete(
      `${API_BASE}/grocery/bills/${billToDelete._id}?month=${targetMonth}`,
      authHeaders
    );

    if (!delRes.data.success || !delRes.data.budget) {
      throw new Error('Failed to delete shopping bill.');
    }
    console.log(`✓ Bill deleted. New Actual Spending: ₹${delRes.data.budget.actualSpending}`);
    if (delRes.data.budget.actualSpending !== 2450) {
      throw new Error(`Expected actualSpending to revert to 2450, got ${delRes.data.budget.actualSpending}`);
    }
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 7: Preservation of Bills Across Plan Recalculation
    // -----------------------------------------------------------------
    console.log('\n--- TEST 7: Preservation of Bills Across Recalculation ---');
    const regenRes = await axios.post(`${API_BASE}/grocery/generate`, { month: targetMonth }, authHeaders);
    if (!regenRes.data.success || !regenRes.data.data) {
      throw new Error('Recalculation failed.');
    }
    const regenPlan = regenRes.data.data;
    if (regenPlan.budget.actualSpending !== 2450 || regenPlan.budget.recordedBills.length !== 1) {
      throw new Error('Recorded bills were not preserved across grocery plan recalculation!');
    }
    console.log(`✓ Recorded bills and actual spending strictly preserved across plan recalculation.`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 8: Validation (Negative Bill Rejection)
    // -----------------------------------------------------------------
    console.log('\n--- TEST 8: Negative Bill Amount Validation ---');
    try {
      await axios.post(
        `${API_BASE}/grocery/bills`,
        { month: targetMonth, amount: -500 },
        authHeaders
      );
      throw new Error('Validation failure: Negative bill amount was accepted!');
    } catch (valErr) {
      if (valErr.response && valErr.response.status === 400) {
        console.log('✓ Negative bill amount correctly rejected with HTTP 400 Bad Request.');
      } else {
        throw valErr;
      }
    }
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 9: Authentication Enforcement
    // -----------------------------------------------------------------
    console.log('\n--- TEST 9: Authentication Security on Bill Routes ---');
    try {
      await axios.post(`${API_BASE}/grocery/bills`, { month: targetMonth, amount: 500 });
      throw new Error('Security Breach: Unauthenticated bill recording was allowed!');
    } catch (unauthErr) {
      if (unauthErr.response && unauthErr.response.status === 401) {
        console.log('✓ Unauthenticated request rejected with HTTP 401 Unauthorized.');
      } else {
        throw unauthErr;
      }
    }
    passedTests++;

    console.log('\n====================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE 5 TESTS PASSED SUCCESSFULLY!`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ Phase 5 Test Suite Failed with Error:', error.message);
    if (error.response?.data) {
      console.error('Response Data:', error.response.data);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runPhase5Tests();
