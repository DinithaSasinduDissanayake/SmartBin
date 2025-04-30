import express from 'express';
import Tool from '../models/tool';

const router = express.Router();

// GET: Fetch all tools
router.get('/tools', async (req, res) => {
  try {
    const tools = await Tool.find();
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// POST: Add a new tool (location field එක remove කළා)
router.post('/tools', async (req, res) => {
  try {
    console.log('Received tool data:', req.body); // Debug log

    // Validate req.body
    const { toolId, type, description } = req.body;

    // Check required fields (location remove කළා)
    if (!toolId || !type || !description) {
      return res.status(400).json({
        error: 'Missing required fields: toolId, type, and description are required',
      });
    }

    // Create new tool (location remove කළා)
    const tool = new Tool({
      toolId,
      type,
      description,
      // status is optional, will default to 'Available'
    });

    await tool.save();
    res.status(201).json(tool);
  } catch (err) {
    console.error('Error adding tool:', err); // Debug log
    res.status(400).json({ error: (err as Error).message }); // Type cast 'err' as Error
  }
});

// PUT: Update a tool (location field එක remove කළා)
router.put('/tools/:id', async (req, res) => {
  try {
    const { toolId, type, description } = req.body;

    // Validate req.body for required fields (location remove කළා)
    if (!toolId || !type || !description) {
      return res.status(400).json({
        error: 'Missing required fields: toolId, type, and description are required',
      });
    }

    const tool = await Tool.findByIdAndUpdate(
      req.params.id,
      {
        toolId,
        type,
        description,
      },
      { new: true }
    );

    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    res.json(tool);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message }); // Type cast 'err' as Error
  }
});

// DELETE: Delete a tool
router.delete('/tools/:id', async (req, res) => {
  try {
    const tool = await Tool.findByIdAndDelete(req.params.id);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: (err as Error).message }); // Type cast 'err' as Error
  }
});

export default router;