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
    const userId = req.user._id;  // get user from JWT
    const { medicineId, action } = req.body;

    // Validate input
    if (!medicineId || !action) {
      return res.status(400).json({ success: false, message: 'medicineId and action are required' });
    }

    // Check if medicine exists and belongs to user
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }

    if (medicine.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: Medicine does not belong to user" });
    }

    // Create log entry
    const log = await MedicineLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      medicineId: new mongoose.Types.ObjectId(medicineId),
      action
    });

    res.status(201).json({ success: true, log });
  } catch (err) {
    console.error('Error in logAction:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

const generateReport = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all medicines for the user
    const medicines = await Medicine.find({ userId });

    // Get date range - last month by default, or use query params
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // Optional: support month/year query params
    let startDate = lastMonth;
    if (req.query.month && req.query.year) {
      startDate = new Date(parseInt(req.query.year), parseInt(req.query.month) - 1, 1);
    }

    // Get all medicine logs for the user in the specified period
    const logs = await MedicineLog.find({
      userId,
      createdAt: { $gte: startDate }
    });

    // Count actions
    const takenLogs = logs.filter(log => log.action === 'taken').length;
    const skippedLogs = logs.filter(log => log.action === 'skipped').length;
    const snoozedLogs = logs.filter(log => log.action === 'snoozed').length;
    const totalLogs = logs.length;

    // Calculate adherence: (taken / (taken + skipped)) * 100
    // This gives a percentage of how many times medicine was taken vs skipped
    let adherence = '0%';
    if (takenLogs + skippedLogs > 0) {
      const adherenceValue = Math.round((takenLogs / (takenLogs + skippedLogs)) * 100);
      adherence = `${adherenceValue}%`;
    } else if (totalLogs > 0) {
      // If only snoozed logs exist, calculate based on total
      adherence = `${Math.round((takenLogs / totalLogs) * 100)}%`;
    }

    const report = {
      totalMeds: medicines.length,
      takenCount: takenLogs,
      skippedCount: skippedLogs,
      snoozedCount: snoozedLogs,
      totalLogs: totalLogs,
      adherence: adherence,
      medList: medicines.map(med => ({
        id: med._id,
        name: med.name,
        dose: med.dose
      }))
    };

    res.status(200).json({ success: true, report });
  } catch (err) {
    console.error('Error in generateReport:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { addMedicine, updateMedicine, getMedicine, deleteMedicine, logAction, generateReport };