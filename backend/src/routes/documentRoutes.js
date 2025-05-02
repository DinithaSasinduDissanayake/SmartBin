const express = require('express');
const router = express.Router();
const { 
  uploadDocument, 
  getUserDocuments, 
  getDocumentById, 
  deleteDocument, 
  verifyDocument 
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { param, body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationErrorHandler');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function(req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and PDF allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max size
});

// Validation for document ID parameter
const documentIdValidation = [
  param('id').isMongoId().withMessage('Invalid document ID format')
];

// Validation for document verification
const verifyDocumentValidation = [
  body('verified').isBoolean().withMessage('Verified status must be a boolean'),
  body('verificationNotes').optional().isString().trim().escape()
];

// All routes are protected with authentication
router.use(protect);

// Routes for documents
router.route('/')
  .get(getUserDocuments);

router.route('/upload')
  .post(upload.single('document'), uploadDocument);

router.route('/:id')
  .get(documentIdValidation, handleValidationErrors, getDocumentById)
  .delete(documentIdValidation, handleValidationErrors, deleteDocument);

// Admin only routes
router.route('/:id/verify')
  .put(
    authorize('admin'), 
    documentIdValidation,
    verifyDocumentValidation,
    handleValidationErrors,
    verifyDocument
  );

module.exports = router;