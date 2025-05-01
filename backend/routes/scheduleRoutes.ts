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
    console.log('GET /schedules request received');
    const schedules = await Schedule.find();
    console.log('Found schedules:', schedules);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Add this route alongside your existing routes
router.get('/customer-schedules', async (req: Request, res: Response) => {
  try {
    console.log('GET /customer-schedules request received');
    const schedules = await Schedule.find();
    console.log('Found schedules:', schedules);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Make sure to add this export statement at the end of the file
export default router;