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
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  PlayArrow as InProgressIcon,
  PendingActions as PendingIcon,
  ErrorOutline as ErrorIcon,
  Person as PersonIcon,
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'in-progress':
        return <InProgressIcon color="info" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return <ErrorIcon color="error" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'error';
    }
  };

  // Filter tasks for the current user
  const userTasks = tasks.filter(task => task.assignedTo?._id === id);
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const inProgressTasks = userTasks.filter(task => task.status === 'in-progress');
  const pendingTasks = userTasks.filter(task => task.status === 'pending');

  const TaskList = ({ tasks }) => (
    <List>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <React.Fragment key={task._id}>
            <ListItem
              component={RouterLink}
              to={`/tasks/${task._id}`}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  {getStatusIcon(task.status)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={task.title}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.primary">
                      Project: {task.project?.name || 'No Project'}
                    </Typography>
                    <br />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </React.Fragment>
                }
              />
              <Chip
                label={task.status}
                color={getStatusColor(task.status)}
                size="small"
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))
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

      {/* User Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
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
              Task Statistics
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Total Tasks
              </Typography>
              <Typography variant="h4">{userTasks.length}</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center" p={1}>
                  <Chip
                    icon={<CompletedIcon />}
                    label={`${completedTasks.length} Completed`}
                    color="success"
                    sx={{ width: '100%' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center" p={1}>
                  <Chip
                    icon={<InProgressIcon />}
                    label={`${inProgressTasks.length} In Progress`}
                    color="info"
                    sx={{ width: '100%' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center" p={1}>
                  <Chip
                    icon={<PendingIcon />}
                    label={`${pendingTasks.length} Pending`}
                    color="warning"
                    sx={{ width: '100%' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Tasks Section */}
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="task tabs">
            <Tab label="All Tasks" icon={<TaskIcon />} iconPosition="start" />
            <Tab 
              label="Completed" 
              icon={<CompletedIcon />} 
              iconPosition="start"
              sx={{ color: 'success.main' }}
            />
            <Tab 
              label="In Progress" 
              icon={<InProgressIcon />} 
              iconPosition="start"
              sx={{ color: 'info.main' }}
            />
            <Tab 
              label="Pending" 
              icon={<PendingIcon />} 
              iconPosition="start"
              sx={{ color: 'warning.main' }}
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
      </Paper>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button
          component={RouterLink}
          to={`/users/${user._id}/edit`}
          variant="contained"
          color="primary"
        >
          Edit User
        </Button>
      </Box>
    </Container>
  );
};

export default UserDetail; 