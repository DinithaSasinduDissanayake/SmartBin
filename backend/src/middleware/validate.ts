import { Request, Response, NextFunction } from 'express';

const validatePickup = (req: Request, res: Response, next: NextFunction): void => {
    const errors: { msg: string }[] = [];

    // Validate name
    if (!req.body.name) {
        errors.push({ msg: 'Name is required' });
    }

    // Validate contactNumber
    if (!req.body.contactNumber) {
        errors.push({ msg: 'Contact number is required' });
    } else if (!/^\d{10}$/.test(req.body.contactNumber)) {
        errors.push({ msg: 'Contact number must be exactly 10 digits' });
    }

    // Validate email
    if (!req.body.email) {
        errors.push({ msg: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(req.body.email)) {
        errors.push({ msg: 'Valid email is required' });
    }

    // Validate community
    if (!req.body.community) {
        errors.push({ msg: 'Community is required' });
    } else if (!['Household', 'Industry'].includes(req.body.community)) {
        errors.push({ msg: 'Community must be either Household or Industry' });
    }

    // Validate wasteType
    if (!req.body.wasteType || !Array.isArray(req.body.wasteType) || req.body.wasteType.length === 0) {
        errors.push({ msg: 'At least one waste type is required' });
    } else {
        const validWasteTypes = ['Organic', 'Plastic', 'Paper'];
        if (!req.body.wasteType.every((type: string) => validWasteTypes.includes(type))) {
            errors.push({ msg: 'Invalid waste type' });
        }
    }

    // Validate address
    if (!req.body.address) {
        errors.push({ msg: 'Address is required' });
    }

    // Validate preferredDate
    if (!req.body.preferredDate) {
        errors.push({ msg: 'Preferred date is required' });
    } else {
        const selectedDate = new Date(req.body.preferredDate);
        selectedDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2);

        if (isNaN(selectedDate.getTime())) {
            errors.push({ msg: 'Preferred date must be a valid date' });
        } else if (selectedDate < today) {
            errors.push({ msg: 'Preferred date must be a future date' });
        } else if (req.body.serviceType === 'regular' && selectedDate < dayAfterTomorrow) {
            errors.push({ msg: 'For regular service, date must be from the day after tomorrow onwards' });
        } else if (req.body.serviceType === 'urgent' && selectedDate < tomorrow) {
            errors.push({ msg: 'For urgent service, date must be from tomorrow onwards' });
        }
    }

    // Validate serviceType
    if (!req.body.serviceType) {
        errors.push({ msg: 'Service type is required' });
    } else if (!['urgent', 'regular'].includes(req.body.serviceType)) {
        errors.push({ msg: 'Service type must be either urgent or regular' });
    }

    // Validate location
    if (!req.body.location) {
        errors.push({ msg: 'Location is required' });
    }

    // Validate amount
    if (!req.body.amount || isNaN(req.body.amount)) {
        errors.push({ msg: 'Amount must be a number' });
    }

    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }

    next();
};

export default validatePickup;
