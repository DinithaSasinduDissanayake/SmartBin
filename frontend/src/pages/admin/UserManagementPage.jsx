// frontend/src/pages/admin/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, CircularProgress, Alert, Snackbar,
  Pagination, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UserList from '../../components/admin/UserList';
import UserForm from '../../components/admin/UserForm';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../services/adminService';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formServerError, setFormServerError] = useState(null); // Separate error state for the form
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null); // For editing
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, userId: null });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers({ page, limit: 10 }); // Adjust limit as needed
      setUsers(data.users || []);
      setPaginationInfo({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalUsers: data.totalUsers || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setSnackbar({ open: true, message: err.message || 'Failed to fetch users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(paginationInfo.currentPage);
  }, [fetchUsers, paginationInfo.currentPage]);

  const handlePageChange = (event, value) => {
    setPaginationInfo(prev => ({ ...prev, currentPage: value }));
  };

  const handleAddUserClick = () => {
    setSelectedUser(null);
    setFormServerError(null); // Clear previous form errors
    setShowForm(true);
  };

  const handleEditUserClick = (user) => {
    setSelectedUser(user);
    setFormServerError(null); // Clear previous form errors
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedUser(null);
    setFormServerError(null);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    setFormServerError(null);
    const isEditMode = Boolean(selectedUser?._id);
    const action = isEditMode ? updateUser : createUser;
    const userId = isEditMode ? selectedUser._id : undefined;

    try {
      await action(userId, formData); // Pass ID only for update
      setShowForm(false);
      setSelectedUser(null);
      setSnackbar({ open: true, message: `User ${isEditMode ? 'updated' : 'created'} successfully!`, severity: 'success' });
      // Refresh users list - fetch current page again
      fetchUsers(paginationInfo.currentPage);
    } catch (err) {
      console.error('Form submission error:', err);
      const errorMessage = err.message || `Failed to ${isEditMode ? 'update' : 'create'} user`;
      setFormServerError({ message: errorMessage }); // Set form-specific error
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUserClick = (userId) => {
    setConfirmDelete({ open: true, userId: userId });
  };

  const handleConfirmDelete = async () => {
    const userId = confirmDelete.userId;
    if (!userId) return;

    setLoading(true); // Use main loading indicator for delete
    setError(null);
    setConfirmDelete({ open: false, userId: null }); // Close dialog

    try {
      await deleteUser(userId);
      setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
      // Refresh list: If the deleted user was the last on the page, go to previous page
      const newTotalUsers = paginationInfo.totalUsers - 1;
      const newTotalPages = Math.ceil(newTotalUsers / 10); // Assuming limit is 10
      let pageToFetch = paginationInfo.currentPage;
      if (users.length === 1 && paginationInfo.currentPage > 1) {
        pageToFetch = paginationInfo.currentPage - 1;
      }
      if (pageToFetch > newTotalPages && newTotalPages > 0) {
         pageToFetch = newTotalPages;
      }
      if (newTotalUsers === 0) {
          pageToFetch = 1;
      }
      // Update pagination state *before* fetching if page changes
      if (pageToFetch !== paginationInfo.currentPage) {
          setPaginationInfo(prev => ({ ...prev, currentPage: pageToFetch }));
      } else {
          fetchUsers(pageToFetch); // Fetch the potentially adjusted current page
      }

    } catch (err) {
      setError(err.message || 'Failed to delete user');
      setSnackbar({ open: true, message: err.message || 'Failed to delete user', severity: 'error' });
      setLoading(false); // Ensure loading is false on error
    }
    // setLoading(false) is handled by fetchUsers in success case
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseConfirmDelete = () => {
    setConfirmDelete({ open: false, userId: null });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUserClick}
        >
          Add New User
        </Button>
      </Box>

      {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <UserList
        users={users}
        onEdit={handleEditUserClick}
        onDelete={handleDeleteUserClick}
        loading={loading}
      />

      {paginationInfo.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={paginationInfo.totalPages}
            page={paginationInfo.currentPage}
            onChange={handlePageChange}
            color="primary"
            disabled={loading}
          />
        </Box>
      )}

      {/* User Form Dialog */}
      <UserForm
        key={selectedUser?._id || 'new'} // Force re-render on user change
        initialData={selectedUser}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={formLoading}
        open={showForm}
        serverError={formServerError} // Pass server error to form
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete.open}
        onClose={handleCloseConfirmDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDelete} disabled={loading}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
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
    </Box>
  );
};

export default UserManagementPage;
