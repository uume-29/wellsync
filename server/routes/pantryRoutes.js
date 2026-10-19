const express = require('express');
const router = express.Router();
const {
  getPantryItems,
  addPantryItem,
  updatePantryItem,
  togglePantryStatus,
  deletePantryItem,
} = require('../controllers/pantryController');
const { protect } = require('../middleware/authMiddleware');

// All pantry routes are protected
router.use(protect);

router.route('/').get(getPantryItems).post(addPantryItem);
router.route('/:id').put(updatePantryItem).delete(deletePantryItem);
router.route('/:id/toggle').patch(togglePantryStatus);

module.exports = router;
