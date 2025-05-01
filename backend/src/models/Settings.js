const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // Add a unique key to enforce singleton
    uniqueKey: { type: String, default: 'global_settings', unique: true },
    appName: {
        type: String,
        default: 'SmartBin',
        trim: true,
    },
    defaultTimezone: {
        type: String,
        default: 'Asia/Colombo', // Example timezone
        // Consider adding validation for valid TZ names if needed
    },
    defaultCurrency: {
        type: String,
        default: 'LKR', // Example currency code
        uppercase: true,
        match: /^[A-Z]{3}$/, // Basic ISO 4217 format validation
    },
    defaultNewUserRole: {
        type: String,
        enum: ['customer', 'staff'],
        default: 'customer',
    },
    passwordMinLength: {
        type: Number,
        default: 8,
        min: 6,
    },
    sessionTimeoutMinutes: {
        type: Number,
        default: 60, // 1 hour
        min: 5, // Minimum 5 minutes
    },
    maintenanceMode: {
        type: Boolean,
        default: false,
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true }); // Add createdAt/updatedAt automatically

module.exports = mongoose.model('Settings', settingsSchema);