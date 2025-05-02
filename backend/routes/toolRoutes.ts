import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import Tool from '../models/tool';
import { protect, authorize } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/validationErrorHandler';

const router = express.Router();

// Validation for creating and updating tools
const toolValidation = [
  body('toolId').notEmpty().withMessage('Tool ID is required').trim(),
  body('type').notEmpty().withMessage('Type is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('status').optional().isIn(['Available', 'In Use', 'Maintenance', 'Retired']).withMessage('Invalid status value')
];

// GET: Fetch all tools - Available to all authenticated users
router.get('/tools', protect, async (req: Request, res: Response) => {
  try {
    const tools = await Tool.find();
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// POST: Add a new tool - Only for staff and admin
router.post(
  '/tools', 
  protect, 
  authorize('staff', 'admin'),
  toolValidation,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      console.log('Received tool data:', req.body);

      // Create new tool
      const tool = new Tool({
        toolId: req.body.toolId,
        type: req.body.type,
        description: req.body.description,
        status: req.body.status || 'Available',
      });

      await tool.save();
      res.status(201).json(tool);
    } catch (err) {
      console.error('Error adding tool:', err);
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

// PUT: Update a tool - Only for staff and admin
router.put(
  '/tools/:id',
  protect,
  authorize('staff', 'admin'),
  param('id').isMongoId().withMessage('Invalid tool ID format'),
  toolValidation,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const tool = await Tool.findByIdAndUpdate(
        req.params.id,
        {
          toolId: req.body.toolId,
          type: req.body.type,
          description: req.body.description,
          status: req.body.status,
        },
        { new: true }
      );

      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }

      res.json(tool);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

// DELETE: Delete a tool - Only for admin
router.delete(
  '/tools/:id',
  protect,
  authorize('admin'),
  param('id').isMongoId().withMessage('Invalid tool ID format'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const tool = await Tool.findByIdAndDelete(req.params.id);
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
);

export default router;