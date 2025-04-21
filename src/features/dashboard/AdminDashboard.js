import React, { useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as TaskIcon,
  Folder as ProjectIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

import { fetchProjects } from '../projects/projectSlice';
import { fetchUsers } from '../users/userSlice';
import { fetchTasks } from '../tasks/tasksSlice';

const StatCard = ({ title, value, icon, color, trend }) => (
  <Card sx={{ height: '100%', background: `linear-gradient(45deg, ${color} 30%, ${color}90 90%)` }}>
    <CardContent sx={{ color: 'white' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">{value || 0}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
          {icon}
        </Avatar>
      </Box>
      {trend && (
        <Box display="flex" alignItems="center" mt={2}>
          <TrendingUpIcon sx={{ mr: 1 }} />
          <Typography variant="body2">{trend}</Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const TaskProgress = ({ tasks }) => {
  if (!tasks || !Array.isArray(tasks)) {
    return null;
  }

  const total = tasks.length || 0;
  const completed = tasks.filter(task => task?.status === 'completed').length || 0;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Task Progress
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h4" sx={{ mr: 2 }}>
            {Math.round(progress)}%
          </Typography>
          <Box flexGrow={1}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">Completed: {completed}</Typography>
          <Typography variant="body2">Total: {total}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const RecentActivity = ({ tasks }) => {
  if (!tasks || !Array.isArray(tasks)) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {tasks.slice(0, 5).map((task) => (
            <React.Fragment key={task._id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      {task.status === 'completed' && <CheckCircleIcon color="success" sx={{ mr: 1 }} />}
                      {task.status === 'in-progress' && <WarningIcon color="warning" sx={{ mr: 1 }} />}
                      {task.status === 'pending' && <ErrorIcon color="error" sx={{ mr: 1 }} />}
                      <Typography variant="subtitle1">{task.title}</Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </Typography>
                  }
                />
                <Chip
                  label={task.status || 'pending'}
                  color={
                    task.status === 'completed' ? 'success' :
                    task.status === 'in-progress' ? 'warning' : 'error'
                  }
                  size="small"
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { users, loading: usersLoading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
    dispatch(fetchUsers());
  }, [dispatch]);

  if (tasksLoading || projectsLoading || usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const getTaskStats = () => {
    if (!tasks || !Array.isArray(tasks)) {
      return { total: 0, completed: 0, inProgress: 0, pending: 0 };
    }
    return {
      total: tasks.length || 0,
      completed: tasks.filter(task => task?.status === 'completed').length || 0,
      inProgress: tasks.filter(task => task?.status === 'in-progress').length || 0,
      pending: tasks.filter(task => task?.status === 'pending').length || 0,
    };
  };

  const getProjectStats = () => {
    if (!projects || !Array.isArray(projects)) {
      return { total: 0, active: 0, completed: 0 };
    }
    return {
      total: projects.length || 0,
      active: projects.filter(project => project?.status === 'active').length || 0,
      completed: projects.filter(project => project?.status === 'completed').length || 0,
    };
  };

  const getCompletionPercentage = () => {
    const { total, completed } = getTaskStats();
    if (total === 0) return 0;
    const percentage = Math.round((completed / total) * 100);
    return isNaN(percentage) ? 0 : percentage;
  };

  const taskStats = getTaskStats();
  const projectStats = getProjectStats();
  const adminCount = users?.filter(user => user?.role === 'admin').length || 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name || 'Admin User'}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Here's what's happening with your projects today
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/tasks/create"
          startIcon={<TaskIcon />}
        >
          Create New Task
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={taskStats.total}
            icon={<TaskIcon />}
            color="#3f51b5"
            trend={`${getCompletionPercentage()}% completed`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={projectStats.total}
            icon={<ProjectIcon />}
            color="#4caf50"
            trend={`${projectStats.active ? Math.round((projectStats.active / projectStats.total) * 100) : 0}% completed`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Team Members"
            value={users?.length || 0}
            icon={<PeopleIcon />}
            color="#ff9800"
            trend={`${adminCount} admins`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tasks Completed"
            value={taskStats.completed}
            icon={<CheckCircleIcon />}
            color="#9c27b0"
            trend={`${getCompletionPercentage()}% of total`}
          />
        </Grid>

        {/* Task Progress */}
        <Grid item xs={12} md={8}>
          <TaskProgress tasks={tasks} />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <RecentActivity tasks={tasks} />
        </Grid>

        {/* Projects Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Projects Overview</Typography>
                <Button
                  component={Link}
                  to="/projects"
                  color="primary"
                  size="small"
                >
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Tasks</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Team</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projects.slice(0, 5).map((project) => (
                      <TableRow key={project._id}>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.status}
                            color={project.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {project.tasks?.length || 0} tasks
                        </TableCell>
                        <TableCell>
                          {new Date(project.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box display="flex">
                            {project.team?.slice(0, 3).map((member) => (
                              <Tooltip key={member._id} title={member.name}>
                                <Avatar
                                  sx={{ width: 32, height: 32, mr: -1 }}
                                  src={member.avatar}
                                >
                                  {member.name.charAt(0)}
                                </Avatar>
                              </Tooltip>
                            ))}
                            {project.team?.length > 3 && (
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.300' }}>
                                +{project.team.length - 3}
                              </Avatar>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 