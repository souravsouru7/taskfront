import React, { useEffect, useState } from 'react';
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
  Tabs,
  Tab,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  PlayArrow as InProgressIcon,
  PendingActions as PendingIcon,
  ErrorOutline as ErrorIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { fetchUserById } from './userSlice';
import { fetchTasks } from '../tasks/tasksSlice';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { selectedUser: user, loading } = useSelector((state) => state.users);
  const { tasks } = useSelector((state) => state.tasks);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    dispatch(fetchUserById(id));
    dispatch(fetchTasks());
  }, [dispatch, id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  const getStatusColor = (status, dueDate) => {
    if (!dueDate) return 'default';
    
    const now = new Date();
    const taskDueDate = new Date(dueDate);
    // Reset time part for date comparison
    now.setHours(0, 0, 0, 0);
    taskDueDate.setHours(0, 0, 0, 0);
    
    const isOverdue = taskDueDate < now && status !== 'completed';

    if (isOverdue) {
      return 'error';
    }

    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status, dueDate) => {
    const now = new Date();
    const taskDueDate = new Date(dueDate);
    const isOverdue = taskDueDate < now && status !== 'completed';

    if (isOverdue) {
      return <ErrorIcon color="error" />;
    }

    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'in-progress':
        return <InProgressIcon color="warning" />;
      case 'pending':
        return <PendingIcon color="info" />;
      default:
        return <ErrorIcon color="error" />;
    }
  };

  const getStatusLabel = (status, dueDate) => {
    const now = new Date();
    const taskDueDate = new Date(dueDate);
    const isOverdue = taskDueDate < now && status !== 'completed';

    if (isOverdue) {
      return 'Overdue';
    }
    return status;
  };

  // Filter tasks for the current user
  const userTasks = tasks.filter(task => task.assignedTo?._id === id);

  // First identify overdue tasks
  const isOverdue = (task) => {
    const now = new Date();
    const taskDueDate = new Date(task.dueDate);
    now.setHours(0, 0, 0, 0);
    taskDueDate.setHours(0, 0, 0, 0);
    return taskDueDate < now && task.status !== 'completed';
  };

  // Calculate task statistics with proper categorization
  const overdueTasks = userTasks.filter(isOverdue);
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const inProgressTasks = userTasks.filter(task => 
    task.status === 'in-progress' && !isOverdue(task)
  );
  const pendingTasks = userTasks.filter(task => 
    task.status === 'pending' && !isOverdue(task)
  );

  // Calculate total as sum of all categories
  const totalTasks = completedTasks.length + inProgressTasks.length + pendingTasks.length + overdueTasks.length;

  // Verify calculations with debug logging
  console.log('Task Statistics:', {
    completed: completedTasks.length,
    inProgress: inProgressTasks.length,
    pending: pendingTasks.length,
    overdue: overdueTasks.length,
    calculatedTotal: totalTasks,
    rawTotal: userTasks.length
  });

  const TaskList = ({ tasks }) => (
    <List sx={{ 
      width: '100%',
      p: 0,
    }}>
      {tasks.length > 0 ? (
        tasks.map((task) => {
          const now = new Date();
          const taskDueDate = new Date(task.dueDate);
          // Reset time part for date comparison
          now.setHours(0, 0, 0, 0);
          taskDueDate.setHours(0, 0, 0, 0);
          
          const isOverdue = taskDueDate < now && task.status !== 'completed';

          return (
            <React.Fragment key={task._id}>
              <ListItem
                component={RouterLink}
                to={`/tasks/${task._id}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 1,
                  p: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  backgroundColor: isOverdue ? 'error.light' : 'inherit',
                }}
              >
                <Box display="flex" alignItems="center" width="100%" gap={1}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {getStatusIcon(task.status, task.dueDate)}
                    </Avatar>
                  </ListItemAvatar>
                  <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
                    {task.title}
                  </Typography>
                  <Chip
                    label={getStatusLabel(task.status, task.dueDate)}
                    color={getStatusColor(task.status, task.dueDate)}
                    size="small"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                <Box pl={5} width="100%">
                  <Typography variant="body2" color="text.secondary">
                    Project: {task.project?.name || 'No Project'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={isOverdue ? 'error.main' : 'text.secondary'}
                  >
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue && ' (Overdue)'}
                  </Typography>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          );
        })
      ) : (
        <ListItem>
          <ListItemText
            primary="No tasks found"
            secondary="No tasks in this category"
          />
        </ListItem>
      )}
    </List>
  );

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
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 2, sm: 4 }, 
        mb: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Button
          component={RouterLink}
          to="/users"
          startIcon={<ArrowBackIcon />}
          sx={{ display: { xs: 'flex', sm: 'none' } }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          User Details
        </Typography>
        <Box 
          sx={{ 
            ml: { sm: 'auto' },
            width: { xs: '100%', sm: 'auto' },
            display: 'flex',
            gap: 1
          }}
        >
          <Button
            component={RouterLink}
            to="/users"
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              flex: { xs: 1, sm: 'none' }
            }}
          >
            Back to Users
          </Button>
          <Button
            component={RouterLink}
            to={`/users/${user._id}/edit`}
            variant="contained"
            color="primary"
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            Edit User
          </Button>
        </Box>
      </Box>

      {/* User Information */}
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: { xs: 2, sm: 3 }
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 3 }}>
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
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                {user.email}
              </Typography>
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
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Task Statistics
            </Typography>
            <Box 
              sx={{ 
                background: 'linear-gradient(145deg, #f9f9f9 0%, #f3f3f3 100%)',
                borderRadius: 2,
                p: { xs: 2, sm: 3 },
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 3
                }}
              >
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {totalTasks}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ ml: 1, mt: 1 }}
                >
                  Total Tasks
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {[
                  { 
                    label: 'Completed', 
                    count: completedTasks.length, 
                    icon: <CompletedIcon />, 
                    color: 'success.main',
                    gradient: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                    lightBg: 'success.lighter'
                  },
                  { 
                    label: 'In Progress', 
                    count: inProgressTasks.length, 
                    icon: <InProgressIcon />, 
                    color: 'warning.main',
                    gradient: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                    lightBg: 'warning.lighter'
                  },
                  { 
                    label: 'Pending', 
                    count: pendingTasks.length, 
                    icon: <PendingIcon />, 
                    color: 'info.main',
                    gradient: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
                    lightBg: 'info.lighter'
                  },
                  { 
                    label: 'Overdue', 
                    count: overdueTasks.length, 
                    icon: <ErrorIcon />, 
                    color: 'error.main',
                    gradient: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
                    lightBg: 'error.lighter'
                  },
                ].map((stat) => (
                  <Grid item xs={6} sm={6} key={stat.label}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: stat.lightBg,
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: stat.gradient,
                          mb: 1,
                          color: 'white',
                          boxShadow: `0 4px 12px ${stat.color}40`
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: stat.color
                        }}
                      >
                        {stat.count}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          textAlign: 'center',
                          fontWeight: 500
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tasks Section */}
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="task tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minWidth: { xs: 'auto', sm: 0 },
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }
            }}
          >
            <Tab 
              label={isMobile ? "All" : "All Tasks"} 
              icon={<TaskIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={isMobile ? "Done" : "Completed"}
              icon={<CompletedIcon />} 
              iconPosition="start"
              sx={{ color: 'success.main' }}
            />
            <Tab 
              label={isMobile ? "Progress" : "In Progress"}
              icon={<InProgressIcon />} 
              iconPosition="start"
              sx={{ color: 'warning.main' }}
            />
            <Tab 
              label={isMobile ? "Pending" : "Pending"}
              icon={<PendingIcon />} 
              iconPosition="start"
              sx={{ color: 'info.main' }}
            />
            <Tab 
              label={isMobile ? "Due" : "Overdue"}
              icon={<ErrorIcon />} 
              iconPosition="start"
              sx={{ color: 'error.main' }}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TaskList tasks={userTasks} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <TaskList tasks={completedTasks} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <TaskList tasks={inProgressTasks} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <TaskList tasks={pendingTasks} />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <TaskList tasks={overdueTasks} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default UserDetail; 