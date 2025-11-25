const mongoose = require ('mongoose');

const relationshipSchema = new mongoose.Schema({
  inviterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  invitedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
    role: {
    type: String,
    enum: ['caregiver', 'patient'],
    required: true,
  },

  connectedAt: {
    type: Date,
    default: Date.now,
  }

})
module.exports = mongoose.model('Relationship', relationshipSchema);
