import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../app/api';

// Get all notifications for current user
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/notifications');
            // Sort notifications by createdAt in descending order
            const sortedNotifications = response.data.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            return sortedNotifications;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

// Get unread notification count
export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/notifications/unread/count');
            return response.data.count;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch unread count');
        }
    }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await API.patch(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to mark notification as read');
        }
    }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.patch('/notifications/read-all');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to mark all notifications as read');
        }
    }
);

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null
    },
    reducers: {
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload;
                state.unreadCount = action.payload.filter(n => !n.isRead).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch unread count
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            // Mark notification as read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const index = state.notifications.findIndex(n => n._id === action.payload._id);
                if (index !== -1) {
                    state.notifications[index] = action.payload;
                    state.unreadCount = state.notifications.filter(n => !n.isRead).length;
                }
            })
            // Mark all notifications as read
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map(notification => ({
                    ...notification,
                    isRead: true
                }));
                state.unreadCount = 0;
            });
    }
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer; 