import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, signInWithGoogle } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Store the current path and trigger Google sign-in
      const currentPath = location.pathname + location.search + location.hash;
      localStorage.setItem('postAuthReturnTo', currentPath);
      signInWithGoogle(currentPath);
    }
  }, [loading, user, signInWithGoogle, location]);

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

  if (!user) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        gap={2}
      >
        <CircularProgress />
        <Typography>Redirecting to sign in...</Typography>
      </Box>
    );
  }

  return children;
};
