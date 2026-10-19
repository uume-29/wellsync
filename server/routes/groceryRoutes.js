const express = require('express');
const router = express.Router();
const {
  getAvailableMonths,
  getCurrentOrSelectedPlan,
  generateOrRefreshMonthlyPlan,
  addCustomGroceryItem,
  updateGroceryItem,
  deleteGroceryItem,
  toggleItemPurchased,
  addItemToPantry,
  recordGroceryBill,
  removeGroceryBill,
  getBudgetAlternatives,
  transferAllPurchasedToPantry,
  finalizeMonthlyPlan,
} = require('../controllers/groceryController');
const { protect } = require('../middleware/authMiddleware');

// All grocery routes require authentication
router.use(protect);

router.get('/months', getAvailableMonths);
router.get('/current', getCurrentOrSelectedPlan);
router.post('/generate', generateOrRefreshMonthlyPlan);
router.patch('/finalize', finalizeMonthlyPlan);
router.post('/transfer-purchased', transferAllPurchasedToPantry);
router.post('/items', addCustomGroceryItem);
router.put('/items/:itemId', updateGroceryItem);
router.delete('/items/:itemId', deleteGroceryItem);
router.patch('/items/:itemId/purchase', toggleItemPurchased);
router.post('/items/:itemId/add-to-pantry', addItemToPantry);

// Budget management & actual shopping bill tracking
router.get('/budget-alternatives', getBudgetAlternatives);
router.post('/bills', recordGroceryBill);
router.delete('/bills/:billId', removeGroceryBill);

module.exports = router;
