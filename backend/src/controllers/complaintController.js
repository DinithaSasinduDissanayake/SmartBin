const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../errors');
const mongoose = require('mongoose');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Customer, Staff)
exports.submitComplaint = async (req, res, next) => {
    const { subject, description, relatedRequestId } = req.body;
    try {
        const complaint = await Complaint.create({
            user: req.user.id, // User ID from protect middleware
            subject,
            description,
            relatedRequestId: relatedRequestId || undefined
        });
        res.status(201).json(complaint);
    } catch (error) {
        next(error); // Pass to global error handler
    }
};

// @desc    Get complaints submitted by the logged-in user
// @route   GET /api/complaints/my-complaints
// @access  Private (Customer, Staff)
exports.getMyComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaint.find({ user: req.user.id })
                                        .sort({ createdAt: -1 })
                                        .populate('assignedAdmin', 'name email'); // Show who is assigned
        res.status(200).json(complaints);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all complaints (for Admin)
// @route   GET /api/complaints
// @access  Private (Admin)
exports.getAllComplaints = async (req, res, next) => {
    try {
        // Add filtering/pagination later if needed
        const complaints = await Complaint.find()
                                        .sort({ createdAt: -1 })
                                        .populate('user', 'name email') // Show who submitted
                                        .populate('assignedAdmin', 'name email');
        res.status(200).json(complaints);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private (Admin or Owner)
exports.getComplaintById = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
                                        .populate('user', 'name email')
                                        .populate('assignedAdmin', 'name email');
        if (!complaint) {
            throw new NotFoundError('Complaint not found');
        }
        // Check permission: Admin or the user who submitted it
        if (req.user.role !== 'admin' && complaint.user._id.toString() !== req.user.id) {
             throw new ForbiddenError('Not authorized to view this complaint');
        }
        res.status(200).json(complaint);
    } catch (error) {
        next(error);
    }
};

// @desc    Update complaint status (Admin)
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin)
exports.updateComplaintStatus = async (req, res, next) => {
    const { status } = req.body;
    // Add validation for status value here or using express-validator
    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
         return next(new BadRequestError('Invalid status value'));
    }
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true } // Return updated doc, run schema validation
        );
        if (!complaint) {
            throw new NotFoundError('Complaint not found');
        }
        res.status(200).json(complaint);
    } catch (error) {
        next(error);
    }
};

// @desc    Assign complaint to an admin/staff (Admin)
// @route   PATCH /api/complaints/:id/assign
// @access  Private (Admin)
exports.assignComplaint = async (req, res, next) => {
    const { adminId } = req.body;
     if (!mongoose.Types.ObjectId.isValid(adminId)) {
         return next(new BadRequestError('Invalid Admin ID format'));
     }
    try {
         // Check if assigned user exists and is admin/staff
        const assignedUser = await User.findById(adminId);
        if (!assignedUser || !['admin', 'staff', 'financial_manager'].includes(assignedUser.role)) { // Allow staff/finance to handle complaints? Adjust roles as needed
            throw new NotFoundError('Assignee user not found or does not have appropriate role');
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { assignedAdmin: adminId },
            { new: true, runValidators: true }
        ).populate('assignedAdmin', 'name email'); // Populate newly assigned admin

        if (!complaint) {
            throw new NotFoundError('Complaint not found');
        }
        res.status(200).json(complaint);
    } catch (error) {
        next(error);
    }
};

 // @desc    Add resolution notes to a complaint (Admin)
// @route   PATCH /api/complaints/:id/resolve
// @access  Private (Admin)
exports.addResolutionNotes = async (req, res, next) => {
    const { resolutionNotes } = req.body;
    if (!resolutionNotes || resolutionNotes.trim() === '') {
        return next(new BadRequestError('Resolution notes cannot be empty'));
    }
    try {
        const complaint = await Complaint.findById(req.params.id);
         if (!complaint) {
            throw new NotFoundError('Complaint not found');
        }
        // Optionally set status to Resolved/Closed when notes are added
        complaint.resolutionNotes = resolutionNotes;
        complaint.status = 'Resolved'; // Or 'Closed' based on workflow
        await complaint.save();

        res.status(200).json(complaint);
    } catch (error) {
        next(error);
    }
};