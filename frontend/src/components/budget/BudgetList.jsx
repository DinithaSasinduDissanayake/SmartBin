// frontend/src/components/budget/BudgetList.jsx
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Box,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, parseISO } from 'date-fns';

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Helper function to format date strings
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Invalid Date';
    }
};

const BudgetList = ({ budgets, onEdit, onDelete }) => {
    if (!budgets || budgets.length === 0) {
        return <Typography>No budgets found.</Typography>;
    }

    return (
        <TableContainer component={Paper} elevation={2}>
            <Table sx={{ minWidth: 650 }} aria-label="budget list table">
                <TableHead sx={{ backgroundColor: 'primary.main' }}>
                    <TableRow>
                        <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Period Type</TableCell>
                        <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Start Date</TableCell>
                        <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>End Date</TableCell>
                        <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold' }}>Allocated Amount</TableCell>
                        <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Notes</TableCell>
                        <TableCell align="center" sx={{ color: 'common.white', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {budgets.map((budget) => (
                        <TableRow 
                            key={budget._id} 
                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                            <TableCell component="th" scope="row">
                                {budget.category ? budget.category.charAt(0).toUpperCase() + budget.category.slice(1) : 'N/A'}
                            </TableCell>
                            <TableCell>{budget.periodType || 'N/A'}</TableCell>
                            <TableCell>{formatDate(budget.periodStartDate)}</TableCell>
                            <TableCell>{formatDate(budget.periodEndDate)}</TableCell>
                            <TableCell align="right">{formatCurrency(budget.allocatedAmount)}</TableCell>
                            <TableCell>
                                <Tooltip title={budget.notes || 'No notes'} arrow>
                                    <Typography noWrap sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} component="span">
                                        {budget.notes || '-'}
                                    </Typography>
                                </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Tooltip title="Edit Budget">
                                        <IconButton 
                                            size="small" 
                                            color="primary" 
                                            onClick={() => onEdit(budget)} 
                                            aria-label={`edit budget for ${budget.category}`}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Budget">
                                        <IconButton 
                                            size="small" 
                                            color="error" 
                                            onClick={() => onDelete(budget._id)} 
                                            aria-label={`delete budget for ${budget.category}`}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default BudgetList;
