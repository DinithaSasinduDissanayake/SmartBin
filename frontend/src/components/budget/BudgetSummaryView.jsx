// frontend/src/components/budget/BudgetSummaryView.jsx
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    LinearProgress
} from '@mui/material';

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Helper to determine color based on percentage used
const getPercentageColor = (percentage) => {
    if (percentage < 70) return 'success.main';
    if (percentage < 90) return 'warning.main';
    return 'error.main';
};

const BudgetSummaryView = ({ summaryData }) => {
    if (!summaryData || summaryData.length === 0) {
        return <Typography>No budget summary data available for the selected period.</Typography>;
    }

    return (
        <TableContainer component={Paper} elevation={1}>
            <Table sx={{ minWidth: 650 }} aria-label="budget summary table">
                <TableHead sx={{ backgroundColor: 'primary.light' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Allocated</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actual</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Remaining</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Usage</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {summaryData.map((item) => (
                        <TableRow key={item.category} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                                {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'N/A'}
                            </TableCell>
                            <TableCell align="right">{formatCurrency(item.allocated)}</TableCell>
                            <TableCell align="right">{formatCurrency(item.actual)}</TableCell>
                            <TableCell align="right">{formatCurrency(item.difference)}</TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={Math.min(item.percentageUsed, 100)} 
                                            sx={{ 
                                                height: 8, 
                                                borderRadius: 5,
                                                bgcolor: 'grey.200',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: getPercentageColor(item.percentageUsed)
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ minWidth: 35 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.percentageUsed === Infinity ? 
                                                'Over budget' : 
                                                `${Math.round(item.percentageUsed)}%`}
                                        </Typography>
                                    </Box>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default BudgetSummaryView;