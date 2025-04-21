import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchTaskById, addTaskComment, deleteTask, updateTaskStatus, fetchUserRewards } from './tasksSlice';
import { addNotification } from '../notifications/notificationsSlice';
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
    LinearProgress
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

const TaskDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
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
        const loadTaskAndRewards = async () => {
            try {
                const taskResult = await dispatch(fetchTaskById(id)).unwrap();
                if (user) {
                    await dispatch(fetchUserRewards()).unwrap();
                }
            } catch (error) {
                console.error('Error loading task or rewards:', error);
                showSnackbar('Error loading task or rewards', 'error');
            }
        };
        
        loadTaskAndRewards();
        
        // Set up an interval to refresh rewards data
        const rewardRefreshInterval = setInterval(() => {
            if (user) {
                dispatch(fetchUserRewards());
            }
        }, 5000); // Refresh every 5 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(rewardRefreshInterval);
    }, [dispatch, id, user, showSnackbar]);

    useEffect(() => {
        if (currentTask) {
            setSelectedStatus(currentTask.status);
        }
    }, [currentTask]);

    useEffect(() => {
        if (id) {
            dispatch(fetchTaskById(id))
                .unwrap()
                .then(taskData => {
                    if (taskData.rewardInfo) {
                        setRewardInfo(taskData.rewardInfo);
                    }
                })
                .catch(error => {
                    showSnackbar(error.message || 'Failed to fetch task details', 'error');
                });
        }
    }, [id, dispatch, showSnackbar]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            dispatch(addTaskComment({ id, text: commentText }));
            setCommentText('');
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
            const dueDate = new Date(currentTask.dueDate);
            const isOnTime = now <= dueDate;
            
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

            // Create notification for admin when task is completed
            if (newStatus === 'completed') {
                dispatch(addNotification({
                    type: 'task_completed',
                    message: `Task "${currentTask.title}" was completed by ${user.name}`,
                    read: false,
                    createdAt: new Date().toISOString(),
                    _id: Date.now().toString() // Temporary ID until backend assigns one
                }));
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

    if (status === 'loading' && !currentTask) {
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
        <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {currentTask.title}
                    </Typography>
                    <Box>
                        <Button
                            component={Link}
                            to="/tasks"
                            variant="outlined"
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        {canUpdateStatus && (
                            <Button
                                variant="contained"
                                startIcon={<UpdateIcon />}
                                color="primary"
                                onClick={handleStatusUpdate}
                                sx={{ mr: 1 }}
                            >
                                Update Status
                            </Button>
                        )}
                        {isAdmin && (
                            <>
                                <Button
                                    component={Link}
                                    to={`/tasks/${id}/edit`}
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    color="primary"
                                    sx={{ mr: 1 }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<DeleteIcon />}
                                    color="error"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                            Description
                        </Typography>
                        <Typography paragraph>
                            {currentTask.description}
                        </Typography>

                        {/* Comments Section */}
                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                            Comments
                        </Typography>
                        <List>
                            {currentTask.comments?.map((comment, index) => (
                                <ListItem key={index} alignItems="flex-start">
                                    <ListItemAvatar>
                                        <Avatar>
                                            <PersonIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={comment.postedBy?.name || 'Unknown User'}
                                        secondary={
                                            <>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                >
                                                    {format(new Date(comment.createdAt), 'PPp')}
                                                </Typography>
                                                <br />
                                                {comment.text}
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>

                        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                variant="outlined"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={!commentText.trim()}
                                        >
                                            <SendIcon />
                                        </Button>
                                    ),
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Task Details
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <ProjectIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body1">
                                    <strong>Project:</strong> {currentTask.project ? currentTask.project.name : 'No Project Assigned'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body1">
                                    <strong>Assigned To:</strong> {currentTask.assignedTo ? currentTask.assignedTo.name : 'Not Assigned'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body1">
                                    <strong>Due Date:</strong> {format(new Date(currentTask.dueDate), 'PP')}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <Chip
                                    label={currentTask.status.replace('_', ' ').toUpperCase()}
                                    color={getStatusColor(currentTask.status)}
                                    size="small"
                                />
                                <Chip
                                    label={currentTask.priority.toUpperCase()}
                                    color={getPriorityColor(currentTask.priority)}
                                    size="small"
                                    sx={{ ml: 1 }}
                                />
                            </Box>
                        </Paper>

                        {/* Rewards Section */}
                        {isAssignedToTask && userRewards && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Your Rewards
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <EmojiEventsIcon sx={{ mr: 1, color: 'gold' }} />
                                        <Typography variant="body1">
                                            <strong>Total Points:</strong> {userRewards.rewardPoints}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="body1">
                                            <strong>Current Streak:</strong> {userRewards.currentStreak} days
                                        </Typography>
                                    </Box>
                                    {currentTask.status === 'completed' && currentTask.rewardPoints > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <StarIcon sx={{ mr: 1, color: 'success.main' }} />
                                            <Typography variant="body1">
                                                <strong>Points Earned:</strong> {currentTask.rewardPoints}
                                                {currentTask.isCompletedOnTime && ' (Completed on time!)'}
                                            </Typography>
                                        </Box>
                                    )}
                                    {userRewards.rewards && userRewards.rewards.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Recent Rewards:
                                            </Typography>
                                            <List dense>
                                                {userRewards.rewards.slice(0, 3).map((reward, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemText
                                                            primary={`${reward.type === 'points' ? '+' : ''}${reward.value} ${reward.type}`}
                                                            secondary={reward.description}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {/* Status Update Dialog */}
            <Dialog
                open={statusDialogOpen}
                onClose={() => setStatusDialogOpen(false)}
            >
                <DialogTitle>Update Task Status</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select the new status for this task.
                    </DialogContentText>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="status-select-label">Status</InputLabel>
                        <Select
                            labelId="status-select-label"
                            value={selectedStatus}
                            label="Status"
                            onChange={(e) => setSelectedStatus(e.target.value)}
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
                    <Button 
                        onClick={() => handleStatusChange(selectedStatus)} 
                        color="primary"
                        variant="contained"
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Completion Confirmation Dialog */}
            <Dialog
                open={statusUpdateDialog.open}
                onClose={() => setStatusUpdateDialog({ ...statusUpdateDialog, open: false })}
            >
                <DialogTitle>Update Task Status</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography>
                            Are you sure you want to mark this task as completed?
                        </Typography>
                        {statusUpdateDialog.potentialReward && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Potential Rewards:
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <EmojiEventsIcon color={statusUpdateDialog.potentialReward.isOnTime ? 'primary' : 'action'} />
                                    <Typography>
                                        {statusUpdateDialog.potentialReward.basePoints} points
                                        {!statusUpdateDialog.potentialReward.isOnTime && ' (reduced for late completion)'}
                                    </Typography>
                                </Box>
                                {statusUpdateDialog.potentialReward.possibleStreak > 1 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <StarIcon color="secondary" />
                                        <Typography>
                                            {statusUpdateDialog.potentialReward.possibleStreak} day streak possible!
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusUpdateDialog({ ...statusUpdateDialog, open: false })}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => confirmStatusUpdate(statusUpdateDialog.newStatus)}
                        color="primary"
                        variant="contained"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this task? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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