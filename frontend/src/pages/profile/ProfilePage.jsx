import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileForm from '../../components/profile/ProfileForm';
import PasswordChangeForm from '../../components/profile/PasswordChangeForm';
import DocumentUploadForm from '../../components/profile/DocumentUploadForm';
import MFASetupForm from '../../components/profile/MFASetupForm';
import profileApi from '../../services/profileApi';
import mfaApi from '../../services/mfaApi';
import './ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState(false); // Separate loading state for operations
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Use useCallback to memoize fetchProfileData
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileApi.getProfile();
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      setProfileData(response.data);
      
      // Update user context if needed
      if (user && response.data && 
          (user.name !== response.data.name || 
           user.email !== response.data.email ||
           user.role !== response.data.role)) {
        updateUser({
          ...user,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user, updateUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleProfileUpdate = async (updatedData) => {
    try {
      setOperationInProgress(true);
      setError(null);
      const response = await profileApi.updateProfile(updatedData);
      setProfileData(response.data);
      setSuccessMessage('Profile updated successfully!');
      return { success: true, message: 'Profile updated successfully' };
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update profile';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setOperationInProgress(false);
    }
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      setOperationInProgress(true);
      setError(null);
      await profileApi.changePassword(passwordData);
      setSuccessMessage('Password changed successfully!');
      return { success: true, message: 'Password changed successfully' };
    } catch (err) {
      console.error('Error changing password:', err);
      const errorMsg = err.response?.data?.message || 'Failed to change password';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setOperationInProgress(false);
    }
  };

  // MFA handlers
  const handleMFAOperations = {
    generateSecret: async () => {
      try {
        setOperationInProgress(true);
        setError(null);
        const response = await mfaApi.generateSecret();
        return { success: true, data: response.data };
      } catch (err) {
        console.error('Error generating MFA secret:', err);
        const errorMsg = err.response?.data?.message || 'Failed to generate MFA secret';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      } finally {
        setOperationInProgress(false);
      }
    },
    enableMFA: async ({ token, secret }) => {
      try {
        setOperationInProgress(true);
        setError(null);
        const response = await mfaApi.enableMFA(token, secret);
        await fetchProfileData(); // Refresh profile to update MFA status
        setSuccessMessage('Multi-factor authentication enabled successfully!');
        return { 
          success: true, 
          message: 'MFA enabled successfully', 
          data: { recoveryCodes: response.data.recoveryCodes } 
        };
      } catch (err) {
        console.error('Error enabling MFA:', err);
        const errorMsg = err.response?.data?.message || 'Failed to enable MFA';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      } finally {
        setOperationInProgress(false);
      }
    }
  };

  const handleDisableMFA = async ({ password }) => {
    try {
      setOperationInProgress(true);
      setError(null);
      await mfaApi.disableMFA(password);
      await fetchProfileData(); // Refresh profile to update MFA status
      setSuccessMessage('Multi-factor authentication disabled successfully!');
      return { success: true, message: 'MFA disabled successfully' };
    } catch (err) {
      console.error('Error disabling MFA:', err);
      const errorMsg = err.response?.data?.message || 'Failed to disable MFA';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleDocumentUpload = async (formData) => {
    try {
      setOperationInProgress(true);
      setError(null);
      const response = await profileApi.uploadDocument(formData);
      await fetchProfileData(); // Refresh profile data to get updated documents list
      setSuccessMessage('Document uploaded successfully!');
      return { 
        success: true, 
        message: 'Document uploaded successfully',
        documentId: response.data?.documentId
      };
    } catch (err) {
      console.error('Error uploading document:', err);
      const errorMsg = err.response?.data?.message || 'Failed to upload document';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setOperationInProgress(false);
    }
  };

  // Function to handle document deletion and refresh
  const handleDocumentDelete = async (docId) => {
    try {
      setOperationInProgress(true);
      setError(null);
      await profileApi.deleteDocument(docId);
      await fetchProfileData(); // Refresh after delete
      setSuccessMessage('Document deleted successfully!');
      return { success: true, message: 'Document deleted successfully' };
    } catch (err) {
      console.error('Error deleting document:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete document';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
    );
    
    if (!isConfirmed) return;
    
    try {
      setOperationInProgress(true);
      setError(null);
      await profileApi.deleteAccount();
      // Show success message temporarily before redirecting
      setSuccessMessage('Account deleted successfully. Redirecting...');
      
      // Short delay before logout and redirect
      setTimeout(() => {
        // Log user out after account deletion
        logout();
        // Redirect to homepage
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setOperationInProgress(false);
    }
  };

  // Initial loading state
  if (loading && !profileData) {
    return (
      <div className="profile-loading-container">
        <div className="profile-loading">Loading profile information...</div>
      </div>
    );
  }

  // Check if user is customer to show delete option
  const canDeleteAccount = profileData?.role === 'customer' || user?.role === 'customer'; 

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      
      {error && (
        <div className="profile-message error-message" role="alert">
          <span className="message-icon">⚠️</span> {error}
        </div>
      )}
      
      {successMessage && (
        <div className="profile-message success-message" role="status">
          <span className="message-icon">✓</span> {successMessage}
        </div>
      )}
      
      <div className="profile-tabs" role="tablist">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          role="tab"
          aria-selected={activeTab === 'profile'}
          id="tab-profile"
          aria-controls="panel-profile"
        >
          Profile Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
          role="tab"
          aria-selected={activeTab === 'password'}
          id="tab-password"
          aria-controls="panel-password"
        >
          Change Password
        </button>
        <button 
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
          role="tab"
          aria-selected={activeTab === 'security'}
          id="tab-security"
          aria-controls="panel-security"
        >
          Security
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
          role="tab"
          aria-selected={activeTab === 'documents'}
          id="tab-documents"
          aria-controls="panel-documents"
        >
          Documents
        </button>
      </div>
      
      <div className="profile-content">
        <div 
          role="tabpanel" 
          id="panel-profile" 
          aria-labelledby="tab-profile"
          hidden={activeTab !== 'profile'}
        >
          {activeTab === 'profile' && (
            <ProfileForm 
              profileData={profileData} 
              onSubmit={handleProfileUpdate}
              loading={operationInProgress}
            />
          )}
        </div>
        
        <div 
          role="tabpanel" 
          id="panel-password" 
          aria-labelledby="tab-password"
          hidden={activeTab !== 'password'}
        >
          {activeTab === 'password' && (
            <PasswordChangeForm 
              onSubmit={handlePasswordChange}
              loading={operationInProgress}
            />
          )}
        </div>
        
        <div 
          role="tabpanel" 
          id="panel-security" 
          aria-labelledby="tab-security"
          hidden={activeTab !== 'security'}
        >
          {activeTab === 'security' && (
            <MFASetupForm 
              profileData={profileData}
              onEnableMFA={handleMFAOperations}
              onDisableMFA={handleDisableMFA}
              loading={operationInProgress}
            />
          )}
        </div>
        
        <div 
          role="tabpanel" 
          id="panel-documents" 
          aria-labelledby="tab-documents"
          hidden={activeTab !== 'documents'}
        >
          {activeTab === 'documents' && (
            <DocumentUploadForm 
              documents={profileData?.documents || []}
              onUpload={handleDocumentUpload}
              onDelete={handleDocumentDelete}
              loading={operationInProgress}
            />
          )}
        </div>
      </div>
      
      {canDeleteAccount && (
        <div className="delete-account-section">
          <h3>Delete Account</h3>
          <p>Once you delete your account, there is no going back. Please be certain.</p>
          <button 
            className="delete-account-button"
            onClick={handleDeleteAccount}
            disabled={operationInProgress}
          >
            {operationInProgress ? 'Processing...' : 'Delete My Account'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;