import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import '../styles/PickupDetails.css';

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

// Edit and store edited data
const PickupDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pickup, setPickup] = useState<Pickup | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Pickup | null>(null);

    useEffect(() => {
        const fetchPickup = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/pickup/${id}`);
                setPickup(response.data);
                setFormData(response.data);
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

    // Calculate amount on changes
    useEffect(() => {
        if (!formData) return;

        const calculateAmount = () => {
            let basePrice = 0;
            if (formData.community === 'Household') {
                basePrice = 200;
            } else if (formData.community === 'Industry') {
                basePrice = 300;
            }

            let locationPrice = 0;
            if (formData.address.toLowerCase().includes('colombo')) {
                locationPrice = 200;
            } else if (formData.address.toLowerCase().includes('magama')) {
                locationPrice = 300;
            } else if (formData.address.toLowerCase().includes('kalutara')) {
                locationPrice = 400;
            }

            const distanceFactor = formData.address.length > 20 ? 1.5 : 1;
            const serviceFactor = formData.serviceType === 'urgent' ? 1.2 : 1;
            const calculatedAmount = (basePrice + locationPrice) * distanceFactor * serviceFactor;

            setFormData(prev => prev ? { ...prev, amount: calculatedAmount } : null);
        };

        calculateAmount();
    }, [formData?.community, formData?.serviceType, formData?.address]);

    // Update changes on form data
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleWasteTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (!prev) return prev;
            if (checked) {
                return { ...prev, wasteType: [...prev.wasteType, value] };
            } else {
                return { ...prev, wasteType: prev.wasteType.filter(type => type !== value) };
            }
        });
    };

    // Send request to backend
    const handleUpdate = async () => {
        if (!formData) return;
        try {
            await axios.put(`http://localhost:5000/api/pickup/${id}`, formData);
            setPickup(formData);
            setIsEditing(false);
            alert('Pickup request updated successfully!');
        } catch (error: any) {
            console.error('Error updating pickup:', error);
            if (error.response && error.response.data.errors) {
                const errorMessages = error.response.data.errors.map((err: any) => err.msg).join('\n');
                alert('Validation Errors:\n' + errorMessages);
            } else {
                alert('Error updating pickup request: ' + (error.response?.data.message || 'Unknown error'));
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this pickup request?')) {
            try {
                await axios.delete(`http://localhost:5000/api/pickup/${id}`);
                alert('Pickup request deleted successfully!');
                navigate('/my-bin-details');
            } catch (error: any) {
                console.error('Error deleting pickup:', error);
                alert('Error deleting pickup request: ' + (error.response?.data.message || 'Unknown error'));
            }
        }
    };

    const handlePayNow = async () => {
        if (!pickup) return;

        try {
            console.log('Initiating payment for pickup ID:', pickup._id);
            alert('Proceeding to payment...');
            const response = await axios.post('http://localhost:5000/api/create-checkout-session', {
                pickupId: pickup._id,
            });
            console.log('Checkout session response:', response.data);
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

    return (
        <div className="page-container">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="pickup-details-section">
                    <h2 className="pickup-details-title">Pickup Request Details</h2>
                    {loading ? (
                        <p>Loading pickup request...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : pickup && formData ? (
                        <div className="pickup-details">
                            {isEditing ? (
                                <div className="edit-form">
                                    <label>Bin ID:</label>
                                    <input type="text" value={pickup.binId} disabled />
                                    <label>Name:</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                                    <label>Contact Number:</label>
                                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
                                    <label>Email:</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                                    <label>Status:</label>
                                    <input type="text" value={formData.status} disabled />
                                    <label>Community:</label>
                                    <select name="community" value={formData.community} onChange={handleChange}>
                                        <option value="Household">Household</option>
                                        <option value="Industry">Industry</option>
                                    </select>
                                    <label>Waste Type:</label>
                                    <div className="waste-type-checkboxes">
                                        <label>
                                            <input
                                                type="checkbox"
                                                value="Organic"
                                                checked={formData.wasteType.includes('Organic')}
                                                onChange={handleWasteTypeChange}
                                            />
                                            Organic
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                value="Plastic"
                                                checked={formData.wasteType.includes('Plastic')}
                                                onChange={handleWasteTypeChange}
                                            />
                                            Plastic
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                value="Paper"
                                                checked={formData.wasteType.includes('Paper')}
                                                onChange={handleWasteTypeChange}
                                            />
                                            Paper
                                        </label>
                                    </div>
                                    <label>Address:</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} />
                                    <label>Preferred Date:</label>
                                    <input
                                        type="date"
                                        name="preferredDate"
                                        value={new Date(formData.preferredDate).toISOString().split('T')[0]}
                                        onChange={handleChange}
                                    />
                                    <label>Service Type:</label>
                                    <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
                                        <option value="urgent">Urgent</option>
                                        <option value="regular">Regular</option>
                                    </select>
                                    <label>Location:</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} />
                                    <label>Amount:</label>
                                    <input type="number" value={formData.amount} disabled />
                                    <div className="edit-buttons">
                                        <button onClick={handleUpdate} className="save-btn">Save</button>
                                        <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <table className="pickup-details-table">
                                        <tbody>
                                            <tr>
                                                <td><strong>Bin ID:</strong></td>
                                                <td>{pickup.binId}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Name:</strong></td>
                                                <td>{pickup.name}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Contact Number:</strong></td>
                                                <td>{pickup.contactNumber}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Email:</strong></td>
                                                <td>{pickup.email}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Status:</strong></td>
                                                <td>{pickup.status}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Community:</strong></td>
                                                <td>{pickup.community}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Waste Type:</strong></td>
                                                <td>{pickup.wasteType.join(', ')}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Address:</strong></td>
                                                <td>{pickup.address}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Preferred Date:</strong></td>
                                                <td>{new Date(pickup.preferredDate).toLocaleDateString()}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Service Type:</strong></td>
                                                <td>{pickup.serviceType}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Location:</strong></td>
                                                <td>{pickup.location}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Amount:</strong></td>
                                                <td>LKR {pickup.amount.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="action-buttons">
                                        <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
                                        <button onClick={handlePayNow} className="pay-now-btn">Pay Now</button>
                                        <button onClick={handleDelete} className="delete-btn">Delete</button>
                                        <button onClick={() => navigate('/my-bin-details')} className="back-btn">Back to My Bin Details</button>
                                    </div>
                                </>
                            )}
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

export default PickupDetails;