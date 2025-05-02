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
  Grid
} from '@mui/material';
import performanceApi from '../../services/performanceApi';
import './FinancialReportsPage.css';

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
    if (reportType === 'detailed') {
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
        case 'summary':
          response = await performanceApi.getPerformanceSummary(period);
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

      const blob = new Blob([response.data], { type: 'application/pdf' });
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
      return <Typography>No performance data available for the selected period.</Typography>;
    }

    const { overall, byStaff, period } = data;

    const staffRatings = byStaff.map(staff => ({
      name: staff.staffName,
      rating: staff.averageRating,
      reviews: staff.reviewCount
    })).sort((a, b) => b.rating - a.rating);

    const ratingDistribution = [
      { name: "5★", value: 0 },
      { name: "4★", value: 0 },
      { name: "3★", value: 0 },
      { name: "2★", value: 0 },
      { name: "1★", value: 0 }
    ];

    byStaff.forEach(staff => {
      const ratingFloor = Math.floor(staff.averageRating);
      if (ratingFloor >= 1 && ratingFloor <= 5) {
        ratingDistribution[5 - ratingFloor].value += 1;
      }
    });

    const COLORS = ['#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#f44336'];

    return (
      <Box>
        <Box>
          <Typography variant="h6">Performance Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Period:</Typography>
              <Typography>
                {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Overall Rating:</Typography>
              <Typography>{overall.averageRating.toFixed(2)}/5.0</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Total Reviews:</Typography>
              <Typography>{overall.totalReviews}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Staff Evaluated:</Typography>
              <Typography>{byStaff.length}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Staff Rating Distribution</Typography>
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
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">Staff Performance Ratings</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffRatings.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip formatter={(value) => `${value.toFixed(2)}/5.0`} />
                <Bar dataKey="rating" name="Rating" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="h6">Staff Performance Details</Typography>
          <table>
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
                  <td>{staff.averageRating.toFixed(2)}/5.0</td>
                  <td>{staff.reviewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    );
  };

  const renderDetailedReport = (data) => {
    if (!data || !data.staffReports || data.staffReports.length === 0) {
      return <Typography>No performance data available for the selected period.</Typography>;
    }

    const { periodInfo, staffReports } = data;

    return (
      <Box>
        <Box>
          <Typography variant="h6">Performance Period Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Start Date:</Typography>
              <Typography>{new Date(periodInfo.startDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>End Date:</Typography>
              <Typography>{new Date(periodInfo.endDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Total Reviews:</Typography>
              <Typography>{periodInfo.totalReviews}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Staff Members:</Typography>
              <Typography>{staffReports.length}</Typography>
            </Grid>
          </Grid>
        </Box>

        {staffReports.map((staffReport, index) => (
          <Box key={index}>
            <Typography variant="h6">{staffReport.staffInfo.name}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography>Average Rating:</Typography>
                <Typography>{staffReport.summary.averageRating.toFixed(2)}/5.0</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography>Total Reviews:</Typography>
                <Typography>{staffReport.summary.totalReviews}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography>Email:</Typography>
                <Typography>{staffReport.staffInfo.email}</Typography>
              </Grid>
            </Grid>

            <Typography variant="h6">Rating Distribution</Typography>
            <Box>
              {Object.entries(staffReport.summary.ratingDistribution)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([rating, count]) => (
                  <Box key={rating}>
                    <Typography>{rating} ★</Typography>
                    <Box>
                      <Box
                        style={{
                          width: `${(count / staffReport.summary.totalReviews) * 100}%`,
                          backgroundColor: rating >= 4 ? '#4caf50' : rating >= 3 ? '#ffeb3b' : '#f44336'
                        }}
                      ></Box>
                    </Box>
                    <Typography>{count}</Typography>
                  </Box>
                ))}
            </Box>

            {staffReport.reviews.length > 0 && (
              <Box>
                <Typography variant="h6">Recent Performance Reviews</Typography>
                <table>
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
                        <td>{review.rating.toFixed(1)}/5.0</td>
                        <td>{review.comments || '-'}</td>
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
      case 'summary':
        return renderPerformanceSummary(reportData);
      case 'detailed':
        return renderDetailedReport(reportData);
      default:
        return <pre>{JSON.stringify(reportData, null, 2)}</pre>;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Performance Reports</Typography>

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
                <MenuItem value="summary">General Summary</MenuItem>
                <MenuItem value="detailed">Detailed Performance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {reportType === 'summary' ? (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="period-label">Period</InputLabel>
                <Select
                  labelId="period-label"
                  id="period"
                  value={period}
                  label="Period"
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="quarter">Last Quarter</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
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
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    max: endDate || undefined
                  }}
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
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: startDate || undefined
                  }}
                />
              </Grid>
            </>
          )}

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

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateReport}
              disabled={loading || (reportType === 'detailed' && (!startDate || !endDate))}
              fullWidth
              sx={{ height: '40px' }}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleExportReport}
                disabled={exportLoading}
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

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {reportType === 'summary' ? 'Performance Summary' : 'Detailed Performance Report'}
        </Typography>
        {loading && <Typography sx={{ my: 2 }}>Loading report data...</Typography>}
        {!loading && reportData && renderReportData()}
        {!loading && !reportData && !error && <Typography sx={{ my: 2 }}>Select parameters and generate a report.</Typography>}
      </Paper>
    </Box>
  );
};

export default PerformanceReportsPage;