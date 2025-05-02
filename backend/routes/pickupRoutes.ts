import express, { Request, Response, RequestHandler } from 'express';
import Pickup, { IPickup } from '../models/Pickup';
import validatePickup from '../middleware/validate';
import mongoose from 'mongoose';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

// Set SendGrid API Key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2020-08-27' as any,
});

const router = express.Router();

// Function to send email based on status or confirmation
const sendStatusEmail = async (pickup: IPickup, newStatus?: string) => {
    console.log('Attempting to send email for pickup ID:', pickup._id, 'with email:', pickup.email);

    if (!pickup || !pickup._id || !pickup.email) {
        console.log('Invalid pickup object or missing email:', { id: pickup._id, email: pickup.email });
        return;
    }

    let subject = '';
    let htmlContent = '';

    // If newStatus is provided, use the status update email logic
    if (newStatus) {
        console.log('Processing status update email for status:', newStatus);
        if (newStatus === 'Pending') {
            subject = 'Your Pickup Request is Pending - SmartBin';
            htmlContent = `
                <h3>Your Pickup Request is Pending</h3>
                <p>Your pickup request has been received and is currently <strong>${newStatus}</strong>.</p>
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
                <p>We will notify you once the status changes. Thank you for choosing SmartBin!</p>
            `;
        } else if (newStatus === 'Scheduled') {
            subject = 'Your Pickup Request is Scheduled - SmartBin';
            htmlContent = `
                <h3>Your Pickup Request is Scheduled</h3>
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
        } else if (newStatus === 'Completed') {
            subject = 'Pickup Request Completed - SmartBin';
            htmlContent = `
                <h3>Pickup Request Completed</h3>
                <p>Your pickup request (Bin ID: ${pickup.binId || 'N/A'}) has been successfully <strong>${newStatus}</strong>.</p>
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
                <p>Thank you for using our service!</p>
            `;
        } else if (newStatus === 'Cancelled') {
            subject = 'Sorry - Your Pickup Request Has Been Cancelled - SmartBin';
            htmlContent = `
                <h3>Sorry for the Inconvenience</h3>
                <p>Your pickup request has been <strong>cancelled</strong> because your location (${pickup.address || 'N/A'}) is not within our covered area.</p>
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
                <p>We apologize for any inconvenience caused. Please contact us if you have any questions.</p>
            `;
        } else {
            console.log('No email sent for unsupported status:', newStatus);
            return;
        }
    } else {
        // Confirmation email for new pickup request
        subject = 'Pickup Request Confirmation - SmartBin';
        htmlContent = `
            <h3>Thank You for Your Pickup Request!</h3>
            <p>We have successfully received your pickup request. Here are the details:</p>
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
                <li><strong>Status:</strong> ${pickup.status || 'Pending'}</li>
            </ul>
            <p>We will process your request shortly. Thank you for choosing SmartBin!</p>
        `;
    }

    if (!pickup.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pickup.email)) {
        console.log('Email validation failed for:', pickup.email, 'in pickup ID:', pickup._id);
        return;
    }

    const msg = {
        to: pickup.email,
        from: 'tharindu71177019@gmail.com', // Must match your verified sender email in SendGrid
        subject: subject,
        html: htmlContent,
    };

    console.log('Mail options for pickup ID:', pickup._id, msg);
    console.log('Sending email to:', pickup.email);

    try {
        const response = await sgMail.send(msg);
        console.log('SendGrid response for pickup ID:', pickup._id, response);
        console.log(`Email sent to ${pickup.email}${newStatus ? ` for status ${newStatus}` : ' for confirmation'}`);
    } catch (error: any) {
        console.error('Error sending email for pickup ID:', pickup._id, error);
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

        // Send confirmation email to the customer
        await sendStatusEmail(pickup);

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
        console.log('Updated pickup with email:', updatedPickup?.email);
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
        console.log('Received status update request for ID:', req.params.id, 'with status:', status);

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

        // Update validStatuses to match Pickup.ts schema
        const validStatuses = ['Pending', 'Scheduled', 'Completed', 'Cancelled'];
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
        console.log('Updated pickup object with email:', updatedPickup?.email);

        if (updatedPickup) {
            console.log('Sending status email for pickup ID:', updatedPickup._id, 'with email:', updatedPickup.email);
            await sendStatusEmail(updatedPickup, status);
        } else {
            console.log('Failed to update pickup, skipping email sending for ID:', req.params.id);
        }

        res.status(200).json({ message: 'Status updated successfully', pickup: updatedPickup });
    } catch (error: any) {
        console.error('Detailed error updating status for ID:', req.params.id, error);
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
            from: 'tharindu71177019@gmail.com', // Must match your verified sender email in SendGrid
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

// POST route to create a Stripe Checkout session
router.post('/api/create-checkout-session', (async (req: Request, res: Response): Promise<void> => {
    try {
        const { pickupId } = req.body;

        if (!pickupId) {
            console.log('Pickup ID is missing in request body');
            res.status(400).json({ message: 'Pickup ID is required' });
            return;
        }

        const pickup = await Pickup.findById(pickupId) as IPickup | null;
        if (!pickup || !pickup._id) {
            console.log('Pickup not found for ID:', pickupId);
            res.status(404).json({ message: 'Pickup not found' });
            return;
        }

        // Convert LKR amount to USD (Stripe doesn't support LKR)
        const exchangeRate = 0.0033; // 1 LKR = 0.0033 USD (example rate, update with real rate)
        const amountInUsd = pickup.amount * exchangeRate;
        const unitAmountInCents = Math.round(amountInUsd * 100); // Convert to cents

        if (unitAmountInCents <= 0) {
            console.log('Invalid amount for Stripe payment:', unitAmountInCents);
            res.status(400).json({ message: 'Invalid payment amount' });
            return;
        }

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Pickup Request - ${pickup.binId}`,
                        },
                        unit_amount: unitAmountInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
            metadata: { pickupId: pickup._id.toString() },
        });

        console.log('Stripe Checkout session created:', session);

        res.status(200).json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating Stripe Checkout session:', error);
        res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
    }
}) as RequestHandler);

export default router;