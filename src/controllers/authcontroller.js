const User = require('../models/users');
const jwt = require('jsonwebtoken'); 

const login = async(req, res)=>{
  const { phoneNumber, name} = req.body; //this includes name from flutter after otp

   try {
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber, name: name || 'User' }); // Use provided name or default
      await user.save(); //saves to db 
    } else {
      // If user exists, update name if provided
      if (name) user.name = name;
      await user.save();
    }
    const token = jwt.sign({ phoneNumber: user.phoneNumber }, process.env.JWT_SECRET);
    //this cretaes a token for user with this phone number 

    res.json({ token, user });  // Sends a JSON response to the frontend (Flutter app)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProfile = async (req, res) => {
    try {
    const user = await User.findOne({ phoneNumber: req.user.phoneNumber });
    res.json(user); //gives json response of user detail
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async(req, res)=>{
 const { name, email } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber: req.user.phoneNumber },
      { name, email }, // Updates only provided fields
      { new: true } // Returns updated user
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports ={ login, getProfile, updateProfile};  ///this is exporting as an objects