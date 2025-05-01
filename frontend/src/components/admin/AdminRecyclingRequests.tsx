// // // // // // // // // // // // import React from 'react';
// // // // // // // // // // // // import AdminRequestList from './AdminRequestList';
// // // // // // // // // // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // // // // // // // // const AdminRecyclingRequests: React.FC = () => {
// // // // // // // // // // // //   return (
// // // // // // // // // // // //     <div className="admin-recycling-requests-container">
// // // // // // // // // // // //       <h2>Recycling Requests</h2>
// // // // // // // // // // // //       <AdminRequestList />
// // // // // // // // // // // //     </div>
// // // // // // // // // // // //   );
// // // // // // // // // // // // };

// // // // // // // // // // // // export default AdminRecyclingRequests;


// // // // // // // // // // // import React from 'react';
// // // // // // // // // // // import AdminRequestList from './AdminRequestList';
// // // // // // // // // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // // // // // // // const AdminRecyclingRequests: React.FC = () => {
// // // // // // // // // // //   return (
// // // // // // // // // // //     <div className="admin-recycling-requests-container">
// // // // // // // // // // //       <h2>Recycling Requests</h2>
// // // // // // // // // // //       <AdminRequestList />
// // // // // // // // // // //     </div>
// // // // // // // // // // //   );
// // // // // // // // // // // };

// // // // // // // // // // // export default AdminRecyclingRequests;




// // // // // // // // // // // import React from 'react';
// // // // // // // // // // // import AdminRequestList from './AdminRequestList';
// // // // // // // // // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // // // // // // // const AdminRecyclingRequests: React.FC = () => {
// // // // // // // // // // //   // Function to generate and download CSV report
// // // // // // // // // // //   const generateReport = async () => {
// // // // // // // // // // //     try {
// // // // // // // // // // //       const response = await fetch('http://localhost:5000/api/admin/recycling-requests');
// // // // // // // // // // //       if (!response.ok) {
// // // // // // // // // // //         throw new Error(`HTTP error! Status: ${response.status}`);
// // // // // // // // // // //       }
// // // // // // // // // // //       const requests = await response.json();
// // // // // // // // // // //       console.log('Fetched requests for report:', requests);

// // // // // // // // // // //       if (requests.length === 0) {
// // // // // // // // // // //         alert('No requests available to generate a report.');
// // // // // // // // // // //         return;
// // // // // // // // // // //       }

// // // // // // // // // // //       // Define CSV headers based on AdminRecyclingRequest schema
// // // // // // // // // // //       const headers = [
// // // // // // // // // // //         'Order ID',
// // // // // // // // // // //         'Name',
// // // // // // // // // // //         'Email',
// // // // // // // // // // //         'Contact',
// // // // // // // // // // //         'Waste Type',
// // // // // // // // // // //         'Quantity',
// // // // // // // // // // //         'Community',
// // // // // // // // // // //         'Pickup Location',
// // // // // // // // // // //         'Preferred Pickup DateTime',
// // // // // // // // // // //         'Collection Preference',
// // // // // // // // // // //         'Status',
// // // // // // // // // // //         'User Request ID',
// // // // // // // // // // //       ];

// // // // // // // // // // //       // Map requests to CSV rows
// // // // // // // // // // //       const csvRows = requests.map((req: any, index: number) => {
// // // // // // // // // // //         const orderId = String(index + 1).padStart(3, '0');
// // // // // // // // // // //         return [
// // // // // // // // // // //           orderId,
// // // // // // // // // // //           req.name,
// // // // // // // // // // //           req.email,
// // // // // // // // // // //           req.contact,
// // // // // // // // // // //           req.wasteType,
// // // // // // // // // // //           req.quantity,
// // // // // // // // // // //           req.community,
// // // // // // // // // // //           req.pickupLocation,
// // // // // // // // // // //           new Date(req.preferredPickupDateTime).toLocaleString(), // Format date
// // // // // // // // // // //           req.collectionPreference,
// // // // // // // // // // //           req.status,
// // // // // // // // // // //           req.userRequestId,
// // // // // // // // // // //         ].map((value) => `"${value}"`).join(','); // Wrap values in quotes to handle commas
// // // // // // // // // // //       });

// // // // // // // // // // //       // Combine headers and rows
// // // // // // // // // // //       const csvContent = [headers.join(','), ...csvRows].join('\n');

// // // // // // // // // // //       // Create and download the CSV file
// // // // // // // // // // //       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
// // // // // // // // // // //       const url = URL.createObjectURL(blob);
// // // // // // // // // // //       const link = document.createElement('a');
// // // // // // // // // // //       link.setAttribute('href', url);
// // // // // // // // // // //       link.setAttribute('download', `recycling_requests_report_${new Date().toISOString().split('T')[0]}.csv`);
// // // // // // // // // // //       document.body.appendChild(link);
// // // // // // // // // // //       link.click();
// // // // // // // // // // //       document.body.removeChild(link);
// // // // // // // // // // //       URL.revokeObjectURL(url);

// // // // // // // // // // //       alert('Report generated successfully!');
// // // // // // // // // // //     } catch (error) {
// // // // // // // // // // //       console.error('Error generating report:', error);
// // // // // // // // // // //       alert('Failed to generate report. Please try again.');
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   return (
// // // // // // // // // // //     <div className="admin-recycling-requests-container">
// // // // // // // // // // //       <h2>Recycling Requests</h2>
// // // // // // // // // // //       <div className="report-button-container">
// // // // // // // // // // //         <button className="generate-report-btn" onClick={generateReport}>
// // // // // // // // // // //           Generate Report
// // // // // // // // // // //         </button>
// // // // // // // // // // //       </div>
// // // // // // // // // // //       <AdminRequestList />
// // // // // // // // // // //     </div>
// // // // // // // // // // //   );
// // // // // // // // // // // };

// // // // // // // // // // // export default AdminRecyclingRequests;


// // // // // // // // // // // import React, { useState } from 'react';
// // // // // // // // // // // import AdminRequestList from './AdminRequestList';
// // // // // // // // // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // // // // // // // const AdminRecyclingRequests: React.FC = () => {
// // // // // // // // // // //   const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

// // // // // // // // // // //   // Function to generate and download CSV report
// // // // // // // // // // //   const generateReport = async () => {
// // // // // // // // // // //     try {
// // // // // // // // // // //       // Validate date range
// // // // // // // // // // //       if (dateRange.start && dateRange.end && new Date(dateRange.end) < new Date(dateRange.start)) {
// // // // // // // // // // //         alert('End date must be after start date.');
// // // // // // // // // // //         return;
// // // // // // // // // // //       }

// // // // // // // // // // //       // Use environment variable for API base URL
// // // // // // // // // // //       const baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// // // // // // // // // // //       const urlParams = new URLSearchParams();
// // // // // // // // // // //       if (dateRange.start) urlParams.append('startDate', dateRange.start);
// // // // // // // // // // //       if (dateRange.end) urlParams.append('endDate', dateRange.end);
// // // // // // // // // // //       const url: string = `${baseUrl}/api/admin/recycling-requests${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

// // // // // // // // // // //       const response = await fetch(url);
// // // // // // // // // // //       if (!response.ok) {
// // // // // // // // // // //         throw new Error(`HTTP error! Status: ${response.status}`);
// // // // // // // // // // //       }
// // // // // // // // // // //       const requests = await response.json();
// // // // // // // // // // //       console.log('Fetched requests for report:', requests);

// // // // // // // // // // //       if (requests.length === 0) {
// // // // // // // // // // //         alert('No requests available to generate a report.');
// // // // // // // // // // //         return;
// // // // // // // // // // //       }

// // // // // // // // // // //       // Define CSV headers based on AdminRecyclingRequest schema
// // // // // // // // // // //       const headers = [
// // // // // // // // // // //         'Order ID',
// // // // // // // // // // //         'Name',
// // // // // // // // // // //         'Email',
// // // // // // // // // // //         'Contact',
// // // // // // // // // // //         'Waste Type',
// // // // // // // // // // //         'Quantity',
// // // // // // // // // // //         'Community',
// // // // // // // // // // //         'Pickup Location',
// // // // // // // // // // //         'Preferred Pickup DateTime',
// // // // // // // // // // //         'Collection Preference',
// // // // // // // // // // //         'Status',
// // // // // // // // // // //         'User Request ID',
// // // // // // // // // // //       ];

// // // // // // // // // // //       // Map requests to CSV rows
// // // // // // // // // // //       const csvRows = requests.map((req: any, index: number) => {
// // // // // // // // // // //         const orderId = String(index + 1).padStart(3, '0');
// // // // // // // // // // //         return [
// // // // // // // // // // //           orderId,
// // // // // // // // // // //           req.name,
// // // // // // // // // // //           req.email,
// // // // // // // // // // //           req.contact,
// // // // // // // // // // //           req.wasteType,
// // // // // // // // // // //           req.quantity,
// // // // // // // // // // //           req.community,
// // // // // // // // // // //           req.pickupLocation,
// // // // // // // // // // //           new Date(req.preferredPickupDateTime).toLocaleString(),
// // // // // // // // // // //           req.collectionPreference,
// // // // // // // // // // //           req.status,
// // // // // // // // // // //           req.userRequestId,
// // // // // // // // // // //         ].map((value) => `"${value}"`).join(',');
// // // // // // // // // // //       });

// // // // // // // // // // //       // Combine headers and rows
// // // // // // // // // // //       const csvContent = [headers.join(','), ...csvRows].join('\n');

// // // // // // // // // // //       // Create and download the CSV file
// // // // // // // // // // //       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
// // // // // // // // // // //       const blobUrl = URL.createObjectURL(blob);
// // // // // // // // // // //       const link = document.createElement('a');
// // // // // // // // // // //       link.setAttribute('href', blobUrl);
// // // // // // // // // // //       link.setAttribute('download', `recycling_requests_report_${new Date().toISOString().split('T')[0]}.csv`);
// // // // // // // // // // //       document.body.appendChild(link);
// // // // // // // // // // //       link.click();
// // // // // // // // // // //       document.body.removeChild(link);
// // // // // // // // // // //       URL.revokeObjectURL(blobUrl);

// // // // // // // // // // //       alert('Report generated successfully!');
// // // // // // // // // // //     } catch (error) {
// // // // // // // // // // //       console.error('Error generating report:', error);
// // // // // // // // // // //       alert('Failed to generate report. Please try again.');
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   return (
// // // // // // // // // // //     <div className="admin-recycling-requests-container">
// // // // // // // // // // //       <h2>Recycling Requests</h2>
// // // // // // // // // // //       <div className="report-button-container">
// // // // // // // // // // //         <div className="date-filter">
// // // // // // // // // // //           <label>
// // // // // // // // // // //             Start Date:
// // // // // // // // // // //             <input
// // // // // // // // // // //               type="date"
// // // // // // // // // // //               value={dateRange.start}
// // // // // // // // // // //               onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
// // // // // // // // // // //             />
// // // // // // // // // // //           </label>
// // // // // // // // // // //           <label>
// // // // // // // // // // //             End Date:
// // // // // // // // // // //             <input
// // // // // // // // // // //               type="date"
// // // // // // // // // // //               value={dateRange.end}
// // // // // // // // // // //               onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
// // // // // // // // // // //             />
// // // // // // // // // // //           </label>
// // // // // // // // // // //         </div>
// // // // // // // // // // //         <button className="generate-report-btn" onClick={generateReport}>
// // // // // // // // // // //           Generate Report
// // // // // // // // // // //         </button>
// // // // // // // // // // //       </div>
// // // // // // // // // // //       <AdminRequestList />
// // // // // // // // // // //     </div>
// // // // // // // // // // //   );
// // // // // // // // // // // };

// // // // // // // // // // // export default AdminRecyclingRequests;


// // // // // // // // // // import React, { useState } from 'react';
// // // // // // // // // // import AdminRequestList from './AdminRequestList';
// // // // // // // // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // // // // // // const AdminRecyclingRequests: React.FC = () => {
// // // // // // // // // //   const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

// // // // // // // // // //   // Function to generate and download CSV report
// // // // // // // // // //   const generateReport = async () => {
// // // // // // // // // //     try {
// // // // // // // // // //       // Validate date range
// // // // // // // // // //       if (dateRange.start && dateRange.end && new Date(dateRange.end) < new Date(dateRange.start)) {
// // // // // // // // // //         alert('End date must be after start date.');
// // // // // // // // // //         return;
// // // // // // // // // //       }

// // // // // // // // // //       // Use environment variable for API base URL
// // // // // // // // // //       const baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// // // // // // // // // //       const urlParams = new URLSearchParams();
// // // // // // // // // //       if (dateRange.start) urlParams.append('startDate', dateRange.start);
// // // // // // // // // //       if (dateRange.end) urlParams.append('endDate', dateRange.end);
// // // // // // // // // //       const url: string = `${baseUrl}/api/admin/recycling-requests${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

// // // // // // // // // //       const response = await fetch(url);
// // // // // // // // // //       if (!response.ok) {
// // // // // // // // // //         throw new Error(`HTTP error! Status: ${response.status}`);
// // // // // // // // // //       }
// // // // // // // // // //       const requests = await response.json();
// // // // // // // // // //       console.log('Fetched requests for report:', requests);

// // // // // // // // // //       if (requests.length === 0) {
// // // // // // // // // //         alert('No requests available to generate a report.');
// // // // // // // // // //         return;
// // // // // // // // // //       }

// // // // // // // // // //       // Define CSV headers based on AdminRecyclingRequest schema
// // // // // // // // // //       const headers = [
// // // // // // // // // //         'Order ID',
// // // // // // // // // //         'Name',
// // // // // // // // // //         'Email',
// // // // // // // // // //         'Contact',
// // // // // // // // // //         'Waste Type',
// // // // // // // // // //         'Quantity',
// // // // // // // // // //         'Community',
// // // // // // // // // //         'Pickup Location',
// // // // // // // // // //         'Preferred Pickup DateTime',
// // // // // // // // // //         'Collection Preference',
// // // // // // // // // //         'Status',
// // // // // // // // // //         'User Request ID',
// // // // // // // // // //         'Amount',
// // // // // // // // // //       ];

// // // // // // // // // //       // Map requests to CSV rows
// // // // // // // // // //       const csvRows = requests.map((req: any, index: number) => {
// // // // // // // // // //         const orderId = String(index + 1).padStart(3, '0');
// // // // // // // // // //         return [
// // // // // // // // // //           orderId,
// // // // // // // // // //           req.name,
// // // // // // // // // //           req.email,
// // // // // // // // // //           req.contact,
// // // // // // // // // //           req.wasteType,
// // // // // // // // // //           req.quantity,
// // // // // // // // // //           req.community,
// // // // // // // // // //           req.pickupLocation,
// // // // // // // // // //           new Date(req.preferredPickupDateTime).toLocaleString(),
// // // // // // // // // //           req.collectionPreference,
// // // // // // // // // //           req.status,
// // // // // // // // // //           req.userRequestId,
// // // // // // // // // //           req.amount,
// // // // // // // // // //         ].map((value) => `"${value}"`).join(',');
// // // // // // // // // //       });

// // // // // // // // // //       // Combine headers and rows
// // // // // // // // // //       const csvContent = [headers.join(','), ...csvRows].join('\n');

// // // // // // // // // //       // Create and download the CSV file
// // // // // // // // // //       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
// // // // // // // // // //       const blobUrl = URL.createObjectURL(blob);
// // // // // // // // // //       const link = document.createElement('a');
// // // // // // // // // //       link.setAttribute('href', blobUrl);
// // // // // // // // // //       link.setAttribute('download', `recycling_requests_report_${new Date().toISOString().split('T')[0]}.csv`);
// // // // // // // // // //       document.body.appendChild(link);
// // // // // // // // // //       link.click();
// // // // // // // // // //       document.body.removeChild(link);
// // // // // // // // // //       URL.revokeObjectURL(blobUrl);

// // // // // // // // // //       alert('Report generated successfully!');
// // // // // // // // // //     } catch (error) {
// // // // // // // // // //       console.error('Error generating report:', error);
// // // // // // // // // //       alert('Failed to generate report. Please try again.');
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   return (
// // // // // // // // // //     <div className="admin-recycling-requests-container">
// // // // // // // // // //       <h2>Recycling Requests</h2>
// // // // // // // // // //       <div className="report-button-container">
// // // // // // // // // //         <div className="date-filter">
// // // // // // // // // //           <label>
// // // // // // // // // //             Start Date:
// // // // // // // // // //             <input
// // // // // // // // // //               type="date"
// // // // // // // // // //               value={dateRange.start}
// // // // // // // // // //               onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
// // // // // // // // // //             />
// // // // // // // // // //           </label>
// // // // // // // // // //           <label>
// // // // // // // // // //             End Date:
// // // // // // // // // //             <input
// // // // // // // // // //               type="date"
// // // // // // // // // //               value={dateRange.end}
// // // // // // // // // //               onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
// // // // // // // // // //             />
// // // // // // // // // //           </label>
// // // // // // // // // //         </div>
// // // // // // // // // //         <button className="generate-report-btn" onClick={generateReport}>
// // // // // // // // // //           Generate Report
// // // // // // // // // //         </button>
// // // // // // // // // //       </div>
// // // // // // // // // //       <AdminRequestList />
// // // // // // // // // //     </div>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // export default AdminRecyclingRequests;



// // // // // // // // // import React, { useRef } from 'react';
// // // // // // // // // import AdminRequestList from './AdminRequestList';
// // // // // // // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // // // // // const AdminRecyclingRequests: React.FC = () => {
// // // // // // // // //   // Create a ref to access AdminRequestList's filteredRequests
// // // // // // // // //   const requestListRef = useRef<{ getFilteredRequests: () => any[] }>(null);

// // // // // // // // //   // Function to generate and download CSV report
// // // // // // // // //   const generateReport = async () => {
// // // // // // // // //     try {
// // // // // // // // //       // Get filtered requests from AdminRequestList
// // // // // // // // //       const requests = requestListRef.current?.getFilteredRequests() || [];
// // // // // // // // //       console.log('Fetched requests for report:', requests);

// // // // // // // // //       if (requests.length === 0) {
// // // // // // // // //         alert('No requests available to generate a report.');
// // // // // // // // //         return;
// // // // // // // // //       }

// // // // // // // // //       // Define CSV headers based on Recycling Order Details page
// // // // // // // // //       const headers = [
// // // // // // // // //         'Order ID',
// // // // // // // // //         'Name',
// // // // // // // // //         'Email',
// // // // // // // // //         'Contact',
// // // // // // // // //         'Waste Type',
// // // // // // // // //         'Quantity (kg)',
// // // // // // // // //         'Amount (LKR)',
// // // // // // // // //         'Community',
// // // // // // // // //         'Pickup Location',
// // // // // // // // //         'Preferred Pickup DateTime',
// // // // // // // // //         'Collection Preference',
// // // // // // // // //         'Status',
// // // // // // // // //         'User Request ID',
// // // // // // // // //       ];

// // // // // // // // //       // Map requests to CSV rows
// // // // // // // // //       const csvRows = requests.map((req: any, index: number) => {
// // // // // // // // //         const orderId = String(index + 1).padStart(3, '0');
// // // // // // // // //         return [
// // // // // // // // //           orderId,
// // // // // // // // //           req.name,
// // // // // // // // //           req.email,
// // // // // // // // //           req.contact,
// // // // // // // // //           req.wasteType,
// // // // // // // // //           req.quantity,
// // // // // // // // //           req.amount || 0, // Ensure amount is included
// // // // // // // // //           req.community,
// // // // // // // // //           req.pickupLocation,
// // // // // // // // //           new Date(req.preferredPickupDateTime).toLocaleString(),
// // // // // // // // //           req.collectionPreference,
// // // // // // // // //           req.status,
// // // // // // // // //           req.userRequestId,
// // // // // // // // //         ].map((value) => `"${value}"`).join(',');
// // // // // // // // //       });

// // // // // // // // //       // Combine headers and rows
// // // // // // // // //       const csvContent = [headers.join(','), ...csvRows].join('\n');

// // // // // // // // //       // Create and download the CSV file
// // // // // // // // //       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
// // // // // // // // //       const blobUrl = URL.createObjectURL(blob);
// // // // // // // // //       const link = document.createElement('a');
// // // // // // // // //       link.setAttribute('href', blobUrl);
// // // // // // // // //       link.setAttribute('download', `recycling_requests_report_${new Date().toISOString().split('T')[0]}.csv`);
// // // // // // // // //       document.body.appendChild(link);
// // // // // // // // //       link.click();
// // // // // // // // //       document.body.removeChild(link);
// // // // // // // // //       URL.revokeObjectURL(blobUrl);

// // // // // // // // //       alert('Report generated successfully!');
// // // // // // // // //     } catch (error) {
// // // // // // // // //       console.error('Error generating report:', error);
// // // // // // // // //       alert('Failed to generate report. Please try again.');
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   return (
// // // // // // // // //     <div className="admin-recycling-requests-container">
// // // // // // // // //       <h2>Recycling Requests</h2>
// // // // // // // // //       <div className="report-button-container">
// // // // // // // // //         <button className="generate-report-btn" onClick={generateReport}>
// // // // // // // // //           Generate Report
// // // // // // // // //         </button>
// // // // // // // // //       </div>
// // // // // // // // //       <AdminRequestList ref={requestListRef} />
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // export default AdminRecyclingRequests;

// // // // // // // // import React, { useRef } from 'react';
// // // // // // // // import AdminRequestList from './AdminRequestList';
// // // // // // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // // // // const AdminRecyclingRequests: React.FC = () => {
// // // // // // // //   // Create a ref to access AdminRequestList's filteredRequests
// // // // // // // //   const requestListRef = useRef<{ getFilteredRequests: () => any[] }>(null);

// // // // // // // //   // Function to calculate amount based on waste type and quantity (fallback if server amount is 0 or missing)
// // // // // // // //   const calculateAmount = (wasteType: string, quantity: number): number => {
// // // // // // // //     const rates: { [key: string]: number } = {
// // // // // // // //       Plastic: 100, // LKR per kg
// // // // // // // //       Paper: 50,
// // // // // // // //       Glass: 30,
// // // // // // // //       Metal: 80,
// // // // // // // //       // Add other waste types as needed
// // // // // // // //     };
// // // // // // // //     const rate = rates[wasteType] || 50; // Default rate if wasteType is unknown
// // // // // // // //     return quantity * rate;
// // // // // // // //   };

// // // // // // // //   // Function to generate and download CSV report
// // // // // // // //   const generateReport = async () => {
// // // // // // // //     try {
// // // // // // // //       // Get filtered requests from AdminRequestList
// // // // // // // //       const requests = requestListRef.current?.getFilteredRequests() || [];
// // // // // // // //       console.log('Fetched requests for report:', requests);

// // // // // // // //       if (requests.length === 0) {
// // // // // // // //         alert('No requests available to generate a report.');
// // // // // // // //         return;
// // // // // // // //       }

// // // // // // // //       // Define CSV headers based on Recycling Order Details page (excluding User Request ID)
// // // // // // // //       const headers = [
// // // // // // // //         'Order ID',
// // // // // // // //         'Name',
// // // // // // // //         'Email',
// // // // // // // //         'Contact',
// // // // // // // //         'Waste Type',
// // // // // // // //         'Quantity (kg)',
// // // // // // // //         'Amount (LKR)',
// // // // // // // //         'Community',
// // // // // // // //         'Pickup Location',
// // // // // // // //         'Preferred Pickup DateTime',
// // // // // // // //         'Collection Preference',
// // // // // // // //         'Status',
// // // // // // // //       ];

// // // // // // // //       // Map requests to CSV rows
// // // // // // // //       const csvRows = requests.map((req: any, index: number) => {
// // // // // // // //         const orderId = String(index + 1).padStart(3, '0');
// // // // // // // //         // Use server-provided amount if available and non-zero; otherwise, calculate it
// // // // // // // //         const amount = req.amount && req.amount > 0 ? req.amount : calculateAmount(req.wasteType, req.quantity);
// // // // // // // //         return [
// // // // // // // //           orderId,
// // // // // // // //           req.name,
// // // // // // // //           req.email,
// // // // // // // //           req.contact,
// // // // // // // //           req.wasteType,
// // // // // // // //           req.quantity,
// // // // // // // //           amount.toFixed(2), // Format amount to 2 decimal places
// // // // // // // //           req.community,
// // // // // // // //           req.pickupLocation,
// // // // // // // //           new Date(req.preferredPickupDateTime).toLocaleString(),
// // // // // // // //           req.collectionPreference,
// // // // // // // //           req.status,
// // // // // // // //         ].map((value) => `"${value}"`).join(',');
// // // // // // // //       });

// // // // // // // //       // Combine headers and rows
// // // // // // // //       const csvContent = [headers.join(','), ...csvRows].join('\n');

// // // // // // // //       // Create and download the CSV file
// // // // // // // //       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
// // // // // // // //       const blobUrl = URL.createObjectURL(blob);
// // // // // // // //       const link = document.createElement('a');
// // // // // // // //       link.setAttribute('href', blobUrl);
// // // // // // // //       link.setAttribute('download', `recycling_requests_report_${new Date().toISOString().split('T')[0]}.csv`);
// // // // // // // //       document.body.appendChild(link);
// // // // // // // //       link.click();
// // // // // // // //       document.body.removeChild(link);
// // // // // // // //       URL.revokeObjectURL(blobUrl);

// // // // // // // //       alert('Report generated successfully!');
// // // // // // // //     } catch (error) {
// // // // // // // //       console.error('Error generating report:', error);
// // // // // // // //       alert('Failed to generate report. Please try again.');
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   return (
// // // // // // // //     <div className="admin-recycling-requests-container">
// // // // // // // //       <h2>Recycling Requests</h2>
// // // // // // // //       <div className="report-button-container">
// // // // // // // //         <button className="generate-report-btn" onClick={generateReport}>
// // // // // // // //           Generate Report
// // // // // // // //         </button>
// // // // // // // //       </div>
// // // // // // // //       <AdminRequestList ref={requestListRef} />
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default AdminRecyclingRequests;


// // // // // // // import React, { useRef } from 'react';
// // // // // // // import AdminRequestList from './AdminRequestList';
// // // // // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // // // const AdminRecyclingRequests: React.FC = () => {
// // // // // // //   // Create a ref to access AdminRequestList's filteredRequests
// // // // // // //   const requestListRef = useRef<{ getFilteredRequests: () => any[] }>(null);

// // // // // // //   // Function to calculate amount based on waste type and quantity (fallback if server amount is 0 or missing)
// // // // // // //   const calculateAmount = (wasteType: string, quantity: number): number => {
// // // // // // //     const rates: { [key: string]: number } = {
// // // // // // //       Plastic: 100, // LKR per kg
// // // // // // //       Paper: 50,
// // // // // // //       Glass: 30,
// // // // // // //       Metal: 80,
// // // // // // //       // Add other waste types as needed
// // // // // // //     };
// // // // // // //     const rate = rates[wasteType] || 50; // Default rate if wasteType is unknown
// // // // // // //     return quantity * rate;
// // // // // // //   };

// // // // // // //   // Function to generate and download CSV report
// // // // // // //   const generateReport = async () => {
// // // // // // //     try {
// // // // // // //       // Get filtered requests from AdminRequestList
// // // // // // //       const requests = requestListRef.current?.getFilteredRequests() || [];
// // // // // // //       console.log('Fetched requests for report:', requests);

// // // // // // //       if (requests.length === 0) {
// // // // // // //         alert('No requests available to generate a report.');
// // // // // // //         return;
// // // // // // //       }

// // // // // // //       // Define CSV headers based on Recycling Order Details page
// // // // // // //       const headers = [
// // // // // // //         'Order ID',
// // // // // // //         'Name',
// // // // // // //         'Email',
// // // // // // //         'Contact',
// // // // // // //         'Waste Type',
// // // // // // //         'Quantity (kg)',
// // // // // // //         'Amount (LKR)',
// // // // // // //         'Community',
// // // // // // //         'Pickup Location',
// // // // // // //         'Preferred Pickup DateTime',
// // // // // // //         'Collection Preference',
// // // // // // //         'Status',
// // // // // // //       ];

// // // // // // //       // Map requests to CSV rows
// // // // // // //       const csvRows = requests.map((req: any) => {
// // // // // // //         // Use stored orderId from request
// // // // // // //         const amount = req.amount && req.amount > 0 ? req.amount : calculateAmount(req.wasteType, req.quantity);
// // // // // // //         return [
// // // // // // //           req.orderId,
// // // // // // //           req.name,
// // // // // // //           req.email,
// // // // // // //           req.contact,
// // // // // // //           req.wasteType,
// // // // // // //           req.quantity,
// // // // // // //           amount.toFixed(2), // Format amount to 2 decimal places
// // // // // // //           req.community,
// // // // // // //           req.pickupLocation,
// // // // // // //           new Date(req.preferredPickupDateTime).toLocaleString(),
// // // // // // //           req.collectionPreference,
// // // // // // //           req.status,
// // // // // // //         ].map((value) => `"${value}"`).join(',');
// // // // // // //       });

// // // // // // //       // Combine headers and rows
// // // // // // //       const csvContent = [headers.join(','), ...csvRows].join('\n');

// // // // // // //       // Create and download the CSV file
// // // // // // //       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
// // // // // // //       const blobUrl = URL.createObjectURL(blob);
// // // // // // //       const link = document.createElement('a');
// // // // // // //       link.setAttribute('href', blobUrl);
// // // // // // //       link.setAttribute('download', `recycling_requests_report_${new Date().toISOString().split('T')[0]}.csv`);
// // // // // // //       document.body.appendChild(link);
// // // // // // //       link.click();
// // // // // // //       document.body.removeChild(link);
// // // // // // //       URL.revokeObjectURL(blobUrl);

// // // // // // //       alert('Report generated successfully!');
// // // // // // //     } catch (error) {
// // // // // // //       console.error('Error generating report:', error);
// // // // // // //       alert('Failed to generate report. Please try again.');
// // // // // // //     }
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <div className="admin-recycling-requests-container">
// // // // // // //       <h2>Recycling Requests</h2>
// // // // // // //       <div className="report-button-container">
// // // // // // //         <button className="generate-report-btn" onClick={generateReport}>
// // // // // // //           Generate Report
// // // // // // //         </button>
// // // // // // //       </div>
// // // // // // //       <AdminRequestList ref={requestListRef} />
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default AdminRecyclingRequests;

// // // // // // import React, { useRef } from 'react';
// // // // // // import AdminRequestList from './AdminRequestList';
// // // // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // // // Declare global jspdf for CDN usage
// // // // // // declare const jspdf: any;
// // // // // // const { jsPDF } = jspdf;

// // // // // // const AdminRecyclingRequests: React.FC = () => {
// // // // // //   // Create a ref to access AdminRequestList's filteredRequests
// // // // // //   const requestListRef = useRef<{ getFilteredRequests: () => any[] }>(null);

// // // // // //   // Function to calculate amount based on waste type and quantity (fallback if server amount is 0 or missing)
// // // // // //   const calculateAmount = (wasteType: string, quantity: number): number => {
// // // // // //     const rates: { [key: string]: number } = {
// // // // // //       Plastic: 100, // LKR per kg
// // // // // //       Paper: 50,
// // // // // //       Glass: 30,
// // // // // //       Metal: 80,
// // // // // //       // Add other waste types as needed
// // // // // //     };
// // // // // //     const rate = rates[wasteType] || 50; // Default rate if wasteType is unknown
// // // // // //     return quantity * rate;
// // // // // //   };

// // // // // //   // Function to generate and download PDF report
// // // // // //   const generateReport = async () => {
// // // // // //     try {
// // // // // //       // Get filtered requests from AdminRequestList
// // // // // //       const requests = requestListRef.current?.getFilteredRequests() || [];
// // // // // //       console.log('Fetched requests for report:', requests);

// // // // // //       if (requests.length === 0) {
// // // // // //         alert('No requests available to generate a report.');
// // // // // //         return;
// // // // // //       }

// // // // // //       // Initialize jsPDF
// // // // // //       const doc = new jsPDF();

// // // // // //       // Add title
// // // // // //       doc.setFontSize(16);
// // // // // //       doc.text('Recycling Requests Report', 14, 20);
// // // // // //       doc.setFontSize(10);
// // // // // //       doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

// // // // // //       // Define table columns
// // // // // //       const columns = [
// // // // // //         { header: 'Order ID', dataKey: 'orderId' },
// // // // // //         { header: 'Name', dataKey: 'name' },
// // // // // //         { header: 'Email', dataKey: 'email' },
// // // // // //         { header: 'Contact', dataKey: 'contact' },
// // // // // //         { header: 'Waste Type', dataKey: 'wasteType' },
// // // // // //         { header: 'Quantity (kg)', dataKey: 'quantity' },
// // // // // //         { header: 'Amount (LKR)', dataKey: 'amount' },
// // // // // //         { header: 'Community', dataKey: 'community' },
// // // // // //         { header: 'Pickup Location', dataKey: 'pickupLocation' },
// // // // // //         { header: 'Pickup DateTime', dataKey: 'preferredPickupDateTime' },
// // // // // //         { header: 'Collection Preference', dataKey: 'collectionPreference' },
// // // // // //         { header: 'Status', dataKey: 'status' },
// // // // // //       ];

// // // // // //       // Map requests to table rows
// // // // // //       const rows = requests.map((req: any) => ({
// // // // // //         orderId: req.orderId,
// // // // // //         name: req.name,
// // // // // //         email: req.email,
// // // // // //         contact: req.contact,
// // // // // //         wasteType: req.wasteType,
// // // // // //         quantity: req.quantity,
// // // // // //         amount: (req.amount && req.amount > 0 ? req.amount : calculateAmount(req.wasteType, req.quantity)).toFixed(2),
// // // // // //         community: req.community,
// // // // // //         pickupLocation: req.pickupLocation,
// // // // // //         preferredPickupDateTime: new Date(req.preferredPickupDateTime).toLocaleString(),
// // // // // //         collectionPreference: req.collectionPreference,
// // // // // //         status: req.status,
// // // // // //       }));

// // // // // //       // Add table to PDF using autoTable
// // // // // //       doc.autoTable({
// // // // // //         columns,
// // // // // //         body: rows,
// // // // // //         startY: 34,
// // // // // //         theme: 'grid',
// // // // // //         headStyles: { fillColor: [255, 105, 180] }, // Pink header like the app's theme
// // // // // //         styles: { fontSize: 8, cellPadding: 2 },
// // // // // //         columnStyles: {
// // // // // //           email: { cellWidth: 30 }, // Wider column for email
// // // // // //           pickupLocation: { cellWidth: 25 }, // Wider column for pickup location
// // // // // //         },
// // // // // //       });

// // // // // //       // Save the PDF
// // // // // //       doc.save(`recycling_requests_report_${new Date().toISOString().split('T')[0]}.pdf`);

// // // // // //       alert('Report generated successfully!');
// // // // // //     } catch (error) {
// // // // // //       console.error('Error generating report:', error);
// // // // // //       alert('Failed to generate report. Please try again.');
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="admin-recycling-requests-container">
// // // // // //       <h2>Recycling Requests</h2>
// // // // // //       <div className="report-button-container">
// // // // // //         <button className="generate-report-btn" onClick={generateReport}>
// // // // // //           Generate Report
// // // // // //         </button>
// // // // // //       </div>
// // // // // //       <AdminRequestList ref={requestListRef} />
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default AdminRecyclingRequests;
// // // // // import React, { useRef } from 'react';
// // // // // import AdminRequestList from './AdminRequestList';
// // // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // // Declare global jspdf for CDN usage
// // // // // declare const jspdf: any;
// // // // // const { jsPDF } = jspdf;

// // // // // const AdminRecyclingRequests: React.FC = () => {
// // // // //   // Create a ref to access AdminRequestList's filteredRequests
// // // // //   const requestListRef = useRef<{ getFilteredRequests: () => any[] }>(null);

// // // // //   // Function to calculate amount based on waste type and quantity (fallback if server amount is 0 or missing)
// // // // //   const calculateAmount = (wasteType: string, quantity: number): number => {
// // // // //     const rates: { [key: string]: number } = {
// // // // //       Plastic: 100, // LKR per kg
// // // // //       Paper: 50,
// // // // //       Glass: 30,
// // // // //       Metal: 80,
// // // // //       // Add other waste types as needed
// // // // //     };
// // // // //     const rate = rates[wasteType] || 50; // Default rate if wasteType is unknown
// // // // //     return quantity * rate;
// // // // //   };

// // // // //   // Function to generate and download PDF report
// // // // //   const generateReport = async () => {
// // // // //     try {
// // // // //       // Get filtered requests from AdminRequestList
// // // // //       const requests = requestListRef.current?.getFilteredRequests() || [];
// // // // //       console.log('Fetched requests for report:', requests);

// // // // //       if (requests.length === 0) {
// // // // //         alert('No requests available to generate a report.');
// // // // //         return;
// // // // //       }

// // // // //       // Initialize jsPDF
// // // // //       const doc = new jsPDF();

// // // // //       // Add title
// // // // //       doc.setFontSize(16);
// // // // //       doc.text('Recycling Requests Report', 14, 20);
// // // // //       doc.setFontSize(10);
// // // // //       doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

// // // // //       // Define table columns
// // // // //       const columns = [
// // // // //         { header: 'Order ID', dataKey: 'orderId' },
// // // // //         { header: 'Name', dataKey: 'name' },
// // // // //         { header: 'Email', dataKey: 'email' },
// // // // //         { header: 'Contact', dataKey: 'contact' },
// // // // //         { header: 'Waste Type', dataKey: 'wasteType' },
// // // // //         { header: 'Quantity (kg)', dataKey: 'quantity' },
// // // // //         { header: 'Amount (LKR)', dataKey: 'amount' },
// // // // //         { header: 'Community', dataKey: 'community' },
// // // // //         { header: 'Pickup Location', dataKey: 'pickupLocation' },
// // // // //         { header: 'Pickup DateTime', dataKey: 'preferredPickupDateTime' },
// // // // //         { header: 'Collection Preference', dataKey: 'collectionPreference' },
// // // // //         { header: 'Status', dataKey: 'status' },
// // // // //       ];

// // // // //       // Map requests to table rows
// // // // //       const rows = requests.map((req: any) => ({
// // // // //         orderId: req.orderId,
// // // // //         name: req.name,
// // // // //         email: req.email,
// // // // //         contact: req.contact,
// // // // //         wasteType: req.wasteType,
// // // // //         quantity: req.quantity,
// // // // //         amount: (req.amount && req.amount > 0 ? req.amount : calculateAmount(req.wasteType, req.quantity)).toFixed(2),
// // // // //         community: req.community,
// // // // //         pickupLocation: req.pickupLocation,
// // // // //         preferredPickupDateTime: new Date(req.preferredPickupDateTime).toLocaleString(),
// // // // //         collectionPreference: req.collectionPreference,
// // // // //         status: req.status,
// // // // //       }));

// // // // //       // Add table to PDF using autoTable
// // // // //       doc.autoTable({
// // // // //         columns,
// // // // //         body: rows,
// // // // //         startY: 34,
// // // // //         theme: 'grid',
// // // // //         headStyles: { fillColor: [255, 105, 180] }, // Pink header like the app's theme
// // // // //         styles: { fontSize: 8, cellPadding: 2 },
// // // // //         columnStyles: {
// // // // //           email: { cellWidth: 30 }, // Wider column for email
// // // // //           pickupLocation: { cellWidth: 25 }, // Wider column for pickup location
// // // // //         },
// // // // //       });

// // // // //       // Save the PDF
// // // // //       doc.save(`recycling_requests_report_${new Date().toISOString().split('T')[0]}.pdf`);

// // // // //       alert('Report generated successfully!');
// // // // //     } catch (error) {
// // // // //       console.error('Error generating report:', error);
// // // // //       alert('Failed to generate report. Please try again.');
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <div className="admin-recycling-requests-container">
// // // // //       <h2>Recycling Requests</h2>
// // // // //       <div className="report-button-container">
// // // // //         <button className="generate-report-btn" onClick={generateReport}>
// // // // //           Generate Report
// // // // //         </button>
// // // // //       </div>
// // // // //       <AdminRequestList ref={requestListRef} />
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default AdminRecyclingRequests;
// // // // import React, { useRef } from 'react';
// // // // import AdminRequestList from './AdminRequestList';
// // // // import '../../styles/AdminRecyclingRequests.css';

// // // // // Declare global jspdf for CDN
// // // // declare const jspdf: any;
// // // // const { jsPDF } = jspdf;

// // // // const AdminRecyclingRequests: React.FC = () => {
// // // //   const requestListRef = useRef<{ getFilteredRequests: () => any[] }>(null);

// // // //   const calculateAmount = (wasteType: string, quantity: number): number => {
// // // //     const rates: { [key: string]: number } = {
// // // //       Plastic: 100,
// // // //       Paper: 50,
// // // //       Glass: 30,
// // // //       Metal: 80,
// // // //     };
// // // //     const rate = rates[wasteType] || 50;
// // // //     return quantity * rate;
// // // //   };

// // // //   const generateReport = async () => {
// // // //     try {
// // // //       const requests = requestListRef.current?.getFilteredRequests() || [];
// // // //       console.log('Requests for PDF:', requests);

// // // //       if (requests.length === 0) {
// // // //         alert('No requests available to generate a report.');
// // // //         return;
// // // //       }

// // // //       const doc = new jsPDF();
// // // //       console.log('jsPDF initialized');

// // // //       doc.setFontSize(16);
// // // //       doc.text('Recycling Requests Report', 14, 20);
// // // //       doc.setFontSize(10);
// // // //       doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

// // // //       const columns = [
// // // //         'Order ID',
// // // //         'Name',
// // // //         'Email',
// // // //         'Contact',
// // // //         'Waste Type',
// // // //         'Quantity (kg)',
// // // //         'Amount (LKR)',
// // // //         'Community',
// // // //         'Pickup Location',
// // // //         'Pickup DateTime',
// // // //         'Collection Preference',
// // // //         'Status',
// // // //       ];

// // // //       const rows = requests.map((req: any) => [
// // // //         req.orderId || 'N/A',
// // // //         req.name || 'N/A',
// // // //         req.email || 'N/A',
// // // //         req.contact || 'N/A',
// // // //         req.wasteType || 'N/A',
// // // //         req.quantity || 0,
// // // //         (req.amount && req.amount > 0 ? req.amount : calculateAmount(req.wasteType, req.quantity)).toFixed(2),
// // // //         req.community || 'N/A',
// // // //         req.pickupLocation || 'N/A',
// // // //         req.preferredPickupDateTime ? new Date(req.preferredPickupDateTime).toLocaleString() : 'N/A',
// // // //         req.collectionPreference || 'N/A',
// // // //         req.status || 'N/A',
// // // //       ]);

// // // //       console.log('Table data:', { columns, rows });

// // // //       doc.autoTable({
// // // //         head: [columns],
// // // //         body: rows,
// // // //         startY: 34,
// // // //         theme: 'grid',
// // // //         headStyles: { fillColor: [255, 105, 180] },
// // // //         styles: { fontSize: 8, cellPadding: 2 },
// // // //         columnStyles: {
// // // //           2: { cellWidth: 30 }, // Email
// // // //           8: { cellWidth: 25 }, // Pickup Location
// // // //         },
// // // //       });

// // // //       console.log('Table added to PDF');

// // // //       doc.save(`recycling_requests_report_${new Date().toISOString().split('T')[0]}.pdf`);
// // // //       console.log('PDF saved');

// // // //       alert('Report generated successfully!');
// // // //     } catch (error) {
// // // //       console.error('PDF generation error:', error);
// // // //       alert('Failed to generate report. Check the console for details.');
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div className="admin-recycling-requests-container">
// // // //       <h2>Recycling Requests</h2>
// // // //       <div className="report-button-container">
// // // //         <button className="generate-report-btn" onClick={generateReport}>
// // // //           Generate Report
// // // //         </button>
// // // //       </div>
// // // //       <AdminRequestList ref={requestListRef} />
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AdminRecyclingRequests;

// // // import React, { useRef } from 'react';
// // // import AdminRequestList from './AdminRequestList';
// // // import '../../styles/AdminRecyclingRequests.css';

// // // // Declare global jspdf for CDN
// // // declare const jspdf: any;
// // // const { jsPDF } = jspdf;

// // // const AdminRecyclingRequests: React.FC = () => {
// // //   const requestListRef = useRef<{ getFilteredRequests: () => any[] }>(null);

// // //   const calculateAmount = (wasteType: string, quantity: number): number => {
// // //     const rates: { [key: string]: number } = {
// // //       Plastic: 100,
// // //       Paper: 50,
// // //       Glass: 30,
// // //       Metal: 80,
// // //     };
// // //     const rate = rates[wasteType] || 50;
// // //     return quantity * rate;
// // //   };

// // //   const generateReport = async () => {
// // //     try {
// // //       const requests = requestListRef.current?.getFilteredRequests() || [];
// // //       console.log('Requests for PDF:', requests);

// // //       if (requests.length === 0) {
// // //         alert('No requests available to generate a report.');
// // //         return;
// // //       }

// // //       const doc = new jsPDF();
// // //       console.log('jsPDF initialized successfully');

// // //       doc.setFontSize(16);
// // //       doc.text('Recycling Requests Report', 14, 20);
// // //       console.log('Added title');

// // //       const columns = ['Order ID', 'Name', 'Email', 'Waste Type', 'Quantity', 'Amount'];
// // //       const rows = requests.map((req: any) => [
// // //         req.orderId || 'N/A',
// // //         req.name || 'N/A',
// // //         req.email || 'N/A',
// // //         req.wasteType || 'N/A',
// // //         req.quantity || 0,
// // //         (req.amount && req.amount > 0 ? req.amount : calculateAmount(req.wasteType, req.quantity)).toFixed(2),
// // //       ]);

// // //       console.log('Table data prepared:', { columns, rows });

// // //       doc.autoTable({
// // //         head: [columns],
// // //         body: rows,
// // //         startY: 30,
// // //         theme: 'grid',
// // //         styles: { fontSize: 10 },
// // //       });
// // //       console.log('Table added to PDF');

// // //       const filename = `recycling_requests_report_${new Date().toISOString().split('T')[0]}.pdf`;
// // //       doc.save(filename);
// // //       console.log(`PDF saved as ${filename}`);

// // //       alert('Report generated successfully!');
// // //     } catch (error) {
// // //       console.error('PDF generation error:', error);
// // //       alert('Failed to generate report. Check the console for details.');
// // //     }
// // //   };

// // //   return (
// // //     <div className="admin-recycling-requests-container">
// // //       <h2>Recycling Requests</h2>
// // //       <div className="report-button-container">
// // //         <button className="generate-report-btn" onClick={generateReport}>
// // //           Generate Report
// // //         </button>
// // //       </div>
// // //       <AdminRequestList ref={requestListRef} />
// // //     </div>
// // //   );
// // // };

// // // export default AdminRecyclingRequests;

// // import React, { useRef } from 'react';
// // import AdminRequestList from './AdminRequestList';
// // import '../../styles/AdminRecyclingRequests.css';

// // const AdminRecyclingRequests: React.FC = () => {
// //   // Create a ref to access AdminRequestList's filteredRequests
// //   const requestListRef = useRef<{ getFilteredRequests: () => any[] }>(null);

// //   // Function to calculate amount based on waste type and quantity (fallback if server amount is 0 or missing)
// //   const calculateAmount = (wasteType: string, quantity: number): number => {
// //     const rates: { [key: string]: number } = {
// //       Plastic: 100, // LKR per kg
// //       Paper: 50,
// //       Glass: 30,
// //       Metal: 80,
// //       // Add other waste types as needed
// //     };
// //     const rate = rates[wasteType] || 50; // Default rate if wasteType is unknown
// //     return quantity * rate;
// //   };

// //   // Function to generate and download CSV report
// //   const generateReport = async () => {
// //     try {
// //       // Get filtered requests from AdminRequestList
// //       const requests = requestListRef.current?.getFilteredRequests() || [];
// //       console.log('Fetched requests for report:', requests);

// //       if (requests.length === 0) {
// //         alert('No requests available to generate a report.');
// //         return;
// //       }

// //       // Define CSV headers based on Recycling Order Details page
// //       const headers = [
// //         'Order ID',
// //         'Name',
// //         'Email',
// //         'Contact',
// //         'Waste Type',
// //         'Quantity (kg)',
// //         'Amount (LKR)',
// //         'Community',
// //         'Pickup Location',
// //         'Preferred Pickup DateTime',
// //         'Collection Preference',
// //         'Status',
// //       ];

// //       // Map requests to CSV rows
// //       const csvRows = requests.map((req: any) => {
// //         // Use stored orderId from request
// //         const amount = req.amount && req.amount > 0 ? req.amount : calculateAmount(req.wasteType, req.quantity);
// //         return [
// //           req.orderId,
// //           req.name,
// //           req.email,
// //           req.contact,
// //           req.wasteType,
// //           req.quantity,
// //           amount.toFixed(2), // Format amount to 2 decimal places
// //           req.community,
// //           req.pickupLocation,
// //           new Date(req.preferredPickupDateTime).toLocaleString(),
// //           req.collectionPreference,
// //           req.status,
// //         ].map((value) => `"${value}"`).join(',');
// //       });

// //       // Combine headers and rows
// //       const csvContent = [headers.join(','), ...csvRows].join('\n');

// //       // Create and download the CSV file
// //       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
// //       const blobUrl = URL.createObjectURL(blob);
// //       const link = document.createElement('a');
// //       link.setAttribute('href', blobUrl);
// //       link.setAttribute('download', `recycling_requests_report_${new Date().toISOString().split('T')[0]}.csv`);
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
// //       URL.revokeObjectURL(blobUrl);

// //       alert('Report generated successfully!');
// //     } catch (error) {
// //       console.error('Error generating report:', error);
// //       alert('Failed to generate report. Please try again.');
// //     }
// //   };

// //   return (
// //     <div className="admin-recycling-requests-container">
// //       <h2>Recycling Requests</h2>
// //       <div className="report-button-container">
// //         <button className="generate-report-btn" onClick={generateReport}>
// //           Generate Report
// //         </button>
// //       </div>
// //       <AdminRequestList ref={requestListRef} />
// //     </div>
// //   );
// // };

// // export default AdminRecyclingRequests;

// import React, { useRef } from 'react';
// import AdminRequestList from './AdminRequestList';
// import '../../styles/AdminRecyclingRequests.css';

// const AdminRecyclingRequests: React.FC = () => {
//   // Create a ref to access AdminRequestList's filteredRequests
//   const requestListRef = useRef<{ getFilteredRequests: () => any[] }>(null);

//   // Function to calculate amount based on waste type and quantity (fallback if server amount is 0 or missing)
//   const calculateAmount = (wasteType: string, quantity: number): number => {
//     const rates: { [key: string]: number } = {
//       Plastic: 100, // LKR per kg
//       Paper: 50,
//       Glass: 30,
//       Metal: 80,
//       // Add other waste types as needed
//     };
//     const rate = rates[wasteType] || 50; // Default rate if wasteType is unknown
//     return quantity * rate;
//   };

//   // Function to generate and download CSV report
//   const generateReport = async () => {
//     try {
//       // Get filtered requests from AdminRequestList
//       const requests = requestListRef.current?.getFilteredRequests() || [];
//       console.log('Fetched requests for report:', requests);

//       if (requests.length === 0) {
//         alert('No requests available to generate a report.');
//         return;
//       }

//       // Define CSV headers based on Recycling Order Details page
//       const headers = [
//         'Order ID',
//         'Name',
//         'Email',
//         'Contact',
//         'Waste Type',
//         'Quantity (kg)',
//         'Amount (LKR)',
//         'Community',
//         'Pickup Location',
//         'Preferred Pickup DateTime',
//         'Collection Preference',
//         'Status',
//       ];

//       // Map requests to CSV rows
//       const csvRows = requests.map((req: any) => {
//         // Use stored orderId from request
//         const amount = req.amount && req.amount > 0 ? req.amount : calculateAmount(req.wasteType, req.quantity);
//         return [
//           req.orderId,
//           req.name,
//           req.email,
//           req.contact,
//           req.wasteType,
//           req.quantity,
//           amount.toFixed(2), // Format amount to 2 decimal places
//           req.community,
//           req.pickupLocation,
//           new Date(req.preferredPickupDateTime).toLocaleString(),
//           req.collectionPreference,
//           req.status,
//         ].map((value) => `"${value}"`).join(',');
//       });

//       // Combine headers and rows
//       const csvContent = [headers.join(','), ...csvRows].join('\n');

//       // Create and download the CSV file
//       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//       const blobUrl = URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.setAttribute('href', blobUrl);
//       link.setAttribute('download', `recycling_requests_report_${new Date().toISOString().split('T')[0]}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(blobUrl);

//       alert('Report generated successfully!');
//     } catch (error) {
//       console.error('Error generating report:', error);
//       alert('Failed to generate report. Please try again.');
//     }
//   };

//   return (
//     <div className="admin-recycling-requests-container">
//       <h2>Recycling Requests</h2>
//       <div className="report-button-container">
//         <button className="generate-report-btn" onClick={generateReport}>
//           Generate Report
//         </button>
//       </div>
//       <AdminRequestList ref={requestListRef} />
//     </div>
//   );
// };

// export default AdminRecyclingRequests;

import React, { useRef } from 'react';
import AdminRequestList from './AdminRequestList';
import '../../styles/AdminRecyclingRequests.css';

const AdminRecyclingRequests: React.FC = () => {
  // Create a ref to access AdminRequestList's filteredRequests
  const requestListRef = useRef<{ getFilteredRequests: () => any[] }>(null);

  // Function to calculate amount based on waste type and quantity (fallback if server amount is 0 or missing)
  const calculateAmount = (wasteType: string, quantity: number): number => {
    const rates: { [key: string]: number } = {
      Plastic: 100, // LKR per kg
      Paper: 50,
      Glass: 30,
      Metal: 80,
      // Add other waste types as needed
    };
    const rate = rates[wasteType] || 50; // Default rate if wasteType is unknown
    return quantity * rate;
  };

  // Function to generate and download CSV report
  const generateReport = async () => {
    try {
      // Get filtered requests from AdminRequestList
      const requests = requestListRef.current?.getFilteredRequests() || [];
      console.log('Fetched requests for report:', requests);

      if (requests.length === 0) {
        alert('No requests available to generate a report.');
        return;
      }

      // Define CSV headers based on Recycling Order Details page
      const headers = [
        'Order ID',
        'Name',
        'Email',
        'Contact',
        'Waste Type',
        'Quantity (kg)',
        'Amount (LKR)',
        'Community',
        'Pickup Location',
        'Preferred Pickup DateTime',
        'Collection Preference',
        'Status',
      ];

      // Map requests to CSV rows
      const csvRows = requests.map((req: any) => {
        // Use stored orderId from request
        const amount = req.amount && req.amount > 0 ? req.amount : calculateAmount(req.wasteType, req.quantity);
        return [
          req.orderId,
          req.name,
          req.email,
          req.contact,
          req.wasteType,
          req.quantity,
          amount.toFixed(2), // Format amount to 2 decimal places
          req.community,
          req.pickupLocation,
          new Date(req.preferredPickupDateTime).toLocaleString(),
          req.collectionPreference,
          req.status,
        ].map((value) => `"${value}"`).join(',');
      });

      // Combine headers and rows
      const csvContent = [headers.join(','), ...csvRows].join('\n');

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', blobUrl);
      link.setAttribute('download', `recycling_requests_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  return (
    <div className="admin-recycling-requests-container">
      <h2>Recycling Requests</h2>
      <div className="report-button-container">
        <button className="generate-report-btn" onClick={generateReport}>
          Generate Report
        </button>
      </div>
      <AdminRequestList ref={requestListRef} />
    </div>
  );
};

export default AdminRecyclingRequests;