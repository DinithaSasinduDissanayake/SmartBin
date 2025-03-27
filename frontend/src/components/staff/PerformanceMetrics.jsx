import React, { useState, useEffect } from 'react';
import performanceApi from '../../services/performanceApi';
import './StaffComponents.css';

const PerformanceMetrics = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchPerformanceReviews = async () => {
      try {
        setLoading(true);
        const response = await performanceApi.getMyReviews();
        setReviews(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load performance reviews');
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceReviews();
  }, []);

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedReview(null);
  };

  // Calculate average rating
  const getAverageRating = () => {
    if (!reviews.length) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.overallRating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const averageRating = getAverageRating();

  return (
    <div className="performance-metrics">
      <h2>Performance Metrics</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="performance-summary">
        <div className="rating-overview">
          <div className="average-rating">
            <span className="rating-label">Average Rating</span>
            <span className="rating-value">{averageRating}</span>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                <span 
                  key={star} 
                  className={`star ${star <= averageRating ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="review-count">
            <span className="count-label">Total Reviews</span>
            <span className="count-value">{reviews.length}</span>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading performance data...</div>
      ) : reviews.length > 0 ? (
        <div className="reviews-list">
          <h3>Review History</h3>
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Review Period</th>
                <th>Rating</th>
                <th>Reviewed By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review._id}>
                  <td>
                    {new Date(review.reviewPeriod.startDate).toLocaleDateString()} - 
                    {new Date(review.reviewPeriod.endDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`rating-badge rating-${Math.round(review.overallRating)}`}>
                      {review.overallRating}
                    </span>
                  </td>
                  <td>{review.reviewer.name}</td>
                  <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(review)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-reviews">No performance reviews found.</div>
      )}
      
      {showDetails && selectedReview && (
        <div className="review-details-modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeDetails}>&times;</span>
            <h3>Performance Review Details</h3>
            
            <div className="review-period">
              <strong>Review Period:</strong> 
              {new Date(selectedReview.reviewPeriod.startDate).toLocaleDateString()} - 
              {new Date(selectedReview.reviewPeriod.endDate).toLocaleDateString()}
            </div>
            
            <div className="metrics-section">
              <h4>Performance Metrics</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-name">Productivity</span>
                  <span className="metric-value">{selectedReview.metrics.productivity}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Quality</span>
                  <span className="metric-value">{selectedReview.metrics.quality}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Reliability</span>
                  <span className="metric-value">{selectedReview.metrics.reliability}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Communication</span>
                  <span className="metric-value">{selectedReview.metrics.communication}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Initiative</span>
                  <span className="metric-value">{selectedReview.metrics.initiative}</span>
                </div>
              </div>
              <div className="overall-rating">
                <strong>Overall Rating:</strong> 
                <span className={`rating-badge rating-${Math.round(selectedReview.overallRating)}`}>
                  {selectedReview.overallRating}
                </span>
              </div>
            </div>
            
            <div className="feedback-section">
              <h4>Feedback</h4>
              <p>{selectedReview.feedback}</p>
            </div>
            
            {selectedReview.goals && selectedReview.goals.length > 0 && (
              <div className="goals-section">
                <h4>Goals for Improvement</h4>
                <ul>
                  {selectedReview.goals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <button className="close-details-btn" onClick={closeDetails}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;