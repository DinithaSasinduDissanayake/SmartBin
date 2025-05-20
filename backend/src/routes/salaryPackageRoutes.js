const express = require('express');
const router = express.Router();
const { 
  getSalaryPackages, 
  getSalaryPackageById, 
  createSalaryPackage, 
  updateSalaryPackage, 
  deleteSalaryPackage 
} = require('../controllers/SalaryPackageController');
const { protect } = require('../middleware/authMiddleware');
const { isFinancialManager } = require('../middleware/roleMiddleware');

// Apply middleware to all routes
router.use(protect);
router.use(isFinancialManager);

// Routes
router.route('/')
  .get(getSalaryPackages)
  .post(createSalaryPackage);

router.route('/:id')
  .get(getSalaryPackageById)
  .put(updateSalaryPackage)
  .delete(deleteSalaryPackage);

module.exports = router;