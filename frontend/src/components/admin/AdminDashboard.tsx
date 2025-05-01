import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate(); 

  // Function to handle navigation back to the Waste Recycle page
  const handleBackToUserClick = () => {
    navigate('/'); // Navigate to the Waste Recycle page
  };

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={handleBackToUserClick}
        style={{
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          padding: '8px 16px',
          backgroundColor:'#3476f1', 
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        Back To User
      </button>

      <h2>Admin Dashboard</h2>
      <p>Welcome to the Admin Dashboard. Use the sidebar to navigate to the Recycling Requests page.</p>
    </div>
  );
};

export default AdminDashboard;