// frontend/src/components/admin/UserList.jsx
import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Typography, Box, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

// Helper to format role display
const formatRole = (role) => {
  return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const UserList = ({ users, onEdit, onDelete, loading }) => {
  if (loading) {
    return <Typography>Loading users...</Typography>; // Or a Skeleton loader
  }

  if (!users || users.length === 0) {
    return <Typography>No users found.</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="user list table">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip label={formatRole(user.role)} size="small" />
              </TableCell>
              <TableCell>{user.phone || 'N/A'}</TableCell>
              <TableCell>
                {format(new Date(user.createdAt), 'PPpp')} {/* Format date */}
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(user)} color="primary" aria-label="edit user">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(user._id)} color="error" aria-label="delete user">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserList;
