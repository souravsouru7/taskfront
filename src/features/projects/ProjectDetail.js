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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchProjectById, updateProject, deleteProject } from './projectSlice';
import { fetchUsers } from '../users/userSlice';
import { createTask, deleteTask, updateTask } from '../tasks/tasksSlice';

const ProjectDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchUsers());
  }, [dispatch, id]);

  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name,
        description: project.description,
        client: project.client,
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

  if (projectLoading || usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (projectError) {
    return (
      <Container>
        <Alert severity="error">{projectError}</Alert>
      </Container>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4">{project.name}</Typography>
              <Box>
                {user?.role === 'admin' && (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={handleOpenEditDialog}
                      sx={{ mr: 2 }}
                    >
                      Edit Project
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleOpenDeleteDialog}
                      sx={{ mr: 2 }}
                    >
                      Delete Project
                    </Button>
                  </>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenTaskDialog()}
                >
                  Add Task
                </Button>
              </Box>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Client: {project.client?.name || 'No client'}
            </Typography>
            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Tasks
            </Typography>
            
            <List>
              {(project.tasks || []).map((task) => (
                <ListItem
                  key={task._id}
                  divider
                  sx={{
                    backgroundColor: task.status === 'completed' ? '#f5f5f5' : 'inherit',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">{task.title}</Typography>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={
                            task.priority === 'urgent'
                              ? 'error'
                              : task.priority === 'high'
                              ? 'warning'
                              : 'default'
                          }
                        />
                        <Chip
                          label={task.status}
                          size="small"
                          color={task.status === 'completed' ? 'success' : 'default'}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {task.description}
                        </Typography>
                        <br />
                        <Typography variant="caption">
                          Assigned To: {task.assignedTo?.name || 'Unassigned'} | 
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleOpenTaskDialog(task)}
                    >
                      <EditIcon />
                    </IconButton>
                    {user?.role === 'admin' && (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {(!project.tasks || project.tasks.length === 0) && (
                <ListItem>
                  <ListItemText
                    primary="No tasks found"
                    secondary="Add a new task to get started"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
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
    </Container>
  );
};

export default ProjectDetail; 