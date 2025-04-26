import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector, useDispatch } from 'react-redux';
import { createGlobalStyle } from 'styled-components';
import { getCurrentUser } from './features/auth/authSlice';
import { Leaderboard } from './features/tasks';

// Layout Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Auth Components
import Login from './features/auth/Login';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';

// Dashboard Components
import Dashboard from './features/dashboard/Dashboard';
import AdminDashboard from './features/dashboard/AdminDashboard';
import EmployeeDashboard from './features/dashboard/EmployeeDashboard';



// Project Components
import ProjectList from './features/projects/ProjectList';
import ProjectDetail from './features/projects/ProjectDetail';
import ProjectCreate from './features/projects/ProjectCreate';
import ProjectEdit from './features/projects/ProjectEdit';

// User Components
import UserList from './features/users/UserList';
import UserDetail from './features/users/UserDetail';
import UserEdit from './features/users/UserEdit';
import UserCreate from './features/users/UserCreate';
import Profile from './features/users/Profile';

// Task Components
import TasksList from './features/tasks/TasksList';
import TaskDetail from './features/tasks/TaskDetail';
import TaskForm from './features/tasks/TaskForm';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513', // Light brown
      light: '#A0522D',
      dark: '#654321',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D2B48C', // Tan
      light: '#DEB887',
      dark: '#CD853F',
      contrastText: '#000000',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#8B4513',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#8B4513',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#8B4513',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#8B4513',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '8px 24px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
  },
});

// Add global styles
const GlobalStyles = createGlobalStyle`
  body {
    background: linear-gradient(135deg, #F5F5F5 0%, #E6E6E6 100%);
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%238B4513' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  }
`;

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Load user if token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser())
        .unwrap()
        .catch(error => {
          // If there's an error loading the user (e.g., token expired),
          // remove the token from localStorage
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
        });
    }
  }, [dispatch]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  !isAuthenticated ? (
                    <Login />
                  ) : (
                    <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard'} replace />
                  )
                } 
              />
              <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
              <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" />} />

              {/* Protected Routes */}
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                {/* Redirect root to appropriate dashboard */}
                <Route 
                  index 
                  element={
                    <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/employee-dashboard'} replace />
                  } 
                />
                
                {/* Dashboard Routes */}
                <Route path="admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="employee-dashboard" element={<EmployeeDashboard />} />
                
                {/* Task Routes */}
                <Route path="tasks" element={<PrivateRoute><TasksList /></PrivateRoute>} />
                <Route path="tasks/create" element={<AdminRoute><TaskForm /></AdminRoute>} />
                <Route path="tasks/:id" element={<PrivateRoute><TaskDetail /></PrivateRoute>} />
                <Route path="tasks/:id/edit" element={<AdminRoute><TaskForm /></AdminRoute>} />

                {/* Leaderboard Route */}
                <Route path="leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />

                {/* Project Routes */}
                <Route path="projects">
                  <Route index element={<ProjectList />} />
                  <Route path="create" element={<ProjectCreate />} />
                  <Route path=":id" element={<ProjectDetail />} />
                  <Route path=":id/edit" element={<ProjectEdit />} />
                </Route>

                {/* User Routes */}
                <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                
                {/* Admin Routes */}
                <Route path="users" element={<AdminRoute><UserList /></AdminRoute>} />
                <Route path="users/create" element={<AdminRoute><UserCreate /></AdminRoute>} />
                <Route path="users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
                <Route path="users/:id/edit" element={<AdminRoute><UserEdit /></AdminRoute>} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App; 