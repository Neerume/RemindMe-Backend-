// models/MedicineLog.js
const mongoose = require('mongoose');

const medicineLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  action: { 
    type: String, 
    enum: ['taken', 'skipped', 'snoozed'], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now }, 
}, { timestamps: true });

module.exports = mongoose.model('MedicineLog', medicineLogSchema);
