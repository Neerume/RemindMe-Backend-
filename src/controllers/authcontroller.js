const User = require('../models/users');
const jwt = require('jsonwebtoken');

// -------------------- Helper: normalize phone --------------------
function normalizePhone(phone) {
  if (!phone) return '';
  return phone.trim().replace(/^\+/, ''); // remove leading '+', trim spaces
}

// Temporary memory to store OTPs and verification status
// { normalizedPhone: { otp: '222222', verified: true/false } }
const otpStore = {};

// -------------------- Send OTP (static for now) --------------------
const sendOtp = async (req, res) => {
  let { phoneNumber } = req.body;
  phoneNumber = normalizePhone(phoneNumber);

  const STATIC_OTP = "222222";

  // Save OTP and mark as unverified
  otpStore[phoneNumber] = { otp: STATIC_OTP, verified: false };

  res.json({
    success: true,
    otp: STATIC_OTP, // For testing only, remove in production
    message: "Static OTP generated."
  });
};

// -------------------- Verify OTP --------------------
const verifyotp = async (req, res) => {
  let { phoneNumber, otp } = req.body;
  phoneNumber = normalizePhone(phoneNumber);

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

// -------------------- Login --------------------
const login = async (req, res) => {
  let { phoneNumber, name } = req.body;
  phoneNumber = normalizePhone(phoneNumber);

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

    // Generate JWT including _id (internal user ID)
    const token = jwt.sign(
      { _id: user._id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET
    );

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// -------------------- Get user profile --------------------
const getProfile = async (req, res) => {
  try {
    const normalizedPhone = normalizePhone(req.user.phoneNumber);
    const user = await User.findOne({ phoneNumber: normalizedPhone });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// -------------------- Update user profile --------------------
const updateProfile = async (req, res) => {
  const { name, email, photo } = req.body;
  try {
    const normalizedPhone = normalizePhone(req.user.phoneNumber);
    const user = await User.findOneAndUpdate(
      { phoneNumber: normalizedPhone },
      { name, email, photo },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login, getProfile, updateProfile, sendOtp, verifyotp };