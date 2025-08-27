import { Router } from 'express';
import { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ISchedule, default as Schedule } from '../src/models/schedule';
import { sendEmail } from '../utils/email';
import { protect, authorize } from '../src/middleware/authMiddleware';
import { handleValidationErrors } from '../src/middleware/validationErrorHandler';

const router = Router();

// Validation for creating and updating schedules
const scheduleValidation = [
  body('scheduleNo').notEmpty().withMessage('Schedule number is required').trim(),
  body('truckNo').notEmpty().withMessage('Truck number is required').trim(),
  body('date').isISO8601().withMessage('Date must be a valid date'),
  body('time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:MM format'),
  body('status').isIn(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).withMessage('Invalid status value'),
  body('route').isArray().withMessage('Route must be an array'),
  body('route.*').isString().withMessage('Route items must be strings')
];

// Validation for schedule search
const searchValidation = [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  query('truckNo').optional().isString(),
  query('scheduleNo').optional().isString(),
  query('status').optional().isString(),
  query('route').optional().isString()
];

// POST route to create a new schedule - Only for staff and admin
router.post(
  '/schedules',
  protect,
  authorize('staff', 'admin'),
  scheduleValidation,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const schedule: ISchedule = new Schedule(req.body);
      await schedule.save();
      
      // Send email notification
      await sendEmail(
        'dhanushka18403@gmail.com',
        'New Schedule Added',
        `Schedule ${schedule.scheduleNo} has been added for truck ${schedule.truckNo} on ${schedule.date} at ${schedule.time}.`
      );
      
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

// GET route to fetch all schedules - Available to all authenticated users
router.get(
  '/schedules',
  protect,
  async (req: Request, res: Response) => {
    try {
      const schedules = await Schedule.find();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Customer schedules - Available to all authenticated users
router.get(
  '/customer-schedules',
  protect,
  async (req: Request, res: Response) => {
    try {
      const schedules = await Schedule.find();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Search schedules by date range and other filters - Available to all authenticated users
router.get(
  '/customer-schedules/search',
  protect,
  searchValidation,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, truckNo, scheduleNo, status, route } = req.query;
      let query: any = {};

      // Search by Schedule No
      if (scheduleNo && typeof scheduleNo === 'string' && scheduleNo.trim() !== '') {
        query.scheduleNo = new RegExp(scheduleNo.trim(), 'i');
      }

      // Search by Truck No
      if (truckNo && typeof truckNo === 'string' && truckNo.trim() !== '') {
        query.truckNo = new RegExp(truckNo.trim(), 'i');
      }

      // Search by Date Range
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);

        query.date = {
          $gte: start.toISOString(),
          $lte: end.toISOString()
        };
      }

      // Search by Status
      if (status && typeof status === 'string' && status.trim() !== '') {
        query.status = new RegExp(status.trim(), 'i');
      }

      // Search by Route
      if (route && typeof route === 'string' && route.trim() !== '') {
        query.route = new RegExp(route.trim(), 'i');
      }

      const schedules = await Schedule.find(query).sort({ date: -1, time: -1 });
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Download schedules as CSV - Available to all authenticated users
router.get(
  '/customer-schedules/download',
  protect,
  searchValidation,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, truckNo } = req.query;
      let query: any = {};

      if (startDate && endDate) {
        query.date = {
          $gte: startDate,
          $lte: endDate
        };
      }

      if (truckNo) {
        query.truckNo = truckNo;
      }

      const schedules = await Schedule.find(query);
      
      // Convert to CSV format
      const csvHeader = 'Schedule No,Truck No,Date,Time,Status,Route\n';
      const csvContent = schedules.map(schedule => 
        `${schedule.scheduleNo},${schedule.truckNo},${schedule.date},${schedule.time},${schedule.status},${schedule.route.join(';')}`
      ).join('\n');
      
      const csv = csvHeader + csvContent;
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=schedules.csv');
      
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// PUT route to update a schedule - Only for staff and admin
router.put(
  '/schedules/:id',
  protect,
  authorize('staff', 'admin'),
  param('id').isMongoId().withMessage('Invalid schedule ID format'),
  scheduleValidation,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

// DELETE route to delete a schedule - Only for admin
router.delete(
  '/schedules/:id',
  protect,
  authorize('admin'),
  param('id').isMongoId().withMessage('Invalid schedule ID format'),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const schedule = await Schedule.findByIdAndDelete(req.params.id);
      if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;