import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
    CircularProgress,
    Alert,
    Avatar,
    Chip,
} from '@mui/material';
import { fetchLeaderboard } from './tasksSlice';
import { EmojiEvents as EmojiEventsIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

const Leaderboard = () => {
    const dispatch = useDispatch();
    const { leaderboard, status, error } = useSelector(state => state.tasks);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(fetchLeaderboard())
            .unwrap()
            .then(data => {
                console.log('Leaderboard API Response:', data);
            })
            .catch(error => {
                console.error('Leaderboard API Error:', error);
            });
    }, [dispatch]);

    // Filter out admin users as a backup
    const filteredLeaderboard = leaderboard.filter(userData => {
        const isAdmin = 
            userData.role === 'admin' || 
            userData.isAdmin === true || 
            userData.name === 'Admin User';
        
        if (isAdmin) {
            console.log('Filtered out admin user:', userData);
        }
        
        return !isAdmin;
    });

    if (status === 'loading') {
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
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Employee Leaderboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Top performers based on reward points
                </Typography>

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Rank</TableCell>
                                <TableCell>Employee</TableCell>
                                <TableCell>Points</TableCell>
                                <TableCell>Streak</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLeaderboard.map((userData, index) => (
                                <TableRow
                                    key={userData._id}
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        backgroundColor: user?._id === userData._id ? 'action.hover' : 'inherit'
                                    }}
                                >
                                    <TableCell>
                                        {index === 0 ? (
                                            <EmojiEventsIcon sx={{ color: 'gold' }} />
                                        ) : index === 1 ? (
                                            <EmojiEventsIcon sx={{ color: 'silver' }} />
                                        ) : index === 2 ? (
                                            <EmojiEventsIcon sx={{ color: '#cd7f32' }} />
                                        ) : (
                                            index + 1
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ mr: 1 }}>
                                                {userData.name.charAt(0)}
                                            </Avatar>
                                            <Typography>{userData.name}</Typography>
                                            {userData.role && (
                                                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                                                    ({userData.role})
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <EmojiEventsIcon sx={{ mr: 1, color: 'gold' }} />
                                            <Typography>{userData.rewardPoints}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography>{userData.currentStreak} days</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={userData.currentStreak >= 7 ? 'On Fire!' : 'Active'}
                                            color={userData.currentStreak >= 7 ? 'error' : 'success'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {filteredLeaderboard.length === 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="info">No data available yet</Alert>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default Leaderboard; 