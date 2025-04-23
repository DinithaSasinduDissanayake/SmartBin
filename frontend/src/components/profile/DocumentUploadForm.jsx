import React, { useState } from 'react';
import './ProfileForms.css';

// Accept onDelete prop
const DocumentUploadForm = ({ documents = [], onUpload, onDelete, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Other',
    document: null
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'document') {
      setFormData({
        ...formData,
        document: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear messages when form is being edited
    setFormError('');
    setFormSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    // Validate form
    if (!formData.name.trim()) {
      setFormError('Document name is required');
      return;
    }
    
    if (!formData.document) {
      setFormError('Please select a file to upload');
      return;
    }
    
    // Check file size (5MB max)
    if (formData.document.size > 5 * 1024 * 1024) {
      setFormError('File size exceeds 5MB limit');
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(formData.document.type)) {
      setFormError('Only JPEG, PNG and PDF files are allowed');
      return;
    }
    
    // Create form data for file upload
    const uploadData = new FormData();
    uploadData.append('name', formData.name);
    uploadData.append('type', formData.type);
    uploadData.append('document', formData.document);
    
    // Submit the form
    setUploading(true);
    
    try {
      const result = await onUpload(uploadData);
      
      if (result.success) {
        setFormSuccess(result.message);
        // Reset form
        setFormData({
          name: '',
          type: 'Other',
          document: null
        });
        // Reset file input
        document.getElementById('document-file').value = '';
      } else {
        setFormError(result.message);
      }
    } catch (error) {
      setFormError('An error occurred during upload');
      console.error(error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setFormError(''); // Clear previous errors
      setFormSuccess('');
      try {
        // Call the onDelete handler passed from ProfilePage
        const result = await onDelete(id);
        if (result.success) {
          setFormSuccess(result.message);
        } else {
          setFormError(result.message);
        }
      } catch (error) {
        setFormError('Failed to delete document');
        console.error('Error deleting document:', error);
      }
    }
  };

  return (
    <div className="profile-form-container">
      <h3>Upload Verification Documents</h3>
      
      {formError && <div className="form-error">{formError}</div>}
      {formSuccess && <div className="form-success">{formSuccess}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Document Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            disabled={loading || uploading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="type">Document Type</label>
          <select 
            id="type" 
            name="type" 
            value={formData.type} 
            onChange={handleChange}
            disabled={loading || uploading}
          >
            <option value="ID Card">ID Card</option>
            <option value="Utility Bill">Utility Bill</option>
            <option value="Driver License">Driver's License</option>
            <option value="Passport">Passport</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="document-file">Select File</label>
          <input 
            type="file" 
            id="document-file" 
            name="document" 
            onChange={handleChange}
            disabled={loading || uploading}
            accept=".jpg,.jpeg,.png,.pdf"
          />
          <small>Max file size: 5MB. Allowed formats: JPG, PNG, PDF</small>
        </div>
        
        {uploading && (
          <div className="upload-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span>{uploadProgress}%</span>
          </div>
        )}
        
        <button 
          type="submit" 
          className="profile-form-button"
          disabled={loading || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
      
      <div className="documents-list">
        <h4>Your Documents</h4>
        
        {documents.length === 0 ? (
          <p className="no-documents">You haven't uploaded any documents yet.</p>
        ) : (
          <table className="documents-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.name}</td>
                  <td>{doc.type}</td>
                  <td>
                    <span className={`status-badge ${doc.verificationStatus.toLowerCase()}`}>
                      {doc.verificationStatus}
                    </span>
                  </td>
                  <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="document-action-btn view"
                      // Use the full filePath relative to the /uploads route
                      onClick={() => window.open(`/uploads/${doc.filePath}`, '_blank')} 
                    >
                      View
                    </button>
                    <button 
                      className="document-action-btn delete"
                      onClick={() => handleDeleteDocument(doc._id)} // Use the internal handler
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