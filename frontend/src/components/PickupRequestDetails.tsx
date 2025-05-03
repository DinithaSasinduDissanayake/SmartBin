import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/PickupRequestDetails.css';

interface Pickup {
    _id: string;
    binId: string;
    name: string;
    contactNumber: string;
    email: string;
    status: string;
    community: string;
    wasteType: string[];
    address: string;
    preferredDate: string;
    serviceType: string;
    location: string;
    amount: number;
}

const PickupRequestDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pickup, setPickup] = useState<Pickup | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchPickup();
    }, [id]);

    const fetchPickup = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/pickup/${id}`);
            setPickup(response.data);
            setStatus(response.data.status);
            setError(null);
        } catch (err) {
            console.error('Error fetching pickup:', err);
            setError('Failed to fetch pickup details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this pickup request?')) {
            try {
                await axios.delete(`http://localhost:5000/api/pickup/${id}`);
                alert('Pickup request deleted successfully');
                navigate('/pickup-requests');
            } catch (err) {
                console.error('Error deleting pickup:', err);
                alert('Failed to delete pickup request. Please try again.');
            }
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/pickup/${id}/status`, { status });
            alert(`Status updated to ${status}`);
            
            // Update local state
            if (pickup) {
                setPickup({
                    ...pickup,
                    status
                });
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!pickup) return <p>Pickup request not found</p>;

    return (
        <div className="page-container">
            <div className="main-content">
                <div className="pickup-request-details-section">
                    <h1 className="pickup-request-details-title">Pickup Request Details</h1>
                    
                    <div className="details-box">
                        <p><strong>Bin ID:</strong> {pickup.binId}</p>
                        <p><strong>Name:</strong> {pickup.name}</p>
                        <p><strong>Contact Number:</strong> {pickup.contactNumber}</p>
                        <p><strong>Email:</strong> {pickup.email}</p>
                        <p><strong>Community:</strong> {pickup.community}</p>
                        <p><strong>Waste Types:</strong> {pickup.wasteType.join(', ')}</p>
                        <p><strong>Address:</strong> {pickup.address}</p>
                        <p><strong>Preferred Date:</strong> {new Date(pickup.preferredDate).toLocaleDateString()}</p>
                        <p><strong>Service Type:</strong> {pickup.serviceType}</p>
                        <p><strong>Status:</strong> {pickup.status}</p>
                        <p><strong>Amount:</strong> Rs. {pickup.amount.toFixed(2)}</p>
                        <p><strong>Location:</strong> {pickup.location}</p>
                    </div>
                    
                    <div className="action-buttons">
                        <div className="status-update">
                            <select 
                                className="status-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <button 
                                className="update-status-btn"
                                onClick={handleStatusUpdate}
                            >
                                Update Status
                            </button>
                        </div>
                        <button 
                            className="delete-btn"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                        <button 
                            className="back-btn"
                            onClick={() => navigate('/pickup-requests')}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PickupRequestDetails;