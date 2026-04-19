import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../db/supabase';

const ProtectedRoute = ({ children }) => {
  // ✅ Read directly from our global context
  const { currentUser, loading } = useAuth();

  // Wait for the context to finish fetching
  if (loading) return null;

  // No user logged in? Send to login.
  if (!currentUser) return <Navigate to="/login" replace />;

  // User is logged in, but their account isn't activated yet? Kick them out.
  if (currentUser.record_status !== 'ACTIVE') {
    supabase.auth.signOut();
    return <Navigate to="/login?error=inactive" replace />;
  }

  // If they pass all checks, render the page!
  return children;
};

export default ProtectedRoute;