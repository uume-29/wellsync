const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCaregivers,
  inviteCaregiver,
  verifyInvitation,
  acceptInvitation,
  updatePermissions,
  revokeCaregiver,
  getMyPatients,
  getPatientModuleData,
} = require('../controllers/caregiverController');

// Public route to inspect invitation metadata before logging in / accepting
router.get('/invitations/verify/:token', verifyInvitation);

// All subsequent routes require authentication
router.use(protect);

router.route('/')
  .get(getCaregivers);

router.post('/invite', inviteCaregiver);
router.post('/invitations/accept', acceptInvitation);

router.patch('/:id/permissions', updatePermissions);
router.delete('/:id', revokeCaregiver);

// Caregiver viewer routes
router.get('/patients', getMyPatients);
router.get('/patient/:grantId/:module', getPatientModuleData);

module.exports = router;
