import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { useAuth } from '../../contexts/AuthContext';
import ProfileForm from '../../components/profile/ProfileForm';
import PasswordChangeForm from '../../components/profile/PasswordChangeForm';
import DocumentUploadForm from '../../components/profile/DocumentUploadForm';
import profileApi from '../../services/profileApi';
import './ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { _user, logout } = useAuth(); // Get logout function
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await profileApi.getProfile();
        setProfileData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleProfileUpdate = async (updatedData) => {
    try {
      setLoading(true);
      const response = await profileApi.updateProfile(updatedData);
      setProfileData(response.data);
      return { success: true, message: 'Profile updated successfully' };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update profile' 
      };
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      setLoading(true);
      await profileApi.changePassword(passwordData);
      return { success: true, message: 'Password changed successfully' };
    } catch (err) {
      console.error('Error changing password:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to change password' 
      };
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (formData) => {
    try {
      setLoading(true);
      await profileApi.uploadDocument(formData);
      // Refresh profile data to get updated documents list
      const response = await profileApi.getProfile();
      setProfileData(response.data);
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

  const handleDeleteAccount = async () => {
    // Confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
    );
    
    if (!isConfirmed) return;
    
    try {
      setLoading(true);
      await profileApi.deleteAccount();
      // Log user out after account deletion
      logout();
      // Redirect to homepage
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData) {
    return <div className="profile-loading">Loading profile information...</div>;
  }

  // Check if user is Resident/Garbage_Buyer to show delete option
  const canDeleteAccount = profileData?.role === 'Resident/Garbage_Buyer';

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      {error && <div className="profile-error">{error}</div>}
      
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
      </div>
      
      <div className="profile-content">
        {activeTab === 'profile' && (
          <ProfileForm 
            profileData={profileData} 
            onSubmit={handleProfileUpdate}
            loading={loading}
          />
        )}
        
        {activeTab === 'password' && (
          <PasswordChangeForm 
            onSubmit={handlePasswordChange}
            loading={loading}
          />
        )}
        
        {activeTab === 'documents' && (
          <DocumentUploadForm 
            documents={profileData?.documents || []}
            onUpload={handleDocumentUpload}
            loading={loading}
          />
        )}
      </div>
      
      {canDeleteAccount && (
        <div className="delete-account-section">
          <h3>Delete Account</h3>
          <p>Once you delete your account, there is no going back. Please be certain.</p>
          <button 
            className="delete-account-button"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Delete My Account'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;