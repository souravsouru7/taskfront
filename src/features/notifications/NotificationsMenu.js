import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    ListItemText,
    ListItemIcon,
    Typography,
    Box,
    Divider,
    Button,
    CircularProgress
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Done as DoneIcon,
    DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { fetchNotifications, markAsRead, markAllAsRead } from './notificationsSlice';
import { format } from 'date-fns';

const NotificationsMenu = () => {
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = useState(null);
    const { items, unreadCount, status } = useSelector((state) => state.notifications);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user?.role === 'admin') {
            dispatch(fetchNotifications());
        }
    }, [dispatch, user]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = async (notificationId) => {
        await dispatch(markAsRead(notificationId));
    };

    const handleMarkAllAsRead = async () => {
        await dispatch(markAllAsRead());
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'task_completed':
                return <CheckCircleIcon color="success" />;
            case 'task_overdue':
                return <ErrorIcon color="error" />;
            default:
                return <NotificationsIcon color="primary" />;
        }
    };

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                aria-label={`${unreadCount} new notifications`}
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
                        maxHeight: 400,
                        width: '350px',
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Notifications</Typography>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            startIcon={<DoneAllIcon />}
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </Box>
                <Divider />
                {status === 'loading' ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : items.length === 0 ? (
                    <MenuItem disabled>
                        <ListItemText primary="No notifications" />
                    </MenuItem>
                ) : (
                    items.map((notification) => (
                        <MenuItem
                            key={notification._id}
                            onClick={() => handleMarkAsRead(notification._id)}
                            sx={{
                                backgroundColor: notification.read ? 'inherit' : 'action.hover',
                                '&:hover': {
                                    backgroundColor: notification.read ? 'action.hover' : 'action.selected',
                                },
                            }}
                        >
                            <ListItemIcon>
                                {getNotificationIcon(notification.type)}
                            </ListItemIcon>
                            <ListItemText
                                primary={notification.message}
                                secondary={format(new Date(notification.createdAt), 'PPp')}
                            />
                            {!notification.read && (
                                <DoneIcon
                                    fontSize="small"
                                    sx={{ ml: 1, color: 'text.secondary' }}
                                />
                            )}
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
};

export default NotificationsMenu; 