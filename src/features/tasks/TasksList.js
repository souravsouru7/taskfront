import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTasks, fetchUserTasks, deleteTask } from './tasksSlice';
import { fetchProjects } from '../projects/projectSlice';
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
    Tab,
    useTheme,
    useMediaQuery,
    Stack,
    Card,
    CardContent,
    CardActions
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        <Box sx={{ mt: 2, p: { xs: 1, sm: 2 } }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
            }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isAdmin ? 'All Tasks' : 'My Tasks'}
                </Typography>
                {isAdmin && (
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/tasks/create"
                        fullWidth={isMobile}
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
                size={isMobile ? "small" : "medium"}
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
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                >
                    <Tab label="All" />
                    <Tab label="Pending" />
                    <Tab label="In Progress" />
                    <Tab label="Completed" />
                    <Tab label="On Hold" />
                </Tabs>
            </Box>

            {isMobile ? (
                <Stack spacing={2}>
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <Card key={task._id} elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {task.title}
                                    </Typography>
                                    <Stack spacing={1}>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Project
                                            </Typography>
                                            <Typography variant="body2">
                                                {task.project?.name || 'No Project'}
                                            </Typography>
                                        </Box>
                                        {isAdmin && (
                                            <Box>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    Assigned To
                                                </Typography>
                                                <Typography variant="body2">
                                                    {task.assignedTo?.name || 'Unassigned'}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Status:
                                            </Typography>
                                            <Chip
                                                label={task.status}
                                                color={getStatusColor(task.status)}
                                                size="small"
                                            />
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Priority:
                                            </Typography>
                                            <Chip
                                                label={task.priority}
                                                color={getPriorityColor(task.priority)}
                                                size="small"
                                            />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Due Date
                                            </Typography>
                                            <Typography variant="body2">
                                                {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        component={Link}
                                        to={`/tasks/${task._id}`}
                                        startIcon={<ViewIcon />}
                                    >
                                        View
                                    </Button>
                                    {isAdmin && (
                                        <>
                                            <Button
                                                size="small"
                                                component={Link}
                                                to={`/tasks/${task._id}/edit`}
                                                startIcon={<EditIcon />}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(task)}
                                                startIcon={<DeleteIcon />}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </CardActions>
                            </Card>
                        ))
                    ) : (
                        <Typography variant="body1" color="textSecondary" textAlign="center">
                            No tasks found
                        </Typography>
                    )}
                </Stack>
            ) : (
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
                                                label={task.status}
                                                color={getStatusColor(task.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={task.priority}
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
                                                size="small"
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                            {isAdmin && (
                                                <>
                                                    <IconButton
                                                        component={Link}
                                                        to={`/tasks/${task._id}/edit`}
                                                        size="small"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleDelete(task)}
                                                        size="small"
                                                        color="error"
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
            )}

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Task</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this task? This action cannot be undone.
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