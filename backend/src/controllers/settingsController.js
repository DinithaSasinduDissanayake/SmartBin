const Settings = require('../models/Settings');
const { NotFoundError } = require('../errors');

// Get or create settings
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne(); // Assuming only one doc due to uniqueKey
        if (!settings) {
            // If no settings exist, create the default one
            settings = new Settings(); // Uses schema defaults
            settings.lastUpdatedBy = req.user?.id; // Assign initial creator if possible
            await settings.save();
        }
        res.status(200).json(settings);
    } catch (error) {
        next(error);
    }
};

// Update settings
exports.updateSettings = async (req, res, next) => {
    // Validation should be handled by middleware before this point
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Optionally create if not found, or throw error
            throw new NotFoundError('Settings not found. Cannot update.');
        }

        // Update fields based on req.body
        Object.assign(settings, req.body);
        settings.lastUpdatedBy = req.user.id; // Track who updated

        const updatedSettings = await settings.save();
        res.status(200).json(updatedSettings);
    } catch (error) {
        next(error);
    }
};