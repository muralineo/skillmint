import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, Container, Button } from '@mui/material';
import { Home } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { checkIsAdmin } from '../lib/courseAccess';

export const ProtectedAdminRoute = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!authLoading && user) {
        const adminStatus = await checkIsAdmin(user.id);
        setIsAdmin(adminStatus);
        setChecking(false);
      } else if (!authLoading && !user) {
        setChecking(false);
      }
    };

    verifyAdmin();
  }, [user, authLoading]);

  if (authLoading || checking) {
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
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You must be signed in to access the admin panel.
        </Alert>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Access Denied: You don't have permission to access the admin panel.
        </Alert>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  return children;
};
