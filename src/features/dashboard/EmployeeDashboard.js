import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  LinearProgress,
  Menu,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CompletedIcon,
  PendingActions as PendingIcon,
  PlayArrow as InProgressIcon,
  Notifications as NotificationIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  FilterList as FilterIcon,
  ErrorOutline as ErrorIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { fetchUserTasks, updateTaskStatus } from '../tasks/tasksSlice';
import { fetchUserProjects } from '../projects/projectSlice';
import { format } from 'date-fns';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, status: tasksStatus, error: tasksError } = useSelector((state) => state.tasks);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    // Load tasks assigned to the current user
    dispatch(fetchUserTasks());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, task) => {
    event.stopPropagation(); // Prevent triggering the ListItem click
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus) => {
    if (selectedTask && selectedTask.status !== newStatus) {
      dispatch(updateTaskStatus({ id: selectedTask._id, status: newStatus }))
        .unwrap()
        .then(() => {
          setSnackbarMessage(`Task status updated to ${newStatus}`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        })
        .catch((error) => {
          setSnackbarMessage(`Error: ${error.message || 'Failed to update status'}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    }
    handleMenuClose();
  };

  const getTaskStats = () => {
    if (!tasks || !Array.isArray(tasks)) {
      return { total: 0, completed: 0, inProgress: 0, pending: 0 };
    }
    
    const total = tasks.length || 0;
    const completed = tasks.filter((task) => task?.status === 'completed').length || 0;
    const inProgress = tasks.filter((task) => task?.status === 'in-progress').length || 0;
    const pending = tasks.filter((task) => task?.status === 'pending').length || 0;

    return { total, completed, inProgress, pending };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'on-hold':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon fontSize="small" />;
      case 'in-progress':
        return <InProgressIcon fontSize="small" />;
      case 'pending':
        return <PendingIcon fontSize="small" />;
      case 'on-hold':
        return <ErrorIcon fontSize="small" />;
      default:
        return <TaskIcon fontSize="small" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCompletionPercentage = () => {
    const { total, completed } = getTaskStats();
    if (total === 0) return 0;
    const percentage = Math.round((completed / total) * 100);
    return isNaN(percentage) ? 0 : percentage;
  };

  // Get tasks due within the next 7 days
  const getUpcomingTasks = () => {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    
    return tasks.filter(task => 
      task.status !== 'completed' && 
      new Date(task.dueDate) >= today && 
      new Date(task.dueDate) <= oneWeekLater
    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  // Get tasks that are overdue
  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => 
      task.status !== 'completed' && 
      new Date(task.dueDate) < today
    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  // Get tasks based on current tab selection
  const getDisplayedTasks = () => {
    switch (tabValue) {
      case 0: // All tasks
        return tasks;
      case 1: // Pending tasks
        return tasks.filter(task => task.status === 'pending');
      case 2: // In Progress tasks
        return tasks.filter(task => task.status === 'in-progress');
      case 3: // Completed tasks
        return tasks.filter(task => task.status === 'completed');
      case 4: // Overdue tasks
        return getOverdueTasks();
      default:
        return tasks;
    }
  };

  if (tasksStatus === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const taskStats = getTaskStats();
  const completionPercentage = getCompletionPercentage();
  const displayedTasks = getDisplayedTasks();
  const overdueTasks = getOverdueTasks();
  const upcomingTasks = getUpcomingTasks();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your Task Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={`${overdueTasks.length} overdue tasks`}>
            <IconButton color="primary" sx={{ mr: 2 }} component={Link} to="/tasks">
              <Badge badgeContent={overdueTasks.length} color="error">
                <NotificationIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Profile">
            <IconButton color="primary" component={Link} to="/profile">
              <PersonIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {tasksError && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
          <Typography variant="subtitle1" color="error.contrastText">
            Error loading your tasks: {tasksError}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 1, bgcolor: 'error.dark' }}
            onClick={() => dispatch(fetchUserTasks())}
          >
            Retry
          </Button>
        </Paper>
      )}

      {/* Task Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="primary">Total Tasks</Typography>
            <Typography variant="h3">{taskStats.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: 'warning.light' }}>
            <Typography variant="h6" color="white">Pending</Typography>
            <Typography variant="h3" color="white">{taskStats.pending}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: 'info.light' }}>
            <Typography variant="h6" color="white">In Progress</Typography>
            <Typography variant="h3" color="white">{taskStats.inProgress}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: 'success.light' }}>
            <Typography variant="h6" color="white">Completed</Typography>
            <Typography variant="h3" color="white">{taskStats.completed}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Progress Overview */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Your Progress</Typography>
          <Typography variant="body2" color="text.secondary">
            {completionPercentage}% Complete
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Paper>

      {/* Task List */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="task tabs">
            <Tab label="All Tasks" icon={<TaskIcon />} iconPosition="start" />
            <Tab label="Pending" icon={<PendingIcon />} iconPosition="start" />
            <Tab label="In Progress" icon={<InProgressIcon />} iconPosition="start" />
            <Tab label="Completed" icon={<CompletedIcon />} iconPosition="start" />
            <Tab 
              label="Overdue" 
              icon={<Badge badgeContent={overdueTasks.length} color="error"><ErrorIcon /></Badge>} 
              iconPosition="start" 
            />
          </Tabs>
        </Box>

        <Box>
          {displayedTasks.length > 0 ? (
            <List>
              {displayedTasks.map((task, index) => (
                <React.Fragment key={task._id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    button
                    component={Link}
                    to={`/tasks/${task._id}`}
                    alignItems="flex-start"
                    sx={{ 
                      py: 2,
                      bgcolor: new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'error.50' : 'inherit' 
                    }}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="task options"
                        onClick={(e) => handleMenuOpen(e, task)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 8 }}>
                          <Typography variant="h6" color="primary">
                            {task.title}
                          </Typography>
                          <Box>
                            <Chip 
                              icon={getStatusIcon(task.status)}
                              label={task.status}
                              size="small"
                              color={getStatusColor(task.status)}
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                            />
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.primary" gutterBottom>
                            {task.description?.substring(0, 100)}
                            {task.description?.length > 100 ? '...' : ''}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Project: {task.project?.name || 'N/A'}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color={new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'error.main' : 'text.secondary'}
                            >
                              Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tabValue === 0 ? "You don't have any assigned tasks yet" : 
                 tabValue === 3 ? "You haven't completed any tasks yet" :
                 tabValue === 4 ? "Great job! You don't have any overdue tasks" :
                 "No tasks with this status"}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Status Change Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Update Status</Typography>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleStatusChange('pending')}
          disabled={selectedTask?.status === 'pending'}
        >
          <PendingIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
          Pending
        </MenuItem>
        <MenuItem 
          onClick={() => handleStatusChange('in-progress')}
          disabled={selectedTask?.status === 'in-progress'}
        >
          <InProgressIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
          In Progress
        </MenuItem>
        <MenuItem 
          onClick={() => handleStatusChange('completed')}
          disabled={selectedTask?.status === 'completed'}
        >
          <CompletedIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
          Completed
        </MenuItem>
        <MenuItem 
          onClick={() => handleStatusChange('on-hold')}
          disabled={selectedTask?.status === 'on-hold'}
        >
          <ErrorIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
          On Hold
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmployeeDashboard; 