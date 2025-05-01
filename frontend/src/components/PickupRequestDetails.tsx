import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPickupDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/pickup/${id}`);
                setPickup(response.data);
                setError(null);
            } catch (error: any) {
                console.error('Error fetching pickup details:', error);
                if (error.response) {
                    setError(`Failed to fetch pickup details: ${error.response.data.message || 'Server error'}`);
                } else if (error.request) {
                    setError('Failed to connect to the server. Please ensure the backend server is running.');
                } else {
                    setError('An unexpected error occurred: ' + error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPickupDetails();
    }, [id]);

    const handlePayNow = async () => {
        if (!pickup) return;

        try {
            console.log('Initiating payment for pickup ID:', pickup._id); // Debug log
            alert('Processing to payment'); // Existing alert
            const response = await axios.post('http://localhost:5000/api/create-checkout-session', {
                pickupId: pickup._id,
            });
            console.log('Checkout session response:', response.data); // Debug log
            if (response.data.url) {
                window.location.href = response.data.url; // Redirect to Stripe Checkout
            } else {
                throw new Error('No redirect URL in response');
            }
        } catch (error: any) {
            console.error('Error initiating Stripe Checkout:', error);
            if (error.response) {
                alert(`Payment initiation failed: ${error.response.data.message || 'Server error'}`);
            } else if (error.request) {
                alert('Payment initiation failed: No response from server. Please check if the backend is running.');
            } else {
                alert('Payment initiation failed: ' + error.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <Header />
                <div className="main-content">
                    <Sidebar />
                    <div className="pickup-details-section">
                        <p>Loading pickup details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !pickup) {
        return (
            <div className="page-container">
                <Header />
                <div className="main-content">
                    <Sidebar />
                    <div className="pickup-details-section">
                        <p className="error-message">{error || 'Pickup request not found.'}</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="page-container">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="pickup-details-section">
                    <h2 className="pickup-details-title">Pickup Request Details</h2>
                    <div className="pickup-details-content">
                        <p><strong>Bin ID:</strong> {pickup.binId || 'N/A'}</p>
                        <p><strong>Name:</strong> {pickup.name || 'N/A'}</p>
                        <p><strong>Contact Number:</strong> {pickup.contactNumber || 'N/A'}</p>
                        <p><strong>Email:</strong> {pickup.email || 'N/A'}</p>
                        <p><strong>Status:</strong> {pickup.status || 'N/A'}</p>
                        <p><strong>Community:</strong> {pickup.community || 'N/A'}</p>
                        <p><strong>Waste Type:</strong> {pickup.wasteType?.join(', ') || 'N/A'}</p>
                        <p><strong>Address:</strong> {pickup.address || 'N/A'}</p>
                        <p><strong>Preferred Date:</strong> {pickup.preferredDate ? new Date(pickup.preferredDate).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Service Type:</strong> {pickup.serviceType || 'N/A'}</p>
                        <p><strong>Location:</strong> {pickup.location || 'N/A'}</p>
                        <p><strong>Amount:</strong> Rs. {pickup.amount ? pickup.amount.toFixed(2) : '0.00'}</p>
                    </div>
                    <div className="pickup-details-actions">
                        <button
                            onClick={() => navigate('/pickup-requests')}
                            className="back-btn"
                        >
                            Back to Pickup Requests
                        </button>
                        {pickup.status === 'Pending' && (
                            <button
                                onClick={handlePayNow}
                                className="pay-now-btn"
                            >
                                Pay Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PickupRequestDetails;