import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DocumentUploadForm from '../../components/profile/DocumentUploadForm';

/**
 * Page component for users to manage their documents
 */
const UserDocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch user documents on component mount
  useEffect(() => {
    fetchUserDocuments();
  }, []);
  
  // Fetch user documents from API
  const fetchUserDocuments = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const mockDocuments = [
          {
            _id: 'doc1',
            userId: user._id,
            type: 'identification',
            filename: 'national_id.pdf',
            url: '#',
            uploadedAt: '2025-04-10T15:30:00',
            fileSize: 1024000
          },
          {
            _id: 'doc2',
            userId: user._id,
            type: 'proof_of_address',
            filename: 'utility_bill.pdf',
            url: '#',
            uploadedAt: '2025-04-05T11:20:00',
            fileSize: 850000
          },
          {
            _id: 'doc3',
            userId: user._id,
            type: 'contract',
            filename: 'service_agreement.pdf',
            url: '#',
            uploadedAt: '2025-03-15T09:45:00',
            fileSize: 1500000
          }
        ];
        setDocuments(mockDocuments);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load your documents. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle document upload
  const handleUploadDocument = async (formData) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          // Generate a mock document
          const newDocument = {
            _id: `doc${Date.now()}`,
            userId: user._id,
            type: formData.get('type'),
            filename: formData.get('document').name,
            url: '#',
            uploadedAt: new Date().toISOString(),
            fileSize: formData.get('document').size
          };
          
          setDocuments((prevDocs) => [...prevDocs, newDocument]);
          setSuccessMessage('Document uploaded successfully!');
          setLoading(false);
          
          // Auto-hide success message after 5 seconds
          setTimeout(() => {
            setSuccessMessage('');
          }, 5000);
          
          resolve({ success: true, document: newDocument });
        }, 1500);
      });
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
      setLoading(false);
      return { success: false, message: err.message || 'Upload failed' };
    }
  };
  
  // Handle document deletion
  const handleDeleteDocument = async (documentId) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          setDocuments((prevDocs) => 
            prevDocs.filter((doc) => doc._id !== documentId)
          );
          setSuccessMessage('Document deleted successfully!');
          setLoading(false);
          
          // Auto-hide success message after 5 seconds
          setTimeout(() => {
            setSuccessMessage('');
          }, 5000);
          
          resolve({ success: true });
        }, 1000);
      });
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
      setLoading(false);
      return { success: false, message: err.message || 'Deletion failed' };
    }
  };

  return (
    <div className="dashboard-content">
      <h2>My Documents</h2>
      <p>Upload and manage your important documents in one secure place.</p>
      
      {error && <div className="form-error">{error}</div>}
      {successMessage && <div className="alert-success">{successMessage}</div>}
      
      <DocumentUploadForm 
        documents={documents}
        onUpload={handleUploadDocument}
        onDelete={handleDeleteDocument}
        loading={loading}
      />
    </div>
  );
};

export default UserDocumentsPage;