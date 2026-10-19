const MonthlyGroceryPlan = require('../models/MonthlyGroceryPlan');
const PantryItem = require('../models/PantryItem');
const MealPlan = require('../models/MealPlan');
const Profile = require('../models/Profile');
const {
  cleanIngredientName,
  categorizeIngredient,
  parseQuantityString,
  toBaseQuantity,
  formatFromBase,
  canConvert,
  canonicalizeUnit,
  deductPantryStock,
} = require('../utils/unitConverter');

/**
 * Helper to get current YYYY-MM
 */
const getCurrentMonthStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * @desc    Get list of all monthly grocery plans (history) for user
 * @route   GET /api/grocery/months
 * @access  Private
 */
exports.getAvailableMonths = async (req, res) => {
  try {
    const plans = await MonthlyGroceryPlan.find({ user: req.user._id })
      .select('month status householdSize summary createdAt updatedAt')
      .sort({ month: -1 });

    const currentMonth = getCurrentMonthStr();
    const existingMonthStrs = plans.map((p) => p.month);

    // If current month is not in existing plans, include it as an option in the list
    const monthList = [...existingMonthStrs];
    if (!monthList.includes(currentMonth)) {
      monthList.unshift(currentMonth);
    }

    res.status(200).json({
      success: true,
      currentMonth,
      months: monthList,
      plans,
    });
  } catch (error) {
    console.error(`[Grocery getAvailableMonths Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve grocery plan history',
      error: error.message,
    });
  }
};

/**
 * @desc    Get grocery plan for current or specified month
 * @route   GET /api/grocery/current
 * @access  Private
 */
exports.getCurrentOrSelectedPlan = async (req, res) => {
  try {
    const targetMonth = req.query.month || getCurrentMonthStr();

    let plan = await MonthlyGroceryPlan.findOne({
      user: req.user._id,
      month: targetMonth,
    });

    const activeMealPlan = await MealPlan.findOne({
      user: req.user._id,
      isActive: true,
    }).select('_id title days');

    res.status(200).json({
      success: true,
      month: targetMonth,
      hasMealPlan: Boolean(activeMealPlan),
      mealPlanTitle: activeMealPlan ? activeMealPlan.title : null,
      data: plan,
    });
  } catch (error) {
    console.error(`[Grocery getCurrentOrSelectedPlan Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve grocery plan',
      error: error.message,
    });
  }
};

/**
 * Internal helper to synchronize and recalculate monthly grocery plan
 */
const syncGroceryPlanInternal = async (userId, targetMonthInput) => {
  try {
    const targetMonth = targetMonthInput || getCurrentMonthStr();

  // 1. Fetch user profile for household size
  const profile = await Profile.findOne({ user: userId });
  const householdSize = profile?.householdSize && profile.householdSize >= 1 ? profile.householdSize : 1;

  // 2. Fetch user's active meal plan
  const activeMealPlan = await MealPlan.findOne({
    user: userId,
    isActive: true,
  });

  // 3. Fetch user's pantry inventory
  const pantryItems = await PantryItem.find({ user: userId });

  // 4. Fetch existing plan for preservation of custom user additions and purchase status
  const existingPlan = await MonthlyGroceryPlan.findOne({
    user: userId,
    month: targetMonth,
  });

    // Map existing items for preservation
    const existingUserAdded = [];
    const existingStatusMap = new Map(); // key -> { isPurchased, purchasedAt, isUserEdited, neededQuantity, neededUnit, notes }

    if (existingPlan && Array.isArray(existingPlan.items)) {
      for (const item of existingPlan.items) {
        const normKey = cleanIngredientName(item.name).toLowerCase();
        if (item.isUserAdded) {
          existingUserAdded.push(item.toObject ? item.toObject() : item);
        } else {
          existingStatusMap.set(normKey, {
            isPurchased: item.isPurchased,
            purchasedAt: item.purchasedAt,
            isUserEdited: item.isUserEdited,
            neededQuantity: item.neededQuantity,
            neededUnit: item.neededUnit,
            notes: item.notes,
          });
        }
      }
    }

    // If no active meal plan exists
    if (!activeMealPlan || !Array.isArray(activeMealPlan.days) || activeMealPlan.days.length === 0) {
      // If we already have a plan with items (e.g. user added), return it with notice
      let plan = existingPlan;
      if (!plan) {
        plan = new MonthlyGroceryPlan({
          user: userId,
          month: targetMonth,
          householdSize,
          items: existingUserAdded,
          budget: {
            monthlyBudget: profile?.monthlyFoodBudget || 10000,
            plannedSpending: 0,
            actualSpending: 0,
            recordedBills: [],
          },
        });
        await plan.save();
      }

      return {
        success: true,
        hasMealPlan: false,
        message:
          'No active AI Meal Plan found. A meal plan is recommended to calculate exact monthly ingredient quantities. You can still manage your custom grocery items manually.',
        data: plan,
      };
    }

    // 5. Aggregate ingredients from active meal plan
    // Standard scaling: 7-day meal plan represents 1 week.
    // Monthly requirement = 4 weeks * householdSize.
    const MONTH_WEEKS_MULTIPLIER = 4;
    const totalScaleFactor = MONTH_WEEKS_MULTIPLIER * householdSize;

    // Map: normKey -> { name, category, totalBaseQuantity, unitType, originalUnit, count }
    const ingredientAggregation = new Map();

    for (const day of activeMealPlan.days) {
      const mealList = Array.isArray(day.meals)
        ? day.meals
        : day.meals && typeof day.meals === 'object'
        ? Object.values(day.meals)
        : [];

      for (const meal of mealList) {
        if (!meal || !Array.isArray(meal.ingredients)) continue;
        for (const ing of meal.ingredients) {
          if (!ing.name) continue;
          const cleanName = cleanIngredientName(ing.name);
          const normKey = cleanName.toLowerCase();
          const parsed = parseQuantityString(ing.quantity);

          // Convert to base units (e.g. grams, ml, or pieces)
          const baseData = toBaseQuantity(parsed.quantity, parsed.unit);

          // Multiply by household size & monthly weeks
          const scaledBaseQuantity = baseData.baseQuantity * totalScaleFactor;

          if (!ingredientAggregation.has(normKey)) {
            ingredientAggregation.set(normKey, {
              name: cleanName,
              category: categorizeIngredient(cleanName),
              totalBaseQuantity: scaledBaseQuantity,
              unitType: baseData.unitType,
              sampleUnit: parsed.unit,
            });
          } else {
            const current = ingredientAggregation.get(normKey);
            // If same unit type, sum base quantity
            if (current.unitType === baseData.unitType) {
              current.totalBaseQuantity += scaledBaseQuantity;
            } else {
              // Different unit type for same ingredient (e.g. pieces vs grams)
              // Keep both separately by distinct key
              const alternateKey = `${normKey}_${baseData.unitType}`;
              if (!ingredientAggregation.has(alternateKey)) {
                ingredientAggregation.set(alternateKey, {
                  name: cleanName,
                  category: categorizeIngredient(cleanName),
                  totalBaseQuantity: scaledBaseQuantity,
                  unitType: baseData.unitType,
                  sampleUnit: parsed.unit,
                });
              } else {
                ingredientAggregation.get(alternateKey).totalBaseQuantity += scaledBaseQuantity;
              }
            }
          }
        }
      }
    }

    // 6. Map pantry items by normalized name for deduction
    const pantryMap = new Map();
    for (const p of pantryItems) {
      const pKey = cleanIngredientName(p.name).toLowerCase();
      pantryMap.set(pKey, p);
    }

    // 7. Build calculated grocery item list with pantry deduction & unit mismatch handling
    const generatedItems = [];

    for (const [key, agg] of ingredientAggregation.entries()) {
      // Find matching pantry item
      // Try direct key or base name without unitType suffix
      const baseKey = key.split('_')[0];
      const matchingPantry = pantryMap.get(baseKey);

      let requiredQuantity = 0;
      let requiredUnit = '';
      let pantryQuantity = 0;
      let pantryUnit = '';
      let neededQuantity = 0;
      let neededUnit = '';
      let unitMismatch = false;
      let unitMismatchMessage = '';

      // Format required quantity from base
      const formattedReq = formatFromBase(agg.totalBaseQuantity, agg.unitType, agg.sampleUnit);
      requiredQuantity = formattedReq.quantity;
      requiredUnit = formattedReq.unit;

      if (matchingPantry && matchingPantry.quantity > 0 && matchingPantry.status !== 'used_up') {
        pantryUnit = matchingPantry.unit;
        pantryQuantity = matchingPantry.quantity;

        const deduction = deductPantryStock(
          requiredQuantity,
          requiredUnit,
          pantryQuantity,
          pantryUnit
        );

        neededQuantity = deduction.neededQuantity;
        neededUnit = deduction.neededUnit;
        unitMismatch = deduction.unitMismatch;
        unitMismatchMessage = deduction.unitMismatchMessage;
      } else {
        // Not in pantry or pantry item used up
        neededQuantity = requiredQuantity;
        neededUnit = requiredUnit;
      }

      // Check preservation from previous generation
      const existingStatus = existingStatusMap.get(baseKey);
      let isPurchased = false;
      let purchasedAt = null;
      let isUserEdited = false;
      let notes = '';

      if (existingStatus) {
        if (existingStatus.isPurchased) {
          isPurchased = true;
          purchasedAt = existingStatus.purchasedAt;
        }
        if (existingStatus.isUserEdited) {
          isUserEdited = true;
          neededQuantity = existingStatus.neededQuantity;
          neededUnit = existingStatus.neededUnit;
          notes = existingStatus.notes || '';
        }
      }

      generatedItems.push({
        name: agg.name,
        category: agg.category,
        requiredQuantity,
        requiredUnit,
        pantryQuantity,
        pantryUnit,
        neededQuantity,
        neededUnit,
        unitMismatch,
        unitMismatchMessage,
        isPurchased,
        purchasedAt,
        isUserAdded: false,
        isUserEdited,
        notes,
      });
    }

    // 8. Re-attach user-added custom items
    const allFinalItems = [...generatedItems, ...existingUserAdded];

    // 9. Compute budget values and preserve recorded shopping bills
    const existingBills = existingPlan?.budget?.recordedBills || [];
    const monthlyBudget = profile?.monthlyFoodBudget || 10000;
    const weeklyMealPlanCost = activeMealPlan?.summary?.weeklyEstimatedCost || 2500;
    const plannedSpending = Math.round(weeklyMealPlanCost * 4);
    const actualSpending = existingBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    // 10. Save or update MonthlyGroceryPlan
    let plan = existingPlan;
    if (!plan) {
      plan = new MonthlyGroceryPlan({
        user: userId,
        month: targetMonth,
        householdSize,
        sourceMealPlanId: activeMealPlan._id,
        items: allFinalItems,
        budget: {
          monthlyBudget,
          plannedSpending,
          actualSpending,
          recordedBills: existingBills,
        },
      });
    } else {
      plan.householdSize = householdSize;
      plan.sourceMealPlanId = activeMealPlan._id;
      plan.items = allFinalItems;
      plan.budget = {
        monthlyBudget,
        plannedSpending,
        actualSpending,
        recordedBills: existingBills,
      };
    }

    await plan.save();

    return {
      success: true,
      hasMealPlan: true,
      mealPlanTitle: activeMealPlan.title,
      message: `Monthly grocery plan for ${targetMonth} calculated successfully based on active meal plan (Household size: ${householdSize}).`,
      data: plan,
    };
  } catch (error) {
    console.error(`[Grocery syncGroceryPlanInternal Error]: ${error.message}`);
    throw error;
  }
};

exports.syncGroceryPlanInternal = syncGroceryPlanInternal;

/**
 * @desc    Generate or refresh monthly grocery plan from active meal plan & pantry
 * @route   POST /api/grocery/generate
 * @access  Private
 */
exports.generateOrRefreshMonthlyPlan = async (req, res) => {
  try {
    const result = await syncGroceryPlanInternal(req.user._id, req.body.month);
    res.status(200).json(result);
  } catch (error) {
    console.error(`[Grocery generateOrRefreshMonthlyPlan Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly grocery plan',
      error: error.message,
    });
  }
};

/**
 * @desc    Add a custom item to the monthly grocery plan
 * @route   POST /api/grocery/items
 * @access  Private
 */
exports.addCustomGroceryItem = async (req, res) => {
  try {
    const { month, name, category, quantity, unit, notes } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required',
      });
    }

    const targetMonth = month || getCurrentMonthStr();
    let plan = await MonthlyGroceryPlan.findOne({
      user: req.user._id,
      month: targetMonth,
    });

    if (!plan) {
      const profile = await Profile.findOne({ user: req.user._id });
      plan = new MonthlyGroceryPlan({
        user: req.user._id,
        month: targetMonth,
        householdSize: profile?.householdSize || 1,
        items: [],
      });
    }

    const trimmedName = name.trim();
    const parsedQty = Math.max(0, parseFloat(quantity) || 1);
    const resolvedUnit = canonicalizeUnit(unit || 'piece');
    const resolvedCategory = category || categorizeIngredient(trimmedName);

    // Check if user has this item in pantry
    const matchingPantry = await PantryItem.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    let pantryQty = 0;
    let pantryUnit = '';
    let neededQty = parsedQty;

    if (matchingPantry && matchingPantry.quantity > 0 && matchingPantry.status !== 'used_up') {
      pantryQty = matchingPantry.quantity;
      pantryUnit = matchingPantry.unit;
      if (canConvert(resolvedUnit, pantryUnit)) {
        const reqBase = toBaseQuantity(parsedQty, resolvedUnit);
        const panBase = toBaseQuantity(pantryQty, pantryUnit);
        const diffBase = Math.max(0, reqBase.baseQuantity - panBase.baseQuantity);
        const formattedNeeded = formatFromBase(diffBase, reqBase.unitType);
        neededQty = formattedNeeded.quantity;
      }
    }

    const newItem = {
      name: trimmedName,
      category: resolvedCategory,
      requiredQuantity: parsedQty,
      requiredUnit: resolvedUnit,
      pantryQuantity: pantryQty,
      pantryUnit: pantryUnit,
      neededQuantity: neededQty,
      neededUnit: resolvedUnit,
      unitMismatch: false,
      isPurchased: false,
      isUserAdded: true,
      isUserEdited: false,
      notes: notes || '',
    };

    plan.items.unshift(newItem);
    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Custom grocery item added successfully',
      data: plan,
    });
  } catch (error) {
    console.error(`[Grocery addCustomGroceryItem Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to add grocery item',
      error: error.message,
    });
  }
};

/**
 * @desc    Edit a grocery item (quantity, unit, category, notes)
 * @route   PUT /api/grocery/items/:itemId
 * @access  Private
 */
exports.updateGroceryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { month, name, category, neededQuantity, neededUnit, notes } = req.body;

    const targetMonth = month || getCurrentMonthStr();
    const plan = await MonthlyGroceryPlan.findOne({
      user: req.user._id,
      month: targetMonth,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Monthly grocery plan not found',
      });
    }

    const item = plan.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Grocery item not found in plan',
      });
    }

    if (name !== undefined) item.name = name.trim();
    if (category !== undefined) item.category = category;
    if (neededQuantity !== undefined) {
      item.neededQuantity = Math.max(0, parseFloat(neededQuantity) || 0);
      item.isUserEdited = true;
    }
    if (neededUnit !== undefined) {
      item.neededUnit = canonicalizeUnit(neededUnit);
      item.isUserEdited = true;
    }
    if (notes !== undefined) item.notes = notes.trim();

    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Grocery item updated successfully',
      data: plan,
    });
  } catch (error) {
    console.error(`[Grocery updateGroceryItem Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update grocery item',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a grocery item from monthly plan
 * @route   DELETE /api/grocery/items/:itemId
 * @access  Private
 */
exports.deleteGroceryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const targetMonth = req.query.month || getCurrentMonthStr();

    const plan = await MonthlyGroceryPlan.findOne({
      user: req.user._id,
      month: targetMonth,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Monthly grocery plan not found',
      });
    }

    const itemIndex = plan.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Grocery item not found in plan',
      });
    }

    plan.items.splice(itemIndex, 1);
    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Grocery item removed from plan',
      data: plan,
    });
  } catch (error) {
    console.error(`[Grocery deleteGroceryItem Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to remove grocery item',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle purchased status for a grocery item
 * @route   PATCH /api/grocery/items/:itemId/purchase
 * @access  Private
 */
exports.toggleItemPurchased = async (req, res) => {
  try {
    const { itemId } = req.params;
    const targetMonth = req.body.month || req.query.month || getCurrentMonthStr();

    const plan = await MonthlyGroceryPlan.findOne({
      user: req.user._id,
      month: targetMonth,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Monthly grocery plan not found',
      });
    }

    const item = plan.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Grocery item not found in plan',
      });
    }

    item.isPurchased = !item.isPurchased;
    item.purchasedAt = item.isPurchased ? new Date() : null;

    await plan.save();

    res.status(200).json({
      success: true,
      message: `Item marked as ${item.isPurchased ? 'purchased' : 'pending'}`,
      data: plan,
    });
  } catch (error) {
    console.error(`[Grocery toggleItemPurchased Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle item purchase status',
      error: error.message,
    });
  }
};

/**
 * @desc    Add purchased grocery item directly into Pantry Inventory
 * @route   POST /api/grocery/items/:itemId/add-to-pantry
 * @access  Private
 */
exports.addItemToPantry = async (req, res) => {
  try {
    const { itemId } = req.params;
    const targetMonth = req.body.month || req.query.month || getCurrentMonthStr();

    const plan = await MonthlyGroceryPlan.findOne({
      user: req.user._id,
      month: targetMonth,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Monthly grocery plan not found',
      });
    }

    const item = plan.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Grocery item not found in plan',
      });
    }

    const qtyToAdd = item.neededQuantity > 0 ? item.neededQuantity : item.requiredQuantity || 1;
    const unitToAdd = item.neededUnit || item.requiredUnit || 'piece';

    // Check if pantry already has this item
    const existingPantry = await PantryItem.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    let pantryDoc;
    if (existingPantry) {
      if (canConvert(unitToAdd, existingPantry.unit)) {
        const addBase = toBaseQuantity(qtyToAdd, unitToAdd);
        const existingBase = toBaseQuantity(existingPantry.quantity, existingPantry.unit);
        const sumBase = existingBase.baseQuantity + addBase.baseQuantity;
        const formatted = formatFromBase(sumBase, addBase.unitType);
        existingPantry.quantity = formatted.quantity;
        existingPantry.unit = formatted.unit;
      } else {
        existingPantry.quantity += qtyToAdd;
      }
      existingPantry.status = 'available';
      await existingPantry.save();
      pantryDoc = existingPantry;
    } else {
      pantryDoc = await PantryItem.create({
        user: req.user._id,
        name: item.name,
        quantity: qtyToAdd,
        unit: unitToAdd,
        category: item.category,
        status: 'available',
        notes: `Added from ${targetMonth} grocery plan`,
      });
    }

    // Mark as purchased and transferred in the plan if not already
    item.isPurchased = true;
    if (!item.purchasedAt) item.purchasedAt = new Date();
    item.isTransferredToPantry = true;
    item.transferredToPantryAt = new Date();
    item.pantryQuantity = pantryDoc.quantity;
    item.pantryUnit = pantryDoc.unit;
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Added ${qtyToAdd} ${unitToAdd} of ${item.name} to Pantry Inventory`,
      pantryItem: pantryDoc,
      data: plan,
    });
  } catch (error) {
    console.error(`[Grocery addItemToPantry Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to pantry',
      error: error.message,
    });
  }
};

/**
 * @desc    Record actual grocery shopping bill for budget spending tracking
 * @route   POST /api/grocery/bills
 * @access  Private
 */
exports.recordGroceryBill = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { month, amount, store, date, notes } = req.body;

    if (amount === undefined || amount === null || isNaN(amount) || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid shopping bill amount in INR.',
      });
    }

    const targetMonth = month || getCurrentMonthStr();
    let plan = await MonthlyGroceryPlan.findOne({ user: userId, month: targetMonth });

    if (!plan) {
      const profile = await Profile.findOne({ user: userId });
      plan = new MonthlyGroceryPlan({
        user: userId,
        month: targetMonth,
        householdSize: profile?.householdSize || 1,
        budget: {
          monthlyBudget: profile?.monthlyFoodBudget || 10000,
          plannedSpending: 0,
          actualSpending: 0,
          recordedBills: [],
        },
        items: [],
      });
    }

    if (!plan.budget) {
      const profile = await Profile.findOne({ user: userId });
      plan.budget = {
        monthlyBudget: profile?.monthlyFoodBudget || 10000,
        plannedSpending: 0,
        actualSpending: 0,
        recordedBills: [],
      };
    }

    const newBill = {
      amount: Math.round(Number(amount)),
      store: store ? String(store).trim() : 'Grocery Store',
      date: date ? new Date(date) : new Date(),
      notes: notes ? String(notes).trim() : '',
    };

    plan.budget.recordedBills.push(newBill);
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Shopping bill of ₹${newBill.amount} recorded successfully.`,
      budget: plan.budget,
      data: plan,
    });
  } catch (error) {
    console.error(`[Record Grocery Bill Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to record shopping bill.',
      error: error.message,
    });
  }
};

/**
 * @desc    Remove a previously recorded grocery shopping bill
 * @route   DELETE /api/grocery/bills/:billId
 * @access  Private
 */
exports.removeGroceryBill = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { billId } = req.params;
    const targetMonth = req.query.month || req.body.month || getCurrentMonthStr();

    const plan = await MonthlyGroceryPlan.findOne({ user: userId, month: targetMonth });
    if (!plan || !plan.budget || !Array.isArray(plan.budget.recordedBills)) {
      return res.status(404).json({
        success: false,
        message: 'Monthly grocery plan or bill not found.',
      });
    }

    const initialLength = plan.budget.recordedBills.length;
    plan.budget.recordedBills = plan.budget.recordedBills.filter(
      (b) => b._id.toString() !== billId
    );

    if (plan.budget.recordedBills.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Specified shopping bill was not found.',
      });
    }

    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Shopping bill removed successfully.',
      budget: plan.budget,
      data: plan,
    });
  } catch (error) {
    console.error(`[Remove Grocery Bill Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to remove shopping bill.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get budget analytics, variance, and practical cheaper alternatives
 * @route   GET /api/grocery/budget-alternatives
 * @access  Private
 */
exports.getBudgetAlternatives = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const targetMonth = req.query.month || getCurrentMonthStr();

    const plan = await MonthlyGroceryPlan.findOne({ user: userId, month: targetMonth });
    const profile = await Profile.findOne({ user: userId });
    const activeMealPlan = await MealPlan.findOne({ user: userId, isActive: true });

    const monthlyBudget = plan?.budget?.monthlyBudget || profile?.monthlyFoodBudget || 10000;
    const plannedSpending =
      plan?.budget?.plannedSpending ||
      Math.round((activeMealPlan?.summary?.weeklyEstimatedCost || 2500) * 4);
    const actualSpending = plan?.budget?.actualSpending || 0;
    const remainingBudget = monthlyBudget - actualSpending;

    const isOverBudget = plannedSpending > monthlyBudget || actualSpending > monthlyBudget;
    const budgetDiff = plannedSpending - monthlyBudget;

    // Curated, practical and clinically validated budget-friendly ingredient swaps
    const budgetSwaps = [
      {
        premiumItem: 'Almonds / Cashews / Walnuts',
        budgetAlternative: 'Roasted Peanuts / Sunflower Seeds / Roasted Chana',
        savingsEstimated: '40% - 60%',
        clinicalNote: 'Provides equivalent healthy unsaturated fats, plant protein, and dietary fiber at a fraction of the cost.',
      },
      {
        premiumItem: 'Exotic Salad Greens / Baby Spinach',
        budgetAlternative: 'Local Palak, Methi, Mint & Fresh Seasonal Greens',
        savingsEstimated: '50% - 70%',
        clinicalNote: 'Local seasonal greens deliver equal or superior micronutrients (iron, vitamin A & K) with longer shelf life.',
      },
      {
        premiumItem: 'Imported Quinoa / Specialty Grains',
        budgetAlternative: 'Foxtail Millet / Dalia (Broken Wheat) / Brown Rice',
        savingsEstimated: '60% - 75%',
        clinicalNote: 'Millets and dalia provide complex low-glycemic carbohydrates and high satiety for sustained energy.',
      },
      {
        premiumItem: 'Store-Bought Hummus / Dips',
        budgetAlternative: 'Home-Prepared Chickpea & Sesame Hummus or Curd Raita',
        savingsEstimated: '65% - 80%',
        clinicalNote: 'Fresh home preparation avoids artificial preservatives while providing probiotic cultures and clean protein.',
      },
      {
        premiumItem: 'Packaged Spice Mixes / Pre-made Sauces',
        budgetAlternative: 'Whole Spices (Jeera, Dhaniya, Haldi) & Fresh Tomato Gravy',
        savingsEstimated: '50% - 65%',
        clinicalNote: 'Pure spices reduce hidden dietary sodium and added sugar commonly found in commercial jarred sauces.',
      },
      {
        premiumItem: 'Paneer / Cottage Cheese',
        budgetAlternative: 'Sprouted Moong / Kala Chana / Firm Tofu',
        savingsEstimated: '35% - 50%',
        clinicalNote: 'Sprouts and legumes provide dense plant protein with zero saturated dairy fats.',
      },
    ];

    res.status(200).json({
      success: true,
      analysis: {
        month: targetMonth,
        monthlyBudget,
        plannedSpending,
        actualSpending,
        remainingBudget,
        isOverBudget,
        budgetVariance:
          budgetDiff > 0
            ? `Planned meal costs exceed monthly budget by ₹${budgetDiff}`
            : `Planned meal costs are within budget with ₹${Math.abs(budgetDiff)} buffer`,
        spendingStatus:
          actualSpending > monthlyBudget
            ? 'over_budget'
            : actualSpending > monthlyBudget * 0.85
            ? 'approaching_limit'
            : 'on_track',
      },
      budgetSwaps,
      actionableTips: [
        'Buy legumes and whole grains in monthly family packs rather than weekly retail packets to save 15-25%.',
        'Check your Pantry Inventory before grocery shopping to avoid duplicate purchases of staple spices and grains.',
        'Prioritize seasonal local produce over imported off-season vegetables for better nutrient retention and lower cost.',
        'Batch-cook base gravies (onion-tomato-ginger-garlic) and freeze in portions to reduce fresh produce waste.',
      ],
    });
  } catch (error) {
    console.error(`[Budget Alternatives Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate budget alternatives.',
      error: error.message,
    });
  }
};

/**
 * @desc    Batch transfer all purchased grocery items directly into Pantry Inventory
 * @route   POST /api/grocery/transfer-purchased
 * @access  Private
 */
exports.transferAllPurchasedToPantry = async (req, res) => {
  try {
    const targetMonth = req.body.month || req.query.month || getCurrentMonthStr();

    const plan = await MonthlyGroceryPlan.findOne({
      user: req.user._id,
      month: targetMonth,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Monthly grocery plan for ${targetMonth} not found`,
      });
    }

    // Find purchased items that haven't been transferred yet
    const itemsToTransfer = plan.items.filter(
      (item) => item.isPurchased && !item.isTransferredToPantry
    );

    if (itemsToTransfer.length === 0) {
      const totalPurchased = plan.items.filter((item) => item.isPurchased).length;
      return res.status(200).json({
        success: true,
        message:
          totalPurchased > 0
            ? 'All purchased items have already been transferred to your Pantry Inventory.'
            : 'No purchased items found to transfer. Mark items as purchased first.',
        transferredCount: 0,
        data: plan,
      });
    }

    let transferredCount = 0;

    for (const item of itemsToTransfer) {
      const qtyToAdd = item.neededQuantity > 0 ? item.neededQuantity : item.requiredQuantity || 1;
      const unitToAdd = item.neededUnit || item.requiredUnit || 'piece';

      // Check if pantry already has this item
      const cleanName = cleanIngredientName(item.name);
      const existingPantry = await PantryItem.findOne({
        user: req.user._id,
        name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });

      let pantryDoc;
      if (existingPantry) {
        if (canConvert(unitToAdd, existingPantry.unit)) {
          const addBase = toBaseQuantity(qtyToAdd, unitToAdd);
          const existingBase = toBaseQuantity(existingPantry.quantity, existingPantry.unit);
          const sumBase = existingBase.baseQuantity + addBase.baseQuantity;
          const formatted = formatFromBase(sumBase, addBase.unitType);
          existingPantry.quantity = formatted.quantity;
          existingPantry.unit = formatted.unit;
        } else {
          existingPantry.quantity += qtyToAdd;
        }
        existingPantry.status = 'available';
        await existingPantry.save();
        pantryDoc = existingPantry;
      } else {
        pantryDoc = await PantryItem.create({
          user: req.user._id,
          name: item.name,
          quantity: qtyToAdd,
          unit: unitToAdd,
          category: item.category,
          status: 'available',
          notes: `Batch transferred from ${targetMonth} grocery plan`,
        });
      }

      item.isTransferredToPantry = true;
      item.transferredToPantryAt = new Date();
      item.pantryQuantity = pantryDoc.quantity;
      item.pantryUnit = pantryDoc.unit;
      transferredCount++;
    }

    await plan.save();

    res.status(200).json({
      success: true,
      message: `Successfully transferred ${transferredCount} purchased item(s) to Pantry Inventory`,
      transferredCount,
      data: plan,
    });
  } catch (error) {
    console.error(`[Grocery transferAllPurchasedToPantry Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to batch transfer purchased items to pantry',
      error: error.message,
    });
  }
};

/**
 * @desc    Finalize or update monthly grocery plan status ('active' | 'completed' | 'archived')
 * @route   PATCH /api/grocery/finalize
 * @access  Private
 */
exports.finalizeMonthlyPlan = async (req, res) => {
  try {
    const targetMonth = req.body.month || req.query.month || getCurrentMonthStr();
    const newStatus = req.body.status || 'completed';

    const validStatuses = ['active', 'completed', 'archived'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const plan = await MonthlyGroceryPlan.findOne({
      user: req.user._id,
      month: targetMonth,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Monthly grocery plan for ${targetMonth} not found`,
      });
    }

    plan.status = newStatus;
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Monthly grocery plan for ${targetMonth} status updated to ${newStatus}`,
      data: plan,
    });
  } catch (error) {
    console.error(`[Grocery finalizeMonthlyPlan Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update monthly plan status',
      error: error.message,
    });
  }
};

