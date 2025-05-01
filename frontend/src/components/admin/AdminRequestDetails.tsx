import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/AdminRequestDetails.css';

const AdminRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Pending');
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  const orderId = location.state?.orderId || 'N/A';

  // Define unit prices for waste types
  const unitPrices: { [key: string]: number } = {
    Organic: 150,
    Glass: 200,
    Paper: 50,
    Plastic: 100,
  };

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/recycling-request/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch request details');
        }
        const data = await response.json();
        setRequest(data);
        setStatus(data.status);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching request:', err);
        setError('Failed to load request details. Please try again.');
      }
    };

    fetchRequest();
  }, [id]);

  // Calculate amount whenever request data changes
  useEffect(() => {
    if (request) {
      const quantity = Number(request.quantity);
      const unitPrice = unitPrices[request.wasteType] || 0;
      const amount = quantity > 0 ? quantity * unitPrice : 0;
      setCalculatedAmount(amount);
    }
  }, [request]);

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/recycling-request/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (response.ok) {
        setUpdateMessage('Status updated successfully');
        setRequest(data.data);
      } else {
        setUpdateMessage(`Error: ${data.message || 'Failed to update status'}`);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      setUpdateMessage('Error updating status');
    }
  };

  const handleBack = () => {
    navigate('/admin/requests');
  };

  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  if (!request) return <div style={{ textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="recycle-form-container">
      <h2>Recycling Order Details</h2>
      <div className="request-details">
        <div className="form-group">
          <label>Order ID:</label>
          <div className="input-wrapper">
            <input type="text" value={orderId} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Name:</label>
          <div className="input-wrapper">
            <input type="text" value={request.name} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Email:</label>
          <div className="input-wrapper">
            <input type="text" value={request.email} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Contact:</label>
          <div className="input-wrapper">
            <input type="text" value={request.contact} readOnly />
            {request.contact && !/^\d{10}$/.test(request.contact) && (
              <span className="error">Contact number must be exactly 10 digits</span>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Waste Type:</label>
          <div className="input-wrapper">
            <input type="text" value={request.wasteType} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Quantity (kg):</label>
          <div className="input-wrapper">
            <input type="text" value={request.quantity} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Amount (LKR):</label>
          <div className="input-wrapper">
            <input type="text" value={calculatedAmount.toFixed(2)} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Community:</label>
          <div className="input-wrapper">
            <input type="text" value={request.community} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Pickup Location:</label>
          <div className="input-wrapper">
            <input type="text" value={request.pickupLocation} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Preferred Pickup Date:</label>
          <div className="input-wrapper">
            <input
              type="text"
              value={new Date(request.preferredPickupDateTime).toLocaleString()}
              readOnly
            />
          </div>
        </div>
        <div className="form-group">
          <label>Collection Preference:</label>
          <div className="input-wrapper">
            <input type="text" value={request.collectionPreference} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Status:</label>
          <div className="input-wrapper">
            <input type="text" value={request.status} readOnly />
          </div>
        </div>
      </div>

      <div className="update-status-section">
        <h3>Update Status</h3>
        <div className="form-group">
          <label>Status:</label>
          <div className="input-wrapper">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="form-group button-group">
          <button onClick={handleUpdateStatus}>Update Status</button>
        </div>
        {updateMessage && (
          <p style={{ color: updateMessage.includes('Error') ? 'red' : 'green' }}>
            {updateMessage}
          </p>
        )}
      </div>

      <div className="form-group button-group">
        <button onClick={handleBack} className="back-btn">
          Back to Recycling Requests
        </button>
      </div>
    </div>
  );
};

export default AdminRequestDetails;