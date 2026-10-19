const express = require('express');
const router = express.Router();
const {
  getCurrentMealPlan,
  generateNewMealPlan,
  swapMealSlot,
  getRecipeDetails,
  enrichRecipe,
} = require('../controllers/mealPlanController');
const { protect } = require('../middleware/authMiddleware');

// All meal plan routes require authentication
router.use(protect);

router.get('/current', getCurrentMealPlan);
router.post('/generate', generateNewMealPlan);
router.post('/swap', swapMealSlot);
router.get('/recipe/:dayId/:mealType', getRecipeDetails);
router.post('/recipe/enrich', enrichRecipe);

module.exports = router;
