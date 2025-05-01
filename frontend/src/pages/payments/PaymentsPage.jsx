import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import paymentApi from '../../services/paymentApi';
import LinearProgress from '@mui/material/LinearProgress'; // Import LinearProgress
import Box from '@mui/material/Box'; // Import Box for layout
import Typography from '@mui/material/Typography'; // Import Typography for text
import './PaymentsPage.css'; // We'll create this CSS file next

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Items per page
  const [totalPages, setTotalPages] = useState(1);
  // Add customerName and paymentMethod to filters state
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '', customerName: '', paymentMethod: '' });
  const [exporting, setExporting] = useState(false); // State for PDF export loading
  const [exportProgress, setExportProgress] = useState(0); // State for export progress

  const fetchPayments = async (currentPage = 1, currentFilters = filters) => {
    setLoading(true);
    console.log('PaymentsPage: Starting fetchPayments', { currentPage, currentFilters }); // Added log
    setError('');
    try {
      // Ensure only non-empty filters are sent
      const activeFilters = Object.entries(currentFilters).reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await paymentApi.getPayments({
        page: currentPage,
        limit,
        ...activeFilters // Spread the active filters
      });
      console.log('PaymentsPage: API response received', response); // Added log
      setPayments(response.docs || []);
      setPage(response.page || 1);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('PaymentsPage: Error fetching payments:', err); // Added log
      setError('Failed to load payments. Please try again.');
    } finally {
      console.log('PaymentsPage: fetchPayments finished'); // Added log
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page, filters);
  }, [page, filters, limit]); // Refetch when page, filters, or limit change

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    fetchPayments(1, filters);
  };

  const clearFilters = () => {
    // Reset all filters including the new ones
    setFilters({ status: '', startDate: '', endDate: '', customerName: '', paymentMethod: '' });
    setPage(1);
    fetchPayments(1, { status: '', startDate: '', endDate: '', customerName: '', paymentMethod: '' });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const formatCurrency = (amount) => {
    // Ensure amount is a number before formatting
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
  };

  // Function to handle PDF export with progress simulation
  const handleExportPDF = async () => { // Make async if data fetching is needed inside
    setExporting(true);
    setExportProgress(0); // Reset progress

    try {
        // Simulate initial setup (10%)
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        setExportProgress(10);

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Payments Report', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);

        // Simulate adding filters info (20%)
        await new Promise(resolve => setTimeout(resolve, 100));
        setExportProgress(20);

        const filterInfo = Object.entries(filters)
          .filter(([, value]) => value)
          .map(([key, value]) => {
            let label = key.replace(/([A-Z])/g, ' $1');
            label = label.charAt(0).toUpperCase() + label.slice(1);
            return `${label}: ${value}`;
          })
          .join(', ');

        doc.text(`Filters Applied: ${filterInfo || 'None'}`, 14, 30);

        // Simulate preparing data (40%) - In a real scenario, you might fetch all data here
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportProgress(40);

        const tableColumn = ["Date", "Customer", "Description", "Amount", "Status", "Method"];
        const tableRows = [];

        // Note: This uses only the currently loaded 'payments'. For a full report,
        // you might need to fetch ALL payments matching the filters here.
        payments.forEach(payment => {
          const paymentData = [
            formatDate(payment.paymentDate),
            payment.user?.name || 'N/A',
            payment.description || 'N/A',
            formatCurrency(payment.amount),
            payment.status || 'N/A',
            payment.paymentMethod?.replace('_', ' ') || 'N/A'
          ];
          tableRows.push(paymentData);
        });

        // Simulate adding table (80%)
        await new Promise(resolve => setTimeout(resolve, 300));
        setExportProgress(80);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 35,
          theme: 'striped',
          headStyles: { fillColor: [34, 139, 34] },
        });

        // Simulate saving (95%)
        await new Promise(resolve => setTimeout(resolve, 100));
        setExportProgress(95);

        doc.save(`payments-report-${new Date().toISOString().split('T')[0]}.pdf`);

        // Finalize (100%)
        setExportProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500)); // Keep progress bar at 100% briefly

    } catch (error) {
        console.error("Error exporting PDF:", error);
        setError("Failed to export PDF. Please try again.");
        // Optionally reset progress on error
        setExportProgress(0);
    } finally {
        setExporting(false);
        // Optionally reset progress after a longer delay
        // setTimeout(() => setExportProgress(0), 2000);
    }
  };


  return (
    <div className="payments-page dashboard-content">
      <h2>Payments Management</h2>

      {/* Filter Section */}
      <div className="filters-section card">
        <h3>Filter Payments</h3>
        <div className="filter-controls">
          {/* Status Filter */}
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange} disabled={loading}>
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="requires_action">Requires Action</option>
            </select>
          </div>
          {/* Payment Method Filter */}
          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select id="paymentMethod" name="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange} disabled={loading}>
              <option value="">All</option>
              <option value="card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              {/* Add other methods if applicable */}
            </select>
          </div>
          {/* Customer Name Filter */}
          <div className="form-group">
            <label htmlFor="customerName">Customer Name</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              placeholder="Enter customer name..."
              value={filters.customerName}
              onChange={handleFilterChange}
              disabled={loading}
            />
          </div>
          {/* Start Date Filter */}
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} disabled={loading} />
          </div>
          {/* End Date Filter */}
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} disabled={loading} />
          </div>
          {/* Filter Actions */}
          <div className="filter-actions">
            <button className="btn primary" onClick={applyFilters} disabled={loading || exporting}>Apply Filters</button>
            <button className="btn secondary" onClick={clearFilters} disabled={loading || exporting}>Clear Filters</button>
            {/* Export Button */}
            <button
              className="btn success"
              onClick={handleExportPDF}
              disabled={loading || exporting || payments.length === 0}
            >
              {exporting ? 'Exporting...' : 'Export to PDF'}
            </button>
          </div>
          {/* Progress Bar Display */}
          {exporting && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Exporting PDF... {`${Math.round(exportProgress)}%`}
              </Typography>
              <LinearProgress variant="determinate" value={exportProgress} />
            </Box>
          )}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-indicator">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="card no-data">
          <p>No payments found matching the criteria.</p>
        </div>
      ) : (
        <div className="payments-table-container card">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment._id}>
                  <td>{formatDate(payment.paymentDate)}</td>
                  <td>{payment.user?.name || 'N/A'}</td>
                  <td>{payment.description}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>
                    <span className={`payment-status ${payment.status?.toLowerCase()}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>{payment.paymentMethod?.replace('_', ' ') || 'N/A'}</td>
                  <td>
                    {/* Add actions like view details, update status etc. */}
                    <button className="btn small secondary">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page <= 1 || loading}
                className="btn secondary"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page >= totalPages || loading}
                className="btn secondary"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
