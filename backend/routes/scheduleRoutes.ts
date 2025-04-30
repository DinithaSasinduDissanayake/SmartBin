import express, { Request, Response } from 'express';
import Schedule, { ISchedule } from '../models/schedule';
import { sendEmail } from '../utils/email';

const router = express.Router();

router.post('/schedules', async (req: Request, res: Response) => {
  try {
    const schedule: ISchedule = new Schedule(req.body);
    await schedule.save();
    await sendEmail(
      'dhanushkal0403@gmail.com',
      'New Schedule Added',
      `Schedule ${schedule.scheduleNo} has been added for truck ${schedule.truckNo} on ${schedule.date} at ${schedule.time}.`
    );
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/schedules', async (req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/schedules/:id', async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    await sendEmail(
      'dhanushkal0403@gmail.com',
      'Schedule Updated',
      `Schedule ${schedule.scheduleNo} has been updated for truck ${schedule.truckNo}.`
    );
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/schedules/:id', async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    await sendEmail(
      'dhanushkal0403@gmail.com',
      'Schedule Deleted',
      `Schedule ${schedule.scheduleNo} has been deleted.`
    );
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;