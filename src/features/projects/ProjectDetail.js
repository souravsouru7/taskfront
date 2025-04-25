import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchProjectById, updateProject, deleteProject, addMilestone, updateMilestoneStatus, clearCurrentProject } from './projectSlice';
import { fetchUsers } from '../users/userSlice';
import { createTask, deleteTask, updateTask } from '../tasks/tasksSlice';
import { useTheme, useMediaQuery } from '@mui/material';

const ProjectDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentProject: project, loading: projectLoading, error: projectError } = useSelector((state) => state.projects);
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { loading: tasksLoading, error: tasksError } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    status: 'pending',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    client: { name: '', email: '', phone: '' },
  });
  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  });
  const [openTeamDialog, setOpenTeamDialog] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchUsers());
    }

    // Cleanup function
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (project && project._id) {
      setEditForm({
        name: project.name,
        description: project.description,
        client: project.client || { name: '', email: '', phone: '' },
      });
    }
  }, [project]);

  const handleOpenTaskDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo?._id || '',
        priority: task.priority,
        dueDate: new Date(task.dueDate),
        status: task.status,
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: 'pending',
      });
    }
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setEditingTask(null);
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskForm({
      ...taskForm,
      [name]: value,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('client.')) {
      const clientField = name.split('.')[1];
      setEditForm({
        ...editForm,
        client: {
          ...editForm.client,
          [clientField]: value,
        },
      });
    } else {
      setEditForm({
        ...editForm,
        [name]: value,
      });
    }
  };

  const handleDateChange = (date) => {
    setTaskForm({
      ...taskForm,
      dueDate: date,
    });
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
      ...taskForm,
      project: id,
    };

    if (editingTask) {
      await dispatch(updateTask({ id: editingTask._id, ...taskData }));
    } else {
      await dispatch(createTask(taskData));
    }
    handleCloseTaskDialog();
    dispatch(fetchProjectById(id));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateProject({ id, ...editForm }));
    handleCloseEditDialog();
    dispatch(fetchProjectById(id));
  };

  const handleDeleteProject = async () => {
    try {
      await dispatch(deleteProject(id));
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(taskId));
        await dispatch(fetchProjectById(id));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleOpenMilestoneDialog = () => {
    setMilestoneForm({
      title: '',
      description: '',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    });
    setOpenMilestoneDialog(true);
  };

  const handleCloseMilestoneDialog = () => {
    setOpenMilestoneDialog(false);
  };

  const handleMilestoneChange = (e) => {
    const { name, value } = e.target;
    setMilestoneForm({
      ...milestoneForm,
      [name]: value,
    });
  };

  const handleMilestoneDateChange = (date) => {
    setMilestoneForm({
      ...milestoneForm,
      dueDate: date,
    });
  };

  const handleMilestoneSubmit = async (e) => {
    e.preventDefault();
    await dispatch(addMilestone({ projectId: id, milestone: milestoneForm }));
    handleCloseMilestoneDialog();
    dispatch(fetchProjectById(id));
  };

  const handleMilestoneStatusChange = async (milestoneId, completed) => {
    await dispatch(updateMilestoneStatus({ projectId: id, milestoneId, completed }));
    dispatch(fetchProjectById(id));
  };

  const handleOpenTeamDialog = () => {
    setOpenTeamDialog(true);
  };

  const handleCloseTeamDialog = () => {
    setOpenTeamDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  if (projectLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (projectError) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {projectError}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Container>
    );
  }

  if (!project || !project._id) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Project not found
        </Alert>
        <Button variant="contained" onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {projectLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      ) : projectError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {projectError}
        </Alert>
      ) : project ? (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {project.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Project ID: {project._id}
              </Typography>
            </Box>
            <Box display="flex" gap={1} width={{ xs: '100%', sm: 'auto' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenEditDialog}
                fullWidth={isMobile}
              >
                Edit Project
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleOpenDeleteDialog}
                fullWidth={isMobile}
              >
                Delete Project
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Project Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {project.description || 'No description provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(project.startDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(project.endDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Tasks
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenTaskDialog()}
                  >
                    Add Task
                  </Button>
                </Box>
                <List>
                  {project.tasks?.map((task) => (
                    <ListItem
                      key={task._id}
                      divider
                      sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1, sm: 0 }
                      }}
                    >
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box component="span" sx={{ display: 'block' }}>
                            <Typography variant="body2" component="span">
                              Assigned to: {task.assignedTo?.name || 'Unassigned'}
                            </Typography>
                            <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction
                        sx={{
                          position: { xs: 'relative', sm: 'absolute' },
                          right: { xs: 0, sm: 16 },
                          top: { xs: 'auto', sm: '50%' },
                          transform: { xs: 'none', sm: 'translateY(-50%)' },
                          mt: { xs: 2, sm: 0 }
                        }}
                      >
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenTaskDialog(task)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteTask(task._id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Client Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {project.client?.name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {project.client?.email || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {project.client?.phone || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Team Members
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={handleOpenTeamDialog}
                  >
                    Manage Team
                  </Button>
                </Box>
                <List>
                  {project.team?.map((member) => (
                    <ListItem key={member._id} divider>
                      <ListItemText
                        primary={member.name}
                        secondary={member.role}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ) : null}

      {/* Milestones Section */}
      <Grid item xs={12} md={6} sx={{ mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Milestones</Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenMilestoneDialog}
            >
              Add Milestone
            </Button>
          </Box>
          <List>
            {project.milestones?.map((milestone) => (
              <ListItem key={milestone._id}>
                <ListItemText
                  primary={milestone.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {milestone.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </Typography>
                      {milestone.completed && (
                        <Typography variant="body2" color="success.main">
                          Completed on: {new Date(milestone.completedAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Checkbox
                    edge="end"
                    checked={milestone.completed}
                    onChange={(e) => handleMilestoneStatusChange(milestone._id, e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Task Dialog */}
      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleTaskSubmit}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={taskForm.title}
              onChange={handleTaskChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={taskForm.description}
              onChange={handleTaskChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Assignee</InputLabel>
              <Select
                name="assignedTo"
                value={taskForm.assignedTo}
                onChange={handleTaskChange}
                required
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={taskForm.priority}
                onChange={handleTaskChange}
                required
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={taskForm.status}
                onChange={handleTaskChange}
                required
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={taskForm.dueDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </LocalizationProvider>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Cancel</Button>
          <Button onClick={handleTaskSubmit} variant="contained" color="primary">
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <TextField
              fullWidth
              label="Project Name"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Client Information
            </Typography>
            <TextField
              fullWidth
              label="Client Name"
              name="client.name"
              value={editForm.client.name}
              onChange={handleEditChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Client Email"
              name="client.email"
              value={editForm.client.email}
              onChange={handleEditChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Client Phone"
              name="client.phone"
              value={editForm.client.phone}
              onChange={handleEditChange}
              margin="normal"
              required
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Update Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
            All tasks associated with this project will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteProject} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog open={openMilestoneDialog} onClose={handleCloseMilestoneDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Milestone</DialogTitle>
        <DialogContent>
          <form onSubmit={handleMilestoneSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Title"
              name="title"
              value={milestoneForm.title}
              onChange={handleMilestoneChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              name="description"
              value={milestoneForm.description}
              onChange={handleMilestoneChange}
              multiline
              rows={3}
              required
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={milestoneForm.dueDate}
                onChange={handleMilestoneDateChange}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
              />
            </LocalizationProvider>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMilestoneDialog}>Cancel</Button>
          <Button onClick={handleMilestoneSubmit} variant="contained" color="primary">
            Add Milestone
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail; 