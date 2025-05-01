import express, { Request, Response, RequestHandler } from 'express';
import Pickup from '../models/Pickup';
import validatePickup from '../middleware/validate';
import mongoose from 'mongoose';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

// Initialize Stripe with Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-03-31.basil',
});

// Set SendGrid API Key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const router = express.Router();

// Function to send email based on status
const sendStatusEmail = async (pickup: any, newStatus: string) => {
    console.log('Attempting to send email for pickup:', pickup);
    console.log('New status:', newStatus);

    if (!pickup || !pickup._id) {
        console.log('Invalid pickup object:', pickup);
        return;
    }

    let subject = '';
    let htmlContent = '';

    if (newStatus === 'On Progress') {
        subject = 'Thank You for Choosing Us - Pickup Request Update';
        htmlContent = `
            <h3>Thank You for Choosing Us!</h3>
            <p>Your pickup request has been updated to <strong>${newStatus}</strong>.</p>
            <h4>Pickup Request Details:</h4>
            <ul>
                <li><strong>Bin ID:</strong> ${pickup.binId || 'N/A'}</li>
                <li><strong>Name:</strong> ${pickup.name || 'N/A'}</li>
                <li><strong>Contact Number:</strong> ${pickup.contactNumber || 'N/A'}</li>
                <li><strong>Community:</strong> ${pickup.community || 'N/A'}</li>
                <li><strong>Waste Type:</strong> ${pickup.wasteType ? pickup.wasteType.join(', ') : 'N/A'}</li>
                <li><strong>Address:</strong> ${pickup.address || 'N/A'}</li>
                <li><strong>Preferred Date:</strong> ${pickup.preferredDate ? new Date(pickup.preferredDate).toLocaleDateString() : 'N/A'}</li>
                <li><strong>Service Type:</strong> ${pickup.serviceType || 'N/A'}</li>
                <li><strong>Location:</strong> ${pickup.location || 'N/A'}</li>
                <li><strong>Amount:</strong> Rs. ${pickup.amount ? pickup.amount.toFixed(2) : '0.00'}</li>
            </ul>
            <p>Please check the pickup schedule to know the exact pickup time.</p>
            <p>Thank you for helping us keep the environment clean!</p>
        `;
    } else if (newStatus === 'Cancelled') {
        subject = 'Sorry - Your Pickup Request Has Been Cancelled';
        htmlContent = `
            <h3>Sorry for the Inconvenience</h3>
            <p>Your pickup request has been <strong>cancelled</strong> because your location (${pickup.address || 'N/A'}) is not within our covered area.</p>
            <p>We apologize for any inconvenience caused. Please contact us if you have any questions.</p>
        `;
    } else if (newStatus === 'Completed') {
        subject = 'Pickup Request Completed';
        htmlContent = `
            <h3>Pickup Request Completed</h3>
            <p>Your pickup request (Bin ID: ${pickup.binId || 'N/A'}) has been successfully <strong>${newStatus}</strong>.</p>
            <p>Thank you for using our service!</p>
        `;
    } else {
        console.log('No email sent for status:', newStatus);
        return;
    }

    if (!pickup.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pickup.email)) {
        console.log('Invalid or missing email address:', pickup.email);
        return;
    }

    const msg = {
        to: pickup.email,
        from: 'tharindu71177019@gmail.com',
        subject: subject,
        html: htmlContent,
    };

    console.log('Mail options:', msg);
    console.log('Sending email to:', pickup.email);

    try {
        const response = await sgMail.send(msg);
        console.log('SendGrid response:', response);
        console.log(`Email sent to ${pickup.email} for status ${newStatus}`);
    } catch (error: any) {
        console.error('Error sending email:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.body || 'No response');
    }
};

// POST route to create a new pickup request
router.post('/api/pickup', validatePickup, (async (req: Request, res: Response): Promise<void> => {
    try {
        const lastPickup = await Pickup.findOne().sort({ createdAt: -1 });
        let nextBinId = 1;

        if (lastPickup?.binId) {
            const lastBinId = parseInt(lastPickup.binId, 10);
            if (!isNaN(lastBinId)) {
                nextBinId = lastBinId + 1;
            }
        }

        const paddedBinId = nextBinId.toString().padStart(4, '0');

        const { email } = req.body;
        if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            console.log('Invalid email address provided:', email);
            res.status(400).json({ message: 'Invalid email address' });
            return;
        }

        const pickupData = {
            ...req.body,
            binId: paddedBinId,
            preferredDate: new Date(req.body.preferredDate),
        };

        console.log('Creating new pickup with data:', pickupData);

        const pickup = new Pickup(pickupData);
        await pickup.save();

        res.status(201).json({ message: 'Pickup request created successfully', pickup });
    } catch (error: any) {
        console.error('Error saving pickup:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}) as RequestHandler);

// GET route to fetch all pickup requests
router.get('/api/pickup', (async (req: Request, res: Response): Promise<void> => {
    try {
        const pickups = await Pickup.find();
        res.status(200).json(pickups);
    } catch (error: any) {
        console.error('Error fetching pickups:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}) as RequestHandler);

// GET route to fetch a single pickup by ID
router.get('/api/pickup/:id', (async (req: Request, res: Response): Promise<void> => {
    try {
        const pickup = await Pickup.findById(req.params.id);
        if (!pickup) {
            res.status(404).json({ message: 'Pickup not found' });
            return;
        }
        res.status(200).json(pickup);
    } catch (error: any) {
        console.error('Error fetching pickup:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}) as RequestHandler);

// PUT route to update a pickup by ID (for full updates with validation)
router.put('/api/pickup/:id', validatePickup, (async (req: Request, res: Response): Promise<void> => {
    try {
        const pickup = await Pickup.findById(req.params.id);
        if (!pickup) {
            res.status(404).json({ message: 'Pickup not found' });
            return;
        }

        const updatedData = {
            ...req.body,
            preferredDate: new Date(req.body.preferredDate),
        };

        const updatedPickup = await Pickup.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.status(200).json({ message: 'Pickup updated successfully', pickup: updatedPickup });
    } catch (error: any) {
        console.error('Error updating pickup:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}) as RequestHandler);

// PUT route to update only the status of a pickup by ID (without validation)
router.put('/api/pickup/:id/status', (async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        console.log('Received status update request:', { id: req.params.id, status });

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.log('Invalid pickup ID:', req.params.id);
            res.status(400).json({ message: 'Invalid pickup ID' });
            return;
        }

        if (!status) {
            console.log('Status is missing in request body');
            res.status(400).json({ message: 'Status is required' });
            return;
        }

        const validStatuses = ['Pending', 'On Progress', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            console.log('Invalid status value:', status);
            res.status(400).json({ message: 'Invalid status value' });
            return;
        }

        const pickup = await Pickup.findById(req.params.id);
        if (!pickup) {
            console.log('Pickup not found for ID:', req.params.id);
            res.status(404).json({ message: 'Pickup not found' });
            return;
        }

        const updatedPickup = await Pickup.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        console.log('Updated pickup:', updatedPickup);

        if (updatedPickup) {
            await sendStatusEmail(updatedPickup, status);
        } else {
            console.log('Failed to update pickup, skipping email sending');
        }

        res.status(200).json({ message: 'Status updated successfully', pickup: updatedPickup });
    } catch (error: any) {
        console.error('Detailed error updating status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}) as RequestHandler);

// DELETE route to delete a pickup by ID
router.delete('/api/pickup/:id', (async (req: Request, res: Response): Promise<void> => {
    try {
        const pickup = await Pickup.findById(req.params.id);
        if (!pickup) {
            res.status(404).json({ message: 'Pickup not found' });
            return;
        }

        await Pickup.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Pickup deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting pickup:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}) as RequestHandler);

// Test route to send a test email
router.post('/api/test-email', (async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            console.log('Invalid email address provided:', email);
            res.status(400).json({ message: 'Invalid email address' });
            return;
        }

        const msg = {
            to: email,
            from: 'tharindu71177019@gmail.com',
            subject: 'Test Email from SmartBin',
            html: '<h3>This is a test email</h3><p>If you received this, your email setup is working!</p>',
        };

        console.log('Test email options:', msg);
        console.log('Sending test email to:', email);

        const response = await sgMail.send(msg);
        console.log('SendGrid response:', response);
        console.log(`Test email sent to ${email}`);
        res.status(200).json({ message: 'Test email sent successfully' });
    } catch (error: any) {
        console.error('Error sending test email:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.body || 'No response');
        res.status(500).json({ message: 'Error sending test email', error: error.message });
    }
}) as RequestHandler);

// POST route to create a payment intent for Stripe
router.post('/api/create-payment-intent', (async (req: Request, res: Response): Promise<void> => {
    try {
        const { pickupId } = req.body;

        console.log('Received create-payment-intent request with pickupId:', pickupId);

        if (!pickupId) {
            console.log('Pickup ID is missing in request body');
            res.status(400).json({ message: 'Pickup ID is required' });
            return;
        }

        const pickup = await Pickup.findById(pickupId);
        if (!pickup) {
            console.log('Pickup not found for ID:', pickupId);
            res.status(404).json({ message: 'Pickup not found' });
            return;
        }

        const amount = pickup.amount ? Math.round(pickup.amount * 100) : 0;
        console.log('Calculated amount in cents:', amount);

        if (amount <= 0) {
            console.log('Invalid amount for pickup:', pickupId);
            res.status(400).json({ message: 'Invalid amount' });
            return;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'lkr',
            description: `Payment for Pickup Request - Bin ID: ${pickup.binId}`,
            metadata: { pickupId: pickupId },
        });

        console.log('Payment intent created:', {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error: any) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}) as RequestHandler);

export default router;