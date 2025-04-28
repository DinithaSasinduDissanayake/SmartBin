import React, { useState } from 'react';
import complaintApi from '../../services/complaintApi';
import '../complaints/ComplaintComponents.css';

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString() : 'N/A';

const ComplaintDetail = ({ complaint, isAdmin = false, onUpdate, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  if (!complaint) {
    return null;
  }

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    setError('');
    try {
      await complaintApi.updateStatus(complaint._id, newStatus);
      if (onUpdate) onUpdate(); // Refresh data in parent
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setError('Resolution notes are required');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await complaintApi.addResolution(complaint._id, resolutionNotes);
      await complaintApi.updateStatus(complaint._id, 'Resolved');
      setIsResolving(false);
      if (onUpdate) onUpdate(); // Refresh data in parent
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve complaint');
      console.error('Resolution error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-detail">
      <div className="complaint-header">
        <h3 className="complaint-title">{complaint.subject}</h3>
        <button className="btn secondary" onClick={onClose}>Close</button>
      </div>

      <div className="complaint-meta">
        <div>Status: <span className={`status ${complaint.status.toLowerCase().replace(' ', '-')}`}>{complaint.status}</span></div>
        <div>Submitted: {formatDate(complaint.createdAt)}</div>
        {isAdmin && complaint.user && <div>By: {complaint.user.name}</div>}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div>
        <strong>Description:</strong>
        <div className="complaint-description">{complaint.description}</div>
      </div>

      {complaint.resolutionNotes && (
        <div className="resolution-notes">
          <div className="resolution-header">Resolution:</div>
          {complaint.resolutionNotes}
        </div>
      )}

      {isAdmin && !isResolving && complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
        <div className="complaint-actions">
          {complaint.status === 'New' && (
            <button 
              className="btn primary" 
              onClick={() => handleStatusChange('In Progress')}
              disabled={loading}
            >
              Mark In Progress
            </button>
          )}
          
          <button 
            className="btn primary" 
            onClick={() => setIsResolving(true)}
            disabled={loading}
          >
            Resolve Complaint
          </button>
        </div>
      )}

      {isAdmin && complaint.status === 'Resolved' && (
        <div className="complaint-actions">
          <button 
            className="btn primary" 
            onClick={() => handleStatusChange('Closed')}
            disabled={loading}
          >
            Close Complaint
          </button>
        </div>
      )}

      {isResolving && (
        <form className="resolution-form" onSubmit={handleResolveSubmit}>
          <div className="form-group">
            <label htmlFor="resolutionNotes">Resolution Notes</label>
            <textarea
              id="resolutionNotes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              disabled={loading}
              required
              placeholder="Describe how the complaint was resolved..."
            ></textarea>
          </div>
          <div className="complaint-actions">
            <button 
              type="submit" 
              className="btn primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Submit Resolution'}
            </button>
            <button 
              type="button" 
              className="btn secondary"
              onClick={() => setIsResolving(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ComplaintDetail;