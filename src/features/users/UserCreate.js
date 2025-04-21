import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { createUser } from './userSlice';

const UserCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'employee',
  });

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'designer', label: 'Designer' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'sales_representative', label: 'Sales Representative' },
    { value: 'employee', label: 'Employee' },
  ];

  const departments = [
    { value: 'Design', label: 'Design' },
    { value: 'Project Management', label: 'Project Management' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Administration', label: 'Administration' },
    { value: 'Other', label: 'Other' },
  ];

  // Clear any existing errors when component mounts
  useEffect(() => {
    // This will help clear any previous errors
    return () => {
      // Cleanup function
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make sure all required fields are filled
      if (!formData.name || !formData.email || !formData.password || !formData.department || !formData.role) {
        console.error('All fields are required');
        return;
      }
      
      // Log the form data for debugging
      console.log('Submitting user data:', formData);
      
      // Make sure we're using the correct endpoint
      const result = await dispatch(createUser(formData)).unwrap();
      console.log('User created successfully:', result);
      navigate('/users');
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New User
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'An error occurred while creating the user'}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            margin="normal"
            required
          >
            {departments.map((dept) => (
              <MenuItem key={dept.value} value={dept.value}>
                {dept.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            margin="normal"
            required
          >
            {roles.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </TextField>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create User'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default UserCreate; 