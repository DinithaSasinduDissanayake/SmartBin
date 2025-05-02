import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import Truck, { ITruck } from '../models/truck';
import { protect, authorize } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/validationErrorHandler';

const router = express.Router();

// Validation for creating and updating trucks
const truckValidation = [
  body('truckId').notEmpty().withMessage('Truck ID is required').trim(),
  body('model').notEmpty().withMessage('Model is required').trim(),
  body('capacity').isNumeric().withMessage('Capacity must be a number'),
  body('maintenanceStatus').optional().isIn(['Good', 'Needs Service', 'In Repair']).withMessage('Invalid maintenance status value'),
  body('lastServiceDate').optional().isISO8601().withMessage('Last service date must be a valid date')
];

// Create a new truck - Only for staff and admin
router.post(
  '/trucks',
  protect,
  authorize('staff', 'admin'),
  truckValidation,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      console.log('Received truck data:', req.body);
      const truck: ITruck = new Truck(req.body);
      await truck.save();
      console.log('Saved truck:', truck);
      res.status(201).json(truck);
    } catch (error) {
      console.error('Error saving truck:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

// Get all trucks - Available to all authenticated users
router.get(
  '/trucks',
  protect,
  async (req: Request, res: Response) => {
    try {
      const trucks = await Truck.find();
      res.json(trucks);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Update a truck - Only for staff and admin
router.put(
  '/trucks/:id',
  protect,
  authorize('staff', 'admin'),
  param('id').isMongoId().withMessage('Invalid truck ID format'),
  truckValidation,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!truck) return res.status(404).json({ error: 'Truck not found' });
      res.json(truck);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

// Delete a truck - Only for admin
router.delete(
  '/trucks/:id',
  protect,
  authorize('admin'),
  param('id').isMongoId().withMessage('Invalid truck ID format'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const truck = await Truck.findByIdAndDelete(req.params.id);
      if (!truck) return res.status(404).json({ error: 'Truck not found' });
      res.json({ message: 'Truck deleted' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;