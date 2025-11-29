const express = require("express");
const router = express.Router();
const {
  inviteCaregiver,
  invitePatient,
  respondInvite,
  getCaregivers,
  getPatient,
  deleteRelation,
} = require("../controllers/relationshipcontroller");

// Send invite using link
router.get("/invite/caregiver/:inviterId", inviteCaregiver);
router.get("/invite/patient/:inviterId", invitePatient);

// Respond to invite
router.post("/respond", respondInvite);

// Fetch accepted caregivers (for patient dashboard)
router.get("/caregivers/:userId", getCaregivers);

// Fetch accepted patients (for caregiver dashboard)
router.get("/patients/:userId", getPatient);

// Delete relationship
router.delete("/:id", deleteRelation);

module.exports = router;
