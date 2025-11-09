import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardMedia,
  Paper
} from '@mui/material';
import { ArrowBack, Lock, HourglassEmpty, CheckCircle } from '@mui/icons-material';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { checkCourseAccess, requestCourseAccess } from '../lib/courseAccess';

export const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchCourseAndAccess();
    }
  }, [id, user]);

  const fetchCourseAndAccess = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Check access status
      const access = await checkCourseAccess(user.id, id);
      setAccessStatus(access);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    setRequesting(true);
    const result = await requestCourseAccess(user.id, id);
    setRequesting(false);
    
    if (result.success) {
      setRequestSuccess(true);
      setAccessStatus({ hasAccess: false, status: 'pending', hasRequested: true });
    } else {
      setError(result.error);
    }
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Error loading course: {error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Courses
        </Button>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Course not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Courses
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Back to Courses
      </Button>

      <Card>
        <CardMedia
          component="img"
          height="400"
          image={course.image_url || 'https://via.placeholder.com/600x400?text=Course'}
          alt={course.title}
        />
        <Box sx={{ p: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', color: '#2e7d32' }}
          >
            {course.title}
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            {course.description}
          </Typography>

          {/* Access Control Section */}
          {!accessStatus?.hasAccess && (
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mt: 3,
                bgcolor: accessStatus?.status === 'pending' ? '#fff3e0' : accessStatus?.status === 'rejected' ? '#ffebee' : '#e3f2fd',
                border: '2px solid',
                borderColor: accessStatus?.status === 'pending' ? '#ff9800' : accessStatus?.status === 'rejected' ? '#f44336' : '#2196f3'
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {accessStatus?.status === 'pending' ? (
                  <HourglassEmpty sx={{ fontSize: 40, color: '#ff9800' }} />
                ) : accessStatus?.status === 'rejected' ? (
                  <Lock sx={{ fontSize: 40, color: '#f44336' }} />
                ) : (
                  <Lock sx={{ fontSize: 40, color: '#2196f3' }} />
                )}
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {accessStatus?.status === 'pending'
                      ? 'Access Request Pending'
                      : accessStatus?.status === 'rejected'
                      ? 'Access Request Rejected'
                      : 'Course Access Required'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {accessStatus?.status === 'pending'
                      ? 'Your request has been sent to the admin. You will be able to access this course once approved.'
                      : accessStatus?.status === 'rejected'
                      ? 'Your access request was rejected. Please contact the administrator for more information.'
                      : 'You need approval to access this course content.'}
                  </Typography>
                </Box>
              </Box>

              {requestSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle />
                    <Typography>
                      The request has been sent to the admin. You will soon be able to access the course after admin approval.
                    </Typography>
                  </Box>
                </Alert>
              )}

              {!accessStatus?.hasRequested && accessStatus?.status !== 'rejected' && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleRequestAccess}
                  disabled={requesting}
                  sx={{ mt: 1 }}
                >
                  {requesting ? 'Sending Request...' : 'Request Access'}
                </Button>
              )}
            </Paper>
          )}

          {/* Course Content - Only visible with access */}
          {accessStatus?.hasAccess && (
            <Box sx={{ mt: 4 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle />
                  <Typography>You have access to this course!</Typography>
                </Box>
              </Alert>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Course Content
              </Typography>
              <Typography variant="body1" paragraph>
                Welcome to {course.title}! Here you'll find all the course materials and lessons.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Course materials and lessons will be available here.
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  );
};
