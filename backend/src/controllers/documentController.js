const Document = require('../models/Document');
const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises; // Use promise-based fs for async/await
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');
const ApiError = require('../errors/ApiError');

/**
 * @desc    Upload new document
 * @route   POST /api/documents/upload
 * @access  Private
 * @param   {object} req - Express request object (with file attached by multer)
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.uploadDocument = async (req, res, next) => {
  try {
    // Multer middleware handles file presence check and potential errors
    if (!req.file) {
      // This might be redundant if multer always throws an error, but good as a fallback
      throw new BadRequestError('No file uploaded or file rejected by filter');
    }
    
    // Validation for name/type handled by express-validator
    const { name, type } = req.body;

    // Create new document
    const document = await Document.create({
      user: req.user.id,
      name: name || req.file.originalname, // Use provided name or original filename
      type: type || 'Other', // Use provided type or default
      filePath: req.file.path, // Path saved by multer
      mimeType: req.file.mimetype,
      size: req.file.size
    });
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Document upload error:', error);
    // Simply pass the error to the global handler
    next(error);
  }
};

/**
 * @desc    Get all documents for the logged-in user
 * @route   GET /api/documents
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getUserDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching user documents:', error);
    // Simply pass the error to the global handler
    next(error); 
  }
};

/**
 * @desc    Get a specific document by ID
 * @route   GET /api/documents/:id
 * @access  Private (Owner or Admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      throw new NotFoundError('Document not found');
    }
    
    // Check permissions: User must own the document or be an admin
    if (document.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to access this document');
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document by ID:', error);
    next(error); // Pass NotFoundError, ForbiddenError, or others
  }
};

/**
 * @desc    Delete a document by ID
 * @route   DELETE /api/documents/:id
 * @access  Private (Owner or Admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      throw new NotFoundError('Document not found');
    }
    
    // Check permissions: User must own the document or be an admin
    if (document.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to delete this document');
    }
    
    // Delete file from storage using fs.promises
    try {
        await fs.unlink(document.filePath);
        console.log(`Deleted file: ${document.filePath}`);
    } catch (unlinkError) {
        // Log error but continue, as the DB entry should still be removed
        console.error(`Failed to delete file ${document.filePath}:`, unlinkError);
        // Optionally, you could choose *not* to delete the DB record if file deletion fails
        // depending on desired behavior.
    }
    
    // Delete document from database
    await document.deleteOne();
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    next(error); // Pass NotFoundError, ForbiddenError, or others
  }
};

/**
 * @desc    Verify or reject a document (admin only)
 * @route   PUT /api/documents/:id/verify
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.verifyDocument = async (req, res, next) => {
  // Validation for status handled by express-validator
  const { status, notes } = req.body;

  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      throw new NotFoundError('Document not found');
    }
    
    // Update verification details
    document.verificationStatus = status; // Already validated
    document.verificationDate = Date.now();
    document.verificationNotes = notes || ''; // Use notes if provided, else empty string
    
    const updatedDocument = await document.save();
    
    res.json(updatedDocument);
  } catch (error) {
    console.error('Error verifying document:', error);
    // Mongoose validation errors handled globally
    next(error); // Pass NotFoundError or others
  }
};