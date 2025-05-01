// frontend/src/components/budget/BudgetForm.jsx
import React, { useState, useEffect } from 'react';
import { 
    TextField, 
    Button, 
    Grid, 
    MenuItem, 
    Select, 
    InputLabel, 
    FormControl, 
    FormHelperText, 
    Box 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO, format } from 'date-fns';

const budgetCategories = ['fuel', 'maintenance', 'salaries', 'utilities', 'equipment', 'office', 'rent', 'marketing', 'insurance', 'taxes', 'other'];
const periodTypes = ['Monthly', 'Quarterly', 'Yearly'];

const BudgetForm = ({ onSubmit, initialData, onCancel }) => {
    const [formData, setFormData] = useState({
        category: '',
        periodType: '',
        periodStartDate: null,
        periodEndDate: null,
        allocatedAmount: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                category: initialData.category || '',
                periodType: initialData.periodType || '',
                // Ensure dates are Date objects for DatePicker
                periodStartDate: initialData.periodStartDate ? parseISO(initialData.periodStartDate) : null,
                periodEndDate: initialData.periodEndDate ? parseISO(initialData.periodEndDate) : null,
                allocatedAmount: initialData.allocatedAmount !== undefined ? String(initialData.allocatedAmount) : '',
                notes: initialData.notes || ''
            });
            setErrors({}); // Clear errors when loading initial data
        } else {
            // Reset form if initialData is null (e.g., switching from edit to add)
            setFormData({
                category: '',
                periodType: '',
                periodStartDate: null,
                periodEndDate: null,
                allocatedAmount: '',
                notes: ''
            });
            setErrors({});
        }
    }, [initialData]);

    const validate = () => {
        let tempErrors = {};
        if (!formData.category) tempErrors.category = 'Category is required';
        if (!formData.periodType) tempErrors.periodType = 'Period type is required';
        if (!formData.periodStartDate) tempErrors.periodStartDate = 'Start date is required';
        if (!formData.periodEndDate) {
            tempErrors.periodEndDate = 'End date is required';
        } else if (formData.periodStartDate && formData.periodEndDate <= formData.periodStartDate) {
            tempErrors.periodEndDate = 'End date must be after start date';
        }
        if (!formData.allocatedAmount) {
            tempErrors.allocatedAmount = 'Allocated amount is required';
        } else if (isNaN(formData.allocatedAmount) || Number(formData.allocatedAmount) < 0) {
            tempErrors.allocatedAmount = 'Allocated amount must be a non-negative number';
        }
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (name, newValue) => {
        setFormData(prev => ({ ...prev, [name]: newValue }));
         // Clear specific error when user changes date
         if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Also clear end date error if start date changes and might fix the issue
        if (name === 'periodStartDate' && errors.periodEndDate === 'End date must be after start date') {
             setErrors(prev => ({ ...prev, periodEndDate: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Format dates to ISO string before submitting
            const dataToSubmit = {
                ...formData,
                periodStartDate: format(formData.periodStartDate, 'yyyy-MM-dd'),
                periodEndDate: format(formData.periodEndDate, 'yyyy-MM-dd'),
                allocatedAmount: Number(formData.allocatedAmount) // Ensure amount is a number
            };
            onSubmit(dataToSubmit);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={3} columns={{ xs: 12, sm: 12 }}>
                <Grid xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.category}>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            labelId="category-label"
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <MenuItem value=""><em>Select Category</em></MenuItem>
                            {budgetCategories.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>
                            ))}
                        </Select>
                        {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.periodType}>
                        <InputLabel id="periodType-label">Period Type</InputLabel>
                        <Select
                            labelId="periodType-label"
                            label="Period Type"
                            name="periodType"
                            value={formData.periodType}
                            onChange={handleChange}
                        >
                             <MenuItem value=""><em>Select Period Type</em></MenuItem>
                            {periodTypes.map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                        {errors.periodType && <FormHelperText>{errors.periodType}</FormHelperText>}
                    </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                    <DatePicker
                        label="Period Start Date"
                        value={formData.periodStartDate}
                        onChange={(newValue) => handleDateChange('periodStartDate', newValue)}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!errors.periodStartDate,
                                helperText: errors.periodStartDate
                            }
                        }}
                    />
                </Grid>
                <Grid xs={12} sm={6}>
                    <DatePicker
                        label="Period End Date"
                        value={formData.periodEndDate}
                        onChange={(newValue) => handleDateChange('periodEndDate', newValue)}
                        minDate={formData.periodStartDate} // Basic validation
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!errors.periodEndDate,
                                helperText: errors.periodEndDate
                            }
                        }}
                    />
                </Grid>
                <Grid xs={12} sm={6}>
                    <TextField
                        label="Allocated Amount"
                        name="allocatedAmount"
                        type="number"
                        value={formData.allocatedAmount}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.allocatedAmount}
                        helperText={errors.allocatedAmount}
                        InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                    />
                </Grid>
                <Grid xs={12}>
                    <TextField
                        label="Notes (Optional)"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                </Grid>
                <Grid xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {onCancel && (
                            <Button type="button" variant="outlined" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" variant="contained" color="primary">
                            {initialData ? 'Update Budget' : 'Create Budget'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </form>
    );
};

export default BudgetForm;
