import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import projectsReducer from '../features/projects/projectsSlice';
import usersReducer from '../features/users/userSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tasks: tasksReducer,
        projects: projectsReducer,
        users: usersReducer,
        notifications: notificationsReducer
    }
});

export default store; 