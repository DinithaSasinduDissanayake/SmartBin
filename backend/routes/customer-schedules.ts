import express, { Request, Response } from 'express';
import Schedule, { ISchedule } from '../models/schedule';
import { sendEmail } from '../utils/email';

const router = express.Router();

router.get('/customer-schedules', async (req: Request, res: Response) => {
    try {
      const currentDate = new Date();
      const formattedCurrentDate = currentDate.toISOString().split('T')[0]; // "2025-05-01"
  
      console.log('Fetching schedules for date:', formattedCurrentDate);
  
      let schedules = await Schedule.find({
        date: formattedCurrentDate,
      });
  
      console.log('Schedules found:', schedules);
  
      if (!schedules.length) {
        return res.json([]);
      }
  
      const updatedSchedules = schedules.filter((schedule) => {
        // Only exclude "Completed" schedules, don't modify status or delete
        if (schedule.status === 'Completed') {
          console.log(`Skipping completed schedule ${schedule.scheduleNo}`);
          return false;
        }
        return true;
      });
  
      console.log('Filtered schedules:', updatedSchedules);
      res.json(updatedSchedules);
    } catch (error) {
      console.error('Error in /customer-schedules:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

// Existing endpoints (admin ලාට තියෙන ඒවා)
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

// Customer ලාට අද දවසේ schedules ගන්න endpoint එක
router.get('/customer-schedules', async (req: Request, res: Response) => {
  try {
    // අද දවස ගන්නවා (YYYY-MM-DD format එකට)
    const currentDate = new Date().toISOString().split('T')[0];

    // අද දවසේ schedules ටික ගන්නවා
    let schedules = await Schedule.find({
      date: currentDate,
    });

    // Time එක ඉවර උන schedules ටික Completed කරලා ඉවත් කරනවා
    const currentTime = new Date();
    const updatedSchedules = schedules.filter((schedule) => {
      // Schedule එකක time එක parse කරනවා (e.g., "14:30")
      const [hours, minutes] = schedule.time.split(':').map(Number);
      const scheduleDateTime = new Date(schedule.date);
      scheduleDateTime.setHours(hours, minutes);

      // Time එක ඉවර උනා නම් status එක Completed කරනවා
      if (scheduleDateTime < currentTime && schedule.status !== 'Completed') {
        Schedule.updateOne(
          { _id: schedule._id },
          { status: 'Completed' }
        ).exec();
        return false; // Response එකෙන් ඉවත් කරනවා
      }

      // Completed schedules ඉවත් කරනවා
      if (schedule.status === 'Completed') {
        Schedule.deleteOne({ _id: schedule._id }).exec();
        return false; // Response එකෙන් ඉවත් කරනවා
      }

      return true; // Completed නැති schedules ටික return කරනවා
    });

    res.json(updatedSchedules);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;