import React, { useState, useEffect } from 'react';
import attendanceApi from '../../services/attendanceApi';
import './StaffComponents.css';

const AttendanceTracker = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Check if already checked in today
  const checkStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await attendanceApi.getMyAttendance(today, today);
      
      const todayRecord = response.data.find(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate === today;
      });
      
      setCheckedIn(todayRecord && !todayRecord.checkOutTime);
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  // Fetch attendance data
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getMyAttendance(
        dateRange.startDate, 
        dateRange.endDate
      );
      setAttendance(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load attendance data');
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    fetchAttendance();
  }, [dateRange]);

  const handleCheckIn = async () => {
    try {
      await attendanceApi.checkIn();
      setCheckedIn(true);
      await fetchAttendance(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceApi.checkOut();
      setCheckedIn(false);
      await fetchAttendance(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out');
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  // Calculate stats
  const getStats = () => {
    if (!attendance.length) return { total: 0, hours: 0 };
    
    const totalDays = attendance.length;
    const totalHours = attendance.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    
    return {
      total: totalDays,
      hours: totalHours.toFixed(1)
    };
  };

  const stats = getStats();

  return (
    <div className="attendance-tracker">
      <div className="tracker-header">
        <h2>Attendance Tracker</h2>
        <div className="attendance-actions">
          {!checkedIn ? (
            <button 
              className="check-in-btn" 
              onClick={handleCheckIn}
            >
              Check In
            </button>
          ) : (
            <button 
              className="check-out-btn" 
              onClick={handleCheckOut}
            >
              Check Out
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="attendance-stats">
        <div className="stat-box">
          <span className="stat-label">Total Working Days</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Total Hours</span>
          <span className="stat-value">{stats.hours}</span>
        </div>
      </div>
      
      <div className="date-filter">
        <div className="filter-item">
          <label>From:</label>
          <input 
            type="date" 
            name="startDate" 
            value={dateRange.startDate} 
            onChange={handleDateChange}
          />
        </div>
        <div className="filter-item">
          <label>To:</label>
          <input 
            type="date" 
            name="endDate" 
            value={dateRange.endDate} 
            onChange={handleDateChange}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading attendance records...</div>
      ) : attendance.length > 0 ? (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map(record => (
              <tr key={record._id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
                <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}</td>
                <td>{record.totalHours ? record.totalHours.toFixed(1) : '-'}</td>
                <td><span className={`status-badge ${record.status.toLowerCase()}`}>{record.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-records">No attendance records found for the selected period.</div>
      )}
    </div>
  );
};

export default AttendanceTracker;