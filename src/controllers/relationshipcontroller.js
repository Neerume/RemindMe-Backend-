const Relationship = require('../models/relationship');
const User = require('../models/userModel');




// Invite Caregiver via link
const inviteCaregiver = async (req, res) => {
  const { inviterId } = req.params; // The user who sent the invite
  const { email } = req.query; // Optionally, email of the invited person

  try {
    // Check if invited user exists
    const invitedUser = await User.findOne({ email });

    if (invitedUser) {
      // If user exists, create relationship immediately
      const exists = await Relationship.findOne({
        inviterId,
        invitedId: invitedUser._id,
        role: 'caregiver'
      });
      if (exists) return res.send('Caregiver already added.');

      const relationship = new Relationship({
        inviterId,
        invitedId: invitedUser._id,
        role: 'caregiver'
      });
      await relationship.save();
      return res.send('Caregiver relationship added successfully!');
    } else {
      // User does not exist yet → save as pending invitation
      // You can create a PendingInvitation model or just store in Relationship with a "pending" flag
      const pending = new Relationship({
        inviterId,
        invitedEmail: email,
        role: 'caregiver',
        status: 'pending'
      });
      await pending.save();
      return res.send('Invite saved! The user can join later.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Invite Patient via link (similar)
const invitePatient = async (req, res) => {
  const { inviterId } = req.params; // Caregiver ID
  const { email } = req.query; // Patient email

  try {
    const invitedUser = await User.findOne({ email });

    if (invitedUser) {
      const exists = await Relationship.findOne({
        inviterId,
        invitedId: invitedUser._id,
        role: 'patient'
      });
      if (exists) return res.send('Patient already added.');

      const relationship = new Relationship({
        inviterId,
        invitedId: invitedUser._id,
        role: 'patient'
      });
      await relationship.save();
      return res.send('Patient relationship added successfully!');
    } else {
      const pending = new Relationship({
        inviterId,
        invitedEmail: email,
        role: 'patient',
        status: 'pending'
      });
      await pending.save();
      return res.send('Invite saved! The user can join later.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new relationship when someone joins via invite link
const addRelationship = async (req, res) => {
  try {
    const { inviterId, invitedId, role } = req.body;

    // Check if relationship already exists
    const exists = await Relationship.findOne({ inviterId, invitedId });
    if (exists) {
      return res.status(400).json({ message: 'User already invited' });
    }

    const relationship = new Relationship({
      inviterId,
      invitedId,
      role,
    });

    await relationship.save();

    res.status(201).json({ message: 'User added successfully', relationship });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all caregivers for a specific patient
const getCaregivers = async (req, res) => {
  try {
    const userId = req.params.userId;

    const caregivers = await Relationship.find({ invitedId: userId, role: 'caregiver' })
      .populate('inviterId', 'name phoneNumber photo')
      .populate('invitedId', 'name phoneNumber photo');

    res.status(200).json(caregivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all patients for a specific caregiver
const getPatient = async (req, res) => {
  try {
    const userId = req.params.userId;

    const patients = await Relationship.find({ inviterId: userId, role: 'patient' })
      .populate('inviterId', 'name phoneNumber photo')
      .populate('invitedId', 'name phoneNumber photo');

    res.status(200).json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a relationship
const deleteRelation = async (req, res) => {
  try {
    const { id } = req.params;

    const relationship = await Relationship.findByIdAndDelete(id);
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }

    res.status(200).json({ message: 'Relationship deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { inviteCaregiver, invitePatient, addRelationship, deleteRelation, getCaregivers, getPatient };
