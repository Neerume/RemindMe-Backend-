const Relationship = require('../models/relationship');
const User = require('../models/users');

// Invite Caregiver via link (sets status to 'pending')
const inviteCaregiver = async (req, res) => {
  const { inviterId } = req.params;
  const currentUserId = req.query.userId;

  try {
    if (!currentUserId) {
      return res.status(401).json({ message: 'You must log in to accept this invitation.' });
    }

    // Prevent self-invites
    if (inviterId === currentUserId) {
      return res.status(400).json({ message: 'You cannot invite yourself.' });
    }

    const exists = await Relationship.findOne({
      inviterId,
      invitedId: currentUserId,
      role: 'caregiver'
    });
    if (exists) return res.status(400).json({ message: 'Caregiver already invited.' });

    const relationship = new Relationship({
      inviterId,
      invitedId: currentUserId,
      role: 'caregiver',
      status: 'pending' // New status field
    });

    await relationship.save();
    res.status(201).json({ message: 'Caregiver invitation sent successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Invite Patient via link (sets status to 'pending')
const invitePatient = async (req, res) => {
  const { inviterId } = req.params;
  const currentUserId = req.query.userId;

  try {
    if (!currentUserId) {
      return res.status(401).json({ message: 'You must log in to accept this invitation.' });
    }

    // Prevent self-invites
    if (inviterId === currentUserId) {
      return res.status(400).json({ message: 'You cannot invite yourself.' });
    }

    const exists = await Relationship.findOne({
      inviterId,
      invitedId: currentUserId,
      role: 'patient'
    });
    if (exists) return res.status(400).json({ message: 'Patient already invited.' });

    const relationship = new Relationship({
      inviterId,
      invitedId: currentUserId,
      role: 'patient',
      status: 'pending' // New status field
    });

    await relationship.save();
    res.status(201).json({ message: 'Patient invitation sent successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Respond to invite (accept or reject, updates status)
const respondInvite = async (req, res) => {
  const { inviterId, inviteeId, type, action } = req.body;
  try {
    const relationship = await Relationship.findOne({ inviterId, invitedId: inviteeId, role: type });
    if (!relationship) return res.status(404).json({ message: 'Invitation not found.' });

    // Prevent responding to already processed invites
    if (relationship.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already responded to.' });
    }

    if (action === 'accept') {
      relationship.status = 'accepted';
      await relationship.save();
      res.status(200).json({ message: 'Invitation accepted!' });
    } else if (action === 'reject') {
      relationship.status = 'rejected';
      await relationship.save();
      res.status(200).json({ message: 'Invitation declined.' });
    } else {
      res.status(400).json({ message: 'Invalid action.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new relationship manually
const addRelationship = async (req, res) => {
  try {
    const { inviterId, invitedId, role } = req.body;

    const exists = await Relationship.findOne({ inviterId, invitedId });
    if (exists) {
      return res.status(400).json({ message: 'User already invited' });
    }

    const relationship = new Relationship({ inviterId, invitedId, role, status: 'accepted' }); // Directly accepted for manual adds
    await relationship.save();

    res.status(201).json({ message: 'User added successfully', relationship });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all caregivers for a specific patient (only accepted)
const getCaregivers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const caregivers = await Relationship.find({ invitedId: userId, role: 'caregiver', status: 'accepted' })
      .populate('inviterId', 'name phoneNumber photo')
      .populate('invitedId', 'name phoneNumber photo');

    res.status(200).json(caregivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all patients for a specific caregiver (only accepted)
const getPatient = async (req, res) => {
  try {
    const userId = req.params.userId;
    const patients = await Relationship.find({ inviterId: userId, role: 'patient', status: 'accepted' })
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
    if (!relationship) return res.status(404).json({ message: 'Relationship not found' });

    res.status(200).json({ message: 'Relationship deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { inviteCaregiver, invitePatient, respondInvite, addRelationship, getCaregivers, getPatient, deleteRelation };
