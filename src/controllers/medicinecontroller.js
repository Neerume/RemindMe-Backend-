const Medicine = require('../models/medicine');
const MedicineLog = require('../models/medicinelog');
const mongoose = require('mongoose');


const addMedicine = async (req, res) => {
  try {
    const userId = req.user._id; // from JWT middleware
    const medicineData = { ...req.body, userId };
    const medicine = new Medicine(medicineData);
    await medicine.save();
    res.status(201).json({ success: true, medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

const getMedicine = async (req, res) => {
  try {
    const userId = req.user._id;
    const medicines = await Medicine.find({ userId });
    res.status(200).json({ success: true, medicines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const medicine = await Medicine.findOneAndUpdate(
      { _id: id, userId }, // ensure the user owns this medicine
      req.body,
      { new: true }
    );
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.status(200).json({ success: true, medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const medicine = await Medicine.findOneAndDelete({ _id: id, userId });
    if (!medicine)
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.status(200).json({ success: true, message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

const logAction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { medicineId, action } = req.body;

    // Check if medicine exists and belongs to user
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }

    if (medicine.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: Medicine does not belong to user" });
    }

    // Decrement pillCount if 'taken'
    if (action === 'taken' && medicine.pillCount != null) {
      const doseMatch = medicine.dose?.toString().match(/\d+/);
      const doseAmount = doseMatch ? parseInt(doseMatch[0]) : 1;
      const currentPillCount = typeof medicine.pillCount === 'number'
          ? medicine.pillCount
          : parseInt(medicine.pillCount) || 0;
      medicine.pillCount = Math.max(0, currentPillCount - doseAmount);
      await medicine.save();
    }

    // Create log entry
    const log = await MedicineLog.create({
      userId,        // no need to wrap in ObjectId
      medicineId,    // string is fine
      action
    });

    // Refill check
    let needsRefill = false;
    if (action === 'taken' && medicine.pillCount != null) {
      const doseMatch = medicine.dose?.toString().match(/\d+/);
      const doseAmount = doseMatch ? parseInt(doseMatch[0]) : 1;
      const remainingPills = typeof medicine.pillCount === 'number'
          ? medicine.pillCount
          : parseInt(medicine.pillCount) || 0;
      const daysRemaining = Math.floor(remainingPills / doseAmount);
      needsRefill = daysRemaining <= 7 && remainingPills > 0;
    }

    res.status(201).json({ 
      success: true, 
      log,
      medicine: {
        _id: medicine._id,
        name: medicine.name,
        pillCount: medicine.pillCount,
        needsRefill
      }
    });

  } catch (err) {
    console.error('Error in logAction:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// Generate monthly report
const generateReport = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get start date (first day of month)
    let startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Support optional query params: ?month=11&year=2025
    if (req.query.month && req.query.year) {
      startDate = new Date(parseInt(req.query.year), parseInt(req.query.month) - 1, 1);
    }

    // End date: first day of next month
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Fetch medicines
    const medicines = await Medicine.find({ userId });

    // Fetch logs in date range
    const logs = await MedicineLog.find({
      userId,
      createdAt: { $gte: startDate, $lt: endDate }
    });

    // Count actions
    const takenLogs = logs.filter(log => log.action === 'taken').length;
    const skippedLogs = logs.filter(log => log.action === 'skipped').length;
    const snoozedLogs = logs.filter(log => log.action === 'snoozed').length;
    const totalLogs = logs.length;

    // Adherence calculation
    let adherence = '0%';
    if (takenLogs + skippedLogs > 0) {
      adherence = `${Math.round((takenLogs / (takenLogs + skippedLogs)) * 100)}%`;
    } else if (totalLogs > 0) {
      adherence = `${Math.round((takenLogs / totalLogs) * 100)}%`;
    }

    const report = {
      totalMeds: medicines.length,
      takenCount: takenLogs,
      skippedCount: skippedLogs,
      snoozedCount: snoozedLogs,
      totalLogs,
      adherence,
      medList: medicines.map(med => ({
        id: med._id,
        name: med.name,
        dose: med.dose,
        pillCount: med.pillCount
      }))
    };

    res.status(200).json({ success: true, report });

  } catch (err) {
    console.error('Error in generateReport:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}


module.exports = { addMedicine, updateMedicine, getMedicine, deleteMedicine, logAction, generateReport };

