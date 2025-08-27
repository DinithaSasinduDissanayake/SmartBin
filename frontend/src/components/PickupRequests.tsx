import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import '../styles/PickupRequests.css';
import { useAuth } from '../contexts/AuthContext';

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

const PickupRequests: React.FC = () => {
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchPickups();
    }, [user]);

    const fetchPickups = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/pickup');
            let filteredData = response.data;
            
            // Filter data based on user role
            if (user && user.role === 'customer') {
                // For customers, only show their own pickups
                filteredData = response.data.filter((pickup: Pickup) => 
                    pickup.email === user.email
                );
            }
            
            setPickups(filteredData);
            setError(null);
        } catch (err) {
            console.error('Error fetching pickups:', err);
            setError('Failed to fetch pickup requests. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

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

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await axios.put(`http://localhost:5000/api/pickup/${id}/status`, { status: newStatus });
            // Update local state
            setPickups(pickups.map(pickup => 
                pickup._id === id ? { ...pickup, status: newStatus } : pickup
            ));
            alert(`Status updated to ${newStatus}`);
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    // Filter pickups based on search term
    const filteredPickups = pickups.filter(pickup => 
        pickup.binId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.community.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Generate PDF Report
    const generatePDF = async () => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Pickup Requests Report', 105, 15, { align: 'center' });
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });
        
        // Add table headers
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        
        let y = 35;
        const headers = ['Bin ID', 'Name', 'Community', 'Service Type', 'Status', 'Amount'];
        const colWidths = [20, 40, 25, 25, 25, 20];
        let x = 15;
        
        headers.forEach((header, i) => {
            doc.text(header, x, y);
            x += colWidths[i];
        });
        
        // Add table rows
        doc.setFont('helvetica', 'normal');
        y += 8;
        
        filteredPickups.forEach(pickup => {
            if (y > 270) { // Check if we need a new page
                doc.addPage();
                y = 20;
            }
            
            x = 15;
            doc.text(pickup.binId, x, y);
            x += colWidths[0];
            
            doc.text(pickup.name.substring(0, 20), x, y); // Limit name length
            x += colWidths[1];
            
            doc.text(pickup.community, x, y);
            x += colWidths[2];
            
            doc.text(pickup.serviceType, x, y);
            x += colWidths[3];
            
            doc.text(pickup.status, x, y);
            x += colWidths[4];
            
            doc.text(`Rs. ${pickup.amount.toFixed(2)}`, x, y);
            
            y += 7;
        });
        
        // Save the PDF
        doc.save('pickup-requests-report.pdf');
    };

    // Generate Word Report
    const generateWord = async () => {
        // Create table rows
        const rows = filteredPickups.map(pickup => {
            return new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(pickup.binId)] }),
                    new TableCell({ children: [new Paragraph(pickup.name)] }),
                    new TableCell({ children: [new Paragraph(pickup.community)] }),
                    new TableCell({ children: [new Paragraph(pickup.serviceType)] }),
                    new TableCell({ children: [new Paragraph(pickup.status)] }),
                    new TableCell({ children: [new Paragraph(`Rs. ${pickup.amount.toFixed(2)}`)] }),
                ],
            });
        });
        
        // Add header row
        const headerRow = new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Bin ID', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Name', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Community', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Service Type', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Amount', bold: true })] })] }),
            ],
        });
        
        // Create table
        const table = new Table({
            rows: [headerRow, ...rows],
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
        });
        
        // Create document
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({ text: 'Pickup Requests Report', heading: 'Heading1' }),
                        new Paragraph(`Generated on: ${new Date().toLocaleDateString()}`),
                        new Paragraph(''),
                        table,
                    ],
                },
            ],
        });
        
        // Generate and save document
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'pickup-requests-report.docx');
        });
    };

    return (
        <div className="page-container">
            <div className="main-content">
                <div className="pickup-requests-section">
                    <h1 className="pickup-requests-title">
                        {user?.role === 'customer' ? 'My Pickup Requests' : 'Pickup Requests Management'}
                    </h1>
                    
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button>Search</button>
                    </div>
                    
                    {/* Only show report buttons for admins and staff */}
                    {user?.role !== 'customer' && (
                        <div className="report-buttons">
                            <button onClick={generatePDF} className="report-btn">Generate PDF Report</button>
                            <button onClick={generateWord} className="report-btn">Generate Word Report</button>
                        </div>
                    )}
                    
                    {/* For customers, show a link to create new pickup request */}
                    {user?.role === 'customer' && (
                        <div className="action-buttons">
                            <Link to="/request-pickup" className="create-btn">Create New Pickup Request</Link>
                        </div>
                    )}
                    
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : filteredPickups.length === 0 ? (
                        <div className="no-data-container">
                            <p>No pickup requests found.</p>
                            {user?.role === 'customer' && (
                                <p>Click the "Create New Pickup Request" button to schedule a pickup.</p>
                            )}
                        </div>
                    ) : (
                        <table className="pickup-requests-table">
                            <thead>
                                <tr>
                                    <th>Bin ID</th>
                                    <th>Name</th>
                                    <th>Community</th>
                                    <th>Service Type</th>
                                    <th>Preferred Date</th>
                                    <th>Status</th>
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
                                        <td>
                                            {user?.role === 'customer' ? (
                                                <span className={`status-badge ${pickup.status.toLowerCase()}`}>
                                                    {pickup.status}
                                                </span>
                                            ) : (
                                                <select
                                                    className="status-select"
                                                    value={pickup.status}
                                                    onChange={(e) => handleStatusUpdate(pickup._id, e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Scheduled">Scheduled</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            )}
                                        </td>
                                        <td>
                                            {user?.role === 'customer' ? (
                                                <Link to={`/pickup/${pickup._id}`} className="view-more-btn">
                                                    View Details
                                                </Link>
                                            ) : (
                                                <>
                                                    <Link to={`/pickup-request/${pickup._id}`} className="view-more-btn">
                                                        View Details
                                                    </Link>
                                                    <button 
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(pickup._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
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

export default PickupRequests;