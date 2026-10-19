const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDiaryByDate,
  getDiaryHistory,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  analyzeFoodPhoto,
} = require('../controllers/foodDiaryController');

// All food diary endpoints are protected
router.use(protect);

router.route('/')
  .get(getDiaryByDate)
  .post(createDiaryEntry);

router.get('/history', getDiaryHistory);

router.post('/analyze-image', analyzeFoodPhoto);

router.route('/:id')
  .put(updateDiaryEntry)
  .delete(deleteDiaryEntry);

module.exports = router;
