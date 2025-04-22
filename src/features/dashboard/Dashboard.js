import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Tooltip
} from '@mui/material';
import { fetchUserTasks } from '../tasks/tasksSlice';
import { fetchUserProjects } from '../projects/projectSlice';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import UserProfile from '../users/UserProfile';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { projects, loading: projectsLoading } = useSelector(
    (state) => state.projects
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserTasks());
      dispatch(fetchUserProjects());
    }
  }, [dispatch, user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getTaskStats = () => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0, pending: 0 };
    
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const inProgress = tasks.filter(
      (task) => task.status === 'in_progress'
    ).length;
    const pending = tasks.filter((task) => task.status === 'pending').length;

    return { total, completed, inProgress, pending };
  };

  const getProjectStats = () => {
    if (!projects) return { total: 0, completed: 0, active: 0, pending: 0 };
    
    const total = projects.length;
    const completed = projects.filter(
      (project) => project.status === 'completed'
    ).length;
    const active = projects.filter(
      (project) => project.status === 'active'
    ).length;
    const pending = projects.filter(
      (project) => project.status === 'pending'
    ).length;

    return { total, completed, active, pending };
  };

  if (tasksLoading || projectsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const taskStats = getTaskStats();
  const projectStats = getProjectStats();

  const handleOpenProfile = () => {
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: { xs: 2, sm: 3 },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Dashboard
        </Typography>
        <Tooltip title="View Profile">
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={handleOpenProfile}
            size="small"
          >
            Profile
          </Button>
        </Tooltip>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
          Welcome, {user?.name}!
        </Typography>
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {/* Task Statistics */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: { xs: 1, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                height: { xs: 'auto', sm: 240 },
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Task Overview
              </Typography>
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: { xs: 1, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: 'primary.light',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{taskStats.total}</Typography>
                    <Typography variant="body2">Total Tasks</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: { xs: 1, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: 'success.light',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{taskStats.completed}</Typography>
                    <Typography variant="body2">Completed</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: { xs: 1, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: 'warning.light',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{taskStats.inProgress}</Typography>
                    <Typography variant="body2">In Progress</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: { xs: 1, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: 'error.light',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{taskStats.pending}</Typography>
                    <Typography variant="body2">Pending</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Project Statistics */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: { xs: 1, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                height: { xs: 'auto', sm: 240 },
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Project Overview
              </Typography>
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: { xs: 1, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: 'primary.light',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{projectStats.total}</Typography>
                    <Typography variant="body2">Total Projects</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: { xs: 1, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: 'success.light',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{projectStats.completed}</Typography>
                    <Typography variant="body2">Completed</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: { xs: 1, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: 'warning.light',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{projectStats.active}</Typography>
                    <Typography variant="body2">Active</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: { xs: 1, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: 'error.light',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{projectStats.pending}</Typography>
                    <Typography variant="body2">Pending</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {isProfileOpen && (
        <UserProfile onClose={handleCloseProfile} />
      )}
    </Box>
  );
};

export default Dashboard; 