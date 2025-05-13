import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Paper, Typography, TextField, Button, Box, Grid,
    Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
    CircularProgress, Alert, Snackbar
} from '@mui/material';
import settingsApi from '../../services/settingsApi';

const SystemSettingsPage = () => {
    const [settings, setSettings] = useState({
        appName: '',
        defaultTimezone: '',
        defaultCurrency: '',
        defaultNewUserRole: 'customer',
        passwordMinLength: 8,
        sessionTimeoutMinutes: 60,
        maintenanceMode: false,
    });
    const [initialSettings, setInitialSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await settingsApi.getSettings();
            setSettings(data);
            setInitialSettings(data);
        } catch (err) {
            setError(err.message || 'Failed to load settings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleNumericChange = (event) => {
        const { name, value } = event.target;
        if (value === '' || /^[0-9]+$/.test(value)) {
            setSettings(prev => ({
                ...prev,
                [name]: value === '' ? '' : Number(value)
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const dataToSubmit = {
                ...settings,
                passwordMinLength: Number(settings.passwordMinLength) || 8,
                sessionTimeoutMinutes: Number(settings.sessionTimeoutMinutes) || 60,
            };
            const updatedData = await settingsApi.updateSettings(dataToSubmit);
            setSettings(updatedData);
            setInitialSettings(updatedData);
            setSnackbar({ open: true, message: 'Settings updated successfully!', severity: 'success' });
        } catch (err) {
            setError(err.message || 'Failed to update settings.');
            setSnackbar({ open: true, message: err.message || 'Failed to update settings.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const hasChanged = JSON.stringify(settings) !== JSON.stringify(initialSettings);

    if (loading) {
        return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h4" gutterBottom>
                    System Settings
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* General Settings */}
                        <Grid item xs={12}>
                            <Typography variant="h6">General</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Application Name"
                                name="appName"
                                value={settings.appName}
                                onChange={handleChange}
                                fullWidth
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Default Timezone"
                                name="defaultTimezone"
                                value={settings.defaultTimezone}
                                onChange={handleChange}
                                fullWidth
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Default Currency (ISO Code)"
                                name="defaultCurrency"
                                value={settings.defaultCurrency}
                                onChange={handleChange}
                                fullWidth
                                disabled={saving}
                                inputProps={{ maxLength: 3, style: { textTransform: 'uppercase' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onChange={handleChange}
                                        name="maintenanceMode"
                                        disabled={saving}
                                    />
                                }
                                label="Maintenance Mode"
                            />
                        </Grid>

                        {/* User Settings */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 2 }}>User Management</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="default-role-label">Default New User Role</InputLabel>
                                <Select
                                    labelId="default-role-label"
                                    label="Default New User Role"
                                    name="defaultNewUserRole"
                                    value={settings.defaultNewUserRole}
                                    onChange={handleChange}
                                    disabled={saving}
                                >
                                    <MenuItem value="customer">Customer</MenuItem>
                                    <MenuItem value="staff">Staff</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Minimum Password Length"
                                name="passwordMinLength"
                                type="number"
                                value={settings.passwordMinLength}
                                onChange={handleNumericChange}
                                fullWidth
                                disabled={saving}
                                InputProps={{ inputProps: { min: 6 } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Session Timeout (Minutes)"
                                name="sessionTimeoutMinutes"
                                type="number"
                                value={settings.sessionTimeoutMinutes}
                                onChange={handleNumericChange}
                                fullWidth
                                disabled={saving}
                                InputProps={{ inputProps: { min: 5 } }}
                            />
                        </Grid>

                        {/* Save Button */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={saving || !hasChanged}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default SystemSettingsPage;