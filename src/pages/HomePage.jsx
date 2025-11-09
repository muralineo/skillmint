import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import { CourseCard } from '../components/CourseCard';

export const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCourses(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{ mb: 4, fontWeight: 'bold', color: '#2e7d32' }}
      >
        Available Courses
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading courses: {error}
        </Alert>
      )}

      {courses.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No courses available at the moment.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <CourseCard
                id={course.id}
                title={course.title}
                description={course.description}
                image_url={course.image_url}
                onClick={handleCourseClick}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
