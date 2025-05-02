import { Router } from 'express';
import { Request, Response } from 'express';
import { ISchedule, default as Schedule } from '../models/schedule';
import { sendEmail } from '../utils/email';

const router = Router();

// POST route to create a new schedule
router.post('/schedules', async (req: Request, res: Response) => {
  try {
    const schedule: ISchedule = new Schedule(req.body);
    await schedule.save();
    await sendEmail(
      'dhanushka18403@gmail.com',
      'New Schedule Added',
      `Schedule ${schedule.scheduleNo} has been added for truck ${schedule.truckNo} on ${schedule.date} at ${schedule.time}.`
    );
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// GET route to fetch all schedules
router.get('/schedules', async (req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Add this route alongside your existing routes
router.get('/customer-schedules', async (req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Search schedules by date range and other filters
router.get('/customer-schedules/search', async (req: Request, res: Response) => {
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
});

// Download schedules as CSV
router.get('/customer-schedules/download', async (req: Request, res: Response) => {
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
});

export default router;