import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Tab,
  Tabs,
  Card,
  CardContent
} from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty, PersonAdd, LibraryBooks } from '@mui/icons-material';
import { getPendingRequests, approveCourseAccess, rejectCourseAccess } from '../lib/courseAccess';

export const AdminPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const result = await getPendingRequests();
    setLoading(false);

    if (result.success) {
      setRequests(result.data);
    } else {
      setError(result.error);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessing({ ...processing, [requestId]: 'approving' });
    const result = await approveCourseAccess(requestId);

    if (result.success) {
      // Update the request in the list
      setRequests(requests.map(req =>
        req.id === requestId ? { ...req, status: 'approved' } : req
      ));
    } else {
      setError(result.error);
    }

    setProcessing({ ...processing, [requestId]: null });
  };

  const handleReject = async (requestId) => {
    setProcessing({ ...processing, [requestId]: 'rejecting' });
    const result = await rejectCourseAccess(requestId);

    if (result.success) {
      // Update the request in the list
      setRequests(requests.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      ));
    } else {
      setError(result.error);
    }

    setProcessing({ ...processing, [requestId]: null });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filterRequests = (status) => {
    if (status === 'all') return requests;
    return requests.filter(req => req.status === status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <HourglassEmpty />;
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const displayedRequests = tabValue === 0 ? requests : 
                            tabValue === 1 ? filterRequests('pending') :
                            tabValue === 2 ? filterRequests('approved') :
                            filterRequests('rejected');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{ mb: 4, fontWeight: 'bold', color: '#2e7d32' }}
      >
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <HourglassEmpty sx={{ fontSize: 40, color: '#ff9800' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {pendingCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Requests
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {approvedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Cancel sx={{ fontSize: 40, color: '#f44336' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {rejectedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`All (${requests.length})`} />
          <Tab label={`Pending (${pendingCount})`} />
          <Tab label={`Approved (${approvedCount})`} />
          <Tab label={`Rejected (${rejectedCount})`} />
        </Tabs>
      </Box>

      {/* Requests Table */}
      {displayedRequests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonAdd sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No {tabValue === 1 ? 'pending' : tabValue === 2 ? 'approved' : tabValue === 3 ? 'rejected' : ''} requests found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>User Email</strong></TableCell>
                <TableCell><strong>Course</strong></TableCell>
                <TableCell><strong>Request Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>{request.user_email}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {request.courses?.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.courses?.description?.substring(0, 60)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(request.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(request.status)}
                      label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {request.status === 'pending' && (
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(request.id)}
                          disabled={processing[request.id] === 'approving'}
                        >
                          {processing[request.id] === 'approving' ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<Cancel />}
                          onClick={() => handleReject(request.id)}
                          disabled={processing[request.id] === 'rejecting'}
                        >
                          {processing[request.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </Box>
                    )}
                    {request.status !== 'pending' && (
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LibraryBooks />}
                          onClick={() => navigate(`/admin/courses/${request.course_id}/content`)}
                        >
                          Manage Content
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};
