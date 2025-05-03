import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/MyBinDetails.css';

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

const MyBinDetails: React.FC = () => {
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch pickup data from backend
    const fetchPickups = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/pickup');
            setPickups(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching pickups:', err);
            setError('Failed to fetch pickup requests. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPickups();
        
        // Set up auto-refresh every 60 seconds
        const interval = setInterval(fetchPickups, 60000);
        
        // Clean up interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this pickup request?')) {
            try {
                await axios.delete(`http://localhost:5000/api/pickup/${id}`);
                // Update local state to remove the deleted pickup
                setPickups(pickups.filter(pickup => pickup._id !== id));
                alert('Pickup request deleted successfully');
            } catch (err) {
                console.error('Error deleting pickup:', err);
                alert('Failed to delete pickup request. Please try again.');
            }
        }
    };

    // Filtering pickup list according to search term
    const filteredPickups = pickups.filter(pickup => 
        pickup.binId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.community.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            <div className="main-content">
                <div className="my-bin-details-section">
                    <h1 className="my-bin-details-title">My Bin Details</h1>
                    
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button>Search</button>
                    </div>
                    
                    <Link to="/request-pickup" className="create-btn">Request Pickup</Link>
                    
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : filteredPickups.length === 0 ? (
                        <p>No pickup requests found.</p>
                    ) : (
                        <table className="my-bin-details-table">
                            <thead>
                                <tr>
                                    <th>Bin ID</th>
                                    <th>Name</th>
                                    <th>Community</th>
                                    <th>Service Type</th>
                                    <th>Preferred Date</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPickups.map(pickup => (
                                    <tr key={pickup._id}>
                                        <td>{pickup.binId}</td>
                                        <td>{pickup.name}</td>
                                        <td>{pickup.community}</td>
                                        <td>{pickup.serviceType}</td>
                                        <td>{new Date(pickup.preferredDate).toLocaleDateString()}</td>
                                        <td>{pickup.status}</td>
                                        <td>Rs. {pickup.amount.toFixed(2)}</td>
                                        <td>
                                            <Link to={`/pickup/${pickup._id}`} className="view-more-btn">
                                                View Details
                                            </Link>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDelete(pickup._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBinDetails;