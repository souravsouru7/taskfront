import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createTask, updateTask, fetchTaskById } from './tasksSlice';
import { fetchProjects } from '../projects/projectSlice';
import { fetchUsers } from '../users/usersSlice';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    CircularProgress,
    Alert,
    FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const TaskForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentTask, status, error } = useSelector(state => state.tasks);
    const { user } = useSelector(state => state.auth);
    const { projects } = useSelector(state => state.projects);
    const { users } = useSelector(state => state.users);
    const [initialValues, setInitialValues] = useState({
        title: '',
        description: '',
        project: '',
        assignedTo: '',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date()
    });
    const isEditing = Boolean(id);

    // Load projects and users data
    useEffect(() => {
        dispatch(fetchProjects());
        dispatch(fetchUsers());
    }, [dispatch]);

    // Check if user is admin
    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/tasks');
        }
    }, [user, navigate]);

    // Fetch task if editing
    useEffect(() => {
        if (isEditing) {
            dispatch(fetchTaskById(id));
        }
    }, [dispatch, isEditing, id]);

    // Set initial values when editing and task is loaded
    useEffect(() => {
        if (isEditing && currentTask) {
            setInitialValues({
                title: currentTask.title || '',
                description: currentTask.description || '',
                project: currentTask.project?._id || '',
                assignedTo: currentTask.assignedTo?._id || '',
                status: currentTask.status || 'pending',
                priority: currentTask.priority || 'medium',
                dueDate: currentTask.dueDate ? new Date(currentTask.dueDate) : new Date()
            });
        }
    }, [isEditing, currentTask]);

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
        project: Yup.string().required('Project is required'),
        assignedTo: Yup.string().required('Assigned user is required'),
        status: Yup.string().required('Status is required'),
        priority: Yup.string().required('Priority is required'),
        dueDate: Yup.date().required('Due date is required')
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const taskData = {
                title: values.title,
                description: values.description,
                project: values.project,
                assignedTo: values.assignedTo,
                status: values.status,
                priority: values.priority,
                dueDate: values.dueDate
            };

            try {
                if (isEditing) {
                    await dispatch(updateTask({ id, ...taskData })).unwrap();
                    navigate('/tasks');
                } else {
                    await dispatch(createTask(taskData)).unwrap();
                    navigate('/tasks');
                }
            } catch (err) {
                console.error('Failed to save task:', err);
            }
        }
    });

    // Format date for input field
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    // Format date for display
    const formatDateForDisplay = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Handle date change for DatePicker
    const handleDateChange = (date) => {
        if (date) {
            // Set time to end of day (23:59:59) to ensure full day is included
            date.setHours(23, 59, 59, 999);
            formik.setFieldValue('dueDate', date.toISOString());
        }
    };

    if (status === 'loading' && isEditing) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEditing ? 'Edit Task' : 'Create New Task'}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="title"
                                name="title"
                                label="Task Title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="description"
                                name="description"
                                label="Description"
                                multiline
                                rows={4}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={formik.touched.project && Boolean(formik.errors.project)}>
                                <InputLabel id="project-label">Project</InputLabel>
                                <Select
                                    labelId="project-label"
                                    id="project"
                                    name="project"
                                    value={formik.values.project}
                                    label="Project"
                                    onChange={formik.handleChange}
                                >
                                    {projects?.map(project => (
                                        <MenuItem key={project._id} value={project._id}>
                                            {project.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.project && formik.errors.project && (
                                    <FormHelperText>{formik.errors.project}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}>
                                <InputLabel id="assignedTo-label">Assigned To</InputLabel>
                                <Select
                                    labelId="assignedTo-label"
                                    id="assignedTo"
                                    name="assignedTo"
                                    value={formik.values.assignedTo}
                                    label="Assigned To"
                                    onChange={formik.handleChange}
                                >
                                    {users?.map(user => (
                                        <MenuItem key={user._id} value={user._id}>
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.assignedTo && formik.errors.assignedTo && (
                                    <FormHelperText>{formik.errors.assignedTo}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                                <InputLabel id="status-label">Status</InputLabel>
                                <Select
                                    labelId="status-label"
                                    id="status"
                                    name="status"
                                    value={formik.values.status}
                                    label="Status"
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="overdue">Overdue</MenuItem>
                                </Select>
                                {formik.touched.status && formik.errors.status && (
                                    <FormHelperText>{formik.errors.status}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={formik.touched.priority && Boolean(formik.errors.priority)}>
                                <InputLabel id="priority-label">Priority</InputLabel>
                                <Select
                                    labelId="priority-label"
                                    id="priority"
                                    name="priority"
                                    value={formik.values.priority}
                                    label="Priority"
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                </Select>
                                {formik.touched.priority && formik.errors.priority && (
                                    <FormHelperText>{formik.errors.priority}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Due Date"
                                    value={formik.values.dueDate ? new Date(formik.values.dueDate) : null}
                                    onChange={handleDateChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                                            helperText={formik.touched.dueDate && formik.errors.dueDate}
                                        />
                                    )}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Button
                                    component={Link}
                                    to="/tasks"
                                    variant="outlined"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    {isEditing ? 'Update Task' : 'Create Task'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default TaskForm; 