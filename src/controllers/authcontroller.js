const User = require('../models/users');
const jwt = require('jsonwebtoken');

// Temporary memory to store OTPs and verification status
const otpStore = {}; // { phoneNumber: { otp: '222222', verified: true/false } }

// Send OTP (static for now)
const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;
  const STATIC_OTP = "222222";

  // Save OTP and mark as unverified
  otpStore[phoneNumber] = { otp: STATIC_OTP, verified: false };

  res.json({
    success: true,
    otp: STATIC_OTP, // For testing only, remove in production
    message: "Static OTP generated."
  });
};

// Verify OTP
const verifyotp = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!otpStore[phoneNumber]) {
    return res.status(400).json({ error: "No OTP sent for this phone number" });
  }

  if (otpStore[phoneNumber].otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // Mark OTP as verified
  otpStore[phoneNumber].verified = true;

  res.json({ success: true, message: "OTP verified successfully" });
};

// Login
const login = async (req, res) => {
  const { phoneNumber, name } = req.body;

  try {
    let user = await User.findOne({ phoneNumber });
    const isNewUser = !user;

    if (isNewUser) {
      // Must verify OTP first
      if (!otpStore[phoneNumber] || !otpStore[phoneNumber].verified) {
        return res.status(400).json({ error: "OTP not verified" });
      }

      // Create new user
      user = new User({ phoneNumber, name: name || 'User' });
      await user.save();
    } else {
      // Existing user → update name if provided
      if (name) user.name = name;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ phoneNumber: user.phoneNumber }, process.env.JWT_SECRET);

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ phoneNumber: req.user.phoneNumber });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber: req.user.phoneNumber },
      { name, email },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login, getProfile, updateProfile, sendOtp, verifyotp };
