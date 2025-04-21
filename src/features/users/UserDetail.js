import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { fetchUserById } from './userSlice';

const UserDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedUser: user, loading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUserById(id));
  }, [dispatch, id]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'designer':
        return 'info';
      case 'project_manager':
        return 'warning';
      case 'sales_representative':
        return 'success';
      case 'employee':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'designer':
        return 'Designer';
      case 'project_manager':
        return 'Project Manager';
      case 'sales_representative':
        return 'Sales Rep';
      case 'employee':
        return 'Employee';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" color="error">
          User not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Details</Typography>
        <Button
          component={RouterLink}
          to="/users"
          variant="outlined"
          color="primary"
        >
          Back to Users
        </Button>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Name
              </Typography>
              <Typography variant="body1">{user.name}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Email
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Department
              </Typography>
              <Typography variant="body1">{user.department}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Role
              </Typography>
              <Chip
                label={formatRoleLabel(user.role)}
                color={getRoleColor(user.role)}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Permissions
            </Typography>
            <List>
              {user.permissions?.map((permission, index) => (
                <ListItem key={index}>
                  <ListItemText primary={permission} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            component={RouterLink}
            to={`/users/${user._id}/edit`}
            variant="contained"
            color="primary"
          >
            Edit User
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserDetail; 