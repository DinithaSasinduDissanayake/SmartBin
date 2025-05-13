import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
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
        const fetchPickup = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/pickup/${id}`);
                setPickup(response.data);
                setStatus(response.data.status);
                setError(null);
            } catch (error: any) {
                console.error('Error fetching pickup:', error);
                if (error.response) {
                    setError('Pickup request not found.');
                } else if (error.request) {
                    setError('Failed to fetch pickup request. Please ensure the backend server is running.');
                } else {
                    setError('An unexpected error occurred while fetching the pickup request.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPickup();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this pickup request?')) {
            try {
                await axios.delete(`http://localhost:5000/api/pickup/${id}`);
                alert('Pickup request deleted successfully!');
                navigate('/pickup-requests');
            } catch (error: any) {
                console.error('Error deleting pickup:', error);
                alert('Error deleting pickup request: ' + (error.response?.data.message || 'Unknown error'));
            }
        }
    };

    const handleStatusUpdate = async () => {
        if (!pickup) return;
        try {
            const response = await axios.put(`http://localhost:5000/api/pickup/${id}/status`, { status });
            console.log('Status update response:', response.data);
            setPickup({ ...pickup, status });
            alert('Status updated successfully! An email has been sent to the user.');
        } catch (error: any) {
            console.error('Error updating status:', error);
            if (error.response) {
                console.log('Error response:', error.response.data);
                alert(`Error updating status: ${error.response.data.message || 'Server error'}`);
            } else if (error.request) {
                console.log('Error request:', error.request);
                alert('Error updating status: No response from server. Please check if the backend is running.');
            } else {
                console.log('Error message:', error.message);
                alert('Error updating status: ' + error.message);
            }
        }
    };

    return (
        <div className="page-container">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="pickup-request-details-section">
                    <h2 className="pickup-request-details-title">Pickup Request Details</h2>
                    {loading ? (
                        <p>Loading pickup request...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : pickup ? (
                        <div className="pickup-request-details">
                            <div className="details-box">
                                <p><strong>Bin ID:</strong> {pickup.binId}</p>
                                <p><strong>Name:</strong> {pickup.name}</p>
                                <p><strong>Contact Number:</strong> {pickup.contactNumber}</p>
                                <p><strong>Email:</strong> {pickup.email}</p>
                                <p><strong>Community:</strong> {pickup.community}</p>
                                <p><strong>Waste Type:</strong> {pickup.wasteType.join(', ')}</p>
                                <p><strong>Address:</strong> {pickup.address}</p>
                                <p><strong>Preferred Date:</strong> {new Date(pickup.preferredDate).toLocaleDateString()}</p>
                                <p><strong>Service Type:</strong> {pickup.serviceType}</p>
                                <p><strong>Location:</strong> {pickup.location}</p>
                                <p><strong>Amount:</strong> Rs. {pickup.amount.toFixed(2)}</p>
                                <p><strong>Status:</strong> {pickup.status}</p>
                            </div>
                            <div className="action-buttons">
                                <div className="status-update">
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <button onClick={handleStatusUpdate} className="update-status-btn">Update Status</button>
                                </div>
                                <button onClick={handleDelete} className="delete-btn">Delete</button>
                                <button onClick={() => navigate('/pickup-requests')} className="back-btn">Back</button>
                            </div>
                        </div>
                    ) : (
                        <p>No pickup request found.</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PickupRequestDetails;