const express = require('express');
const medicineController = require('../controllers/medicinecontroller');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/addmedicine', authMiddleware, medicineController.addMedicine);
router.get('/getmedicine', authMiddleware, medicineController.getMedicine);
router.put('/updatemedicine/:id', authMiddleware, medicineController.updateMedicine);
router.delete('/deletemedicine/:id', authMiddleware, medicineController.deleteMedicine);
router.post('/action', authMiddleware, medicineController.logAction);
router.get('/report', authMiddleware, medicineController.generateReport);

module.exports = router;