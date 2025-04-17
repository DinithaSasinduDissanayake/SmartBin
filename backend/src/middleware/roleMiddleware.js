// Middleware factory to check if user has one of the allowed roles
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure req.user exists (should be set by authMiddleware)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Authentication required or user role not found' });
    }

    const userRole = req.user.role;

    // Check if the user's role is included in the allowed roles
    // Convert allowedRoles to lowercase for case-insensitive comparison if needed,
    // or ensure consistency in role naming (e.g., 'financial_manager' vs 'Financial Manager')
    // Assuming roles in the database match the strings in allowedRoles exactly for now.
    if (allowedRoles.includes(userRole)) {
      next(); // User has the required role, proceed to the next middleware/controller
    } else {
      console.warn(`Role access denied for user ${req.user.id} with role '${userRole}'. Required: ${allowedRoles.join(' or ')}`);
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
  };
};

// Export the middleware factory function as the default export
module.exports = roleMiddleware;

// Example refactor for isFinancialManager middleware using the new roleMiddleware
exports.isFinancialManager = roleMiddleware(['financial_manager', 'admin']);