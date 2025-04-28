import api from './api';

const complaintApi = {
  // Submit a new complaint
  submitComplaint: (data) => api.post('/complaints', data),

  // Get complaints submitted by the current user
  getMyComplaints: () => api.get('/complaints/my-complaints'),

  // Get a specific complaint by ID (for owner or admin)
  getComplaintById: (id) => api.get(`/complaints/${id}`),

  // --- Admin Endpoints ---
  // Get all complaints
  getAllComplaints: (filters = {}) => api.get('/complaints', { params: filters }), // Add filters later if needed

  // Update complaint status
  updateStatus: (id, status) => api.patch(`/complaints/${id}/status`, { status }),

  // Assign complaint to an admin/staff
  assignComplaint: (id, adminId) => api.patch(`/complaints/${id}/assign`, { adminId }),

  // Add resolution notes
  addResolution: (id, resolutionNotes) => api.patch(`/complaints/${id}/resolve`, { resolutionNotes }),
};

export default complaintApi;