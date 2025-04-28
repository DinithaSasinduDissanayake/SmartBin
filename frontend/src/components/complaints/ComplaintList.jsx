import React from 'react';
import '../complaints/ComplaintComponents.css';

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

const ComplaintList = ({ complaints = [], onSelectComplaint, isAdminView = false }) => {
  if (complaints.length === 0) {
    return <p className="no-data-message">No complaints found.</p>;
  }

  return (
    <div className="complaints-list-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Status</th>
            {isAdminView && <th>Submitted By</th>}
            <th>Date Submitted</th>
            <th>Last Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint._id}>
              <td>{complaint.subject}</td>
              <td>
                <span className={`status ${complaint.status.toLowerCase().replace(' ', '-')}`}>
                  {complaint.status}
                </span>
              </td>
              {isAdminView && <td>{complaint.user?.name || 'Unknown User'}</td>}
              <td>{formatDate(complaint.createdAt)}</td>
              <td>{formatDate(complaint.updatedAt)}</td>
              <td>
                <button 
                  className="view-btn"
                  onClick={() => onSelectComplaint(complaint._id)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintList;