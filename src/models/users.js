      const mongoose = require('mongoose');

      const userSchema = new mongoose.Schema({
        phoneNumber: { type: String, required: true, unique: true },
        name: { type: String, required: true, default: 'User' },
        email: { type: String, required: false },
        createdAt: { type: Date, default: Date.now },
      }); 

      module.exports = mongoose.model('User', userSchema);
      