// models/Medicine.js
const mongoose = require('mongoose');

const medicineTimeSchema = new mongoose.Schema({   //since here we can store as nested object and use it in the below schema
  hour: { type: Number, required: true },
  minute: { type: Number, required: true },
  amPm: { type: String, required: true },
});

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dose: { type: String, default: '1 tablet' },
  pillCount: { type: Number, default: 20 },
  instruction: { type: String, default: 'Before meal' },
  ringtone: { type: String, default: 'Dhum dhum' },
  repeat: { type: String, default: 'Everyday' },
  photo: { type: String, default: null }, // base64 or URL
  alarms: [medicineTimeSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // link to user
}, { timestamps: true });
  
module.exports = mongoose.model('Medicine', medicineSchema);
