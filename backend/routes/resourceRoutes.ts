import express, { Request, Response } from 'express';
import Truck, { ITruck } from '../models/truck';

const router = express.Router();

router.post('/trucks', async (req: Request, res: Response) => {
  try {
    console.log('Received truck data:', req.body); // Log the incoming data
    const truck: ITruck = new Truck(req.body);
    await truck.save();
    console.log('Saved truck:', truck); // Log the saved truck
    res.status(201).json(truck);
  } catch (error) {
    console.error('Error saving truck:', error); // Log the error
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/trucks', async (req: Request, res: Response) => {
  try {
    const trucks = await Truck.find();
    res.json(trucks);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/trucks/:id', async (req: Request, res: Response) => {
  try {
    const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!truck) return res.status(404).json({ error: 'Truck not found' });
    res.json(truck);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/trucks/:id', async (req: Request, res: Response) => {
  try {
    const truck = await Truck.findByIdAndDelete(req.params.id);
    if (!truck) return res.status(404).json({ error: 'Truck not found' });
    res.json({ message: 'Truck deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;