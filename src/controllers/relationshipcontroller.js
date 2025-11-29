const mongoose = require("mongoose");
const Relationship = require("../models/relationship");
const User = require("../models/users");

// -------------------------------
// SEND INVITE (via share link)
// -------------------------------
const inviteCaregiver = async (req, res) => {
  const { inviterId } = req.params;
  const currentUserId = req.query.userId;

  try {
    if (!currentUserId) {
      return res.status(401).json({ message: "You must log in to open this invite." });
    }

    // Prevent self invites
    if (inviterId === currentUserId) {
      return res.status(400).json({ message: "You cannot invite yourself." });
    }

    // Check if pending/accepted invite already exists
    const exists = await Relationship.findOne({
      inviterId,
      invitedId: currentUserId,
      role: "caregiver",
    });

    if (exists) {
      return res.status(400).json({ message: "Caregiver already invited." });
    }

    // Create new invite
    await Relationship.create({
      inviterId,
      invitedId: currentUserId,
      role: "caregiver",
      status: "pending",
    });

    res.status(201).json({ message: "Caregiver invitation created successfully!" });
  } catch (err) {
    console.error("inviteCaregiver Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const invitePatient = async (req, res) => {
  const { inviterId } = req.params;
  const currentUserId = req.query.userId;

  try {
    if (!currentUserId) {
      return res.status(401).json({ message: "You must log in to open this invite." });
    }

    if (inviterId === currentUserId) {
      return res.status(400).json({ message: "You cannot invite yourself." });
    }

    const exists = await Relationship.findOne({
      inviterId,
      invitedId: currentUserId,
      role: "patient",
    });

    if (exists) {
      return res.status(400).json({ message: "Patient already invited." });
    }

    await Relationship.create({
      inviterId,
      invitedId: currentUserId,
      role: "patient",
      status: "pending",
    });

    res.status(201).json({ message: "Patient invitation created successfully!" });
  } catch (err) {
    console.error("invitePatient Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// -------------------------------
// RESPOND TO INVITE
// -------------------------------
const respondInvite = async (req, res) => {
  let { inviterId, inviteeId, type, action } = req.body;

  try {
    if (!inviterId || !inviteeId || !type || !action) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const inviterObjectId = new mongoose.Types.ObjectId(inviterId);
    const inviteeObjectId = new mongoose.Types.ObjectId(inviteeId);

    // Normalize role string
    const role = type.toLowerCase(); // caregiver / patient

    // Only update an existing pending invite
    const relationship = await Relationship.findOne({
      inviterId: inviterObjectId,
      invitedId: inviteeObjectId,
      role,
      status: "pending",
    });

    if (!relationship) {
      return res.status(404).json({ message: "No pending invitation found." });
    }

    // Update status
    relationship.status = action === "accept" ? "accepted" : "rejected";
    await relationship.save();

    res.status(200).json({
      message: `Invitation ${relationship.status}!`,
      relationship,
    });
  } catch (err) {
    console.error("respondInvite Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// -------------------------------
// FETCH CAREGIVERS (accepted only)
// -------------------------------
const getCaregivers = async (req, res) => {
  try {
    const userId = req.params.userId;

    const caregivers = await Relationship.find({
      invitedId: userId,
      role: "caregiver",
      status: "accepted",
    })
      .populate("inviterId", "name phoneNumber photo")
      .populate("invitedId", "name phoneNumber photo");

    res.status(200).json(caregivers);
  } catch (err) {
    console.error("getCaregivers Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// -------------------------------
// FETCH PATIENTS (accepted only)
// -------------------------------
const getPatient = async (req, res) => {
  try {
    const userId = req.params.userId;

    const patients = await Relationship.find({
      inviterId: userId,
      role: "patient",
      status: "accepted",
    })
      .populate("inviterId", "name phoneNumber photo")
      .populate("invitedId", "name phoneNumber photo");

    res.status(200).json(patients);
  } catch (err) {
    console.error("getPatient Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// -------------------------------
// DELETE RELATIONSHIP
// -------------------------------
const deleteRelation = async (req, res) => {
  try {
    const { id } = req.params;

    const relationship = await Relationship.findByIdAndDelete(id);
    if (!relationship) {
      return res.status(404).json({ message: "Relationship not found." });
    }

    res.status(200).json({ message: "Relationship deleted successfully." });
  } catch (err) {
    console.error("deleteRelation Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {inviteCaregiver, invitePatient, respondInvite, getCaregivers, getPatient, deleteRelation,};
