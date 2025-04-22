import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { fetchProjects } from './projectSlice';

const ProjectList = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { projects, loading, error, status } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
      case 'in-progress':
        return 'warning';
      case 'pending':
      case 'planning':
        return 'info';
      case 'on-hold':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading || status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button
          component={RouterLink}
          to="/projects/create"
          variant="contained"
          color="primary"
          fullWidth={{ xs: true, sm: false }}
        >
          Create Project
        </Button>
      </Box>

      {isMobile ? (
        <Stack spacing={2}>
          {projects.map((project) => (
            <Card key={project._id} elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.name}
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Client:</strong> {project.client?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Dates:</strong> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">
                      <strong>Status:</strong>
                    </Typography>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    <strong>Team Size:</strong> {project.team?.length || 0}
                  </Typography>
                  <Box mt={1}>
                    <Button
                      component={RouterLink}
                      to={`/projects/${project._id}`}
                      color="primary"
                      size="small"
                      variant="outlined"
                      fullWidth
                    >
                      View Details
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {(!projects || projects.length === 0) && (
            <Typography variant="body1" color="textSecondary" textAlign="center">
              No projects found
            </Typography>
          )}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Team Size</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.client?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(project.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(project.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{project.team?.length || 0}</TableCell>
                  <TableCell>
                    <Button
                      component={RouterLink}
                      to={`/projects/${project._id}`}
                      color="primary"
                      size="small"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!projects || projects.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No projects found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ProjectList; 