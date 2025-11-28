const Medicine = require('../models/medicine');
const jwt = require('jsonwebtoken');
const MedicineLog = require('../models/medicinelog');

const addMedicine = async(req,res)=>{
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
const getMedicine = async(req,res)=>{
  try {
    const userId = req.user._id;
    const medicines = await Medicine.find({ userId });
    res.status(200).json({ success: true, medicines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
const updateMedicine = async(req,res)=>{
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
const deleteMedicine = async(req,res)=>{
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
  const { userId, medicineId, action } = req.body;
  try {
    const log = await MedicineLog.create({ userId, medicineId, action });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
const generateReport = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all medicines for the user
    const medicines = await Medicine.find({ userId });

    // Get all medicine logs for the user in the last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const logs = await MedicineLog.find({
      userId,
      createdAt: { $gte: lastMonth }
    });

    const report = {
      totalMeds: medicines.length,
      takenCount: logs.filter(log => log.action === 'Taken').length,
      skippedCount: logs.filter(log => log.action === 'Skipped').length,
      adherence: medicines.length > 0
        ? `${Math.round((logs.filter(log => log.action === 'Taken').length / medicines.length) * 100)}%`
        : '0%',
      medList: medicines.map(med => med.name)
    };

    res.status(200).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}


module.exports= {addMedicine, updateMedicine, getMedicine, deleteMedicine, logAction, generateReport};
