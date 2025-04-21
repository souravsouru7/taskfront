import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from './userSlice';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Work as WorkIcon,
    Security as SecurityIcon,
    EmojiEvents as EmojiEventsIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const departments = ['Design', 'Project Management', 'Sales', 'Administration', 'Other'];

const UserProfile = ({ onClose }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { profile, status, error } = useSelector(state => state.users);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                try {
                    await dispatch(fetchUserProfile(user.id)).unwrap();
                } catch (err) {
                    console.error('Failed to fetch profile:', err);
                }
            }
        };
        fetchData();
    }, [dispatch, user]);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                department: profile.department || ''
            });
        }
    }, [profile]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                department: profile.department || ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) return;

        try {
            await dispatch(updateUserProfile({ 
                userId: user.id, 
                userData: formData 
            })).unwrap();
            setEditMode(false);
            // Refresh profile data
            dispatch(fetchUserProfile(user.id));
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (status === 'loading') {
        return (
            <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
                <DialogContent>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    if (error) {
        return (
            <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
                <DialogContent>
                    <Alert severity="error">{error}</Alert>
                </DialogContent>
            </Dialog>
        );
    }

    if (!profile) {
        return (
            <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
                <DialogContent>
                    <Alert severity="info">Loading profile data...</Alert>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">User Profile</Typography>
                    {!editMode && (
                        <Button
                            startIcon={<EditIcon />}
                            variant="outlined"
                            onClick={handleEditClick}
                        >
                            Edit Profile
                        </Button>
                    )}
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Box display="flex" flexDirection="column" alignItems="center" p={2}>
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        mb: 2,
                                        bgcolor: 'primary.main'
                                    }}
                                >
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                                </Avatar>
                                <Typography variant="h6" gutterBottom>
                                    {profile.name}
                                </Typography>
                                <Chip
                                    label={profile.role ? profile.role.replace('_', ' ').toUpperCase() : 'USER'}
                                    color="primary"
                                    sx={{ mb: 1 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Card>
                                <CardContent>
                                    <Box mb={3}>
                                        <Typography variant="h6" gutterBottom>
                                            Personal Information
                                        </Typography>
                                        {editMode ? (
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        type="email"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Department</InputLabel>
                                                        <Select
                                                            name="department"
                                                            value={formData.department}
                                                            onChange={handleChange}
                                                            required
                                                        >
                                                            {departments.map((dept) => (
                                                                <MenuItem key={dept} value={dept}>
                                                                    {dept}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Box>
                                                <Box display="flex" alignItems="center" mb={2}>
                                                    <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                                                    <Typography>{profile.name}</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" mb={2}>
                                                    <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                                                    <Typography>{profile.email}</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" mb={2}>
                                                    <WorkIcon sx={{ mr: 2, color: 'primary.main' }} />
                                                    <Typography>{profile.department}</Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Box mb={3}>
                                        <Typography variant="h6" gutterBottom>
                                            Rewards & Achievements
                                        </Typography>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <EmojiEventsIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <Typography>
                                                Total Points: {profile.rewardPoints || 0}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <Typography>
                                                Current Streak: {profile.currentStreak || 0} days
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {profile.rewards && profile.rewards.length > 0 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Recent Rewards
                                            </Typography>
                                            {profile.rewards.slice(0, 3).map((reward, index) => (
                                                <Box key={index} mb={1}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {format(new Date(reward.date), 'PP')}
                                                    </Typography>
                                                    <Typography>
                                                        {reward.type === 'points' ? '+' : ''}{reward.value} {reward.type}
                                                        {reward.description && ` - ${reward.description}`}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            {editMode && (
                <DialogActions>
                    <Button
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                    >
                        Cancel
                    </Button>
                    <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default UserProfile; 