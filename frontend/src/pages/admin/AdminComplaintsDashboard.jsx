import React, { useState, useEffect, useCallback } from 'react';
import ComplaintList from '../../components/complaints/ComplaintList';
import ComplaintDetail from '../../components/complaints/ComplaintDetail';
import complaintApi from '../../services/complaintApi';
import '../../components/complaints/ComplaintComponents.css';

const AdminComplaintsDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  // Function to fetch all complaints
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      // Add filtering parameters as needed
      const filters = {};
      if (filter !== 'all') {
        filters.status = filter;
      }
      
      const response = await complaintApi.getAllComplaints(filters);
      setComplaints(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Function to fetch a specific complaint
  const fetchComplaintDetails = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await complaintApi.getComplaintById(id);
      setSelectedComplaint(response.data);
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError('Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load complaints on component mount and when filter changes
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Load selected complaint details when ID changes
  useEffect(() => {
    if (selectedComplaintId) {
      fetchComplaintDetails(selectedComplaintId);
    } else {
      setSelectedComplaint(null);
    }
  }, [selectedComplaintId, fetchComplaintDetails]);

  // Handle complaint selection
  const handleSelectComplaint = (id) => {
    setSelectedComplaintId(id);
  };

  // Handle update of complaint details
  const handleComplaintUpdated = () => {
    fetchComplaintDetails(selectedComplaintId);
    fetchComplaints(); // Refresh the list too
  };

  // Handle closing complaint detail view
  const handleCloseDetail = () => {
    setSelectedComplaintId(null);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Calculate counts for dashboard stats
  const countByStatus = {
    new: complaints.filter(c => c.status === 'New').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    closed: complaints.filter(c => c.status === 'Closed').length,
    total: complaints.length
  };

  return (
    <div className="dashboard-content">
      <h2>Complaints Management</h2>
      
      {error && <div className="form-error">{error}</div>}
      
      {!selectedComplaint ? (
        <>
          {/* Dashboard stats */}
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Total Complaints</h3>
              <p>{countByStatus.total}</p>
            </div>
            <div className="dashboard-card">
              <h3>New</h3>
              <p>{countByStatus.new}</p>
            </div>
            <div className="dashboard-card">
              <h3>In Progress</h3>
              <p>{countByStatus.inProgress}</p>
            </div>
            <div className="dashboard-card">
              <h3>Resolved</h3>
              <p>{countByStatus.resolved}</p>
            </div>
          </div>
          
          {/* Filter controls */}
          <div className="admin-filter-bar">
            <select 
              className="filter-select"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All Complaints</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          
          {/* Complaints list */}
          {loading ? (
            <p>Loading complaints...</p>
          ) : (
            <ComplaintList 
              complaints={complaints} 
              onSelectComplaint={handleSelectComplaint}
              isAdminView={true}
            />
          )}
        </>
      ) : (
        <ComplaintDetail 
          complaint={selectedComplaint} 
          isAdmin={true}
          onUpdate={handleComplaintUpdated}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default AdminComplaintsDashboard;