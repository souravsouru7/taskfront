import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchTaskById, addComment, deleteTask, updateTaskStatus, fetchUserRewards } from './tasksSlice';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    TextField,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Card,
    CardContent,
    LinearProgress,
    IconButton
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
    Comment as CommentIcon,
    Person as PersonIcon,
    Assignment as ProjectIcon,
    AccessTime as AccessTimeIcon,
    AttachFile as AttachFileIcon,
    Update as UpdateIcon,
    EmojiEvents as EmojiEventsIcon,
    TrendingUp as TrendingUpIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme, useMediaQuery } from '@mui/material';

const TaskDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { currentTask, status, error, userRewards } = useSelector(state => state.tasks);
    const { user } = useSelector(state => state.auth);
    const [commentText, setCommentText] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [rewardInfo, setRewardInfo] = useState(null);
    const [statusUpdateDialog, setStatusUpdateDialog] = useState({
        open: false,
        newStatus: '',
        potentialReward: null
    });

    // Add loading state
    const isLoading = status === 'loading' || !currentTask;

    // Add null checks for task properties
    const taskStatus = currentTask?.status || '';
    const taskPriority = currentTask?.priority || '';
    const taskDueDate = currentTask?.dueDate ? new Date(currentTask.dueDate) : null;
    const taskIsOnTime = currentTask?.isOnTime || false;
    const taskComments = currentTask?.comments || [];
    const taskAttachments = currentTask?.attachments || [];
    const taskAssignedTo = currentTask?.assignedTo || null;
    const taskProject = currentTask?.project || null;

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadTaskAndRewards = async () => {
            try {
                const taskResult = await dispatch(fetchTaskById(id)).unwrap();
                if (isMounted && user) {
                    await dispatch(fetchUserRewards()).unwrap();
                }
                if (isMounted && taskResult && taskResult.rewardInfo) {
                    setRewardInfo(taskResult.rewardInfo);
                }
            } catch (error) {
                console.error('Error loading task or rewards:', error);
                showSnackbar('Error loading task or rewards', 'error');
            }
        };
        
        if (id) {
            loadTaskAndRewards();
        }

        // Only set up the interval if user is logged in
        let rewardRefreshInterval;
        if (user) {
            rewardRefreshInterval = setInterval(() => {
                dispatch(fetchUserRewards());
            }, 30000); // Increased to 30 seconds to reduce API calls
        }

        return () => {
            isMounted = false;
            if (rewardRefreshInterval) {
                clearInterval(rewardRefreshInterval);
            }
        };
    }, [dispatch, id, user, showSnackbar]);

    useEffect(() => {
        if (currentTask) {
            setSelectedStatus(currentTask.status);
        }
    }, [currentTask]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            await dispatch(addComment({ taskId: id, text: commentText })).unwrap();
            setCommentText('');
            setSnackbar({
                open: true,
                message: 'Comment added successfully',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to add comment',
                severity: 'error'
            });
        }
    };

    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteTask(id)).then(() => {
            navigate('/tasks');
        });
        setDeleteDialogOpen(false);
    };

    const handleStatusUpdate = () => {
        setStatusDialogOpen(true);
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === 'completed') {
            const now = new Date();
            const dueDate = currentTask?.dueDate ? new Date(currentTask.dueDate) : null;
            const isOnTime = dueDate ? now <= dueDate : false;
            
            setStatusUpdateDialog({
                open: true,
                newStatus,
                potentialReward: {
                    isOnTime,
                    basePoints: isOnTime ? 10 : 5,
                    possibleStreak: currentTask?.currentStreak ? currentTask.currentStreak + 1 : 1
                }
            });
        } else {
            confirmStatusUpdate(newStatus);
        }
    };

    const confirmStatusUpdate = async (newStatus) => {
        try {
            const result = await dispatch(updateTaskStatus({ id, status: newStatus })).unwrap();
            const { task: updatedTask, rewardInfo } = result;
            
            // Immediately fetch updated user rewards
            if (user) {
                await dispatch(fetchUserRewards()).unwrap();
            }
            
            setRewardInfo(rewardInfo);
            
            let message = `Task status updated to ${newStatus}`;
            let severity = 'success';
            
            if (rewardInfo) {
                if (rewardInfo.isLate) {
                    message = `Task completed late. No points earned.`;
                    severity = 'warning';
                } else if (rewardInfo.pointsEarned > 0) {
                    message = `Task completed! You earned ${rewardInfo.pointsEarned} points!`;
                }
            }

            showSnackbar(message, severity);
            setStatusDialogOpen(false);
            setStatusUpdateDialog({ ...statusUpdateDialog, open: false });

            // Refresh task details to get latest data
            dispatch(fetchTaskById(id));
        } catch (error) {
            showSnackbar(error.message || 'Failed to update task status', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'in_progress':
                return 'info';
            case 'completed':
                return 'success';
            case 'overdue':
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
            default:
                return 'default';
        }
    };

    // Check if current user is assigned to this task
    const isAssignedToTask = currentTask && 
        currentTask.assignedTo && 
        user && 
        (currentTask.assignedTo._id === user.id || 
         currentTask.assignedTo._id === user._id || 
         currentTask.assignedTo.id === user.id);

    const isAdmin = user && user.role === 'admin';

    // Only assigned users or admins can update status
    const canUpdateStatus = isAssignedToTask || isAdmin;

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 2 }}>
                <Alert severity="error">{error}</Alert>
                <Button component={Link} to="/tasks" sx={{ mt: 2 }}>
                    Back to Tasks
                </Button>
            </Box>
        );
    }

    if (!currentTask) {
        return (
            <Box sx={{ mt: 2 }}>
                <Alert severity="info">Task not found</Alert>
                <Button component={Link} to="/tasks" sx={{ mt: 2 }}>
                    Back to Tasks
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2, p: { xs: 1, sm: 2 } }}>
            {status === 'loading' ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : currentTask ? (
                <Box>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 3,
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 2, sm: 0 }
                    }}>
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {currentTask.title}
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                                <Chip
                                    label={taskStatus}
                                    color={getStatusColor(taskStatus)}
                                    size={isMobile ? "small" : "medium"}
                                />
                                <Chip
                                    label={taskPriority}
                                    color={getPriorityColor(taskPriority)}
                                    size={isMobile ? "small" : "medium"}
                                />
                                {taskIsOnTime && (
                                    <Chip
                                        label="On Time"
                                        color="success"
                                        size={isMobile ? "small" : "medium"}
                                    />
                                )}
                            </Box>
                        </Box>
                        <Box display="flex" gap={1} width={{ xs: '100%', sm: 'auto' }}>
                            {isAdmin && (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        component={Link}
                                        to={`/tasks/${id}/edit`}
                                        fullWidth={isMobile}
                                    >
                                        Edit Task
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleDelete}
                                        fullWidth={isMobile}
                                    >
                                        Delete Task
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Description
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {currentTask.description}
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Comments
                                </Typography>
                                <List>
                                    {taskComments.map((comment) => (
                                        <ListItem key={comment._id} alignItems="flex-start">
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <PersonIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="subtitle2">
                                                            {comment.user?.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={comment.text}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                                <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 2 }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        size={isMobile ? "small" : "medium"}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton
                                                    type="submit"
                                                    color="primary"
                                                    disabled={!commentText.trim()}
                                                >
                                                    <SendIcon />
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Task Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <ProjectIcon color="action" />
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Project
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            {taskProject?.name || 'No Project'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <PersonIcon color="action" />
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Assigned To
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            {taskAssignedTo?.name || 'Unassigned'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <AccessTimeIcon color="action" />
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Due Date
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            {taskDueDate ? format(taskDueDate, 'MMM dd, yyyy') : 'No due date'}
                                        </Typography>
                                    </Grid>
                                    {canUpdateStatus && (
                                        <Grid item xs={12}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleStatusUpdate}
                                                fullWidth
                                                startIcon={<UpdateIcon />}
                                            >
                                                Update Status
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>

                            {rewardInfo && (
                                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                                    <Typography variant="h6" gutterBottom>
                                        Rewards
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <EmojiEventsIcon color="primary" />
                                        <Typography variant="body1">
                                            Points Earned: {rewardInfo.pointsEarned}
                                        </Typography>
                                    </Box>
                                    {rewardInfo.currentStreak > 0 && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <TrendingUpIcon color="success" />
                                            <Typography variant="body1">
                                                Current Streak: {rewardInfo.currentStreak}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            ) : null}

            {/* Status Update Dialog */}
            <Dialog
                open={statusDialogOpen}
                onClose={() => setStatusDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Update Task Status</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={selectedStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="on_hold">On Hold</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => confirmStatusUpdate(selectedStatus)} variant="contained">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
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

            {/* Status Update Reward Dialog */}
            <Dialog
                open={statusUpdateDialog.open}
                onClose={() => setStatusUpdateDialog({ ...statusUpdateDialog, open: false })}
            >
                <DialogTitle>Complete Task</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {statusUpdateDialog.potentialReward?.isOnTime ? (
                            `Completing this task on time will earn you ${statusUpdateDialog.potentialReward?.basePoints || 0} points!`
                        ) : (
                            'This task is overdue. You will earn reduced points.'
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusUpdateDialog({ ...statusUpdateDialog, open: false })}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => confirmStatusUpdate(statusUpdateDialog.newStatus)}
                        variant="contained"
                        color="primary"
                    >
                        Complete Task
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TaskDetail; 