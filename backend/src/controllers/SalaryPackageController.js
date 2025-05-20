const SalaryPackage = require('../models/SalaryPackage');

// @desc    Get all salary packages
// @route   GET /api/salary-packages
// @access  Private/financial_manager
exports.getSalaryPackages = async (req, res) => {
  try {
    const salaryPackages = await SalaryPackage.find().sort({ createdAt: -1 });
    res.json(salaryPackages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get salary package by ID
// @route   GET /api/salary-packages/:id
// @access  Private/financial_manager
exports.getSalaryPackageById = async (req, res) => {
  try {
    const salaryPackage = await SalaryPackage.findById(req.params.id);
    
    if (!salaryPackage) {
      return res.status(404).json({ message: 'Salary package not found' });
    }
    
    res.json(salaryPackage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new salary package
// @route   POST /api/salary-packages
// @access  Private/financial_manager
exports.createSalaryPackage = async (req, res) => {
  try {
    const { name, basicSalary, bonusPerHour, deductionPercentage } = req.body;
    
    // Check if package with the same name already exists
    const existingPackage = await SalaryPackage.findOne({ name });
    if (existingPackage) {
      return res.status(400).json({ message: 'A package with this name already exists' });
    }
    
    const salaryPackage = await SalaryPackage.create({
      name,
      basicSalary,
      bonusPerHour,
      deductionPercentage
    });
    
    const savedPackage = await salaryPackage.save();
    res.status(201).json(savedPackage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Update salary package
// @route   PUT /api/salary-packages/:id
// @access  Private/financial_manager
exports.updateSalaryPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, basicSalary, bonusPerHour, deductionPercentage } = req.body;

    // Check if package exists
    let salaryPackage = await SalaryPackage.findById(id);

    if (!salaryPackage) {
      return res.status(404).json({ message: 'Salary package not found' });
    }

    // Check if trying to update to a name that already exists
    if (name !== salaryPackage.name) {
      const existingPackage = await SalaryPackage.findOne({ name });
      if (existingPackage) {
        return res.status(400).json({ message: 'A package with this name already exists' });
      }
    }

    // Update the package
    salaryPackage.name = name;
    salaryPackage.basicSalary = basicSalary;
    salaryPackage.bonusPerHour = bonusPerHour;
    salaryPackage.deductionPercentage = deductionPercentage;

    const updatedPackage = await salaryPackage.save();

    res.json(updatedPackage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete salary package
// @route   DELETE /api/salary-packages/:id
// @access  Private/financial_manager
exports.deleteSalaryPackage = async (req, res) => {
  try {
    const salaryPackage = await SalaryPackage.findById(req.params.id);
    
    if (!salaryPackage) {
      return res.status(404).json({ message: 'Salary package not found' });
    }
    
    await salaryPackage.deleteOne();
    
    res.json({ message: 'Salary package removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};