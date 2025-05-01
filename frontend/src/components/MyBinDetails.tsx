import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import '../styles/MyBinDetails.css';

//Pickup data structure
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
    const [pickups, setPickups] = useState<Pickup[]>([]);//Store pickup list
    const [searchTerm, setSearchTerm] = useState('');//Searching word
    const [error, setError] = useState<string | null>(null);//Store error
    const [loading, setLoading] = useState(true);//True,False conditon of data

    //Get pickup data from backend
    const fetchPickups = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/pickup');
            console.log('Fetched pickups:', response.data);
            if (!Array.isArray(response.data)) {//if not a array throw a error
                throw new Error('Response data is not an array');
            }
            if (response.data.length === 0) {//if no data
                setError('No pickup requests found in the database.');
            } else {//update pickup request
                setPickups(response.data);
                setError(null);
            }
        } catch (error: any) {
            console.error('Error fetching pickups:', error);
            if (error.response) {
                setError(`Failed to fetch pickup requests. Server responded with: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                setError('Failed to fetch pickup requests. Please ensure the backend server is running.');
            } else {
                setError('An unexpected error occurred while fetching pickup requests: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPickups();

        //Set interval every 10 seconds for data refresh
        const interval = setInterval(() => {
            fetchPickups();
        }, 10000);

        // Cleanup interval on component removing
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this pickup request?')) {
            try {
                await axios.delete(`http://localhost:5000/api/pickup/${id}`);//Send delete request to backend
                setPickups(pickups.filter(pickup => pickup._id !== id));
                alert('Pickup request deleted successfully!');
            } catch (error: any) {
                console.error('Error deleting pickup:', error);
                alert('Error deleting pickup request: ' + (error.response?.data.message || 'Unknown error'));
            }
        }
    };

    //Filtering pickup list according search term
    const filteredPickups = pickups.filter(pickup => {
        if (!pickup) return false;
        return (
            (pickup.binId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pickup.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pickup.contactNumber || '').includes(searchTerm) ||
            (pickup.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pickup.status || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="page-container">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="my-bin-details-section">
                    <h2 className="my-bin-details-title">My Bin Details</h2>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button><i className="fas fa-search"></i></button>
                    </div>
                    <Link to="/" className="create-btn">Create Bin</Link>
                    {loading ? (
                        <p>Loading pickup requests...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : pickups.length === 0 ? (
                        <p>No pickup requests found in the database.</p>
                    ) : filteredPickups.length === 0 ? (
                        <p>No pickup requests match your search criteria.</p>
                    ) : (
                        <table className="my-bin-details-table">
                            <thead>
                                <tr>
                                    <th>Bin ID</th>
                                    <th>Name</th>
                                    <th>Contact Number</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPickups.map(pickup => (
                                    <tr key={pickup._id}>
                                        <td>{pickup.binId || 'N/A'}</td>
                                        <td>{pickup.name || 'N/A'}</td>
                                        <td>{pickup.contactNumber || 'N/A'}</td>
                                        <td>{pickup.email || 'N/A'}</td>
                                        <td>
                                            <span className="status-box">{pickup.status || 'N/A'}</span>
                                        </td>
                                        <td>
                                            <Link to={`/pickup-details/${pickup._id}`} className="view-more-btn">View More</Link>
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
            <Footer />
        </div>
    );
};

export default MyBinDetails;