import React, { useState } from 'react';
import './DocumentUploadForm.css';

/**
 * Component for users to upload and manage documents
 */
const DocumentUploadForm = ({ documents, onUpload, onDelete, loading }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('identification');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the maximum limit of 5MB.');
      setFile(null);
      e.target.value = null; // Reset file input
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError('Only PDF, JPEG, JPG, and PNG files are allowed.');
      setFile(null);
      e.target.value = null; // Reset file input
      return;
    }
    
    setFile(selectedFile);
    setUploadError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);
    
    try {
      const result = await onUpload(formData);
      
      if (!result.success) {
        setUploadError(result.message || 'Failed to upload document.');
      } else {
        // Reset form on successful upload
        setFile(null);
        setDocumentType('identification');
        e.target.reset(); // Reset form fields
      }
    } catch (error) {
      setUploadError('An unexpected error occurred. Please try again.');
      console.error('Document upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle document deletion
  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await onDelete(docId);
      } catch (error) {
        console.error('Document deletion error:', error);
      }
    }
  };

  // Format document type for display
  const formatDocumentType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="document-upload-container">
      {/* Upload Form */}
      <div className="document-upload-form">
        <h3>Upload Document</h3>
        
        {uploadError && <div className="form-error">{uploadError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="documentType">Document Type</label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
            >
              <option value="identification">Identification</option>
              <option value="proof_of_address">Proof of Address</option>
              <option value="business_license">Business License</option>
              <option value="contract">Contract</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="documentFile">Select File</label>
            <input
              type="file"
              id="documentFile"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              required
            />
            <small className="file-info">
              Maximum file size: 5MB. Supported formats: PDF, JPEG, JPG, PNG
            </small>
          </div>
          
          {file && (
            <div className="file-preview">
              <p>
                <strong>Selected file:</strong> {file.name}
              </p>
              <p>
                <strong>Size:</strong> {formatFileSize(file.size)}
              </p>
            </div>
          )}
          
          <button
            type="submit"
            className="btn primary"
            disabled={isUploading || loading || !file}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>
      
      {/* Documents List */}
      <div className="documents-list">
        <h3>My Documents</h3>
        
        {loading ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <table className="documents-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Filename</th>
                <th>Uploaded Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td>{formatDocumentType(doc.type)}</td>
                  <td>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="document-link"
                    >
                      {doc.filename || 'View Document'}
                    </a>
                  </td>
                  <td>{formatDate(doc.uploadedAt)}</td>
                  <td>
                    <button
                      className="btn delete-btn"
                      onClick={() => handleDelete(doc._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadForm;