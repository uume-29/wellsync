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

async function runPhase6Tests() {
  console.log('================================================================');
  console.log('🚀 WELLSYNC PHASE 6 GROCERY CYCLES & REPLENISHMENT TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 12;

  try {
    // 1. Connect directly to Atlas
    await connectDB();
    console.log('✓ Connected to MongoDB Atlas for verification assertions.\n');

    // 2. Locate test user
    const user = await User.findOne({ email: '2403031460435@paruluniversity.ac.in' });
    if (!user) throw new Error('Test user not found in Atlas.');

    const userId = user._id.toString();
    console.log(`Using Test User: ${user.email} (${userId})`);

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

    // -----------------------------------------------------------------
    // TEST 1: Generate / Retrieve Plan for Current Month (targetMonth)
    // -----------------------------------------------------------------
    console.log('--- TEST 1: Plan Generation for Current Month ---');
    const genRes = await axios.post(
      `${API_BASE}/grocery/generate`,
      { month: targetMonth },
      authHeaders
    );
    if (!genRes.data.success || !genRes.data.data) {
      throw new Error(`TEST 1 Failed: Plan generation for ${targetMonth} returned unsuccessful.`);
    }
    const currentPlan = genRes.data.data;
    if (!Array.isArray(currentPlan.items) || currentPlan.items.length === 0) {
      throw new Error('TEST 1 Failed: Plan items array is empty.');
    }
    console.log(`✓ TEST 1 Passed: Plan for ${targetMonth} loaded with ${currentPlan.items.length} items.\n`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 2: Mark First 3 Items as Purchased
    // -----------------------------------------------------------------
    console.log('--- TEST 2: Marking Items as Purchased ---');
    // Reset transfer flags and ensure first 3 items are unpurchased initially
    await MonthlyGroceryPlan.updateOne(
      { _id: currentPlan._id },
      {
        $set: {
          'items.$[].isTransferredToPantry': false,
          'items.$[].transferredToPantryAt': null,
        },
      }
    );

    const freshPlan = await MonthlyGroceryPlan.findById(currentPlan._id);
    const itemsToPurchase = freshPlan.items.slice(0, 3);
    for (const itm of itemsToPurchase) {
      if (itm.isPurchased) {
        // Toggle to unpurchased first
        await axios.patch(
          `${API_BASE}/grocery/items/${itm._id}/purchase`,
          { month: targetMonth },
          authHeaders
        );
      }
      // Now toggle to purchased
      const toggleRes = await axios.patch(
        `${API_BASE}/grocery/items/${itm._id}/purchase`,
        { month: targetMonth },
        authHeaders
      );
      if (!toggleRes.data.success) {
        throw new Error(`TEST 2 Failed to mark item ${itm.name} as purchased.`);
      }
    }

    // Verify in database
    const dbPlanAfterPurchase = await MonthlyGroceryPlan.findById(currentPlan._id);
    const purchasedInDb = dbPlanAfterPurchase.items.filter((i) => i.isPurchased);
    if (purchasedInDb.length < 3) {
      throw new Error(`TEST 2 Failed: Expected at least 3 purchased items in DB, found ${purchasedInDb.length}.`);
    }
    console.log(`✓ TEST 2 Passed: Successfully marked ${purchasedInDb.length} items as purchased in Atlas.\n`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 3: Batch Transfer Purchased Items to Pantry
    // -----------------------------------------------------------------
    console.log('--- TEST 3: Batch Transfer Purchased Items to Pantry ---');
    const transferRes = await axios.post(
      `${API_BASE}/grocery/transfer-purchased`,
      { month: targetMonth },
      authHeaders
    );
    if (!transferRes.data.success) {
      throw new Error(`TEST 3 Failed: Transfer endpoint returned error: ${transferRes.data.message}`);
    }
    console.log(`Transfer API Response: ${transferRes.data.message} (Transferred: ${transferRes.data.transferredCount})`);
    if (transferRes.data.transferredCount < 1) {
      throw new Error('TEST 3 Failed: transferredCount should be at least 1.');
    }
    console.log(`✓ TEST 3 Passed: Batch transfer endpoint executed successfully.\n`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 4: Verify Items in MonthlyGroceryPlan Marked isTransferredToPantry
    // -----------------------------------------------------------------
    console.log('--- TEST 4: Verify Transfer Flags on MonthlyGroceryPlan ---');
    const dbPlanAfterTransfer = await MonthlyGroceryPlan.findById(currentPlan._id);
    const transferredItems = dbPlanAfterTransfer.items.filter((i) => i.isTransferredToPantry);
    if (transferredItems.length < transferRes.data.transferredCount) {
      throw new Error(`TEST 4 Failed: Expected at least ${transferRes.data.transferredCount} transferred items in DB.`);
    }
    for (const ti of transferredItems) {
      if (!ti.transferredToPantryAt) {
        throw new Error(`TEST 4 Failed: transferredToPantryAt date is missing for item ${ti.name}.`);
      }
    }
    console.log(`✓ TEST 4 Passed: ${transferredItems.length} items verified with isTransferredToPantry=true and valid timestamps in Atlas.\n`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 5: Verify PantryItem Records in Database
    // -----------------------------------------------------------------
    console.log('--- TEST 5: Verify Pantry Inventory in MongoDB Atlas ---');
    for (const ti of transferredItems.slice(0, 3)) {
      const pantryDoc = await PantryItem.findOne({
        user: user._id,
        name: { $regex: new RegExp(`^${ti.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      if (!pantryDoc) {
        throw new Error(`TEST 5 Failed: Pantry item ${ti.name} was not found in PantryItem collection.`);
      }
      if (pantryDoc.quantity <= 0) {
        throw new Error(`TEST 5 Failed: Pantry item ${ti.name} has non-positive quantity (${pantryDoc.quantity}).`);
      }
      if (pantryDoc.status !== 'available') {
        throw new Error(`TEST 5 Failed: Expected status 'available', got '${pantryDoc.status}'.`);
      }
    }
    console.log('✓ TEST 5 Passed: Replenished items exist in PantryItem collection with valid quantities and available status.\n');
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 6: Idempotent Transfer (No Duplicates on Second Call)
    // -----------------------------------------------------------------
    console.log('--- TEST 6: Idempotent Batch Transfer ---');
    const retransferRes = await axios.post(
      `${API_BASE}/grocery/transfer-purchased`,
      { month: targetMonth },
      authHeaders
    );
    if (!retransferRes.data.success) {
      throw new Error(`TEST 6 Failed: Re-transfer endpoint returned error.`);
    }
    if (retransferRes.data.transferredCount !== 0) {
      throw new Error(`TEST 6 Failed: Re-transfer transferred ${retransferRes.data.transferredCount} items; expected 0.`);
    }
    console.log(`✓ TEST 6 Passed: Idempotency verified. transferredCount=0, no duplicate items or quantities added.\n`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 7: Finalize Monthly Grocery Plan (status: completed)
    // -----------------------------------------------------------------
    console.log('--- TEST 7: Finalize Monthly Grocery Cycle ---');
    const finalizeRes = await axios.patch(
      `${API_BASE}/grocery/finalize`,
      { month: targetMonth, status: 'completed' },
      authHeaders
    );
    if (!finalizeRes.data.success || finalizeRes.data.data.status !== 'completed') {
      throw new Error('TEST 7 Failed: Plan status was not set to completed.');
    }
    const dbFinalizedPlan = await MonthlyGroceryPlan.findById(currentPlan._id);
    if (dbFinalizedPlan.status !== 'completed') {
      throw new Error(`TEST 7 Failed: Status in DB is '${dbFinalizedPlan.status}', expected 'completed'.`);
    }
    console.log(`✓ TEST 7 Passed: Month ${targetMonth} marked as 'completed' in MongoDB Atlas.\n`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 8: Generate Next Month Cycle (nextMonth)
    // -----------------------------------------------------------------
    console.log(`--- TEST 8: Advance to Next Month Cycle (${nextMonth}) ---`);
    const nextMonthRes = await axios.post(
      `${API_BASE}/grocery/generate`,
      { month: nextMonth },
      authHeaders
    );
    if (!nextMonthRes.data.success || !nextMonthRes.data.data) {
      throw new Error(`TEST 8 Failed: Failed to generate next month plan for ${nextMonth}.`);
    }
    const nextPlan = nextMonthRes.data.data;
    if (nextPlan.month !== nextMonth) {
      throw new Error(`TEST 8 Failed: Expected month ${nextMonth}, got ${nextPlan.month}.`);
    }
    console.log(`✓ TEST 8 Passed: Successfully generated fresh cycle for ${nextMonth} with ${nextPlan.items.length} items.\n`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 9: Verify History Preservation of Previous Month
    // -----------------------------------------------------------------
    console.log(`--- TEST 9: Verify History Preservation of ${targetMonth} ---`);
    const prevPlanFromDb = await MonthlyGroceryPlan.findOne({
      user: user._id,
      month: targetMonth,
    });
    if (!prevPlanFromDb) {
      throw new Error(`TEST 9 Failed: Previous month ${targetMonth} was deleted or lost.`);
    }
    if (prevPlanFromDb.status !== 'completed') {
      throw new Error(`TEST 9 Failed: Previous month status changed unexpectedly to '${prevPlanFromDb.status}'.`);
    }
    const prevPurchased = prevPlanFromDb.items.filter((i) => i.isPurchased);
    if (prevPurchased.length < 3) {
      throw new Error(`TEST 9 Failed: Previous month purchased items were reset.`);
    }
    console.log(`✓ TEST 9 Passed: Month ${targetMonth} is fully preserved with ${prevPlanFromDb.items.length} items, ${prevPurchased.length} purchases, and 'completed' status.\n`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 10: Multi-Month History Endpoint (GET /api/grocery/months)
    // -----------------------------------------------------------------
    console.log('--- TEST 10: Verify Multi-Month History Listing ---');
    const monthsRes = await axios.get(`${API_BASE}/grocery/months`, authHeaders);
    if (!monthsRes.data.success || !Array.isArray(monthsRes.data.months)) {
      throw new Error('TEST 10 Failed: /api/grocery/months failed or returned non-array.');
    }
    const monthsList = monthsRes.data.months;
    if (!monthsList.includes(targetMonth) || !monthsList.includes(nextMonth)) {
      throw new Error(`TEST 10 Failed: Expected both ${targetMonth} and ${nextMonth} in months list: ${JSON.stringify(monthsList)}`);
    }
    console.log(`✓ TEST 10 Passed: History listing returns ${monthsList.length} months including ${targetMonth} and ${nextMonth}.\n`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 11: Pantry Replenishment Deducted in Next Month Plan
    // -----------------------------------------------------------------
    console.log('--- TEST 11: Replenished Pantry Deducted in Next Month ---');
    // Check that items replenished in pantry now reflect in next month's pantryQuantity
    const nextPlanWithPantry = await MonthlyGroceryPlan.findOne({
      user: user._id,
      month: nextMonth,
    });
    const itemsWithPantry = nextPlanWithPantry.items.filter((i) => i.pantryQuantity > 0);
    if (itemsWithPantry.length === 0) {
      throw new Error('TEST 11 Failed: Next month plan does not recognize any pantry stock.');
    }
    console.log(`✓ TEST 11 Passed: Next month plan recognizes ${itemsWithPantry.length} items already stocked in pantry from replenishment.\n`);
    passedTests++;

    // -----------------------------------------------------------------
    // TEST 12: Reopen Cycle Capability (status -> active)
    // -----------------------------------------------------------------
    console.log(`--- TEST 12: Reopen Cycle Capability (${targetMonth}) ---`);
    const reopenRes = await axios.patch(
      `${API_BASE}/grocery/finalize`,
      { month: targetMonth, status: 'active' },
      authHeaders
    );
    if (!reopenRes.data.success || reopenRes.data.data.status !== 'active') {
      throw new Error('TEST 12 Failed: Failed to reopen cycle to active status.');
    }
    const dbReopenedPlan = await MonthlyGroceryPlan.findById(currentPlan._id);
    if (dbReopenedPlan.status !== 'active') {
      throw new Error(`TEST 12 Failed: Expected status 'active' in DB, got '${dbReopenedPlan.status}'.`);
    }
    console.log(`✓ TEST 12 Passed: Successfully toggled cycle status back to 'active'.\n`);
    passedTests++;

    console.log('================================================================');
    console.log(`🎯 PHASE 6 VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED!`);
    console.log('================================================================\n');
  } catch (error) {
    console.error(`\n❌ Phase 6 Test Failed: ${error.message}`);
    if (error.response?.data) {
      console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runPhase6Tests();
