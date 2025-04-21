import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTasks, fetchUserTasks, deleteTask } from './tasksSlice';
import { fetchProjects } from '../projects/projectsSlice';
import { fetchUsers } from '../users/usersSlice';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const TasksList = () => {
    const dispatch = useDispatch();
    const { tasks, status, error } = useSelector(state => state.tasks);
    const { projects } = useSelector(state => state.projects);
    const { users } = useSelector(state => state.users);
    const { user } = useSelector(state => state.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const loadData = async () => {
            try {
                // For admin users, fetch all tasks
                // For regular users, fetch only tasks assigned to them
                if (isAdmin) {
                    await dispatch(fetchTasks()).unwrap();
                    await dispatch(fetchProjects()).unwrap();
                    await dispatch(fetchUsers()).unwrap();
                } else {
                    await dispatch(fetchUserTasks()).unwrap();
                }
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };
        
        loadData();
    }, [dispatch, isAdmin]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Filter tasks based on search term and tab selection
    const filteredTasks = tasks.filter(task => {
        // First apply the search filter
        const matchesSearch = 
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.project?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.assignedTo?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            
        // Then apply the status filter if we're on a status tab
        if (tabValue === 0) {
            return matchesSearch; // All tasks
        } else if (tabValue === 1) {
            return matchesSearch && task.status === 'pending';
        } else if (tabValue === 2) {
            return matchesSearch && task.status === 'in_progress';
        } else if (tabValue === 3) {
            return matchesSearch && task.status === 'completed';
        } else if (tabValue === 4) {
            return matchesSearch && task.status === 'on_hold';
        }
        
        return matchesSearch;
    });

    const handleDelete = (task) => {
        setTaskToDelete(task);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (taskToDelete) {
            dispatch(deleteTask(taskToDelete._id));
            setDeleteDialogOpen(false);
            setTaskToDelete(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'in-progress':
                return 'info';
            case 'completed':
                return 'success';
            case 'on-hold':
                return 'error';
            default:
                return 'default';
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

    if (status === 'loading' && tasks.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isAdmin ? 'All Tasks' : 'My Tasks'}
                </Typography>
                {isAdmin && (
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/tasks/create"
                    >
                        Create Task
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="All" />
                    <Tab label="Pending" />
                    <Tab label="In Progress" />
                    <Tab label="Completed" />
                    <Tab label="On Hold" />
                </Tabs>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Project</TableCell>
                            {isAdmin && <TableCell>Assigned To</TableCell>}
                            <TableCell>Status</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <TableRow key={task._id}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>
                                        {task.project?.name ? (
                                            <Typography variant="body2" color="textPrimary">
                                                {task.project.name}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                No Project
                                            </Typography>
                                        )}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell>
                                            {task.assignedTo?.name ? (
                                                <Typography variant="body2" color="textPrimary">
                                                    {task.assignedTo.name}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    Unassigned
                                                </Typography>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Chip
                                            label={task.status.replace('_', ' ').toUpperCase()}
                                            color={getStatusColor(task.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={task.priority.toUpperCase()}
                                            color={getPriorityColor(task.priority)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            component={Link}
                                            to={`/tasks/${task._id}`}
                                            color="primary"
                                            size="small"
                                            title="View details"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        {isAdmin && (
                                            <>
                                                <IconButton
                                                    component={Link}
                                                    to={`/tasks/${task._id}/edit`}
                                                    color="primary"
                                                    size="small"
                                                    title="Edit task"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(task)}
                                                    color="error"
                                                    size="small"
                                                    title="Delete task"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                                    <Typography variant="body1" color="textSecondary">
                                        No tasks found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Task</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the task "{taskToDelete?.title}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TasksList; 