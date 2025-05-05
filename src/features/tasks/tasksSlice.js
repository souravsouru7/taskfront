import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../app/api';

// Get all tasks
export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/tasks');
            console.log('Tasks from backend:', response.data);
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to fetch tasks';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Get user tasks
export const fetchUserTasks = createAsyncThunk(
    'tasks/fetchUserTasks',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            if (!auth.user) {
                return rejectWithValue({ message: 'User not authenticated' });
            }
            
            const response = await API.get('/tasks/assigned-to-me');
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to fetch user tasks';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Get task by ID
export const fetchTaskById = createAsyncThunk(
    'tasks/fetchTaskById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.get(`/tasks/${id}`);
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to fetch task';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Create new task (admin only)
export const createTask = createAsyncThunk(
    'tasks/createTask',
    async (taskData, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            
            if (!auth.user) {
                return rejectWithValue({ message: 'User not authenticated' });
            }
            
            const response = await API.post('/tasks', taskData);
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to create task';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Update task (admin only)
export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ id, ...taskData }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/tasks/${id}`, taskData);
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to update task';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Delete task (admin only)
export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.delete(`/tasks/${id}`);
            return { id, message: response.data.message };
        } catch (err) {
            let errorMessage = 'Failed to delete task';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Add comment to task
export const addComment = createAsyncThunk(
    'tasks/addComment',
    async ({ taskId, text }, { rejectWithValue, getState }) => {
        try {
            const response = await API.post(`/tasks/${taskId}/comments`, { text });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to add comment');
        }
    }
);

// Update task status (available to assigned users and admins)
export const updateTaskStatus = createAsyncThunk(
    'tasks/updateTaskStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await API.patch(`/tasks/${id}/status`, { status });
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to update task status';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Get user's reward points and streak
export const fetchUserRewards = createAsyncThunk(
    'tasks/fetchUserRewards',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/tasks/rewards/me');
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to fetch rewards';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Get leaderboard
export const fetchLeaderboard = createAsyncThunk(
    'tasks/fetchLeaderboard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/tasks/rewards/leaderboard');
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to fetch leaderboard';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Request task extension
export const requestTaskExtension = createAsyncThunk(
    'tasks/requestTaskExtension',
    async ({ taskId, reason, newDueDate }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/tasks/${taskId}/extension-request`, {
                reason,
                newDueDate
            });
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to request task extension';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Handle extension request (Admin only)
export const handleExtensionRequest = createAsyncThunk(
    'tasks/handleExtensionRequest',
    async ({ taskId, status, newDueDate }, { rejectWithValue }) => {
        try {
            const response = await API.patch(`/tasks/${taskId}/extension-request`, {
                status,
                newDueDate
            });
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to handle extension request';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Get extension request status
export const fetchExtensionRequest = createAsyncThunk(
    'tasks/fetchExtensionRequest',
    async (taskId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/tasks/${taskId}/extension-request`);
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to fetch extension request';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

const initialState = {
    tasks: [],
    currentTask: null,
    userRewards: null,
    leaderboard: [],
    status: 'idle',
    error: null
};

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        clearCurrentTask: (state) => {
            state.currentTask = null;
        },
        setTaskStatus: (state, action) => {
            const { id, status } = action.payload;
            const task = state.tasks.find(task => task._id === id);
            if (task) {
                task.status = status;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all tasks
            .addCase(fetchTasks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Fetch user tasks
            .addCase(fetchUserTasks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserTasks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tasks = action.payload;
            })
            .addCase(fetchUserTasks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Fetch task by ID
            .addCase(fetchTaskById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTaskById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentTask = action.payload;
            })
            .addCase(fetchTaskById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Create task
            .addCase(createTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tasks.push(action.payload);
            })
            .addCase(createTask.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Update task
            .addCase(updateTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.tasks.findIndex(task => task._id === action.payload._id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
                if (state.currentTask?._id === action.payload._id) {
                    state.currentTask = action.payload;
                }
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Delete task
            .addCase(deleteTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tasks = state.tasks.filter(task => task._id !== action.payload.id);
                if (state.currentTask?._id === action.payload.id) {
                    state.currentTask = null;
                }
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Add comment
            .addCase(addComment.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (state.currentTask?._id === action.payload._id) {
                    state.currentTask = action.payload;
                }
            })
            .addCase(addComment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Update task status
            .addCase(updateTaskStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateTaskStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { task: updatedTask } = action.payload;
                
                // Update task in tasks list
                const index = state.tasks.findIndex(task => task._id === updatedTask._id);
                if (index !== -1) {
                    state.tasks[index] = updatedTask;
                }
                
                // Update current task if it's the same one
                if (state.currentTask?._id === updatedTask._id) {
                    state.currentTask = updatedTask;
                }
            })
            .addCase(updateTaskStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Fetch user rewards
            .addCase(fetchUserRewards.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserRewards.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userRewards = action.payload;
            })
            .addCase(fetchUserRewards.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Fetch leaderboard
            .addCase(fetchLeaderboard.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchLeaderboard.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.leaderboard = action.payload;
            })
            .addCase(fetchLeaderboard.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Request task extension
            .addCase(requestTaskExtension.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(requestTaskExtension.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.tasks.findIndex(task => task._id === action.payload.task._id);
                if (index !== -1) {
                    state.tasks[index] = action.payload.task;
                }
                if (state.currentTask?._id === action.payload.task._id) {
                    state.currentTask = action.payload.task;
                }
            })
            .addCase(requestTaskExtension.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Handle extension request
            .addCase(handleExtensionRequest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(handleExtensionRequest.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.tasks.findIndex(task => task._id === action.payload.task._id);
                if (index !== -1) {
                    state.tasks[index] = action.payload.task;
                }
                if (state.currentTask?._id === action.payload.task._id) {
                    state.currentTask = action.payload.task;
                }
            })
            .addCase(handleExtensionRequest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Fetch extension request
            .addCase(fetchExtensionRequest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchExtensionRequest.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.tasks.findIndex(task => task._id === action.payload.task._id);
                if (index !== -1) {
                    state.tasks[index].extensionRequest = action.payload.extensionRequest;
                }
                if (state.currentTask?._id === action.payload.task._id) {
                    state.currentTask.extensionRequest = action.payload.extensionRequest;
                }
            })
            .addCase(fetchExtensionRequest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            });
    }
});

export const { clearCurrentTask, setTaskStatus } = tasksSlice.actions;

export default tasksSlice.reducer; 