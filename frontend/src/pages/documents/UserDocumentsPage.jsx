import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DocumentUploadForm from '../../components/profile/DocumentUploadForm';
import profileApi from '../../services/profileApi';

/**
 * Page component for users to view, upload, and manage their documents
 */
const UserDocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Function to fetch user documents
  const fetchDocuments = useCallback(async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await profileApi.getProfile();
      setDocuments(response.data.documents || []);
      setError('');
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Load documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle document upload
  const handleDocumentUpload = async (formData) => {
    try {
      setLoading(true);
      await profileApi.uploadDocument(formData);
      await fetchDocuments(); 
      setSuccess('Document uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
      return { success: true, message: 'Document uploaded successfully' };
    } catch (err) {
      console.error('Error uploading document:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to upload document' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Handle document deletion
  const handleDocumentDelete = async (docId) => {
    try {
      setLoading(true);
      await profileApi.deleteDocument(docId);
      await fetchDocuments();
      setSuccess('Document deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      return { success: true, message: 'Document deleted successfully' };
    } catch (err) {
      console.error('Error deleting document:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to delete document' 
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <h2>My Documents</h2>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      
      {loading && documents.length === 0 ? (
        <p>Loading documents...</p>
      ) : (
        <DocumentUploadForm
          documents={documents}
          onUpload={handleDocumentUpload}
          onDelete={handleDocumentDelete}
          loading={loading}
        />
      )}
    </div>
  );
};

export default UserDocumentsPage;