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
  CardMedia
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { supabase } from '../lib/supabaseClient';

export const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setCourse(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
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
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Course Content
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Course materials and lessons will be available here.
            </Typography>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};
