import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../db/supabase';

const ProtectedRoute = ({ children }) => {
  // 1. Read directly from our global context
  const { currentUser, loading } = useAuth();

  // 2. Wait for the context to finish fetching session/user data
  if (loading) return null;

  // 3. No user logged in? Send to login.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 4. Check account activation
  // AuthContext already merged 'record_status' into currentUser for us.
  if (currentUser.record_status !== 'ACTIVE') {
    // If they aren't active, sign them out of Supabase and redirect
    supabase.auth.signOut();
    return <Navigate to="/login?error=inactive" replace />;
  }

  // 5. If they pass all checks, render the page (children)
  return children;
};

export default ProtectedRoute;