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
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemSecondary,
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
  Person as PersonIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
  PersonOutline as UserIcon,
} from '@mui/icons-material';

import { fetchProjects } from '../projects/projectSlice';
import { fetchUsers } from '../users/userSlice';
import { fetchTasks } from '../tasks/tasksSlice';

const StatCard = ({ title, value, icon, color, trend, onClick }) => (
  <Card 
    sx={{ 
      height: '100%', 
      background: `linear-gradient(45deg, ${color} 30%, ${color}90 90%)`,
      p: { xs: 1, sm: 2 },
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? {
        opacity: 0.9,
        transform: 'scale(1.02)',
        transition: 'all 0.2s ease-in-out'
      } : {}
    }}
    onClick={onClick}
  >
    <CardContent sx={{ color: 'white' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>{value || 0}</Typography>
        </Box>
        <Avatar sx={{ 
          bgcolor: 'rgba(255,255,255,0.2)',
          width: { xs: 32, sm: 40 },
          height: { xs: 32, sm: 40 }
        }}>
          {icon}
        </Avatar>
      </Box>
      {trend && (
        <Box display="flex" alignItems="center" mt={2}>
          <TrendingUpIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{trend}</Typography>
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

const CompletedTasksList = ({ tasks, open, onClose }) => {
  const completedTasks = tasks?.filter(task => task.status === 'completed') || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CheckCircleIcon color="success" />
          <Typography variant="h6">Completed Tasks</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <List>
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <React.Fragment key={task._id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          Completed by: {task.assignedTo?.name}
                        </Typography>
                        {' — '}
                        {task.project?.name && `Project: ${task.project.name}`}
                        <br />
                        Completed on: {new Date(task.updatedAt).toLocaleDateString()}
                      </React.Fragment>
                    }
                  />
                  <Chip
                    label="Completed"
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon />}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No completed tasks"
                secondary="Tasks that are marked as completed will appear here"
              />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button
          component={Link}
          to="/tasks"
          color="primary"
          variant="contained"
        >
          View All Tasks
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TeamMembersList = ({ users, open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PeopleIcon color="primary" />
          <Typography variant="h6">Team Members</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <List>
          {users && users.length > 0 ? (
            users.map((user) => (
              <React.Fragment key={user._id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      {user.role === 'admin' ? <AdminIcon /> : <UserIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          {user.name}
                        </Typography>
                        <Chip
                          label={user.role}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No team members found"
                secondary="Add team members to see them here"
              />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button
          component={Link}
          to="/users"
          color="primary"
          variant="contained"
          startIcon={<PeopleIcon />}
        >
          Manage Users
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ProjectDetailsDialog = ({ projects, open, onClose }) => {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.tasks);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const activeProjects = projects?.filter(project => project?.status === 'in-progress') || [];
  const totalProjects = projects?.length || 0;

  // Helper to format date or show fallback
  const formatDate = (date) => {
    if (!date) return 'No due date';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'No due date' : d.toLocaleDateString();
  };

  // Get tasks for a specific project
  const getTasksForProject = (project) => {
    if (!project || !tasks) return [];
    return tasks.filter(task => task.project?._id === project._id);
  };

  // Get task count for a project
  const getTaskCount = (project) => {
    return getTasksForProject(project).length;
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ProjectIcon color="primary" />
          <Typography variant="h6">Project Details</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Projects
                </Typography>
                <Typography variant="h4" color="primary">
                  {activeProjects.length}
                </Typography>
                <List>
                  {activeProjects.map((project) => (
                    <ListItem 
                      key={project._id}
                      button
                      selected={selectedProject?._id === project._id}
                      onClick={() => handleProjectSelect(project)}
                    >
                      <ListItemText
                        primary={project.name}
                        secondary={`Due: ${formatDate(project.dueDate)}`}
                      />
                      <Chip
                        label={`${getTaskCount(project)} tasks`}
                        size="small"
                        color="primary"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedProject ? `${selectedProject.name} Tasks` : 'Project Statistics'}
                </Typography>
                {selectedProject ? (
                  <List>
                    {getTaskCount(selectedProject) > 0 ? (
                      getTasksForProject(selectedProject).map((task) => (
                        <ListItem key={task._id}>
                          <ListItemText
                            primary={task.title}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="text.primary">
                                  Status: {task.status}
                                </Typography>
                                <br />
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Due: {formatDate(task.dueDate)}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="No tasks for this project" />
                      </ListItem>
                    )}
                  </List>
                ) : (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="subtitle1">Total Projects</Typography>
                      <Typography variant="h4">{totalProjects}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1">Completion Rate</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={totalProjects > 0 ? (activeProjects.length / totalProjects) * 100 : 0} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {totalProjects > 0 ? Math.round((activeProjects.length / totalProjects) * 100) : 0}% Active
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button
          component={Link}
          to="/projects"
          color="primary"
          variant="contained"
          startIcon={<ProjectIcon />}
        >
          View All Projects
        </Button>
      </DialogActions>
    </Dialog>
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

const TaskDetailsDialog = ({ tasks, open, onClose }) => {
  const taskStats = {
    total: tasks?.length || 0,
    completed: tasks?.filter(task => task?.status === 'completed').length || 0,
    inProgress: tasks?.filter(task => task?.status === 'in-progress').length || 0,
    pending: tasks?.filter(task => task?.status === 'pending').length || 0,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <TaskIcon color="primary" />
          <Typography variant="h6">Task Details</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Statistics
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="subtitle1">Total Tasks</Typography>
                    <Typography variant="h4">{taskStats.total}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">Completed Tasks</Typography>
                    <Typography variant="h4" color="success.main">{taskStats.completed}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">In Progress</Typography>
                    <Typography variant="h4" color="warning.main">{taskStats.inProgress}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">Pending Tasks</Typography>
                    <Typography variant="h4" color="error.main">{taskStats.pending}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Distribution
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="subtitle1">Completion Rate</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% Completed
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">Status Distribution</Typography>
                    <Box display="flex" gap={1} mt={1}>
                      <Chip
                        label={`Completed: ${taskStats.completed}`}
                        color="success"
                        size="small"
                      />
                      <Chip
                        label={`In Progress: ${taskStats.inProgress}`}
                        color="warning"
                        size="small"
                      />
                      <Chip
                        label={`Pending: ${taskStats.pending}`}
                        color="error"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button
          component={Link}
          to="/tasks"
          color="primary"
          variant="contained"
          startIcon={<TaskIcon />}
        >
          View All Tasks
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const [completedTasksDialogOpen, setCompletedTasksDialogOpen] = React.useState(false);
  const [teamMembersDialogOpen, setTeamMembersDialogOpen] = React.useState(false);
  const [projectDetailsDialogOpen, setProjectDetailsDialogOpen] = React.useState(false);
  const [taskDetailsDialogOpen, setTaskDetailsDialogOpen] = React.useState(false);

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
      active: projects.filter(project => project?.status === 'in-progress').length || 0,
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

  const handleOpenCompletedTasks = () => {
    setCompletedTasksDialogOpen(true);
  };

  const handleCloseCompletedTasks = () => {
    setCompletedTasksDialogOpen(false);
  };

  const handleOpenTeamMembers = () => {
    setTeamMembersDialogOpen(true);
  };

  const handleCloseTeamMembers = () => {
    setTeamMembersDialogOpen(false);
  };

  const handleOpenProjectDetails = () => {
    setProjectDetailsDialogOpen(true);
  };

  const handleCloseProjectDetails = () => {
    setProjectDetailsDialogOpen(false);
  };

  const handleOpenTaskDetails = () => {
    setTaskDetailsDialogOpen(true);
  };

  const handleCloseTaskDetails = () => {
    setTaskDetailsDialogOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: { xs: 2, sm: 4 },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Welcome back, {user?.name || 'Admin User'}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Here's what's happening with your projects today
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/tasks/create"
          startIcon={<TaskIcon />}
          size="small"
        >
          Create New Task
        </Button>
      </Box>

      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={taskStats.total}
            icon={<TaskIcon />}
            color="#3f51b5"
            trend={`${getCompletionPercentage()}% completed`}
            onClick={handleOpenTaskDetails}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={projectStats.total}
            icon={<ProjectIcon />}
            color="#4caf50"
            trend={`${projectStats.active ? Math.round((projectStats.active / projectStats.total) * 100) : 0}% completed`}
            onClick={handleOpenProjectDetails}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Team Members"
            value={users?.length || 0}
            icon={<PeopleIcon />}
            color="#ff9800"
            trend={`${adminCount} admins`}
            onClick={handleOpenTeamMembers}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tasks Completed"
            value={taskStats.completed}
            icon={<CheckCircleIcon />}
            color="#9c27b0"
            trend={`${getCompletionPercentage()}% of total`}
            onClick={handleOpenCompletedTasks}
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
                          {tasks.filter(task => task.project?._id === project._id).length} tasks
                        </TableCell>
                        <TableCell>
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No due date'}
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

      {/* Completed Tasks Dialog */}
      <CompletedTasksList
        tasks={tasks}
        open={completedTasksDialogOpen}
        onClose={handleCloseCompletedTasks}
      />

      {/* Team Members Dialog */}
      <TeamMembersList
        users={users}
        open={teamMembersDialogOpen}
        onClose={handleCloseTeamMembers}
      />

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        projects={projects}
        open={projectDetailsDialogOpen}
        onClose={handleCloseProjectDetails}
      />

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        tasks={tasks}
        open={taskDetailsDialogOpen}
        onClose={handleCloseTaskDetails}
      />
    </Container>
  );
};

export default AdminDashboard; 