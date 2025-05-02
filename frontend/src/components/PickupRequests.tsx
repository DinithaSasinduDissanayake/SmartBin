import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';
import companyLogo from '../assets/company-logo.png'; // Adjust the path to your logo
import '../styles/PickupRequests.css';

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

    useEffect(() => {
        const fetchPickups = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/pickup');
                console.log('Fetched pickups:', response.data);
                if (!Array.isArray(response.data)) {
                    throw new Error('Response data is not an array');
                }
                if (response.data.length === 0) {
                    setError('No pickup requests found in the database.');
                } else {
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

        fetchPickups();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this pickup request?')) {
            try {
                await axios.delete(`http://localhost:5000/api/pickup/${id}`);
                setPickups(pickups.filter(pickup => pickup._id !== id));
                alert('Pickup request deleted successfully!');
            } catch (error: any) {
                console.error('Error deleting pickup:', error);
                alert('Error deleting pickup request: ' + (error.response?.data.message || 'Unknown error'));
            }
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/pickup/${id}/status`, { status: newStatus });
            console.log('Status update response:', response.data);
            setPickups(pickups.map(pickup => 
                pickup._id === id ? { ...pickup, status: newStatus } : pickup
            ));
            alert('Status updated successfully! An email has been sent to the user.');
        } catch (error: any) {
            console.error('Error updating status:', error);
            if (error.response) {
                console.log('Error response:', error.response.data);
                alert(`Error updating status: ${error.response.data.message || 'Server error'}. Please check the backend logs for email sending details.`);
            } else if (error.request) {
                console.log('Error request:', error.request);
                alert('Error updating status: No response from server. Please ensure the backend is running.');
            } else {
                console.log('Error message:', error.message);
                alert('Error updating status: ' + error.message);
            }
        }
    };

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

    // Convert image to base64 for jsPDF and docx
    const getBase64Image = (imgUrl: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imgUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    console.log('Generated base64 image:', dataURL.substring(0, 50) + '...');
                    resolve(dataURL);
                } else {
                    reject(new Error('Canvas context not available'));
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        });
    };

    // Generate PDF Report
    const generatePDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Add Company Logo
        try {
            const logoBase64 = await getBase64Image(companyLogo);
            const logoWidth = 30;
            const logoHeight = 30;
            const logoX = (pageWidth - logoWidth) / 2; 
            doc.addImage(logoBase64, 'PNG', logoX, 10, logoWidth, logoHeight);
        } catch (error) {
            console.error('Error adding logo to PDF:', error);
        }

        // Add Company Address
        doc.setFontSize(12);
        const companyDetails = [
            'SmartBin Inc.',
            '+94715485554',
            'SmartBin@gmail.com',
            '39/C, Janara Lane, Kottawa'
        ];
        let y = 45;
        companyDetails.forEach(detail => {
            const textWidth = doc.getTextWidth(detail);
            const textX = (pageWidth - textWidth) / 2; // Center the text
            doc.text(detail, textX, y);
            y += 8;
        });

        // Add Report Title (Centered and Underlined)
        doc.setFontSize(18);
        const title = 'Pickup Requests Report';
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2; // Center the title
        doc.text(title, titleX, 85);
        doc.setLineWidth(0.5);
        doc.line(titleX, 87, titleX + titleWidth, 87); // Underline the title

        // Add Report Date
        doc.setFontSize(12);
        const dateText = `Generated on: ${new Date().toLocaleString()}`;
        const dateWidth = doc.getTextWidth(dateText);
        const dateX = (pageWidth - dateWidth) / 2; // Center the date
        doc.text(dateText, dateX, 95);

        // Add Pickup Data
        y = 105;
        filteredPickups.forEach((pickup, index) => {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            doc.text(`Pickup ${index + 1}:`, 14, y);
            y += 10;
            doc.text(`Bin ID: ${pickup.binId || 'N/A'}`, 14, y);
            y += 10;
            doc.text(`Name: ${pickup.name || 'N/A'}`, 14, y);
            y += 10;
            doc.text(`Contact Number: ${pickup.contactNumber || 'N/A'}`, 14, y);
            y += 10;
            doc.text(`Email: ${pickup.email || 'N/A'}`, 14, y);
            y += 10;
            doc.text(`Community: ${pickup.community || 'N/A'}`, 14, y);
            y += 10;
            doc.text(`Service Type: ${pickup.serviceType || 'N/A'}`, 14, y);
            y += 10;
            doc.text(`Waste Type: ${pickup.wasteType ? pickup.wasteType.join(', ') : 'N/A'}`, 14, y);
            y += 10;
            doc.text(`Address: ${pickup.address || 'N/A'}`, 14, y);
            y += 10;
            doc.text(`Preferred Date: ${pickup.preferredDate ? new Date(pickup.preferredDate).toLocaleDateString() : 'N/A'}`, 14, y);
            y += 10;
            doc.text(`Amount: Rs. ${pickup.amount ? pickup.amount.toFixed(2) : '0.00'}`, 14, y);
            y += 10;
            doc.text(`Status: ${pickup.status || 'N/A'}`, 14, y);
            y += 10;
            doc.text(`Location: ${pickup.location || 'N/A'}`, 14, y);
            y += 15;
        });

        doc.save('pickup_requests_report.pdf');
    };

    // Generate Word Report
    const generateWord = async () => {
        // Convert logo to base64 for docx
        let logoBase64;
        try {
            logoBase64 = await getBase64Image(companyLogo);
            console.log('logoBase64 before split:', logoBase64.substring(0, 50) + '...');
            if (!logoBase64 || !logoBase64.includes(',')) {
                throw new Error('Invalid base64 string for logo');
            }
        } catch (error) {
            console.error('Error converting logo for Word:', error);
            logoBase64 = undefined;
        }

        const rows = filteredPickups.map((pickup, index) => (
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(`${index + 1}`)] }),
                    new TableCell({ children: [new Paragraph(pickup.binId || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(pickup.name || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(pickup.contactNumber || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(pickup.email || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(pickup.community || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(pickup.serviceType || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(pickup.wasteType ? pickup.wasteType.join(', ') : 'N/A')] }),
                    new TableCell({ children: [new Paragraph(pickup.address || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(pickup.preferredDate ? new Date(pickup.preferredDate).toLocaleDateString() : 'N/A')] }),
                    new TableCell({ children: [new Paragraph(`Rs. ${pickup.amount ? pickup.amount.toFixed(2) : '0.00'}`)] }),
                    new TableCell({ children: [new Paragraph(pickup.status || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(pickup.location || 'N/A')] }),
                ],
            })
        ));

        const doc = new Document({
            sections: [{
                children: [
                    // Add Company Logo (Centered in PDF, but docx doesn't support direct image centering easily)
                    logoBase64 ? new Paragraph({
                        children: [],
                    }) : new Paragraph('Logo not available'),

                    // Add Company Address (Centered)
                    new Paragraph({
                        text: 'SmartBin Inc.',
                        alignment: 'center',
                    }),
                    new Paragraph({
                        text: '+94715485554',
                        alignment: 'center',
                    }),
                    new Paragraph({
                        text: 'SmartBin@gmail.com',
                        alignment: 'center',
                    }),
                    new Paragraph({
                        text: '39/C, Janara Lane, Kottawa',
                        alignment: 'center',
                    }),
                    new Paragraph(''),

                    // Add Report Title (Centered and Underlined)
                    new Paragraph({
                        text: 'Pickup Requests Report',
                        heading: 'Heading1',
                        alignment: 'center',
                        thematicBreak: true, // Underline equivalent in docx
                    }),
                    new Paragraph({
                        text: `Generated on: ${new Date().toLocaleString()}`,
                        alignment: 'center',
                    }),
                    new Paragraph(''),

                    // Add Table
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph('No')] }),
                                    new TableCell({ children: [new Paragraph('Bin ID')] }),
                                    new TableCell({ children: [new Paragraph('Name')] }),
                                    new TableCell({ children: [new Paragraph('Contact Number')] }),
                                    new TableCell({ children: [new Paragraph('Email')] }),
                                    new TableCell({ children: [new Paragraph('Community')] }),
                                    new TableCell({ children: [new Paragraph('Service Type')] }),
                                    new TableCell({ children: [new Paragraph('Waste Type')] }),
                                    new TableCell({ children: [new Paragraph('Address')] }),
                                    new TableCell({ children: [new Paragraph('Preferred Date')] }),
                                    new TableCell({ children: [new Paragraph('Amount')] }),
                                    new TableCell({ children: [new Paragraph('Status')] }),
                                    new TableCell({ children: [new Paragraph('Location')] }),
                                ],
                            }),
                            ...rows,
                        ],
                    }),
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pickup_requests_report.docx';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="page-container">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="pickup-requests-section">
                    <h2 className="pickup-requests-title">Pickup Requests</h2>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button><i className="fas fa-search"></i></button>
                    </div>

                    {/* Report Download Buttons */}
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <button
                            onClick={generatePDF}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                marginRight: '10px',
                                cursor: 'pointer',
                            }}
                        >
                            Download PDF Report
                        </button>
                        <button
                            onClick={generateWord}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Download Word Report
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading pickup requests...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : pickups.length === 0 ? (
                        <p>No pickup requests found in the database.</p>
                    ) : filteredPickups.length === 0 ? (
                        <p>No pickup requests match your search criteria.</p>
                    ) : (
                        <table className="pickup-requests-table">
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
                                            <select
                                                value={pickup.status}
                                                onChange={(e) => handleStatusUpdate(pickup._id, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Scheduled">Scheduled</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td>
                                            <Link to={`/pickup-request-details/${pickup._id}`} className="view-more-btn">View More</Link>
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

export default PickupRequests;