import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    ListItemIcon,
    ListItemText,
    Avatar,
    CircularProgress
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Check as CheckIcon,
    Comment as CommentIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from './notificationsSlice';

const Notifications = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { notifications, unreadCount, loading, error } = useSelector(state => state.notifications);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        dispatch(fetchNotifications());
        dispatch(fetchUnreadCount());
    }, [dispatch]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await dispatch(markNotificationAsRead(notification._id));
        }
        handleClose();
        // Use React Router navigation
        let taskId = notification.task;
        if (typeof taskId === 'object' && taskId !== null) {
            taskId = taskId._id;
        }
        if (taskId) {
            navigate(`/tasks/${taskId}`);
        }
    };

    const handleMarkAllAsRead = async () => {
        await dispatch(markAllNotificationsAsRead());
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'comment':
                return <CommentIcon />;
            case 'task':
                return <AssignmentIcon />;
            default:
                return <NotificationsIcon />;
        }
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                sx={{ mr: 2 }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 400
                    }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Notifications</Typography>
                    {unreadCount > 0 && (
                        <Typography
                            variant="body2"
                            color="primary"
                            sx={{ cursor: 'pointer' }}
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all as read
                        </Typography>
                    )}
                </Box>
                <Divider />
                {loading ? (
                    <MenuItem disabled>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress size={24} />
                        </Box>
                    </MenuItem>
                ) : error ? (
                    <MenuItem disabled>
                        <Typography color="error">{error}</Typography>
                    </MenuItem>
                ) : notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            No notifications
                        </Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                                bgcolor: notification.isRead ? 'inherit' : 'action.hover',
                                '&:hover': {
                                    bgcolor: 'action.selected'
                                }
                            }}
                        >
                            <ListItemIcon>
                                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                                    {getNotificationIcon(notification.type)}
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText
                                primary={notification.message}
                                secondary={new Date(notification.createdAt).toLocaleString()}
                            />
                            {!notification.isRead && (
                                <CheckIcon color="primary" fontSize="small" />
                            )}
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
};

export default Notifications; 