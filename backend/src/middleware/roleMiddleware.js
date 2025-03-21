const User = require('../models/User');

// Middleware to check if user is a financial manager
exports.isFinancialManager = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'financial_manager' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as a financial manager' });
    }
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};