const Document = require('../models/Document');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Upload new document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create new document
    const document = await Document.create({
      user: req.user.id,
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'Other',
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
    
    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id });
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if the document belongs to the user
    if (document.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }
    
    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if the document belongs to the user
    if (document.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }
    
    // Delete file from storage
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Delete document from database
    await document.deleteOne();
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify document (admin only)
// @route   PUT /api/documents/:id/verify
// @access  Private/Admin
exports.verifyDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    document.verificationStatus = req.body.status || 'Verified';
    document.verificationDate = Date.now();
    document.verificationNotes = req.body.notes || '';
    
    const updatedDocument = await document.save();
    
    res.json(updatedDocument);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};