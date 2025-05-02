import express, { Request, Response } from 'express';
import Equipment, { IEquipment } from '../models/equipment';

const router = express.Router();

// Add Equipment
router.post('/equipment', async (req: Request, res: Response) => {
  try {
    const equipment: IEquipment = new Equipment(req.body);
    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get All Equipment
router.get('/equipment', async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update Equipment
router.put('/equipment/:id', async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Delete Equipment
router.delete('/equipment/:id', async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json({ message: 'Equipment deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;