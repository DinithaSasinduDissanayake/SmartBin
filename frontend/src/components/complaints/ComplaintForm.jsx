import React, { useState } from 'react';
import complaintApi from '../../services/complaintApi';
import '../complaints/ComplaintComponents.css';

const ComplaintForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setLoading(true);
    try {
      await complaintApi.submitComplaint(formData);
      setFormData({ subject: '', description: '' }); // Clear form
      if (onSubmitSuccess) onSubmitSuccess(); // Notify parent component
      alert('Complaint submitted successfully!'); // Simple feedback
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
      console.error('Complaint submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-form-container">
      <h3>Submit a New Complaint</h3>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            maxLength="150"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            maxLength="2000"
            required
            disabled={loading}
          ></textarea>
        </div>
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;