// filepath: c:\y2s2ITP\SmartBin\frontend\src\pages\reports\PerformanceReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import performanceApi from '../../services/performanceApi';
import './FinancialReportsPage.css'; // Reuse same styling

const PerformanceReportsPage = () => {
  const [reportType, setReportType] = useState('summary');
  const [period, setPeriod] = useState('year');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState('');

  // Get staff list for filtering
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        // This is a placeholder. In a real app, you would fetch staff list from an API
        // For now, we'll leave it empty as we don't have a specific endpoint
        // setStaffList([...]);
      } catch (err) {
        console.error('Error fetching staff list:', err);
      }
    };

    fetchStaffList();
  }, []);

  const handleGenerateReport = async () => {
    if (reportType === 'detailed') {
      // For detailed reports, validate date range
      if (!startDate || !endDate) {
        setError('Please select both start and end dates.');
        return;
      }
      
      // Validate date range
      if (new Date(startDate) > new Date(endDate)) {
        setError('Start date cannot be after end date.');
        return;
      }
    }
    
    setLoading(true);
    setError('');
    setReportData(null);
    
    try {
      let response;
      
      switch (reportType) {
        case 'summary':
          response = await performanceApi.getPerformanceSummary();
          setReportData(response.data);
          break;
        case 'detailed':
          response = await performanceApi.getDetailedPerformanceReport(startDate, endDate, staffId || undefined);
          setReportData(response.data);
          break;
        default:
          throw new Error('Invalid report type selected');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.response?.data?.message || `Failed to generate ${reportType} report.`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    setExportLoading(true);
    setError('');
    
    try {
      const response = await performanceApi.exportPerformanceReport(period, staffId || undefined);
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const reportPeriod = period || 'custom';
                         
      a.href = url;
      a.download = `performance-report-${reportPeriod}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Report export error:', err);
      setError(err.response?.data?.message || 'Failed to export performance report.');
    } finally {
      setExportLoading(false);
    }
  };

  const renderPerformanceSummary = (data) => {
    if (!data || !data.byStaff || data.byStaff.length === 0) {
      return <p>No performance data available for the selected period.</p>;
    }
    
    const { overall, byStaff, period } = data;
    
    // Prepare data for charts
    const staffRatings = byStaff.map(staff => ({
      name: staff.staffName,
      rating: staff.averageRating,
      reviews: staff.reviewCount
    })).sort((a, b) => b.rating - a.rating);
    
    // Rating distribution data
    const ratingDistribution = [
      { name: "5★", value: 0 },
      { name: "4★", value: 0 },
      { name: "3★", value: 0 },
      { name: "2★", value: 0 },
      { name: "1★", value: 0 }
    ];
    
    // Count staff by rating buckets
    byStaff.forEach(staff => {
      const ratingFloor = Math.floor(staff.averageRating);
      if (ratingFloor >= 1 && ratingFloor <= 5) {
        ratingDistribution[5 - ratingFloor].value += 1;
      }
    });
    
    const COLORS = ['#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#f44336'];
    
    return (
      <div className="report-content">
        <div className="report-summary">
          <h4>Performance Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Period:</span>
              <span className="value">
                {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Overall Rating:</span>
              <span className="value">{overall.averageRating.toFixed(2)}/5.0</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Reviews:</span>
              <span className="value">{overall.totalReviews}</span>
            </div>
            <div className="summary-item">
              <span className="label">Staff Evaluated:</span>
              <span className="value">{byStaff.length}</span>
            </div>
          </div>
        </div>
        
        <div className="report-charts-grid">
          <div className="chart-container">
            <h4>Staff Rating Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingDistribution.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} staff`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h4>Staff Performance Ratings</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffRatings.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip formatter={(value) => `${value.toFixed(2)}/5.0`} />
                <Bar dataKey="rating" name="Rating" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="report-table">
          <h4>Staff Performance Details</h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Email</th>
                <th>Average Rating</th>
                <th>Total Reviews</th>
              </tr>
            </thead>
            <tbody>
              {byStaff.map((staff, index) => (
                <tr key={index}>
                  <td>{staff.staffName}</td>
                  <td>{staff.staffEmail}</td>
                  <td>
                    <span className={`rating rating-${Math.floor(staff.averageRating)}`}>
                      {staff.averageRating.toFixed(2)}/5.0
                    </span>
                  </td>
                  <td>{staff.reviewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderDetailedReport = (data) => {
    if (!data || !data.staffReports || data.staffReports.length === 0) {
      return <p>No performance data available for the selected period.</p>;
    }
    
    const { periodInfo, staffReports } = data;
    
    return (
      <div className="report-content">
        <div className="report-summary">
          <h4>Performance Period Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Start Date:</span>
              <span className="value">{new Date(periodInfo.startDate).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">End Date:</span>
              <span className="value">{new Date(periodInfo.endDate).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Reviews:</span>
              <span className="value">{periodInfo.totalReviews}</span>
            </div>
            <div className="summary-item">
              <span className="label">Staff Members:</span>
              <span className="value">{staffReports.length}</span>
            </div>
          </div>
        </div>
        
        {staffReports.map((staffReport, index) => (
          <div key={index} className="staff-report-section">
            <h4>{staffReport.staffInfo.name}</h4>
            <div className="summary-grid mini">
              <div className="summary-item">
                <span className="label">Average Rating:</span>
                <span className="value">{staffReport.summary.averageRating.toFixed(2)}/5.0</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Reviews:</span>
                <span className="value">{staffReport.summary.totalReviews}</span>
              </div>
              <div className="summary-item">
                <span className="label">Email:</span>
                <span className="value">{staffReport.staffInfo.email}</span>
              </div>
            </div>
            
            <h5>Rating Distribution</h5>
            <div className="rating-bars">
              {Object.entries(staffReport.summary.ratingDistribution)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([rating, count]) => (
                  <div key={rating} className="rating-bar-container">
                    <span className="rating-label">{rating} ★</span>
                    <div className="rating-bar">
                      <div 
                        className="rating-bar-fill" 
                        style={{
                          width: `${(count / staffReport.summary.totalReviews) * 100}%`,
                          backgroundColor: rating >= 4 ? '#4caf50' : rating >= 3 ? '#ffeb3b' : '#f44336'
                        }}
                      ></div>
                    </div>
                    <span className="rating-count">{count}</span>
                  </div>
                ))}
            </div>
            
            {staffReport.reviews.length > 0 && (
              <>
                <h5>Recent Performance Reviews</h5>
                <table className="data-table mini">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reviewer</th>
                      <th>Rating</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffReport.reviews.slice(0, 5).map((review, idx) => (
                      <tr key={idx}>
                        <td>{new Date(review.reviewDate).toLocaleDateString()}</td>
                        <td>{review.reviewer.name}</td>
                        <td className={`rating rating-${Math.floor(review.rating)}`}>
                          {review.rating.toFixed(1)}/5.0
                        </td>
                        <td>{review.comments || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const renderReportData = () => {
    if (!reportData) return null;
    
    switch (reportType) {
      case 'summary':
        return renderPerformanceSummary(reportData);
      case 'detailed':
        return renderDetailedReport(reportData);
      default:
        return <pre>{JSON.stringify(reportData, null, 2)}</pre>;
    }
  };

  return (
    <div className="performance-reports-page dashboard-content">
      <h2>Performance Reports</h2>

      <div className="report-controls">
        <div className="form-group">
          <label htmlFor="reportType">Report Type:</label>
          <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="summary">General Summary</option>
            <option value="detailed">Detailed Performance</option>
          </select>
        </div>
        
        {reportType === 'summary' ? (
          <div className="form-group">
            <label htmlFor="period">Period:</label>
            <select id="period" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="startDate">Start Date:</label>
              <input 
                type="date" 
                id="startDate" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date:</label>
              <input 
                type="date" 
                id="endDate" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                min={startDate || undefined}
              />
            </div>
          </>
        )}
        
        {staffList.length > 0 && (
          <div className="form-group">
            <label htmlFor="staffId">Staff Member:</label>
            <select id="staffId" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
              <option value="">All Staff</option>
              {staffList.map(staff => (
                <option key={staff._id} value={staff._id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <button 
          className="btn primary" 
          onClick={handleGenerateReport} 
          disabled={loading || (reportType === 'detailed' && (!startDate || !endDate))}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        
        <button 
          className="btn secondary" 
          onClick={handleExportReport} 
          disabled={exportLoading}
        >
          {exportLoading ? 'Exporting...' : 'Export PDF Report'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="report-output">
        <h3>{reportType === 'summary' ? 'Performance Summary' : 'Detailed Performance Report'}</h3>
        {loading && <p className="loading-message">Loading report data...</p>}
        {!loading && reportData && renderReportData()}
        {!loading && !reportData && !error && <p>Select parameters and generate a report.</p>}
      </div>
    </div>
  );
};

export default PerformanceReportsPage;