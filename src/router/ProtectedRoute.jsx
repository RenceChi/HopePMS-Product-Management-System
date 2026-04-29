import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../db/supabase';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Still fetching session or user row — hold, don't redirect
  if (loading) return null;

  // No session at all — send to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // DB fetch returned null / RLS issue — hold without signing out.
  // AuthContext will re-render once the real row arrives.
  if (currentUser.record_status === 'PENDING') {
    return null;
  }

  // Confirmed inactive account — sign out and show the error message
  if (currentUser.record_status !== 'ACTIVE') {
    supabase.auth.signOut();
    return <Navigate to="/login?error=inactive" replace />;
  }

  return children;
};

export default ProtectedRoute;