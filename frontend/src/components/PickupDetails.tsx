import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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

const PickupDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pickup, setPickup] = useState<Pickup | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Pickup | null>(null);

    useEffect(() => {
        fetchPickup();
    }, [id]);

    // Calculate amount on form data changes
    useEffect(() => {
        calculateAmount();
    }, [formData?.community, formData?.serviceType, formData?.address]);

    const fetchPickup = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/pickup/${id}`);
            setPickup(response.data);
            setFormData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching pickup:', err);
            setError('Failed to fetch pickup details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (formData) {
            const { name, value } = e.target;
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleWasteTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (formData) {
            const { value, checked } = e.target;
            if (checked) {
                setFormData({
                    ...formData,
                    wasteType: [...formData.wasteType, value]
                });
            } else {
                setFormData({
                    ...formData,
                    wasteType: formData.wasteType.filter(type => type !== value)
                });
            }
        }
    };

    const calculateAmount = () => {
        if (formData) {
            let baseAmount = 0;
            
            // Base amount by community type
            if (formData.community === 'Household') {
                baseAmount = 500; // Base amount for households
            } else if (formData.community === 'Industry') {
                baseAmount = 1000; // Base amount for industries
            }
            
            // Additional amount for urgent service
            if (formData.serviceType === 'urgent') {
                baseAmount += 300; // Additional charge for urgent service
            }
            
            // Additional amount based on address (simplified example)
            if (formData.address && formData.address.toLowerCase().includes('colombo')) {
                baseAmount += 200; // Additional charge for Colombo area
            }
            
            setFormData({
                ...formData,
                amount: baseAmount
            });
        }
    };

    const handleUpdate = async () => {
        if (!formData) return;
        
        try {
            setLoading(true);
            const response = await axios.put(`http://localhost:5000/api/pickup/${id}`, formData);
            setPickup(response.data.pickup);
            setIsEditing(false);
            alert('Pickup request updated successfully');
        } catch (err) {
            console.error('Error updating pickup:', err);
            alert('Failed to update pickup request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this pickup request?')) {
            try {
                await axios.delete(`http://localhost:5000/api/pickup/${id}`);
                alert('Pickup request deleted successfully');
                navigate('/my-bin-details');
            } catch (err) {
                console.error('Error deleting pickup:', err);
                alert('Failed to delete pickup request. Please try again.');
            }
        }
    };

    const handlePayNow = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/create-checkout-session', {
                pickupId: id
            });
            
            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                alert('Error creating checkout session');
            }
        } catch (err) {
            console.error('Error creating payment session:', err);
            alert('Failed to create payment session. Please try again.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!pickup) return <p>Pickup request not found</p>;

    return (
        <div className="page-container">
            <div className="main-content">
                <div className="pickup-details-section">
                    <h1 className="pickup-details-title">Pickup Request Details</h1>
                    
                    {isEditing ? (
                        // Edit form
                        <div className="edit-form">
                            <div>
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData?.name || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="contactNumber">Contact Number</label>
                                <input
                                    type="text"
                                    id="contactNumber"
                                    name="contactNumber"
                                    value={formData?.contactNumber || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData?.email || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="community">Community Type</label>
                                <select
                                    id="community"
                                    name="community"
                                    value={formData?.community || ''}
                                    onChange={handleChange}
                                >
                                    <option value="Household">Household</option>
                                    <option value="Industry">Industry</option>
                                </select>
                            </div>
                            
                            <div>
                                <label>Waste Type</label>
                                <div className="waste-type-checkboxes">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="wasteType"
                                            value="Organic"
                                            checked={formData?.wasteType.includes('Organic') || false}
                                            onChange={handleWasteTypeChange}
                                        />
                                        Organic
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="wasteType"
                                            value="Plastic"
                                            checked={formData?.wasteType.includes('Plastic') || false}
                                            onChange={handleWasteTypeChange}
                                        />
                                        Plastic
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="wasteType"
                                            value="Paper"
                                            checked={formData?.wasteType.includes('Paper') || false}
                                            onChange={handleWasteTypeChange}
                                        />
                                        Paper
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="address">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData?.address || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="serviceType">Service Type</label>
                                <select
                                    id="serviceType"
                                    name="serviceType"
                                    value={formData?.serviceType || ''}
                                    onChange={handleChange}
                                >
                                    <option value="regular">Regular</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            
                            <div>
                                <label>Amount</label>
                                <input
                                    type="text"
                                    value={`Rs. ${formData?.amount.toFixed(2) || 0}`}
                                    readOnly
                                />
                            </div>
                            
                            <div className="edit-buttons">
                                <button className="save-btn" onClick={handleUpdate}>Save Changes</button>
                                <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        // View details
                        <>
                            <table className="pickup-details-table">
                                <tbody>
                                    <tr>
                                        <td>Bin ID</td>
                                        <td>{pickup.binId}</td>
                                    </tr>
                                    <tr>
                                        <td>Name</td>
                                        <td>{pickup.name}</td>
                                    </tr>
                                    <tr>
                                        <td>Contact Number</td>
                                        <td>{pickup.contactNumber}</td>
                                    </tr>
                                    <tr>
                                        <td>Email</td>
                                        <td>{pickup.email}</td>
                                    </tr>
                                    <tr>
                                        <td>Community</td>
                                        <td>{pickup.community}</td>
                                    </tr>
                                    <tr>
                                        <td>Waste Type</td>
                                        <td>{pickup.wasteType.join(', ')}</td>
                                    </tr>
                                    <tr>
                                        <td>Address</td>
                                        <td>{pickup.address}</td>
                                    </tr>
                                    <tr>
                                        <td>Preferred Date</td>
                                        <td>{new Date(pickup.preferredDate).toLocaleDateString()}</td>
                                    </tr>
                                    <tr>
                                        <td>Service Type</td>
                                        <td>{pickup.serviceType}</td>
                                    </tr>
                                    <tr>
                                        <td>Status</td>
                                        <td>{pickup.status}</td>
                                    </tr>
                                    <tr>
                                        <td>Amount</td>
                                        <td>Rs. {pickup.amount.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <div className="action-buttons">
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                                {pickup.status === 'Pending' && (
                                    <button className="pay-now-btn" onClick={handlePayNow}>Pay Now</button>
                                )}
                                <button className="delete-btn" onClick={handleDelete}>Delete</button>
                                <button className="back-btn" onClick={() => navigate('/my-bin-details')}>Back</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PickupDetails;