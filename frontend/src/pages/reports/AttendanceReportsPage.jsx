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
import { LinearProgress } from '@mui/material'; // Assuming Material UI is used, adjust if needed
import attendanceApi from '../../services/attendanceApi';
import './FinancialReportsPage.css'; // Reuse same styling

const AttendanceReportsPage = () => {
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [year, setYear] = useState(new Date().getFullYear()); // Current year
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
    if (reportType === 'monthly') {
      if (!month || !year) {
        setError('Please select both month and year.');
        return;
      }
    } else {
      // For detailed reports
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
        case 'monthly':
          response = await attendanceApi.getAttendanceSummary(month, year);
          setReportData(response.data);
          break;
        case 'detailed':
          response = await attendanceApi.getDetailedAttendanceReport(startDate, endDate, staffId || undefined);
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
    if (reportType === 'monthly' && (!month || !year)) {
      setError('Please select both month and year to export report.');
      return;
    }
    
    setExportLoading(true);
    setError('');
    
    try {
      let response;
      
      if (reportType === 'monthly') {
        response = await attendanceApi.exportAttendanceReport(month, year);
      } else {
        // For detailed report, we need to generate the summary first
        if (!reportData) {
          await handleGenerateReport();
        }
        response = await attendanceApi.exportAttendanceReport(month, year);
      }
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
                         

      a.href = url;
      a.download = `attendance-report-${monthNames[month-1]}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Report export error:', err);
      setError(err.response?.data?.message || 'Failed to export attendance report.');
    } finally {
      setExportLoading(false);
    }
  };

  const renderMonthlySummary = (data) => {
    if (!data || data.length === 0) return <p>No attendance data available for the selected month.</p>;
    
    // Process data for charts
    // Calculate department-wide statistics
    let totalHours = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalLeave = 0;
    
    data.forEach(staff => {
      totalHours += staff.summary?.totalHours || 0;
      totalPresent += staff.summary?.presentDays || 0;
      totalAbsent += staff.summary?.absentDays || 0;
      totalLate += staff.summary?.lateDays || 0;
      totalLeave += staff.summary?.leaveDays || 0;
    });
    
    // Prepare status distribution data for pie chart
    const statusData = [
      { name: 'Present', value: totalPresent },
      { name: 'Absent', value: totalAbsent },
      { name: 'Late', value: totalLate },
      { name: 'On Leave', value: totalLeave }
    ].filter(item => item.value > 0);
    
    // Prepare staff hours data for bar chart
    const staffHoursData = data.map(staff => ({
      name: staff.staff?.name || 'Unknown',
      hours: staff.summary?.totalHours || 0
    })).sort((a, b) => b.hours - a.hours); // Sort by hours (descending)
    
    const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3'];
    
    return (
      <div className="report-content">
        <div className="report-summary">
          <h4>Department Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Total Hours:</span>
              <span className="value">{totalHours.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Present Days:</span>
              <span className="value">{totalPresent}</span>
            </div>
            <div className="summary-item">
              <span className="label">Absent Days:</span>
              <span className="value">{totalAbsent}</span>
            </div>
            <div className="summary-item">
              <span className="label">Late Days:</span>
              <span className="value">{totalLate}</span>
            </div>
            <div className="summary-item">
              <span className="label">Leave Days:</span>
              <span className="value">{totalLeave}</span>
            </div>
          </div>
        </div>
        
        <div className="report-charts-grid">
          <div className="chart-container">
            <h4>Attendance Status Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} days`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h4>Staff Hours Worked</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffHoursData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)} hours`} />
                <Bar dataKey="hours" name="Hours" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="report-table">
          <h4>Staff Attendance Details</h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Total Hours</th>
                <th>Present Days</th>
                <th>Absent Days</th>
                <th>Late Days</th>
                <th>Leave Days</th>
              </tr>
            </thead>
            <tbody>
              {data.map((staff, index) => (
                <tr key={index}>
                  <td>{staff.staff?.name || 'Unknown'}</td>
                  <td>{(staff.summary?.totalHours || 0).toFixed(2)}</td>
                  <td>{staff.summary?.presentDays || 0}</td>
                  <td>{staff.summary?.absentDays || 0}</td>
                  <td>{staff.summary?.lateDays || 0}</td>
                  <td>{staff.summary?.leaveDays || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderDetailedReport = (data) => {
    if (!data || !data.staffReports || data.staffReports.length === 0) 
      return <p>No attendance data available for the selected period.</p>;
    
    // Process working days information
    const workingDays = data.periodInfo?.workingDays || 0;
    
    return (
      <div className="report-content">
        <div className="report-summary">
          <h4>Attendance Period Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Start Date:</span>
              <span className="value">{new Date(data.periodInfo.startDate).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">End Date:</span>
              <span className="value">{new Date(data.periodInfo.endDate).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Working Days:</span>
              <span className="value">{workingDays}</span>
            </div>
            <div className="summary-item">
              <span className="label">Staff Members:</span>
              <span className="value">{data.staffReports.length}</span>
            </div>
          </div>
        </div>
        
        {data.staffReports.map((staffReport, index) => (
          <div key={index} className="staff-report-section">
            <h4>{staffReport.staffInfo.name}</h4>
            <div className="summary-grid mini">
              <div className="summary-item">
                <span className="label">Total Hours:</span>
                <span className="value">{staffReport.summary.totalHours.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Attendance Rate:</span>
                <span className="value">{staffReport.summary.attendanceRate}%</span>
              </div>
              <div className="summary-item">
                <span className="label">Present:</span>
                <span className="value">{staffReport.summary.presentDays}</span>
              </div>
              <div className="summary-item">
                <span className="label">Absent:</span>
                <span className="value">{staffReport.summary.absentDays}</span>
              </div>
              <div className="summary-item">
                <span className="label">Late:</span>
                <span className="value">{staffReport.summary.lateDays}</span>
              </div>
            </div>
            
            {staffReport.records.length > 0 && (
              <table className="data-table mini">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {staffReport.records.map((record, idx) => (
                    <tr key={idx}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td className={record.status.toLowerCase().replace(' ', '-')}>{record.status}</td>
                      <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                      <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                      <td>{record.totalHours ? record.totalHours.toFixed(2) : '-'}</td>
                      <td>{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const renderReportData = () => {
    if (!reportData) return null;
    
    switch (reportType) {
      case 'monthly':
        return renderMonthlySummary(reportData);
      case 'detailed':
        return renderDetailedReport(reportData);
      default:
        return <pre>{JSON.stringify(reportData, null, 2)}</pre>;
    }
  };
  
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  
  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i < 5; i++) {
    yearOptions.push({ value: currentYear - i, label: (currentYear - i).toString() });
  }

  return (
    <div className="attendance-reports-page dashboard-content">
      <h2>Attendance Reports</h2>

      <div className="report-controls">
        <div className="form-group">
          <label htmlFor="reportType">Report Type:</label>
          <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="monthly">Monthly Summary</option>
            <option value="detailed">Detailed Attendance</option>
          </select>
        </div>
        
        {reportType === 'monthly' ? (
          <>
            <div className="form-group">
              <label htmlFor="month">Month:</label>
              <select id="month" value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="year">Year:</label>
              <select id="year" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
                {yearOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
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
          </>
        )}
        
        <button 
          className="btn primary" 
          onClick={handleGenerateReport} 
          disabled={loading || (reportType === 'monthly' ? (!month || !year) : (!startDate || !endDate))}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        
        <div className="export-section"> {/* Wrap button and progress bar */}
          <button 
            className="btn secondary" 
            onClick={handleExportReport} 
            disabled={exportLoading || (reportType === 'monthly' ? (!month || !year) : (!startDate || !endDate))}
          >
            {exportLoading ? 'Exporting...' : 'Export PDF Report'}
          </button>
          {exportLoading && <LinearProgress style={{ marginTop: '8px' }} />} {/* Add progress bar */}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="report-output">
        <h3>{reportType === 'monthly' ? 'Monthly Attendance Summary' : 'Detailed Attendance Report'}</h3>
        {loading && <p className="loading-message">Loading report data...</p>}
        {!loading && reportData && renderReportData()}
        {!loading && !reportData && !error && <p>Select parameters and generate a report.</p>}
      </div>
    </div>
  );
};

export default AttendanceReportsPage;