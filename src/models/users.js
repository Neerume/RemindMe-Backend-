      const mongoose = require('mongoose');

      const userSchema = new mongoose.Schema({
        phoneNumber: { type: String, required: true, unique: true },
        name: { type: String, required: true, default: 'User' },
        createdAt: { type: Date, default: Date.now },
        photo: { type: String, default: '' }
      }); 

      module.exports = mongoose.model('User', userSchema);
      