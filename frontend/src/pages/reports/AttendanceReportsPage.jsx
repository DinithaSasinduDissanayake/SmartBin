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
import {
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Alert
} from '@mui/material';
import attendanceApi from '../../services/attendanceApi';

const AttendanceReportsPage = () => {
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [staffId, setStaffId] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        setStaffList([
          { _id: 'staff1', name: 'John Doe' },
          { _id: 'staff2', name: 'Jane Smith' },
        ]);
      } catch (err) {
        console.error('Error fetching staff list:', err);
        setError('Failed to load staff list.');
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
      if (!startDate || !endDate) {
        setError('Please select both start and end dates.');
        return;
      }
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
    if (reportType === 'detailed' && (!startDate || !endDate)) {
      setError('Please select both start and end dates to export report.');
      return;
    }

    setExportLoading(true);
    setError('');

    try {
      let response;

      if (reportType === 'monthly') {
        response = await attendanceApi.exportAttendanceReport(month, year);
      } else {
        if (!reportData) {
          await handleGenerateReport();
        }
        response = await attendanceApi.exportAttendanceReport(month, year);
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      a.href = url;
      a.download = `attendance-report-${monthNames[month - 1]}-${year}.pdf`;
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
    if (!data || data.length === 0) return <Typography>No attendance data available for the selected month.</Typography>;

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

    const statusData = [
      { name: 'Present', value: totalPresent },
      { name: 'Absent', value: totalAbsent },
      { name: 'Late', value: totalLate },
      { name: 'On Leave', value: totalLeave }
    ].filter(item => item.value > 0);

    const staffHoursData = data.map(staff => ({
      name: staff.staff?.name || 'Unknown',
      hours: staff.summary?.totalHours || 0
    })).sort((a, b) => b.hours - a.hours);

    const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3'];

    return (
      <Box>
        <Box>
          <Typography variant="h6">Department Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>Total Hours: {totalHours.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Present Days: {totalPresent}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Absent Days: {totalAbsent}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Late Days: {totalLate}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Leave Days: {totalLeave}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Attendance Status Distribution</Typography>
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
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">Staff Hours Worked</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffHoursData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)} hours`} />
                <Bar dataKey="hours" name="Hours" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderDetailedReport = (data) => {
    if (!data || !data.staffReports || data.staffReports.length === 0)
      return <Typography>No attendance data available for the selected period.</Typography>;

    const workingDays = data.periodInfo?.workingDays || 0;

    return (
      <Box>
        <Box>
          <Typography variant="h6">Attendance Period Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>Start Date: {new Date(data.periodInfo.startDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>End Date: {new Date(data.periodInfo.endDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Working Days: {workingDays}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Staff Members: {data.staffReports.length}</Typography>
            </Grid>
          </Grid>
        </Box>

        {data.staffReports.map((staffReport, index) => (
          <Box key={index}>
            <Typography variant="h6">{staffReport.staffInfo.name}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>Total Hours: {staffReport.summary.totalHours.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Attendance Rate: {staffReport.summary.attendanceRate}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Present: {staffReport.summary.presentDays}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Absent: {staffReport.summary.absentDays}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Late: {staffReport.summary.lateDays}</Typography>
              </Grid>
            </Grid>

            {staffReport.records.length > 0 && (
              <Box>
                <Typography variant="h6">Attendance Records</Typography>
                <table>
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
                        <td>{record.status}</td>
                        <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                        <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                        <td>{record.totalHours ? record.totalHours.toFixed(2) : '-'}</td>
                        <td>{record.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Box>
        ))}
      </Box>
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

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const yearValue = currentYear - i;
    return { value: yearValue, label: yearValue.toString() };
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Attendance Reports</Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="reportType-label">Report Type</InputLabel>
              <Select
                labelId="reportType-label"
                id="reportType"
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="monthly">Monthly Summary</MenuItem>
                <MenuItem value="detailed">Detailed Attendance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {reportType === 'monthly' ? (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="month-label">Month</InputLabel>
                  <Select
                    labelId="month-label"
                    id="month"
                    value={month}
                    label="Month"
                    onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  >
                    {monthOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="year-label">Year</InputLabel>
                  <Select
                    labelId="year-label"
                    id="year"
                    value={year}
                    label="Year"
                    onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  >
                    {yearOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  id="startDate"
                  label="Start Date"
                  type="date"
                  variant="outlined"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: endDate || undefined }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  id="endDate"
                  label="End Date"
                  type="date"
                  variant="outlined"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: startDate || undefined }}
                />
              </Grid>
              {staffList.length > 0 && (
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel id="staffId-label">Staff Member</InputLabel>
                    <Select
                      labelId="staffId-label"
                      id="staffId"
                      value={staffId}
                      label="Staff Member"
                      onChange={(e) => setStaffId(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>All Staff</em>
                      </MenuItem>
                      {staffList.map(staff => (
                        <MenuItem key={staff._id} value={staff._id}>
                          {staff.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </>
          )}

          <Grid item xs={12} sm={6} md={reportType === 'monthly' ? 3 : (staffList.length > 0 ? 3 : 6)}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateReport}
              disabled={loading || (reportType === 'monthly' ? (!month || !year) : (!startDate || !endDate))}
              fullWidth
              sx={{ height: '40px' }}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={reportType === 'monthly' ? 3 : (staffList.length > 0 ? 3 : 6)}>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleExportReport}
                disabled={exportLoading || (reportType === 'monthly' ? (!month || !year) : (!startDate || !endDate))}
                fullWidth
                sx={{ height: '40px' }}
              >
                {exportLoading ? 'Exporting...' : 'Export PDF Report'}
              </Button>
              {exportLoading && (
                <LinearProgress
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: '100%',
                  }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {reportType === 'monthly' ? 'Monthly Attendance Summary' : 'Detailed Attendance Report'}
        </Typography>
        {loading && <Typography sx={{ my: 2 }}>Loading report data...</Typography>}
        {!loading && reportData && renderReportData()}
        {!loading && !reportData && !error && <Typography sx={{ my: 2 }}>Select parameters and generate a report.</Typography>}
      </Paper>
    </Box>
  );
};

export default AttendanceReportsPage;