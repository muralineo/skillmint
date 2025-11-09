import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle post-authentication redirect
        if (event === 'SIGNED_IN') {
          const returnTo = localStorage.getItem('postAuthReturnTo');
          if (returnTo) {
            localStorage.removeItem('postAuthReturnTo');
            navigate(returnTo, { replace: true });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signInWithGoogle = async (returnToPath) => {
    // Store the return path for post-authentication redirect
    const pathToStore = returnToPath || (location.pathname + location.search + location.hash);
    localStorage.setItem('postAuthReturnTo', pathToStore);

    // Trigger Google OAuth
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
