const express = require('express');
const router = express.Router();
const relationshipController = require('../controllers/relationshipcontroller');

// Invite links
router.get('/invite/caregiver/:inviterId', relationshipController.inviteCaregiver);
router.get('/invite/patient/:inviterId', relationshipController.invitePatient);

// Respond to invite (accept or reject) - Fixed to POST with hyphen
router.post('/respond-invite', relationshipController.respondInvite);

// Add a new relationship (when someone joins via invite link)
router.post('/addrelation', relationshipController.addRelationship);

// Get all caregivers for a specific user (patient)
router.get('/caregivers/:userId', relationshipController.getCaregivers);

// Get all patients for a specific user (caregiver)
router.get('/patients/:userId', relationshipController.getPatient);

// Delete a relationship
router.delete('/delete/:id', relationshipController.deleteRelation);

module.exports = router;
