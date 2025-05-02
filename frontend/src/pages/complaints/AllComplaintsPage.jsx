import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../components/complaints/ComplaintComponents.css';

/**
 * Page component for admins and staff to manage all complaints
 */
const AllComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Response state
  const [responseText, setResponseText] = useState('');
  
  // Simulated complaint data - replace with actual API calls in production
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call with timeout
      setTimeout(() => {
        const mockComplaints = [
          {
            _id: '1',
            user: {
              _id: 'u1',
              name: 'Alice Johnson',
              email: 'alice@example.com'
            },
            subject: 'Missed Pickup',
            type: 'Service',
            description: 'My waste was not collected on the scheduled date (April 24, 2025)',
            status: 'new',
            createdAt: '2025-04-24T10:30:00',
            responses: []
          },
          {
            _id: '2',
            user: {
              _id: 'u2',
              name: 'Bob Smith',
              email: 'bob@example.com'
            },
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
          },
          {
            _id: '3',
            user: {
              _id: 'u3',
              name: 'Carol Davis',
              email: 'carol@example.com'
            },
            subject: 'App Not Working',
            type: 'Technical',
            description: 'The mobile app crashes whenever I try to schedule a pickup.',
            status: 'new',
            createdAt: '2025-04-23T16:45:00',
            responses: []
          },
          {
            _id: '4',
            user: {
              _id: 'u4',
              name: 'David Wilson',
              email: 'david@example.com'
            },
            subject: 'Suggestion for Service Improvement',
            type: 'Feedback',
            description: 'I think it would be helpful if we could get SMS notifications before pickups.',
            status: 'resolved',
            createdAt: '2025-04-20T11:20:00',
            responses: [
              {
                _id: 'r2',
                content: 'Thank you for your suggestion! We are considering adding this feature in our next update.',
                createdAt: '2025-04-21T10:15:00',
                isStaff: true,
                author: 'Product Manager'
              },
              {
                _id: 'r3',
                content: 'Thanks for considering my suggestion!',
                createdAt: '2025-04-21T14:30:00',
                isStaff: false,
                author: 'David Wilson'
              }
            ]
          }
        ];
        
        setComplaints(mockComplaints);
        setFilteredComplaints(mockComplaints);
        setLoading(false);
        setError('');
      }, 1000);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Apply filters whenever the filter conditions change
  useEffect(() => {
    if (complaints.length === 0) return;
    
    let result = [...complaints];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(complaint => complaint.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(complaint => complaint.type === typeFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(complaint => 
        complaint.subject.toLowerCase().includes(term) ||
        complaint.description.toLowerCase().includes(term) ||
        complaint.user.name.toLowerCase().includes(term) ||
        complaint.user.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredComplaints(result);
  }, [complaints, statusFilter, typeFilter, searchTerm]);

  // Load complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Handle complaint selection
  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText('');
  };

  // Handle back button in detail view
  const handleBackToList = () => {
    setSelectedComplaint(null);
  };

  // Handle adding response to a complaint
  const handleAddResponse = (e) => {
    e.preventDefault();
    if (!responseText.trim() || !selectedComplaint) return;
    
    const updatedComplaints = complaints.map(complaint => {
      if (complaint._id === selectedComplaint._id) {
        const newResponse = {
          _id: `resp-${Date.now()}`,
          content: responseText,
          createdAt: new Date().toISOString(),
          isStaff: true,
          author: user?.name || 'Staff Member'
        };
        
        return {
          ...complaint,
          responses: [...complaint.responses, newResponse]
        };
      }
      return complaint;
    });
    
    setComplaints(updatedComplaints);
    
    // Update filteredComplaints as well
    setFilteredComplaints(prev => 
      prev.map(c => c._id === selectedComplaint._id ? 
        updatedComplaints.find(uc => uc._id === selectedComplaint._id) : c
      )
    );
    
    // Update selectedComplaint to reflect changes
    const updatedComplaint = updatedComplaints.find(c => c._id === selectedComplaint._id);
    setSelectedComplaint(updatedComplaint);
    
    // Clear response text
    setResponseText('');
  };

  // Handle updating complaint status
  const handleUpdateStatus = (status) => {
    if (!selectedComplaint) return;
    
    const updatedComplaints = complaints.map(complaint => {
      if (complaint._id === selectedComplaint._id) {
        return {
          ...complaint,
          status
        };
      }
      return complaint;
    });
    
    setComplaints(updatedComplaints);
    
    // Update filteredComplaints as well
    setFilteredComplaints(prev => 
      prev.map(c => c._id === selectedComplaint._id ? 
        {...c, status} : c
      )
    );
    
    // Update selectedComplaint to reflect changes
    setSelectedComplaint({
      ...selectedComplaint,
      status
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="dashboard-content">
      <h2>Complaint Management</h2>
      
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
                  <span className="meta-label">Customer:</span>
                  <span>{selectedComplaint.user.name} ({selectedComplaint.user.email})</span>
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
            <h4>Communication History</h4>
            
            {selectedComplaint.responses.length === 0 ? (
              <p>No responses yet.</p>
            ) : (
              selectedComplaint.responses.map(response => (
                <div key={response._id} className="response-item">
                  <div className="response-header">
                    <span className="response-author">
                      {response.isStaff ? '👤 ' + response.author : '🧑 ' + response.author}
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
              <form onSubmit={handleAddResponse}>
                <textarea 
                  name="responseText" 
                  placeholder="Type your response here..." 
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  required
                ></textarea>
                <button type="submit" className="action-btn action-update">
                  Send Response
                </button>
              </form>
            </div>
          )}
          
          {/* Admin actions */}
          <div className="admin-actions">
            <button 
              className="action-btn action-update"
              onClick={() => handleUpdateStatus('in-progress')}
              disabled={selectedComplaint.status === 'in-progress'}
            >
              Mark In Progress
            </button>
            <button 
              className="action-btn action-resolve"
              onClick={() => handleUpdateStatus('resolved')}
              disabled={selectedComplaint.status === 'resolved'}
            >
              Mark Resolved
            </button>
            <button 
              className="action-btn action-close"
              onClick={() => handleUpdateStatus('closed')}
              disabled={selectedComplaint.status === 'closed'}
            >
              Close Complaint
            </button>
          </div>
        </div>
      ) : loading ? (
        // Loading state
        <p>Loading complaints...</p>
      ) : (
        // Complaints list view
        <>
          {/* Filter controls */}
          <div className="complaint-section">
            <div className="filter-controls">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <span className="filter-label">Status:</span>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div className="filter-group">
                <span className="filter-label">Type:</span>
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="Service">Service</option>
                  <option value="Billing">Billing</option>
                  <option value="Technical">Technical</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            {/* Complaints table */}
            {filteredComplaints.length === 0 ? (
              <p>No complaints found matching your filters.</p>
            ) : (
              <table className="payroll-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map(complaint => (
                    <tr 
                      key={complaint._id} 
                      onClick={() => handleSelectComplaint(complaint)}
                      className="clickable"
                    >
                      <td>{complaint.subject}</td>
                      <td>{complaint.user.name}</td>
                      <td>{complaint.type}</td>
                      <td>
                        <span className={`complaint-status status-${complaint.status}`}>
                          {complaint.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                      <td>{complaint.responses.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AllComplaintsPage;