const Medicine = require('../models/medicine');
const jwt = require('jsonwebtoken');

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

module.exports= {addMedicine, updateMedicine, getMedicine, deleteMedicine}
