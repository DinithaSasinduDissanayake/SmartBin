import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    CircularProgress, 
    Alert, 
    Box, 
    Card, 
    CardContent, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Button, 
    TextField, 
    Stack // Import Stack for custom legends
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    PieChart, 
    Pie, 
    Cell, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip 
} from 'recharts';
import statisticsApi from '../../services/statisticsApi';
import { format, parseISO } from 'date-fns';
import './StatisticsPage.css'; // Import custom CSS

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

// Custom Legend Component
const CustomLegend = ({ data, colors }) => (
    <Stack direction="row" spacing={2} justifyContent="center" mt={2} flexWrap="wrap">
        {data.map((entry, index) => (
            <Stack direction="row" spacing={1} key={`legend-${index}`} alignItems="center">
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors[index % colors.length] }} />
                <Typography variant="caption">{entry.name}</Typography>
            </Stack>
        ))}
    </Stack>
);

// Custom Legend for Line Chart
const CustomLineLegend = ({ name, color }) => (
    <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
        <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, backgroundColor: color }} /> 
            <Typography variant="caption">{name}</Typography>
        </Stack>
    </Stack>
);

const StatisticsPage = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRange, setSelectedRange] = useState('this_month');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const fetchStatistics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (selectedRange === 'custom' && startDate && endDate) {
                params.startDate = format(startDate, 'yyyy-MM-dd');
                params.endDate = format(endDate, 'yyyy-MM-dd');
            } else if (selectedRange !== 'custom') {
                params.range = selectedRange;
            }
            
            const data = await statisticsApi.getStatistics(params);
            setStatsData(data);
        } catch (err) {
            setError(err.message || 'Failed to load statistics.');
            setStatsData(null); // Clear data on error
        } finally {
            setLoading(false);
        }
    }, [selectedRange, startDate, endDate]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    const handleRangeChange = (event) => {
        setSelectedRange(event.target.value);
        // Reset custom dates if a predefined range is selected
        if (event.target.value !== 'custom') {
            setStartDate(null);
            setEndDate(null);
        }
    };

    const handleApplyCustomRange = () => {
        if (startDate && endDate && startDate <= endDate) {
            fetchStatistics();
        }
    };

    // --- Helper Functions for Chart Data Formatting ---
    const formatUsersByRoleData = (data) => {
        return data?.map(item => ({ 
            name: item.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format role name
            value: item.count 
        })) || [];
    };

    const formatNewUserTrendData = (data) => {
        return data?.map(item => ({ date: item.date, count: item.count })) || [];
    };

    const formatPlanPopularityData = (data) => {
        return data?.map(item => ({ name: item.planName, value: item.count })) || [];
    };

    const formatPaymentStatusData = (data) => {
        return data?.map(item => ({ name: item.status, value: item.count })) || [];
    };

    const formatComplaintOverviewData = (data) => {
        return data?.map(item => ({ name: item.status, value: item.count })) || [];
    };

    // --- Prepare data for charts ---
    const usersByRoleData = formatUsersByRoleData(statsData?.usersByRole);
    const newUserTrendData = formatNewUserTrendData(statsData?.newUserTrend);
    const planPopularityData = formatPlanPopularityData(statsData?.planPopularity);
    const paymentStatusData = formatPaymentStatusData(statsData?.paymentStatus);
    const complaintOverviewData = formatComplaintOverviewData(statsData?.complaintOverview);

    // --- Render Logic ---
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom component="div">
                    System Statistics
                </Typography>

                {/* Filter Bar */}
                <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel id="range-select-label">Date Range</InputLabel>
                        <Select
                            labelId="range-select-label"
                            value={selectedRange}
                            label="Date Range"
                            onChange={handleRangeChange}
                        >
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="this_month">This Month</MenuItem>
                            <MenuItem value="last_3_months">Last 3 Months</MenuItem>
                            <MenuItem value="this_year">This Year</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                        </Select>
                    </FormControl>

                    {selectedRange === 'custom' && (
                        <>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                renderInput={(params) => <TextField {...params} sx={{ width: 180 }} />}
                                maxDate={endDate || new Date()} // Prevent start date after end date
                            />
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                renderInput={(params) => <TextField {...params} sx={{ width: 180 }} />}
                                minDate={startDate} // Prevent end date before start date
                                maxDate={new Date()} // Prevent future dates
                            />
                            <Button 
                                variant="contained" 
                                onClick={handleApplyCustomRange} 
                                disabled={!startDate || !endDate || startDate > endDate}
                            >
                                Apply
                            </Button>
                        </>
                    )}
                    {statsData?.dateRange && (
                        <Typography variant="caption" sx={{ ml: 'auto' }}>
                            Displaying data from {format(parseISO(statsData.dateRange.startDate), 'PP')} to {format(parseISO(statsData.dateRange.endDate), 'PP')}
                        </Typography>
                    )}
                </Paper>

                {/* Key Metric Cards */} 
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Total Revenue</Typography>
                                <Typography variant="h5">${statsData?.totalRevenue?.toFixed(2) ?? '0.00'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Total Expenses</Typography>
                                <Typography variant="h5">${statsData?.totalExpenses?.toFixed(2) ?? '0.00'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Net Profit/Loss</Typography>
                                <Typography variant="h5" color={statsData?.netProfit >= 0 ? 'success.main' : 'error.main'}>
                                    ${statsData?.netProfit?.toFixed(2) ?? '0.00'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Active Subscriptions</Typography>
                                <Typography variant="h5">{statsData?.activeSubscriptionsCount ?? 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Chart Sections */} 
                <Grid container spacing={3}>
                    {/* User Statistics */} 
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom align="center">Users by Role</Typography>
                            {usersByRoleData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={200}> {/* Adjust height */} 
                                        <PieChart>
                                            <Pie
                                                data={usersByRoleData}
                                                cx="50%"
                                                cy="100%" // Position center at bottom
                                                startAngle={180}
                                                endAngle={0}
                                                innerRadius={60} // Make it a donut
                                                outerRadius={100} // Adjust radius
                                                fill="#8884d8"
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {usersByRoleData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <CustomLegend data={usersByRoleData} colors={COLORS} />
                                </> 
                            ) : (
                                <Typography align="center" color="textSecondary">No data available</Typography>
                            )}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} lg={8}>
                        <Paper sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom align="center">New User Registrations</Typography>
                            {newUserTrendData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={250}> {/* Adjust height */} 
                                        <LineChart data={newUserTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis allowDecimals={false} domain={[0, 'auto']} /> {/* Ensure Y axis starts at 0 */} 
                                            <Tooltip />
                                            <Line type="monotone" dataKey="count" stroke={COLORS[0]} activeDot={{ r: 8 }} name="New Users" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <CustomLineLegend name="New Users" color={COLORS[0]} />
                                </>
                            ) : (
                                <Typography align="center" color="textSecondary">No data available</Typography>
                            )}
                        </Paper>
                    </Grid>

                    {/* Financial & Subscription Statistics */} 
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom align="center">Subscription Plan Popularity</Typography>
                            {planPopularityData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={250}> {/* Adjust height */} 
                                        <PieChart>
                                            <Pie
                                                data={planPopularityData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100} // Adjust radius
                                                fill="#82ca9d"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {planPopularityData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <CustomLegend data={planPopularityData} colors={COLORS} />
                                </>
                            ) : (
                                <Typography align="center" color="textSecondary">No data available</Typography>
                            )}
                        </Paper>
                    </Grid>
                     <Grid item xs={12} md={6} lg={4}>
                        <Paper sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom align="center">Payment Status</Typography>
                            {paymentStatusData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={250}> {/* Adjust height */} 
                                        <PieChart>
                                            <Pie
                                                data={paymentStatusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100} // Adjust radius
                                                fill="#ffc658"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {paymentStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <CustomLegend data={paymentStatusData} colors={COLORS} />
                                </>
                            ) : (
                                <Typography align="center" color="textSecondary">No data available</Typography>
                            )}
                        </Paper>
                    </Grid>

                    {/* Operational Statistics */} 
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom align="center">Complaint Status</Typography>
                            {complaintOverviewData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={200}> {/* Adjust height */} 
                                        <PieChart>
                                            <Pie
                                                data={complaintOverviewData}
                                                cx="50%"
                                                cy="100%" // Position center at bottom
                                                startAngle={180}
                                                endAngle={0}
                                                innerRadius={60} // Make it a donut
                                                outerRadius={100} // Adjust radius
                                                fill="#ff8042"
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {complaintOverviewData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <CustomLegend data={complaintOverviewData} colors={COLORS} />
                                </>
                            ) : (
                                <Typography align="center" color="textSecondary">No data available</Typography>
                            )}
                        </Paper>
                    </Grid>

                </Grid>
            </Container>
        </LocalizationProvider>
    );
};

export default StatisticsPage;
