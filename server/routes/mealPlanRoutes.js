const express = require('express');
const router = express.Router();
const {
  getCurrentMealPlan,
  generateNewMealPlan,
  swapMealSlot,
} = require('../controllers/mealPlanController');
const { protect } = require('../middleware/authMiddleware');

// All meal plan routes require authentication
router.use(protect);

router.get('/current', getCurrentMealPlan);
router.post('/generate', generateNewMealPlan);
router.post('/swap', swapMealSlot);

module.exports = router;
