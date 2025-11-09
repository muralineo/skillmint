import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const NavBar = () => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignIn = () => {
    const currentPath = location.pathname + location.search + location.hash;
    signInWithGoogle(currentPath);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#2e7d32' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => navigate('/')}
        >
          SkillMint
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          {user ? (
            <>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: '#1b5e20' }}
                  alt={user.email}
                >
                  {user.email?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="body2">{user.email}</Typography>
              </Box>
              <Button color="inherit" variant="outlined" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Button color="inherit" variant="outlined" onClick={handleSignIn}>
              Sign in with Google
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
