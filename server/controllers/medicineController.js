const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');

const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

/**
 * @desc    Get all active medicines for authenticated user along with today's status logs
 * @route   GET /api/medicines
 * @access  Private
 */
const getMedicines = async (req, res) => {
  try {
    const userId = req.user._id;
    const date = req.query.date || getTodayDateStr();

    const medicines = await Medicine.find({ user: userId, isActive: true }).sort({
      createdAt: -1,
    });

    // Fetch existing dose logs for this date
    const logs = await MedicineLog.find({
      user: userId,
      date: date,
      medicine: { $in: medicines.map((m) => m._id) },
    });

    const logsByMedId = {};
    logs.forEach((log) => {
      logsByMedId[log.medicine.toString()] = log;
    });

    // Merge status into response
    const combinedMedicines = medicines.map((med) => {
      const medObj = med.toObject();
      const todayLog = logsByMedId[med._id.toString()];
      medObj.status = todayLog ? todayLog.status : 'pending';
      medObj.recordedTime = todayLog ? todayLog.recordedTime : null;
      medObj.logId = todayLog ? todayLog._id : null;
      return medObj;
    });

    // Calculate adherence for selected date
    const totalCount = combinedMedicines.length;
    const takenCount = combinedMedicines.filter((m) => m.status === 'taken').length;
    const skippedCount = combinedMedicines.filter((m) => m.status === 'skipped').length;
    const adherenceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

    res.status(200).json({
      success: true,
      date,
      medicines: combinedMedicines,
      metrics: {
        totalMeds: totalCount,
        takenMeds: takenCount,
        skippedMeds: skippedCount,
        pendingMeds: totalCount - takenCount - skippedCount,
        adherenceRate,
      },
      reminderNotice:
        'In-app reminders are active while WellSync is open. Since native OS push notifications are not configured, keep this dashboard active for timely alerts.',
    });
  } catch (error) {
    console.error('[Medicine Controller Error - getMedicines]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve medicine records.',
    });
  }
};

/**
 * @desc    Create a new medicine record
 * @route   POST /api/medicines
 * @access  Private
 */
const createMedicine = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      type,
      dosage,
      timing,
      scheduleTime,
      frequency,
      startDate,
      endDate,
      instructions,
      remindersEnabled,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a medicine or supplement name.',
      });
    }

    if (!dosage || !dosage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide dosage as entered on prescription or bottle.',
      });
    }

    const validTimings = ['Morning', 'Afternoon', 'Evening', 'Bedtime', 'As Needed'];
    const selectedTiming = validTimings.includes(timing) ? timing : 'Morning';

    const newMed = await Medicine.create({
      user: userId,
      name: name.trim(),
      type: type || 'Supplement',
      dosage: dosage.trim(),
      timing: selectedTiming,
      scheduleTime: scheduleTime || (selectedTiming === 'Bedtime' ? '10:00 PM' : '08:00 AM'),
      frequency: frequency || 'Daily',
      startDate: startDate || getTodayDateStr(),
      endDate: endDate || null,
      instructions: instructions ? instructions.trim() : 'Take as directed with water',
      remindersEnabled: remindersEnabled !== undefined ? Boolean(remindersEnabled) : true,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added to your daily wellness schedule.',
      medicine: newMed,
    });
  } catch (error) {
    console.error('[Medicine Controller Error - createMedicine]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create medicine record.',
    });
  }
};

/**
 * @desc    Update an existing medicine record
 * @route   PUT /api/medicines/:id
 * @access  Private
 */
const updateMedicine = async (req, res) => {
  try {
    const userId = req.user._id;
    const medId = req.params.id;

    const med = await Medicine.findOne({ _id: medId, user: userId });
    if (!med) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found or unauthorized.',
      });
    }

    const {
      name,
      type,
      dosage,
      timing,
      scheduleTime,
      frequency,
      startDate,
      endDate,
      instructions,
      remindersEnabled,
      isActive,
    } = req.body;

    if (name) med.name = name.trim();
    if (type) med.type = type;
    if (dosage) med.dosage = dosage.trim();
    if (timing) med.timing = timing;
    if (scheduleTime) med.scheduleTime = scheduleTime;
    if (frequency) med.frequency = frequency;
    if (startDate) med.startDate = startDate;
    if (endDate !== undefined) med.endDate = endDate;
    if (instructions !== undefined) med.instructions = instructions.trim();
    if (remindersEnabled !== undefined) med.remindersEnabled = Boolean(remindersEnabled);
    if (isActive !== undefined) med.isActive = Boolean(isActive);

    await med.save();

    res.status(200).json({
      success: true,
      message: 'Medicine record updated successfully.',
      medicine: med,
    });
  } catch (error) {
    console.error('[Medicine Controller Error - updateMedicine]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medicine record.',
    });
  }
};

/**
 * @desc    Delete (or soft-delete) medicine
 * @route   DELETE /api/medicines/:id
 * @access  Private
 */
const deleteMedicine = async (req, res) => {
  try {
    const userId = req.user._id;
    const medId = req.params.id;

    const med = await Medicine.findOneAndDelete({ _id: medId, user: userId });
    if (!med) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found or unauthorized.',
      });
    }

    // Clean up associated logs
    await MedicineLog.deleteMany({ user: userId, medicine: medId });

    res.status(200).json({
      success: true,
      message: 'Medicine removed from your schedule.',
      deletedId: medId,
    });
  } catch (error) {
    console.error('[Medicine Controller Error - deleteMedicine]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medicine record.',
    });
  }
};

/**
 * @desc    Record or update dose compliance status (taken, skipped, missed, pending)
 * @route   PATCH /api/medicines/:id/status
 * @access  Private
 */
const setDoseStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const medId = req.params.id;
    const { status, date, timingSlot, notes } = req.body;

    const validStatuses = ['taken', 'skipped', 'missed', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be taken, skipped, missed, or pending.',
      });
    }

    const med = await Medicine.findOne({ _id: medId, user: userId });
    if (!med) {
      return res.status(404).json({
        success: false,
        message: 'Medicine record not found or unauthorized.',
      });
    }

    const logDate = date || getTodayDateStr();
    const slot = timingSlot || med.timing || 'Morning';

    // Safe status update / upsert using unique compound key
    const recordedTime =
      status === 'taken' || status === 'skipped'
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;

    const log = await MedicineLog.findOneAndUpdate(
      {
        user: userId,
        medicine: medId,
        date: logDate,
        timingSlot: slot,
      },
      {
        $set: {
          status: status,
          recordedTime: recordedTime,
          notes: notes ? notes.trim() : '',
        },
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: `Dose marked as ${status}.`,
      log,
      status,
      recordedTime,
    });
  } catch (error) {
    console.error('[Medicine Controller Error - setDoseStatus]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dose status.',
    });
  }
};

/**
 * @desc    Toggle reminder notifications for a medicine
 * @route   PATCH /api/medicines/:id/toggle-reminder
 * @access  Private
 */
const toggleReminder = async (req, res) => {
  try {
    const userId = req.user._id;
    const medId = req.params.id;

    const med = await Medicine.findOne({ _id: medId, user: userId });
    if (!med) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found or unauthorized.',
      });
    }

    med.remindersEnabled = !med.remindersEnabled;
    await med.save();

    res.status(200).json({
      success: true,
      remindersEnabled: med.remindersEnabled,
      message: `Reminders ${med.remindersEnabled ? 'enabled' : 'muted'} for ${med.name}.`,
    });
  } catch (error) {
    console.error('[Medicine Controller Error - toggleReminder]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle reminders.',
    });
  }
};

/**
 * @desc    Get adherence analytics history
 * @route   GET /api/medicines/compliance
 * @access  Private
 */
const getComplianceHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = Math.max(1, Math.min(30, parseInt(req.query.days, 10) || 7));

    const totalActiveMeds = await Medicine.countDocuments({ user: userId, isActive: true });

    const logs = await MedicineLog.find({ user: userId }).sort({ date: -1 }).limit(days * 10);

    const logsByDate = {};
    logs.forEach((l) => {
      if (!logsByDate[l.date]) logsByDate[l.date] = { taken: 0, skipped: 0, missed: 0, total: 0 };
      if (l.status === 'taken') logsByDate[l.date].taken += 1;
      if (l.status === 'skipped') logsByDate[l.date].skipped += 1;
      if (l.status === 'missed') logsByDate[l.date].missed += 1;
      logsByDate[l.date].total += 1;
    });

    res.status(200).json({
      success: true,
      totalActiveMeds,
      logsByDate,
    });
  } catch (error) {
    console.error('[Medicine Controller Error - getComplianceHistory]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve compliance history.',
    });
  }
};

module.exports = {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  setDoseStatus,
  toggleReminder,
  getComplianceHistory,
};
