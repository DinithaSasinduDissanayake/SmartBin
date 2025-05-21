import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import Equipment, { IEquipment } from '../models/equipment';
import { protect, authorize } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/validationErrorHandler';

const router = express.Router();

// Validation for creating and updating equipment
const equipmentValidation = [
  body('name').notEmpty().withMessage('Equipment name is required').trim(),
  body('type').notEmpty().withMessage('Equipment type is required').trim(),
  body('serialNumber').notEmpty().withMessage('Serial number is required').trim(),
  body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid date'),
  body('condition').optional().isIn(['New', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition value'),
  body('maintenanceSchedule').optional().isISO8601().withMessage('Maintenance schedule must be a valid date')
];

// Add Equipment - Only for staff and admin
router.post(
  '/equipment',
  protect,
  authorize('staff', 'admin'),
  // equipmentValidation, // Temporarily commented out due to model/validation mismatch
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const equipment: IEquipment = new Equipment(req.body);
      await equipment.save();
      res.status(201).json(equipment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

// Get All Equipment - Available to all authenticated users
router.get(
  '/equipment',
  protect,
  async (req: Request, res: Response) => {
    try {
      const equipment = await Equipment.find();
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Update Equipment - Only for staff and admin
router.put(
  '/equipment/:id',
  protect,
  authorize('staff', 'admin'),
  param('id').isMongoId().withMessage('Invalid equipment ID format'),
  // equipmentValidation, // Temporarily commented out due to model/validation mismatch
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
      res.json(equipment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

// Delete Equipment - Only for admin
router.delete(
  '/equipment/:id',
  protect,
  authorize('admin'),
  param('id').isMongoId().withMessage('Invalid equipment ID format'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const equipment = await Equipment.findByIdAndDelete(req.params.id);
      if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
      res.json({ message: 'Equipment deleted' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;