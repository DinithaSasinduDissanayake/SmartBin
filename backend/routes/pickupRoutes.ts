import express, { Request, Response, RequestHandler } from 'express';
import Pickup, { IPickup } from '../models/Pickup';
import validatePickup from '../middleware/validate';
import mongoose from 'mongoose';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2020-08-27' as any,
});

const router = express.Router();

// Function to send email based on status or confirmation
const sendStatusEmail = async (pickup: IPickup, newStatus?: string) => {
    try {
        const status = newStatus || pickup.status;
        
        // Define email content based on status
        let subject = '';
        let text = '';
        
        if (status === 'Pending') {
            subject = 'Pickup Request Confirmation';
            text = `Dear ${pickup.name},\n\nYour pickup request has been received and is pending approval. Your pickup ID is: ${pickup._id}.\n\nDetails:\n- Address: ${pickup.address}\n- Preferred Date: ${new Date(pickup.preferredDate).toLocaleDateString()}\n- Waste Type: ${pickup.wasteType.join(', ')}\n- Service Type: ${pickup.serviceType}\n- Amount: Rs. ${pickup.amount.toFixed(2)}\n\nWe will notify you once your request is scheduled.\n\nThank you for using SmartBin services.\n\nRegards,\nSmartBin Team`;
        } else if (status === 'Scheduled') {
            subject = 'Pickup Request Scheduled';
            text = `Dear ${pickup.name},\n\nYour pickup request (ID: ${pickup._id}) has been scheduled for ${new Date(pickup.preferredDate).toLocaleDateString()}. Please ensure that your waste is properly segregated and ready for collection.\n\nDetails:\n- Address: ${pickup.address}\n- Waste Type: ${pickup.wasteType.join(', ')}\n- Service Type: ${pickup.serviceType}\n- Amount: Rs. ${pickup.amount.toFixed(2)}\n\nThank you for using SmartBin services.\n\nRegards,\nSmartBin Team`;
        } else if (status === 'Completed') {
            subject = 'Pickup Completed';
            text = `Dear ${pickup.name},\n\nWe're happy to inform you that your pickup request (ID: ${pickup._id}) has been completed successfully. Thank you for contributing to a cleaner environment.\n\nDetails:\n- Address: ${pickup.address}\n- Waste Type: ${pickup.wasteType.join(', ')}\n- Service Type: ${pickup.serviceType}\n- Amount: Rs. ${pickup.amount.toFixed(2)}\n\nThank you for using SmartBin services.\n\nRegards,\nSmartBin Team`;
        } else if (status === 'Cancelled') {
            subject = 'Pickup Request Cancelled';
            text = `Dear ${pickup.name},\n\nYour pickup request (ID: ${pickup._id}) has been cancelled as requested. If this was not intended, please create a new pickup request or contact our support team.\n\nDetails:\n- Address: ${pickup.address}\n- Preferred Date: ${new Date(pickup.preferredDate).toLocaleDateString()}\n- Waste Type: ${pickup.wasteType.join(', ')}\n- Service Type: ${pickup.serviceType}\n\nThank you for using SmartBin services.\n\nRegards,\nSmartBin Team`;
        }
        
        // Send email only if subject and text are defined
        if (subject && text) {
            const msg = {
                to: pickup.email,
                from: process.env.EMAIL_FROM || 'noreply@smartbin.com',
                subject,
                text,
            };
            
            await sgMail.send(msg);
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// POST route to create a new pickup request
router.post('/api/pickup', validatePickup, async (req: Request, res: Response) => {
    try {
        // Generate a unique binId (e.g., SB followed by timestamp)
        const binId = `SB${Date.now().toString().slice(-6)}`;
        
        // Create a new pickup document with binId
        const pickup = new Pickup({
            ...req.body,
            binId,
            status: 'Pending' // Default status for new pickup requests
        });
        
        // Save the pickup to the database
        await pickup.save();
        
        // Send confirmation email
        await sendStatusEmail(pickup);
        
        res.status(201).json(pickup);
    } catch (error) {
        console.error('Error creating pickup request:', error);
        res.status(500).json({ error: 'Failed to create pickup request' });
    }
});

// GET route to fetch all pickup requests
router.get('/api/pickup', async (req: Request, res: Response) => {
    try {
        // Fetch all pickups sorted by newest first
        const pickups = await Pickup.find().sort({ createdAt: -1 });
        res.status(200).json(pickups);
    } catch (error) {
        console.error('Error fetching pickup requests:', error);
        res.status(500).json({ error: 'Failed to fetch pickup requests' });
    }
});

// GET route to fetch a single pickup by ID
router.get('/api/pickup/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid pickup ID' });
        }
        
        // Find pickup by ID
        const pickup = await Pickup.findById(id);
        
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup request not found' });
        }
        
        res.status(200).json(pickup);
    } catch (error) {
        console.error('Error fetching pickup request:', error);
        res.status(500).json({ error: 'Failed to fetch pickup request' });
    }
});

// PUT route to update a pickup by ID (for full updates with validation)
router.put('/api/pickup/:id', validatePickup, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid pickup ID' });
        }
        
        // Find and update pickup
        const updatedPickup = await Pickup.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );
        
        if (!updatedPickup) {
            return res.status(404).json({ error: 'Pickup request not found' });
        }
        
        // If status is different from original, send status update email
        const originalPickup = await Pickup.findById(id);
        if (originalPickup && originalPickup.status !== req.body.status) {
            await sendStatusEmail(updatedPickup, req.body.status);
        }
        
        res.status(200).json({ message: 'Pickup request updated successfully', pickup: updatedPickup });
    } catch (error) {
        console.error('Error updating pickup request:', error);
        res.status(500).json({ error: 'Failed to update pickup request' });
    }
});

// PUT route to update only the status of a pickup by ID (without validation)
router.put('/api/pickup/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid pickup ID' });
        }
        
        // Validate status
        const validStatuses = ['Pending', 'Scheduled', 'Completed', 'Cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        
        // Find pickup by ID and update its status
        const updatedPickup = await Pickup.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        
        if (!updatedPickup) {
            return res.status(404).json({ error: 'Pickup request not found' });
        }
        
        // Send status update email
        await sendStatusEmail(updatedPickup);
        
        res.status(200).json({ message: 'Status updated successfully', pickup: updatedPickup });
    } catch (error) {
        console.error('Error updating pickup status:', error);
        res.status(500).json({ error: 'Failed to update pickup status' });
    }
});

// DELETE route to delete a pickup by ID
router.delete('/api/pickup/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Check if ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid pickup ID' });
        }
        
        // Find pickup by ID and delete it
        const deletedPickup = await Pickup.findByIdAndDelete(id);
        
        if (!deletedPickup) {
            return res.status(404).json({ error: 'Pickup request not found' });
        }
        
        res.status(200).json({ message: 'Pickup request deleted successfully' });
    } catch (error) {
        console.error('Error deleting pickup request:', error);
        res.status(500).json({ error: 'Failed to delete pickup request' });
    }
});

// Test route to send a test email
router.post('/api/test-email', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const msg = {
            to: email,
            from: process.env.EMAIL_FROM || 'noreply@smartbin.com',
            subject: 'SmartBin Email Test',
            text: 'This is a test email from SmartBin. If you received this, your email notifications are working correctly.',
        };
        
        await sgMail.send(msg);
        
        res.status(200).json({ message: 'Test email sent successfully' });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
});

// POST route to create a Stripe Checkout session
router.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    try {
        const { pickupId } = req.body;
        
        if (!pickupId || !mongoose.Types.ObjectId.isValid(pickupId)) {
            return res.status(400).json({ error: 'Valid pickup ID is required' });
        }
        
        // Find pickup by ID
        const pickup = await Pickup.findById(pickupId);
        
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup request not found' });
        }
        
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'lkr',
                        product_data: {
                            name: `Pickup Service - ${pickup.binId}`,
                            description: `${pickup.wasteType.join(', ')} waste pickup service`,
                        },
                        unit_amount: Math.round(pickup.amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pickup-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pickup/${pickupId}`,
        });
        
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

export default router;
