import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../components/complaints/ComplaintComponents.css';

/**
 * Page component for customers to view and submit their complaints
 */
const MyComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newComplaint, setNewComplaint] = useState({
    subject: '',
    type: 'Service',
    description: ''
  });
  
  // Simulated complaint data - replace with actual API calls in production
  const fetchComplaints = useCallback(async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      // Simulate API call with timeout
      setTimeout(() => {
        const mockComplaints = [
          {
            _id: '1',
            subject: 'Missed Pickup',
            type: 'Service',
            description: 'My waste was not collected on the scheduled date (April 24, 2025)',
            status: 'new',
            createdAt: '2025-04-24T10:30:00',
            responses: []
          },
          {
            _id: '2',
            subject: 'Billing Issue',
            type: 'Billing',
            description: 'I was charged twice for my April subscription',
            status: 'in-progress',
            createdAt: '2025-04-22T14:15:00',
            responses: [
              {
                _id: 'r1',
                content: 'We are investigating this issue and will resolve it shortly.',
                createdAt: '2025-04-23T09:20:00',
                isStaff: true,
                author: 'Support Staff'
              }
            ]
          }
        ];
        
        setComplaints(mockComplaints);
        setLoading(false);
        setError('');
      }, 1000);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again later.');
      setLoading(false);
    }
  }, [user?._id]);

  // Load complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComplaint(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newComplaint.subject.trim() || !newComplaint.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    // Add the new complaint to the list (simulate server response)
    const newComplaintObj = {
      _id: `temp-${Date.now()}`,
      ...newComplaint,
      status: 'new',
      createdAt: new Date().toISOString(),
      responses: []
    };
    
    setComplaints([newComplaintObj, ...complaints]);
    
    // Reset form
    setNewComplaint({
      subject: '',
      type: 'Service',
      description: ''
    });
    
    // Show success message
    alert('Complaint submitted successfully!');
  };

  // Handle complaint selection
  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
  };

  // Handle back button in detail view
  const handleBackToList = () => {
    setSelectedComplaint(null);
  };

  // Handle adding response to a complaint
  const handleAddResponse = (complaintId, responseText) => {
    if (!responseText.trim()) return;
    
    const updatedComplaints = complaints.map(complaint => {
      if (complaint._id === complaintId) {
        const newResponse = {
          _id: `resp-${Date.now()}`,
          content: responseText,
          createdAt: new Date().toISOString(),
          isStaff: false,
          author: user?.name || 'Customer'
        };
        
        return {
          ...complaint,
          responses: [...complaint.responses, newResponse]
        };
      }
      return complaint;
    });
    
    setComplaints(updatedComplaints);
    
    // Update selectedComplaint as well to reflect changes
    if (selectedComplaint && selectedComplaint._id === complaintId) {
      const updatedComplaint = updatedComplaints.find(c => c._id === complaintId);
      setSelectedComplaint(updatedComplaint);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="dashboard-content">
      <h2>My Complaints</h2>
      
      {error && <div className="form-error">{error}</div>}
      
      {selectedComplaint ? (
        // Complaint detail view
        <div className="complaint-detail">
          <div className="complaint-detail-header">
            <div>
              <h3 className="complaint-detail-title">{selectedComplaint.subject}</h3>
              <div className="complaint-detail-meta">
                <div className="meta-item">
                  <span className="meta-label">Status:</span>
                  <span className={`complaint-status status-${selectedComplaint.status}`}>
                    {selectedComplaint.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Type:</span>
                  <span>{selectedComplaint.type}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Submitted:</span>
                  <span>{formatDate(selectedComplaint.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <button className="action-btn action-back" onClick={handleBackToList}>
              Back to List
            </button>
          </div>
          
          <div>
            <h4>Description</h4>
            <div className="complaint-description">
              {selectedComplaint.description}
            </div>
          </div>
          
          {/* Response section */}
          <div className="responses-history">
            <h4>Responses</h4>
            
            {selectedComplaint.responses.length === 0 ? (
              <p>No responses yet.</p>
            ) : (
              selectedComplaint.responses.map(response => (
                <div key={response._id} className="response-item">
                  <div className="response-header">
                    <span className="response-author">
                      {response.isStaff ? '👤 ' + response.author : '🧑 You'}
                    </span>
                    <span className="response-date">{formatDate(response.createdAt)}</span>
                  </div>
                  <div className="response-content">{response.content}</div>
                </div>
              ))
            )}
          </div>
          
          {/* Add new response form */}
          {selectedComplaint.status !== 'closed' && (
            <div className="response-section">
              <h4>Add Response</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const responseText = e.target.elements.responseText.value;
                handleAddResponse(selectedComplaint._id, responseText);
                e.target.elements.responseText.value = '';
              }}>
                <textarea 
                  name="responseText" 
                  placeholder="Type your response here..." 
                  required
                ></textarea>
                <button type="submit" className="action-btn action-update">
                  Submit Response
                </button>
              </form>
            </div>
          )}
        </div>
      ) : loading ? (
        // Loading state
        <p>Loading complaints...</p>
      ) : (
        // Complaints list view
        <>
          {/* New complaint form */}
          <div className="complaint-section">
            <h3>Submit a New Complaint</h3>
            <form className="complaint-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={newComplaint.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  name="type"
                  value={newComplaint.type}
                  onChange={handleInputChange}
                >
                  <option value="Service">Service Issue</option>
                  <option value="Billing">Billing Issue</option>
                  <option value="Technical">Technical Problem</option>
                  <option value="Feedback">General Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-row">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={newComplaint.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <button type="submit" className="submit-button">
                Submit Complaint
              </button>
            </form>
          </div>
          
          {/* Complaints list */}
          <div className="complaint-section">
            <h3>My Previous Complaints</h3>
            
            {complaints.length === 0 ? (
              <p>You haven't submitted any complaints yet.</p>
            ) : (
              <ul className="complaints-list">
                {complaints.map(complaint => (
                  <li 
                    key={complaint._id} 
                    className={`complaint-item ${complaint.status}`}
                    onClick={() => handleSelectComplaint(complaint)}
                  >
                    <div className="complaint-header">
                      <h4 className="complaint-title">{complaint.subject}</h4>
                      <span className={`complaint-status status-${complaint.status}`}>
                        {complaint.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="complaint-meta">
                      <span>{complaint.type}</span>
                      <span>{formatDate(complaint.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyComplaintsPage;