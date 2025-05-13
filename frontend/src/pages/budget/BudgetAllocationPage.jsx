// frontend/src/pages/budget/BudgetAllocationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, 
    Typography, 
    Grid, 
    Paper, 
    CircularProgress, 
    Alert, 
    Box, 
    Button, 
    Collapse 
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, startOfMonth, endOfMonth } from 'date-fns';

import BudgetForm from '../../components/budget/BudgetForm';
import BudgetList from '../../components/budget/BudgetList';
import BudgetSummaryView from '../../components/budget/BudgetSummaryView';
import * as budgetApi from '../../services/budgetApi';

const BudgetAllocationPage = () => {
    // State for budgets data
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for summary data
    const [summaryData, setSummaryData] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [errorSummary, setErrorSummary] = useState(null);
    
    // UI states
    const [editingBudget, setEditingBudget] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // State for summary date range
    const [summaryStartDate, setSummaryStartDate] = useState(startOfMonth(new Date()));
    const [summaryEndDate, setSummaryEndDate] = useState(endOfMonth(new Date()));

    // Fetch budgets from API
    const fetchBudgets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await budgetApi.getBudgets();
            setBudgets(Array.isArray(response.docs) ? response.docs : (Array.isArray(response) ? response : []));
        } catch (err) {
            console.error('Error fetching budgets:', err);
            setError(err.message || 'Failed to fetch budgets');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch summary data
    const fetchSummaryData = useCallback(async () => {
        if (!summaryStartDate || !summaryEndDate) return;
        try {
            setLoadingSummary(true);
            setErrorSummary(null);
            const formattedStart = format(summaryStartDate, 'yyyy-MM-dd');
            const formattedEnd = format(summaryEndDate, 'yyyy-MM-dd');
            const response = await budgetApi.getBudgetSummary(formattedStart, formattedEnd);
            setSummaryData(response.summary || []);
        } catch (err) {
            console.error('Error fetching budget summary:', err);
            setErrorSummary(err.message || 'Failed to fetch budget summary');
        } finally {
            setLoadingSummary(false);
        }
    }, [summaryStartDate, summaryEndDate]);

    // Initial data fetch
    useEffect(() => {
        fetchBudgets();
        fetchSummaryData();
    }, [fetchBudgets, fetchSummaryData]);

    // Form submission handler
    const handleFormSubmit = async (budgetData) => {
        try {
            setFeedback({ type: '', message: '' });
            if (editingBudget) {
                await budgetApi.updateBudget(editingBudget._id, budgetData);
                setFeedback({ type: 'success', message: 'Budget updated successfully!' });
            } else {
                await budgetApi.createBudget(budgetData);
                setFeedback({ type: 'success', message: 'Budget created successfully!' });
            }
            setEditingBudget(null);
            setShowForm(false);
            fetchBudgets();
            fetchSummaryData();
        } catch (err) {
            console.error('Error submitting budget:', err);
            setFeedback({ 
                type: 'error', 
                message: err.message || 'Failed to save budget. Please check your input and try again.'
            });
        }
    };

    // Edit budget handler
    const handleEdit = (budget) => {
        setEditingBudget(budget);
        setShowForm(true);
        setFeedback({ type: '', message: '' });
    };

    // Delete budget handler
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                setFeedback({ type: '', message: '' });
                await budgetApi.deleteBudget(id);
                setFeedback({ type: 'success', message: 'Budget deleted successfully!' });
                fetchBudgets();
                fetchSummaryData();
            } catch (err) {
                console.error('Error deleting budget:', err);
                setFeedback({ type: 'error', message: err.message || 'Failed to delete budget.' });
            }
        }
    };

    // Cancel edit handler
    const handleCancelEdit = () => {
        setEditingBudget(null);
        setShowForm(false);
        setFeedback({ type: '', message: '' });
    };

    // Toggle form visibility
    const handleToggleForm = () => {
        if (showForm) {
            handleCancelEdit();
        } else {
            setShowForm(true);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom component="div">
                    Budget Allocation Management
                </Typography>

                {feedback.message && (
                    <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback({ type: '', message: '' })}>
                        {feedback.message}
                    </Alert>
                )}

                {/* Budget Creation/Editing Form */} 
                <Box sx={{ mb: 3 }}>
                    <Button variant="contained" onClick={handleToggleForm} sx={{ mb: 1 }}>
                        {showForm ? (editingBudget ? 'Cancel Edit' : 'Cancel New Budget') : 'Add New Budget'}
                    </Button>
                    <Collapse in={showForm}>
                        <Paper sx={{ p: 3, mt: 1 }}>
                            <BudgetForm 
                                onSubmit={handleFormSubmit} 
                                initialData={editingBudget} 
                                onCancel={handleCancelEdit} 
                            />
                        </Paper>
                    </Collapse>
                </Box>

                {/* Budget List */} 
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Existing Budgets</Typography>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error">Error loading budgets: {error}</Alert>
                    ) : budgets.length === 0 ? (
                        <Alert severity="info">No budgets found. Create your first budget above.</Alert>
                    ) : (
                        <BudgetList 
                            budgets={budgets}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </Paper>

                {/* Budget Summary */} 
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Budget Summary</Typography>
                    <Grid container spacing={3} columns={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                      <Grid xs={12} sm={6} md={4}>
                        <DatePicker
                          label="Summary Start Date"
                          value={summaryStartDate}
                          onChange={(newValue) => setSummaryStartDate(newValue)}
                          slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
                        />
                      </Grid>
                      <Grid xs={12} sm={6} md={4}>
                        <DatePicker
                          label="Summary End Date"
                          value={summaryEndDate}
                          onChange={(newValue) => setSummaryEndDate(newValue)}
                          minDate={summaryStartDate}
                          slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
                        />
                      </Grid>
                      <Grid xs={12} sm={12} md={4}>
                        <Button 
                          variant="outlined" 
                          onClick={fetchSummaryData} 
                          disabled={loadingSummary || !summaryStartDate || !summaryEndDate}
                          fullWidth
                        >
                          {loadingSummary ? <CircularProgress size={24} /> : 'Refresh Summary'}
                        </Button>
                      </Grid>
                    </Grid>
                    
                    {loadingSummary ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : errorSummary ? (
                        <Alert severity="error">Error loading summary: {errorSummary}</Alert>
                    ) : (
                        <BudgetSummaryView summaryData={summaryData} />
                    )}
                </Paper>
            </Container>
        </LocalizationProvider>
    );
};

export default BudgetAllocationPage;
