const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  setDoseStatus,
  toggleReminder,
  getComplianceHistory,
} = require('../controllers/medicineController');

// Protect all medicine endpoints
router.use(protect);

router.route('/')
  .get(getMedicines)
  .post(createMedicine);

router.get('/compliance', getComplianceHistory);

router.route('/:id')
  .put(updateMedicine)
  .delete(deleteMedicine);

router.patch('/:id/status', setDoseStatus);
router.patch('/:id/toggle-reminder', toggleReminder);

module.exports = router;
